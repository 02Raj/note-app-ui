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
import { MatDividerModule } from '@angular/material/divider';

@Component({
    selector: 'app-note-details',
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        FormsModule,
        MatProgressSpinnerModule,
        QuillModule,
        MatTooltipModule,
        MatDividerModule
    ],
    templateUrl: './note-details.component.html',
    styleUrl: './note-details.component.scss'
})
export class NoteDetailsComponent implements OnDestroy {

  quillEditorModules = { toolbar: false };

  isLoading = false;
  isSpeaking = false;

  note: any;
  openEditCallback: any;

  // 🔥 NEW: language selection
  selectedLang: 'english' | 'hinglish' = 'english';

  private synth: SpeechSynthesis | null = null;
  private utterance: SpeechSynthesisUtterance | null = null;

  private chunks: string[] = [];
  currentChunkIndex = 0;

  constructor(
    public dialogRef: MatDialogRef<NoteDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private notesService: NotesService
  ) {
    this.note = data.note;
    this.openEditCallback = data.openEdit;

    if ('speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  // =====================================================
  // 🤖 AI SPEAK FEATURE (NEW)
  // =====================================================

  speakWithAI(): void {
    if (!this.synth) return;

    this.isLoading = true;
    this.stopSpeaking();

    this.notesService
      .explainNoteWithAI(this.note.content, this.selectedLang)
      .subscribe({
        next: (res) => {
          const aiText = res.data;
          this.chunks = this.splitText(aiText);
          this.currentChunkIndex = 0;
          this.isLoading = false;
          this.speakCurrentChunk();
        },
        error: (err) => {
          console.error('AI explain failed:', err);
          this.isLoading = false;
        }
      });
  }

  private speakCurrentChunk(): void {
    if (!this.synth || !this.chunks.length) return;

    const text = this.chunks[this.currentChunkIndex];

    this.synth.cancel();

    this.utterance = new SpeechSynthesisUtterance(text);
    this.utterance.lang =
      this.selectedLang === 'hinglish' ? 'hi-IN' : 'en-US';

    this.utterance.rate = 0.95;
    this.utterance.pitch = 1;

    this.utterance.onend = () => {
      if (this.currentChunkIndex < this.chunks.length - 1) {
        this.currentChunkIndex++;
        this.speakCurrentChunk();
      } else {
        this.isSpeaking = false;
      }
    };

    this.isSpeaking = true;
    this.synth.speak(this.utterance);
  }

  // =====================================================
  // EXISTING METHODS (UNCHANGED)
  // =====================================================

  previousChunk(): void {
    if (this.currentChunkIndex > 0) {
      this.currentChunkIndex--;
      this.speakCurrentChunk();
    }
  }

  nextChunk(): void {
    if (this.currentChunkIndex < this.chunks.length - 1) {
      this.currentChunkIndex++;
      this.speakCurrentChunk();
    }
  }

  restartFromBeginning(): void {
    this.currentChunkIndex = 0;
    this.speakCurrentChunk();
  }

  private stopSpeaking(): void {
    this.synth?.cancel();
    this.isSpeaking = false;
  }

  private splitText(text: string): string[] {
    return text.match(/[^.?!]+[.?!]*/g) || [text];
  }

  onRevisionComplete(): void {
    this.isLoading = true;
    this.notesService.markNoteAsRevised(this.note._id).subscribe({
      next: () => {
        this.isLoading = false;
        this.stopSpeaking();
        this.dialogRef.close(true);
      },
      error: () => (this.isLoading = false)
    });
  }

  onCancel(): void {
    this.stopSpeaking();
    this.dialogRef.close(false);
  }

  onEdit(): void {
    this.stopSpeaking();
    this.openEditCallback?.(this.note);
  }

  ngOnDestroy(): void {
    this.stopSpeaking();
  }
}
