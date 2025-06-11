import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-note-details',
  standalone: true,
  imports: [CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    FormsModule, 
    QuillModule],
  templateUrl: './note-details.component.html',
  styleUrl: './note-details.component.scss'
})
export class NoteDetailsComponent {
  // Configuration for the read-only editor (no toolbar needed)
  quillEditorModules = {
    toolbar: false
  };

  constructor(
    public dialogRef: MatDialogRef<NoteDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public note: any
  ) {
    // The 'note' object is now available to use in the template
  }

  // Method to close the dialog
  onCancel(): void {
    this.dialogRef.close();
  }
}