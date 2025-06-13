import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResourcesService {
  // Aapka backend server ka URL
  private apiUrl = `${environment.apiUrl}/resources`; // Isko apne URL se badal lein

  constructor(private http: HttpClient) { }

  /**
   * Ek topic ke saare resources fetch karta hai
   * @param topicId - Jis topic ke resource chahiye uski ID
   */
  getResourcesByTopic(topicId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/topic/${topicId}`);
  }

  /**
   * Naya resource upload karta hai (File ke saath)
   * @param formData - FormData object jismein file aur topicId ho
   */
  uploadResource(formData: FormData): Observable<any> {
    // Note: Authentication token HttpClient interceptor ke through apne aap lag jaana chahiye
    return this.http.post<any>(`${this.apiUrl}/upload`, formData);
  }

  /**
   * Ek resource ko uski ID se delete karta hai
   * @param id - Resource ki ID jise delete karna hai
   */
  deleteResource(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
