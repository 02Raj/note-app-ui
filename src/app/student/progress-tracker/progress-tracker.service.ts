/*
--------------------------------------------------------------------------------
-- File: progress-tracker.service.ts
-- Your existing service file. No changes are needed here.
--------------------------------------------------------------------------------
*/
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

export interface ProgressUpdatePayload {
  topicId: string;
  subtopicId?: string;
  progressPercent: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProgressTrackerService {
  private progressApiUrl = `${environment.apiUrl}/progress`;

  constructor(private http: HttpClient) { }

  createOrUpadate(payload: ProgressUpdatePayload): Observable<any> {
    return this.http.post(this.progressApiUrl, payload);
  }

  getUserProgress(): Observable<any> {
    return this.http.get(this.progressApiUrl);
  }
}
