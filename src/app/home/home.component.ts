import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";

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

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    this.isAuthenticated = !!token;
    if (user) {
      this.currentUserId = JSON.parse(user).id;
    }
    this.fetchVideos(token || '');
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

  toggleComments(videoId: number) {
    this.visibleComments[videoId] = !this.visibleComments[videoId];
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
