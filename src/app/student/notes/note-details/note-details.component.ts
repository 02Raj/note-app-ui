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
note: any;
openEditCallback: any;

constructor(
  public dialogRef: MatDialogRef<NoteDetailsComponent>,
  @Inject(MAT_DIALOG_DATA) public data: any,
  private notesService: NotesService
) {
  console.log("MAT_DIALOG_DATA received:", data);

  this.note = data.note;                 // ✔ Correct
  this.openEditCallback = data.openEdit; // ✔ Correct
}




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

  onEdit(): void {
  try {
    if (this.openEditCallback && typeof this.openEditCallback === 'function') {
      this.openEditCallback(this.note);   // Parent ka openCreateDialog() call karega
    } else {
      console.error("Edit callback is not provided.");
    }
  } catch (error) {
    console.error("Error while opening edit dialog:", error);
  }
}

}
