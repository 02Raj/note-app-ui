import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment'; // Make sure the path is correct

// Interface for creating a subtopic for better type safety
export interface SubtopicPayload {
  name: string;
  description?: string;
  topicId: string;
}

@Injectable({
  providedIn: 'root'
})
export class TopicService {
  private topicApiUrl = `${environment.apiUrl}/topics`;
  private subtopicApiUrl = `${environment.apiUrl}/subtopics`; // Base URL for subtopics

  constructor(private http: HttpClient) { }

  // ===================================
  // Methods for Topics
  // ===================================

  /**
   * Creates a new topic.
   * @param name - The name of the topic.
   */
  createTopic(name: string): Observable<any> {
    return this.http.post(this.topicApiUrl, { name });
  }

  /**
   * Gets all topics.
   */
  getAllTopics(): Observable<any> {
    return this.http.get(this.topicApiUrl);
  }

  /**
   * Deletes a topic by its ID.
   * @param id - The ID of the topic to delete.
   */
  deleteTopic(id: string): Observable<any> {
    return this.http.delete(`${this.topicApiUrl}/${id}`);
  }

  // ===================================
  // Methods for Subtopics
  // ===================================

  /**
   * Creates a new subtopic.
   * @param payload - Object with the name, description, and topicId of the subtopic.
   */
  createSubtopic(payload: SubtopicPayload): Observable<any> {
    return this.http.post(this.subtopicApiUrl, payload);
  }

  /**
   * Gets all subtopics for the user.
   */
  getAllSubtopics(): Observable<any> {
    return this.http.get(this.subtopicApiUrl);
  }

  /**
   * Gets all subtopics associated with a specific topic.
   * @param topicId - The ID of the parent topic.
   */
  getSubtopicsByTopic(topicId: string): Observable<any> {
    return this.http.get(`${this.subtopicApiUrl}/topic/${topicId}`);
  }

  /**
   * Deletes a subtopic by its ID.
   * @param id - The ID of the subtopic to delete.
   */
  deleteSubtopic(id: string): Observable<any> {
    return this.http.delete(`${this.subtopicApiUrl}/${id}`);
  }
}