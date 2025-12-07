import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { QuillModule } from 'ngx-quill';
import { NotesService } from '../notes.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-note-details',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    MatProgressSpinnerModule,
    QuillModule,
    MatTooltipModule   
  ],
  templateUrl: './note-details.component.html',
  styleUrl: './note-details.component.scss'
})
export class NoteDetailsComponent implements OnDestroy {

  // Configuration for the read-only editor
  quillEditorModules = {
    toolbar: false
  };

  isLoading = false;
  note: any;
  openEditCallback: any;

  // ---- Text-to-Speech state ----
  isSpeaking = false;
  private synth: SpeechSynthesis | null = null;
  private utterance: SpeechSynthesisUtterance | null = null;

  constructor(
    public dialogRef: MatDialogRef<NoteDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private notesService: NotesService
  ) {
    console.log('MAT_DIALOG_DATA received:', data);

    this.note = data.note;                 // ✔ Correct
    this.openEditCallback = data.openEdit; // ✔ Correct

    // Web Speech API instance (browser side)
    if ('speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    } else {
      this.synth = null;
      console.warn('Speech Synthesis not supported in this browser.');
    }
  }

  // --------------- TEXT TO SPEECH METHODS ----------------

  /**
   * Toggle speak / stop.
   */
  toggleSpeak(): void {
    if (!this.synth) {
      alert('Your browser does not support text-to-speech.');
      return;
    }

    if (this.isSpeaking) {
      this.stopSpeaking();
    } else {
      this.startSpeaking();
    }
  }

  /**
   * Start reading the note content aloud.
   */
  private startSpeaking(): void {
    const htmlContent = this.note?.content || '';
    const text = this.getPlainText(htmlContent);

    if (!text.trim()) {
      console.warn('No text available to speak.');
      return;
    }

    // In case anything is already speaking
    this.stopSpeaking(true);

    this.utterance = new SpeechSynthesisUtterance(text);

    // Tune these as you like
    this.utterance.lang = 'en-IN';  // ya 'hi-IN' agar hindi zyada hai
    this.utterance.rate = 1;
    this.utterance.pitch = 1;

    this.utterance.onend = () => {
      this.isSpeaking = false;
    };

  this.utterance.onerror = (event) => {
  if (event.error !== "interrupted") {
    console.error("Speech synthesis error:", event);
  }
  this.isSpeaking = false;
};


    this.isSpeaking = true;
    this.synth!.speak(this.utterance);
  }

  /**
   * Stop speaking (if cancelOnly = true, just cancel current speech).
   */
  private stopSpeaking(cancelOnly: boolean = false): void {
    if (!this.synth) return;

    this.synth.cancel();
    this.isSpeaking = false;

    if (!cancelOnly) {
      this.utterance = null;
    }
  }

  /**
   * Convert HTML (from Quill) to plain text for speech.
   */
private getPlainText(html: string): string {
  if (!html) return '';

  // Create temp DIV
  const div = document.createElement('div');
  div.innerHTML = html;

  // Extract text
  let text = div.textContent || div.innerText || '';

  // Remove extra blank lines, spaces, invisible characters
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}


  // --------------- EXISTING METHODS ----------------

  /**
   * Called when the "Revision Complete" button is clicked.
   */
  onRevisionComplete(): void {
    this.isLoading = true;
    this.notesService.markNoteAsRevised(this.note._id).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.stopSpeaking();   // stop voice if playing
        this.dialogRef.close(true); 
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to mark note as revised:', err);
      }
    });
  }

  /**
   * Method to close the dialog without any action.
   */
  onCancel(): void {
    this.stopSpeaking();   // stop voice on close
    this.dialogRef.close(false);
  }

  onEdit(): void {
    this.stopSpeaking();   // stop while editing
    try {
      if (this.openEditCallback && typeof this.openEditCallback === 'function') {
        this.openEditCallback(this.note);   // Parent ka openCreateDialog() call karega
      } else {
        console.error('Edit callback is not provided.');
      }
    } catch (error) {
      console.error('Error while opening edit dialog:', error);
    }
  }

  /**
   * Cleanup when dialog component is destroyed.
   */
  ngOnDestroy(): void {
    this.stopSpeaking();
  }
}
