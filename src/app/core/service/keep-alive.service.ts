import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class KeepAliveService {
  private intervalId: any;

  constructor(private http: HttpClient) {}

  /**
   * Starts a periodic ping to keep the backend awake.
   * Render free tier spins down after 15-20 mins of inactivity.
   * We ping every 10 minutes (600,000 ms) to prevent this.
   */
  start() {
    if (this.intervalId) return;
    
    // Ping immediately once, then every 10 minutes
    console.log('Keep-alive service started.');
    
    this.intervalId = setInterval(() => {
      // Any request to the backend will reset the idle timer.
      // Assuming a generic endpoint or even if it returns 404, it wakes the server.
      this.http.get(`${environment.apiUrl}/notes`).subscribe({
        next: () => console.log('Keep-alive ping successful.'),
        error: () => console.log('Keep-alive ping sent (may return 404, but keeps server awake).')
      });
    }, 10 * 60 * 1000); // 10 minutes
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
