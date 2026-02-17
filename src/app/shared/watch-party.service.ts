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

    private currentRoomId: number | null = null;
    private lastActiveVideoId: number | null = null;
    private pollingInterval: any = null;

    connectToRoom(roomId: number) {
        if (this.currentRoomId === roomId) return;

        this.currentRoomId = roomId;
        this.stopPolling(); // Clear any existing polling

        console.log(`Watching Party Room ${roomId} via Network-Sync Polling`);

        // Start polling for changes (simulates Socket behavior across computers)
        this.pollingInterval = setInterval(() => {
            if (!this.currentRoomId) return;

            this.getRoom(this.currentRoomId).subscribe({
                next: (room: any) => {
                    if (room.current_video_id && room.current_video_id !== this.lastActiveVideoId) {
                        console.log('Network Sync: New video detected from creator', room.current_video_id);
                        this.lastActiveVideoId = room.current_video_id;
                        this.videoStarted$.next(room.current_video_id);
                    }
                },
                error: (err) => console.error('Polling error:', err)
            });
        }, 2000); // Poll every 2 seconds
    }

    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    simulateVideoStart(roomId: number, videoId: number) {
        // Immediate local sync for current browser window
        this.lastActiveVideoId = videoId;
        this.videoStarted$.next(videoId);
    }

    simulateVideoSync(roomId: number, videoId: number, currentTime: number, isPlaying: boolean, userId: number) {
        this.videoSynced$.next({ roomId, videoId, currentTime, isPlaying, userId });
    }
}
