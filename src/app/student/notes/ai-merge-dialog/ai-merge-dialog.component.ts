import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ai-merge-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, CommonModule],
  template: `
    <h2 mat-dialog-title style="color: #9c27b0; display: flex; align-items: center; gap: 8px;">
      <mat-icon>auto_awesome</mat-icon> AI Master Note: {{ data.topicName }}
    </h2>
    <mat-dialog-content>
      <div style="background: #fafafa; padding: 16px; border-radius: 8px; border: 1px solid #e0e0e0; max-height: 60vh; overflow-y: auto;">
        <pre style="white-space: pre-wrap; font-family: 'Inter', sans-serif; font-size: 14px; color: #333; margin: 0; line-height: 1.6;">{{ data.mergedContent }}</pre>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onClose()">Close</button>
      <button mat-raised-button color="accent" (click)="copyToClipboard()" style="background-color: #9c27b0; color: white;">
        <mat-icon>content_copy</mat-icon> Copy Master Note
      </button>
    </mat-dialog-actions>
  `,
  styles: []
})
export class AiMergeDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AiMergeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { topicName: string; mergedContent: string }
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.data.mergedContent).then(() => {
      alert('Copied to clipboard! You can now paste this into a new Note and delete the duplicates.');
    });
  }
}
