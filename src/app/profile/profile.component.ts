import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: any = null;

  constructor(private router: Router) { }

  ngOnInit() {
    this.loadUserData();

    // Redirect to login if not authenticated
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  loadUserData() {
    const userData = localStorage.getItem('user');

    if (userData) {
      try {
        this.currentUser = JSON.parse(userData);
      } catch (e) {
        console.error('Error parsing user data:', e);
        this.router.navigate(['/login']);
      }
    }
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
