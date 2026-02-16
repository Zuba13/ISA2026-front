import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
    selector: 'app-video-upload',
    templateUrl: './video-upload.component.html',
    styleUrls: ['./video-upload.component.css']
})
export class VideoUploadComponent {
    title: string = '';
    description: string = '';
    tags: string = '';
    location: string = '';
    thumbnail: File | null = null;
    video: File | null = null;
    uploading: boolean = false;
    error: string | null = null;

    constructor(private http: HttpClient, private router: Router) { }

    onFileChange(event: any, type: string) {
        if (event.target.files.length > 0) {
            if (type === 'thumbnail') {
                this.thumbnail = event.target.files[0];
            } else {
                this.video = event.target.files[0];
            }
        }
    }

    upload() {
        if (!this.title || !this.description || !this.thumbnail || !this.video) {
            this.error = 'Please fill all required fields.';
            return;
        }

        const formData = new FormData();
        formData.append('title', this.title);
        formData.append('description', this.description);

        // Send tags as an array
        const tagArray = this.tags.split(',').map(t => t.trim()).filter(t => t !== '');
        tagArray.forEach(tag => formData.append('tags[]', tag));

        formData.append('location', this.location);
        formData.append('thumbnail', this.thumbnail);
        formData.append('video', this.video);

        const token = localStorage.getItem('access_token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        this.uploading = true;
        this.error = null;

        this.http.post('http://localhost/api/videos', formData, { headers }).subscribe({
            next: () => {
                alert('Video uploaded successfully!');
                this.router.navigate(['/']);
            },
            error: (err) => {
                this.error = err.error.message || 'Upload failed. Please try again.';
                this.uploading = false;
            }
        });
    }
}
