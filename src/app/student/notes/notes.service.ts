import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, tap } from 'rxjs';
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

  // Cache for all notes
  private allNotesSubject = new BehaviorSubject<any>(null);

  // Inject HttpClient to make API requests
  constructor(private http: HttpClient) { }

  /**
   * Invalidate the notes cache
   */
  clearCache() {
    this.allNotesSubject.next(null);
  }

  // ======================================================
  // CRUD Operations for Notes
  // ======================================================

  /**
   * Creates a new note.
   * @param payload - The note data to be saved.
   */
  createNote(payload: NotePayload): Observable<any> {
    return this.http.post(this.noteApiUrl, payload).pipe(tap(() => this.clearCache()));
  }
/**
 * Updates an existing note by its ID.
 * @param id - The ID of the note to update.
 * @param payload - The updated note data.
 */
updateNote(id: string, payload: NotePayload): Observable<any> {
  return this.http.put(`${this.noteApiUrl}/${id}`, payload).pipe(tap(() => this.clearCache()));
}

/** Quickly update only the priority of a note */
updateNotePriority(id: string, priority: 'low' | 'medium' | 'high'): Observable<any> {
  return this.http.put(`${this.noteApiUrl}/${id}`, { priority }).pipe(tap(() => this.clearCache()));
}

/** Quickly update only the color of a note (pass null to clear) */
updateNoteColor(id: string, color: string | null): Observable<any> {
  return this.http.put(`${this.noteApiUrl}/${id}`, { color }).pipe(tap(() => this.clearCache()));
}

  /**
   * Gets all notes for the current user.
   */
  getAllNotes(): Observable<any> {
    if (this.allNotesSubject.value) {
      return of(this.allNotesSubject.value);
    }
    return this.http.get(this.noteApiUrl).pipe(
      tap(res => this.allNotesSubject.next(res))
    );
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
    return this.http.delete(`${this.noteApiUrl}/${id}`).pipe(tap(() => this.clearCache()));
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
  markNoteAsRevised(noteId: string, rating: 'got_it' | 'shaky' | 'forgot' = 'got_it'): Observable<any> {
    return this.http.post(`${this.revisionApiUrl}/${noteId}/complete`, { rating });
  }


  getDrillNotes(): Observable<any> {
    return this.http.get(`${this.revisionApiUrl}/drill`);
  }


  getWeakNotes(): Observable<any> {
    return this.http.get(`${this.revisionApiUrl}/weak`);
  }

  // ======================================================
  // AI Features
  // ======================================================

  /**
   * Search notes semantically using AI embeddings.
   * @param query - The user's search text.
   */
  aiSearch(query: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/ai/search`, { query });
  }

  /**
   * Deduplicate and merge notes for a specific topic.
   * @param topicId - The ID of the topic.
   * @param topicName - The name of the topic for context.
   */
  aiMerge(topicId: string, topicName: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/ai/merge`, { topicId, topicName });
  }

}
