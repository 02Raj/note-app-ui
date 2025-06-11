import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { QuillModule } from 'ngx-quill';
import { NotesService } from '../notes.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-note-details',
  standalone: true,
  imports: [CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    FormsModule, 
    MatProgressSpinnerModule,
    QuillModule],
  templateUrl: './note-details.component.html',
  styleUrl: './note-details.component.scss'
})
export class NoteDetailsComponent {
  // Configuration for the read-only editor
  quillEditorModules = {
    toolbar: false
  };
  
  isLoading = false;

  constructor(
    public dialogRef: MatDialogRef<NoteDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public note: any,
    private notesService: NotesService // Inject the service
  ) {}

  /**
   * Called when the "Revision Complete" button is clicked.
   */
  onRevisionComplete(): void {
    this.isLoading = true;
    this.notesService.markNoteAsRevised(this.note._id).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Close the dialog and pass 'true' to indicate success
        this.dialogRef.close(true); 
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Failed to mark note as revised:", err);
        // Optionally, show an error message to the user
      }
    });
  }

  /**
   * Method to close the dialog without any action.
   */
  onCancel(): void {
    // Close the dialog and pass 'false' or nothing
    this.dialogRef.close(false);
  }
}
