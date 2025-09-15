import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class MockInterviewService {
  private apiUrl = `${environment.apiUrl}/mock-interview`;

  constructor(private http: HttpClient) { }

  // Setup: support custom questions, questionCount, timeLimit
  startInterview(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/start`, data);
  }

  submitAnswer(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/answer`, data); // endpoint name is now /answer
  }

  // Feedback report
  getResults(sessionId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/results/${sessionId}`);
  }

  pauseInterview(sessionId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/pause`, { sessionId });
  }
  resumeInterview(sessionId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/resume`, { sessionId });
  }
}
