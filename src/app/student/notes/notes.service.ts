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
  // Base URLs for the different API endpoints
  private noteApiUrl = `${environment.apiUrl}/notes`;
  private revisionApiUrl = `${environment.apiUrl}/revisions`; // URL for revision endpoints

  // Inject HttpClient to make API requests
  constructor(private http: HttpClient) { }

  // ======================================================
  // CRUD Operations for Notes
  // ======================================================

  /**
   * Creates a new note.
   * @param payload - The note data to be saved.
   */
  createNote(payload: NotePayload): Observable<any> {
    return this.http.post(this.noteApiUrl, payload);
  }
/**
 * Updates an existing note by its ID.
 * @param id - The ID of the note to update.
 * @param payload - The updated note data.
 */
updateNote(id: string, payload: NotePayload): Observable<any> {
  return this.http.put(`${this.noteApiUrl}/${id}`, payload);
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

  /**
   * Gets a single note by its ID.
   * @param id - The ID of the note to retrieve.
   */
  getNoteById(id: string): Observable<any> {
    return this.http.get(`${this.noteApiUrl}/${id}`);
  }

  // ======================================================
  // Revision System Methods
  // ======================================================

  /**
   * Gets all notes that are currently due for revision.
   * Corresponds to the `getDueNotes` controller.
   */
  getDueRevisionNotes(): Observable<any> {
    // The endpoint is /due, so the full path is /api/revisions/due
    return this.http.get(`${this.revisionApiUrl}/due`);
  }

  /**
   * Marks a note as revised.
   * This now sends a POST request to the correct endpoint.
   * @param noteId - The ID of the note to mark as revised.
   */
  markNoteAsRevised(noteId: string): Observable<any> {
    // Corrected to send a POST request to /revisions/:id/complete
    return this.http.post(`${this.revisionApiUrl}/${noteId}/complete`, {});
  }
}
