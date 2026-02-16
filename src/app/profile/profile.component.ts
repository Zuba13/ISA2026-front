import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: any = null;
  isEditing = false;
  editForm: any = {
    name: '',
    surname: '',
    username: '',
    address: ''
  };
  isLoading = false;
  message = '';
  error = '';

  constructor(private router: Router, private http: HttpClient) { }

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
        this.editForm = {
          name: this.currentUser.name,
          surname: this.currentUser.surname,
          username: this.currentUser.username,
          address: this.currentUser.address
        };
      } catch (e) {
        console.error('Error parsing user data:', e);
        this.router.navigate(['/login']);
      }
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadUserData(); // Reset form if cancelling
    }
    this.message = '';
    this.error = '';
  }

  saveChanges() {
    this.isLoading = true;
    this.message = '';
    this.error = '';

    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.put('http://localhost/api/user', this.editForm, { headers }).subscribe({
      next: (res: any) => {
        this.currentUser = res.user;
        localStorage.setItem('user', JSON.stringify(res.user));
        this.isEditing = false;
        this.isLoading = false;
        this.message = 'Profile updated successfully!';
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Failed to update profile';
        console.error('Update error:', err);
      }
    });
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
