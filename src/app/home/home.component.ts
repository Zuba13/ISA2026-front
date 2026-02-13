import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { WatchPartyService } from "../shared/watch-party.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  videos: any[] = [];
  isAuthenticated = false;
  currentUserId: any = null;
  newComments: { [key: number]: string } = {};
  visibleComments: { [key: number]: boolean } = {};
  commentPagination: { [key: number]: { current_page: number, last_page: number } } = {};

  // Watch Party
  rooms: any[] = [];
  joinedRoom: any = null;
  newRoomName: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private wpService: WatchPartyService
  ) { }

  ngOnInit() {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    this.isAuthenticated = !!token;
    if (user) {
      this.currentUserId = JSON.parse(user).id;
    }
    this.fetchVideos(token || '');
    this.fetchRooms();

    // Listen for watch party synchronization
    this.wpService.videoStarted$.subscribe((videoId: number) => {
      alert('A new video has started in your Watch Party!');
      // Navigate or handle video open logic
      this.router.navigate(['/video', videoId]);
    });
  }

  fetchRooms() {
    this.wpService.getRooms().subscribe(res => this.rooms = res);
  }

  createRoom() {
    if (!this.newRoomName) return;
    this.wpService.createRoom(this.newRoomName).subscribe((room: any) => {
      this.joinedRoom = room;
      this.newRoomName = '';
      this.fetchRooms();
      this.wpService.connectToRoom(room.id);
    });
  }

  joinRoom(room: any) {
    this.wpService.joinRoom(room.token).subscribe(() => {
      this.joinedRoom = room;
      this.wpService.connectToRoom(room.id);
      alert(`Joined room: ${room.name}`);
    });
  }

  startVideoInRoom(video: any) {
    if (!this.joinedRoom) {
      alert('Please join or create a room first');
      return;
    }
    this.wpService.startVideo(this.joinedRoom.id, video.id).subscribe(() => {
      // For demonstration, since we don't have a real socket server running
      this.wpService.simulateVideoStart(this.joinedRoom.id, video.id);
    });
  }

  fetchVideos(token: string) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get('http://localhost/api/videos', { headers })
      .subscribe({
        next: (res: any) => {
          this.videos = res;
          console.log('Videos:', res);
        },
        error: (err) => {
          console.error('Error fetching videos:', err);
        }
      });
  }

  getViewsCount(views: any): any {
    if (!views && views !== 0) return 'Unknown';
    if (views < 1000) return views;
    if (views < 1000000) return (views / 1000).toFixed(1) + 'K';
    return (views / 1000000).toFixed(1) + 'M';
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

  toggleLike(video: any) {
    if (!this.isAuthenticated) {
      alert('Please log in to like videos');
      return;
    }

    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post('http://localhost/api/likes/toggle', {
      likeable_type: 'App\\Models\\Video',
      likeable_id: video.id
    }, { headers }).subscribe({
      next: (res: any) => {
        if (res.liked) {
          video.likes.push({ user_id: this.currentUserId });
        } else {
          video.likes = video.likes.filter((l: any) => l.user_id !== this.currentUserId);
        }
      },
      error: (err) => console.error(err)
    });
  }

  isLikedByMe(video: any): boolean {
    if (!this.isAuthenticated || !video.likes) return false;
    return video.likes.some((l: any) => l.user_id === this.currentUserId);
  }

  toggleComments(video: any) {
    this.visibleComments[video.id] = !this.visibleComments[video.id];
    if (this.visibleComments[video.id]) {
      this.incrementViews(video);
      this.loadComments(video, 1);
    }
  }

  incrementViews(video: any) {
    this.http.get(`http://localhost/api/videos/${video.id}`)
      .subscribe({
        next: (res: any) => {
          video.views = res.views;
        },
        error: (err) => console.error('Error incrementing views:', err)
      });
  }

  loadComments(video: any, page: number) {
    this.http.get(`http://localhost/api/videos/${video.id}/comments?page=${page}`)
      .subscribe({
        next: (res: any) => {
          if (page === 1) {
            video.comments = res.data;
          } else {
            video.comments = [...video.comments, ...res.data];
          }
          this.commentPagination[video.id] = {
            current_page: res.current_page,
            last_page: res.last_page
          };
        },
        error: (err) => console.error('Error loading comments:', err)
      });
  }

  loadMoreComments(video: any) {
    const pagination = this.commentPagination[video.id];
    if (pagination && pagination.current_page < pagination.last_page) {
      this.loadComments(video, pagination.current_page + 1);
    }
  }

  addComment(video: any) {
    if (!this.isAuthenticated) {
      alert('Please log in to comment');
      return;
    }

    const content = this.newComments[video.id];
    if (!content || content.trim() === '') return;

    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post(`http://localhost/api/videos/${video.id}/comments`, { content }, { headers })
      .subscribe({
        next: (comment: any) => {
          video.comments.unshift(comment);
          video.comments_count++;
          this.newComments[video.id] = '';
        },
        error: (err) => console.error(err)
      });
  }

  navigateToProfile(userId: number) {
    this.router.navigate(['/user-profile', userId]);
  }
}
