import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class WatchPartyService {
    private apiUrl = 'http://localhost/api';
    private socket: WebSocket | null = null;
    public videoStarted$ = new Subject<any>();
    public videoSynced$ = new Subject<any>();

    constructor(private http: HttpClient, private router: Router) { }

    private getHeaders() {
        const token = localStorage.getItem('access_token');
        return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }

    getRooms(): Observable<any> {
        return this.http.get(`${this.apiUrl}/rooms`).pipe(
            catchError(err => {
                console.error('Error fetching rooms:', err);
                return of([]);
            })
        );
    }

    getRoom(roomId: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/rooms/${roomId}`);
    }

    createRoom(name: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/rooms`, { name }, { headers: this.getHeaders() });
    }

    joinRoom(token: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/rooms/join`, { token }, { headers: this.getHeaders() });
    }

    leaveRoom(roomId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/rooms/${roomId}/leave`, {}, { headers: this.getHeaders() });
    }

    startVideo(roomId: number, videoId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/rooms/${roomId}/start-video`, { video_id: videoId }, { headers: this.getHeaders() });
    }

    syncVideo(roomId: number, videoId: number, currentTime: number, isPlaying: boolean): Observable<any> {
        return this.http.post(`${this.apiUrl}/rooms/${roomId}/sync-video`, {
            video_id: videoId,
            current_time: currentTime,
            is_playing: isPlaying
        }, { headers: this.getHeaders() });
    }

    connectToRoom(roomId: number) {
        console.log(`Connecting to Watch Party Room ${roomId}...`);

        window.addEventListener('message', (event) => {
            if (event.data?.type === 'VIDEO_STARTED' && event.data?.roomId === roomId) {
                this.videoStarted$.next(event.data.videoId);
            }
            if (event.data?.type === 'VIDEO_SYNCED' && event.data?.roomId === roomId) {
                this.videoSynced$.next(event.data);
            }
        });
    }

    simulateVideoStart(roomId: number, videoId: number) {
        window.postMessage({ type: 'VIDEO_STARTED', roomId, videoId }, '*');
    }

    simulateVideoSync(roomId: number, videoId: number, currentTime: number, isPlaying: boolean, userId: number) {
        window.postMessage({ type: 'VIDEO_SYNCED', roomId, videoId, currentTime, isPlaying, userId }, '*');
    }
}
