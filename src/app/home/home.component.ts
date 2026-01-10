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

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.isAuthenticated = true;
    this.fetchVideos(token);
  }

  fetchVideos(token: string) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get('http://localhost/api/videos', { headers })
      .subscribe({
        next: (res: any) => {
          this.videos = res; // Assuming backend returns array of videos
          console.log('Videos:', res);
        },
        error: (err) => {
          console.error('Error fetching videos:', err);
        }
      });
  }
}
