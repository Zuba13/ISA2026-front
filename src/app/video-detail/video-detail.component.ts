import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { WatchPartyService } from '../shared/watch-party.service';
import { ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-video-detail',
    templateUrl: './video-detail.component.html',
    styleUrls: ['./video-detail.component.css']
})
export class VideoDetailComponent implements OnInit {
    video: any = null;
    videoId: number | null = null;
    isAuthenticated = false;
    currentUserId: any = null;
    newComment: string = '';
    loading = true;

    @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
    joinedRoom: any = null;
    isSyncing = false; // To prevent loops
    private syncSub: Subscription | null = null;
    private videoStartedSub: Subscription | null = null;

    constructor(
        private route: ActivatedRoute,
        private http: HttpClient,
        private router: Router,
        private wpService: WatchPartyService
    ) { }

    ngOnInit(): void {
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
            this.videoId = +idParam;
            this.fetchVideoDetails();
        }

        const token = localStorage.getItem('access_token');
        const user = localStorage.getItem('user');
        this.isAuthenticated = !!token;
        if (user) {
            this.currentUserId = JSON.parse(user).id;
        }

        // Check if user is in a room
        const savedRoom = localStorage.getItem('joined_room');
        if (savedRoom) {
            this.joinedRoom = JSON.parse(savedRoom);
            this.setupSync();
        }
    }

    setupSync() {
        this.wpService.connectToRoom(this.joinedRoom.id);

        // Sync player status (play/pause/seek)
        this.syncSub = this.wpService.videoSynced$.subscribe(data => {
            const senderId = data.userId || data.senderId;
            if (senderId !== this.currentUserId) {
                this.handleIncomingSync(data);
            }
        });

        // Sync video switches (creator picks a new video)
        this.videoStartedSub = this.wpService.videoStarted$.subscribe((videoId: number) => {
            if (videoId !== this.videoId) {
                this.router.navigate(['/video', videoId]);
            }
        });
    }

    handleIncomingSync(data: any) {
        if (!this.videoPlayer || data.videoId !== this.videoId) return;
        const player = this.videoPlayer.nativeElement;

        this.isSyncing = true;

        // Sync time if difference is more than 2 seconds
        if (Math.abs(player.currentTime - data.currentTime) > 2) {
            player.currentTime = data.currentTime;
        }

        if (data.isPlaying && player.paused) {
            player.play().catch(e => console.error("Playback failed", e));
        } else if (!data.isPlaying && !player.paused) {
            player.pause();
        }

        setTimeout(() => this.isSyncing = false, 1000);
    }

    broadcastSync() {
        if (!this.joinedRoom || this.isSyncing || !this.videoPlayer) return;

        const player = this.videoPlayer.nativeElement;
        this.wpService.syncVideo(
            this.joinedRoom.id,
            this.videoId!,
            player.currentTime,
            !player.paused
        ).subscribe({
            next: () => {
                // Also simulate locally for demo
                this.wpService.simulateVideoSync(
                    this.joinedRoom.id,
                    this.videoId!,
                    player.currentTime,
                    !player.paused,
                    this.currentUserId
                );
            }
        });
    }

    onVideoPlay() {
        this.broadcastSync();
    }

    onVideoPause() {
        this.broadcastSync();
    }

    onVideoSeek() {
        this.broadcastSync();
    }

    ngOnDestroy() {
        if (this.syncSub) {
            this.syncSub.unsubscribe();
        }
        if (this.videoStartedSub) {
            this.videoStartedSub.unsubscribe();
        }
    }

    fetchVideoDetails() {
        this.http.get(`http://localhost/api/videos/${this.videoId}`).subscribe({
            next: (res: any) => {
                this.video = res;
                this.loading = false;
                this.loadComments();
            },
            error: (err) => {
                console.error('Error fetching video details:', err);
                this.loading = false;
            }
        });
    }

    loadComments() {
        this.http.get(`http://localhost/api/videos/${this.videoId}/comments`).subscribe({
            next: (res: any) => {
                this.video.comments = res.data;
            },
            error: (err) => console.error(err)
        });
    }

    toggleLike() {
        if (!this.isAuthenticated) {
            alert('Please log in to like videos');
            return;
        }

        const token = localStorage.getItem('access_token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        this.http.post('http://localhost/api/likes/toggle', {
            likeable_type: 'App\\Models\\Video',
            likeable_id: this.video.id
        }, { headers }).subscribe({
            next: (res: any) => {
                if (res.liked) {
                    this.video.likes.push({ user_id: this.currentUserId });
                } else {
                    this.video.likes = this.video.likes.filter((l: any) => l.user_id !== this.currentUserId);
                }
            },
            error: (err) => console.error(err)
        });
    }

    isLikedByMe(): boolean {
        if (!this.isAuthenticated || !this.video || !this.video.likes) return false;
        return this.video.likes.some((l: any) => l.user_id === this.currentUserId);
    }

    addComment() {
        if (!this.isAuthenticated) {
            alert('Please log in to comment');
            return;
        }

        if (!this.newComment.trim()) return;

        const token = localStorage.getItem('access_token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        this.http.post(`http://localhost/api/videos/${this.video.id}/comments`, { content: this.newComment }, { headers })
            .subscribe({
                next: (comment: any) => {
                    this.video.comments.unshift(comment);
                    this.video.comments_count++;
                    this.newComment = '';
                },
                error: (err) => console.error(err)
            });
    }

    getTimeAgo(createdAt: string): string {
        if (!createdAt) return 'Unknown';
        const now = new Date();
        const created = new Date(createdAt);
        const diffMs = now.getTime() - created.getTime();
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSeconds < 60) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        return `${diffDays} days ago`;
    }

    getViewsCount(views: any): any {
        if (!views && views !== 0) return '0';
        if (views < 1000) return views;
        if (views < 1000000) return (views / 1000).toFixed(1) + 'K';
        return (views / 1000000).toFixed(1) + 'M';
    }

    navigateToProfile(userId: number) {
        this.router.navigate(['/user-profile', userId]);
    }
}
