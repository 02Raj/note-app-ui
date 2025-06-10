import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

/**
 * Interface for the payload when creating a new note.
 * This ensures type safety.
 */
export interface NotePayload {
  title: string;
  content: string;
  topicId: string;
  subtopicId?: string; // Optional, as a note might only belong to a topic
}

@Injectable({
  providedIn: 'root'
})
export class NotesService {
  // Set the full base URL for the notes API endpoint
  private noteApiUrl = `${environment.apiUrl}/notes`;

  // Inject HttpClient to make API requests
  constructor(private http: HttpClient) { }

  /**
   * Creates a new note.
   * @param payload - The note data to be saved.
   */
  createNote(payload: NotePayload): Observable<any> {
    return this.http.post(this.noteApiUrl, payload);
  }

  /**
   * Gets all notes for the current user.
   */
  getAllNotes(): Observable<any> {
    return this.http.get(this.noteApiUrl);
  }

  /**
   * Gets all notes associated with a specific topic.
   * @param topicId - The ID of the parent topic.
   */
  getNotesByTopic(topicId: string): Observable<any> {
    return this.http.get(`${this.noteApiUrl}/topic/${topicId}`);
  }

  /**
   * Gets all notes associated with a specific subtopic.
   * @param subtopicId - The ID of the parent subtopic.
   */
  getNotesBySubtopic(subtopicId: string): Observable<any> {
    return this.http.get(`${this.noteApiUrl}/subtopic/${subtopicId}`);
  }

  /**
   * Deletes a note by its ID.
   * @param id - The ID of the note to delete.
   */
  deleteNote(id: string): Observable<any> {
    return this.http.delete(`${this.noteApiUrl}/${id}`);
  }
}