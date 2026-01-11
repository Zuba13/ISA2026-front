import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  userName: string = '';
  private checkInterval: any;
  showDropdown: boolean = false;

  constructor(private router: Router) { }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.profile-wrapper');

    if (!clickedInside && this.showDropdown) {
      this.showDropdown = false;
    }
  }

  ngOnInit() {
    this.loadUserData();
    // Check for user data changes every second
    this.checkInterval = setInterval(() => {
      this.loadUserData();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  loadUserData() {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        this.currentUser = JSON.parse(userData);
        this.userName = this.currentUser.name || this.currentUser.email || 'User';
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    } else {
      // Clear user data if not logged in
      this.currentUser = null;
      this.userName = '';
    }
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.currentUser = null;
    this.userName = '';
    this.showDropdown = false;
    this.router.navigate(['/login']);
  }
}
