import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

/**
 * Defines the structure for the progress update payload.
 * Using an interface ensures type safety.
 */
export interface ProgressUpdatePayload {
  topicId: string;
  subtopicId?: string; // Optional, as progress might be tied only to a topic
  progressPercent: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProgressTrackerService {
  // Define the base URL for the progress API
  private progressApiUrl = `${environment.apiUrl}/progress`;

  // Inject HttpClient to make requests
  constructor(private http: HttpClient) { }

  /**
   * Updates or creates a progress entry for a topic or subtopic.
   * Corresponds to the `updateProgress` controller.
   * @param payload - The data for the progress update.
   */
  updateProgress(payload: ProgressUpdatePayload): Observable<any> {
    return this.http.post(this.progressApiUrl, payload);
  }

  /**
   * Fetches all progress entries for the current user.
   * Corresponds to the `getUserProgress` controller.
   */
  getUserProgress(): Observable<any> {
    return this.http.get(this.progressApiUrl);
  }
}
