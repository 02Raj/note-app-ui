import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { Deadline } from './models/deadline.model';
import { map } from 'rxjs/operators'
// API se aane wale response ka structure define karein
interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DeadlineService {
  private readonly apiUrl = `${environment.apiUrl}/deadlines`;

  constructor(private http: HttpClient) { }

  /**
   * Get all deadlines for the logged-in user
   */
  getDeadlines(): Observable<Deadline[]> {
    // API se aane wale response se 'data' property ko extract karein
    return this.http.get<ApiResponse<Deadline[]>>(this.apiUrl).pipe(
      map(response => response.data) // <<-- YEH LINE ERROR FIX KAREGI
    );
  }

  /**
   * Create a new deadline
   */
  createDeadline(deadlineData: Partial<Deadline>): Observable<Deadline> {
    return this.http.post<ApiResponse<Deadline>>(this.apiUrl, deadlineData).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update the status of a deadline
   */
  updateStatus(id: string, status: 'pending' | 'completed' | 'missed'): Observable<Deadline> {
    return this.http.put<ApiResponse<Deadline>>(`${this.apiUrl}/${id}/status`, { status }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Delete a deadline by its ID
   */
  deleteDeadline(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}