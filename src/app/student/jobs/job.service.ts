import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { Job, ParsedJobResponse } from './job.model';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = `${environment.apiUrl}/jobs`;

  constructor(private http: HttpClient) {}

  /**
   * Parse raw job description text to extract structured data.
   */
  parseJobDescription(rawText: string): Observable<ParsedJobResponse> {
    return this.http.post<ParsedJobResponse>(`${this.apiUrl}/parse`, { rawText });
  }

  /**
   * Save a new parsed job to the database.
   */
  saveNewJob(jobData: Job): Observable<any> {
    return this.http.post<any>(this.apiUrl, jobData);
  }

  /**
   * Get all jobs for the logged-in user.
   */
  getAllJobs(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  /**
   * Update the status of a specific job.
   */
  updateJobStatus(id: string, status: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/status`, { status });
  }
}
