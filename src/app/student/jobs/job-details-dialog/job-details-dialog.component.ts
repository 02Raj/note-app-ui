import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Job } from '../job.model';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-job-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './job-details-dialog.component.html',
  styleUrls: ['./job-details-dialog.component.scss']
})
export class JobDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<JobDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public job: Job
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
