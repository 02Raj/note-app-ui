import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MockInterviewService {
 // Aapka backend server ka URL
 private apiUrl = 'http://localhost:5000/api/mock-interview';

 constructor(private http: HttpClient) { }

 /**
  * Naya interview session shuru karne ke liye API call
  * @param data - { userId, jobProfile, experience, topics }
  */
 startInterview(data: any): Observable<any> {
   return this.http.post<any>(`${this.apiUrl}/start`, data);
 }

 /**
  * Jawaab submit karne ke liye API call
  * @param data - { sessionId, questionNumber, userAnswer }
  */
 submitAnswer(data: any): Observable<any> {
   return this.http.post<any>(`${this.apiUrl}/submit`, data);
 }

 /**
  * Final feedback report paane ke liye API call
  * @param sessionId - Interview session ki ID
  */
 getResults(sessionId: string): Observable<any> {
   return this.http.get<any>(`${this.apiUrl}/results/${sessionId}`);
 }
}
