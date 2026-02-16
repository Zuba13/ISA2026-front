import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WatchPartyService } from '../shared/watch-party.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-watch-room',
    templateUrl: './watch-room.component.html',
    styleUrls: ['./watch-room.component.css']
})
export class WatchRoomComponent implements OnInit, OnDestroy {
    room: any = null;
    roomId: number = 0;
    currentUserId: number | null = null;
    isCreator = false;
    loading = true;
    error = '';

    // For joining via token
    joinToken = '';

    // Videos list for the creator to pick from
    videos: any[] = [];

    private videoStartedSub: Subscription | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private wpService: WatchPartyService
    ) { }

    ngOnInit() {
        const user = localStorage.getItem('user');
        if (user) {
            this.currentUserId = JSON.parse(user).id;
        }

        this.roomId = +this.route.snapshot.paramMap.get('id')!;
        this.loadRoom();

        // Listen for video sync events
        this.wpService.connectToRoom(this.roomId);
        this.videoStartedSub = this.wpService.videoStarted$.subscribe((videoId: number) => {
            // Automatically navigate to the video detail page when it starts
            this.router.navigate(['/video', videoId]);
        });
    }

    loadRoom() {
        this.wpService.getRoom(this.roomId).subscribe({
            next: (room: any) => {
                this.room = room;
                this.isCreator = room.creator_id === this.currentUserId;
                this.loading = false;
            },
            error: (err: any) => {
                this.error = 'Room not found or you do not have access.';
                this.loading = false;
                console.error(err);
            }
        });
    }

    leaveRoom() {
        this.wpService.leaveRoom(this.roomId).subscribe({
            next: () => {
                localStorage.removeItem('joined_room');
                this.router.navigate(['/']);
            },
            error: (err: any) => console.error(err)
        });
    }

    startVideo(videoId: number) {
        this.wpService.startVideo(this.roomId, videoId).subscribe({
            next: () => {
                // Simulate event for demo (since no real WebSocket)
                this.wpService.simulateVideoStart(this.roomId, videoId);
                this.loadRoom();
            },
            error: (err: any) => console.error(err)
        });
    }

    watchCurrentVideo() {
        if (this.room?.current_video_id) {
            this.router.navigate(['/video', this.room.current_video_id]);
        }
    }

    copyToken() {
        if (this.room?.token) {
            navigator.clipboard.writeText(this.room.token).then(() => {
                alert('Room token copied to clipboard!');
            });
        }
    }

    goHome() {
        this.router.navigate(['/']);
    }

    ngOnDestroy() {
        if (this.videoStartedSub) {
            this.videoStartedSub.unsubscribe();
        }
    }
}
