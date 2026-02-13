import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class WatchPartyService {
    private apiUrl = 'http://localhost/api';
    private socket: WebSocket | null = null;
    public videoStarted$ = new Subject<any>();

    constructor(private http: HttpClient, private router: Router) { }

    private getHeaders() {
        const token = localStorage.getItem('access_token');
        return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }

    getRooms(): Observable<any> {
        return this.http.get(`${this.apiUrl}/rooms`);
    }

    createRoom(name: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/rooms`, { name }, { headers: this.getHeaders() });
    }

    joinRoom(token: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/rooms/join`, { token }, { headers: this.getHeaders() });
    }

    startVideo(roomId: number, videoId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/rooms/${roomId}/start-video`, { video_id: videoId }, { headers: this.getHeaders() });
    }

    connectToRoom(roomId: number) {
        // Simulated Socket connection using native WebSockets or a mock
        // In a real Laravel app, we'd use Echo.connector.socket.id or similar
        // Here we use a generic placeholder to demonstrate the logic
        console.log(`Connecting to Watch Party Room ${roomId}...`);

        // Mocking a socket behavior for demonstration
        // Since I can't setup a real socket server on the host easily without sail/npm
        // I will simulate the event reception
        window.addEventListener('message', (event) => {
            if (event.data?.type === 'VIDEO_STARTED' && event.data?.roomId === roomId) {
                this.videoStarted$.next(event.data.videoId);
            }
        });
    }

    simulateVideoStart(roomId: number, videoId: number) {
        // Helper for demonstration to trigger the navigation
        window.postMessage({ type: 'VIDEO_STARTED', roomId, videoId }, '*');
    }
}
