import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { JobService } from '../job.service';

@Component({
  selector: 'app-add-job-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './add-job-dialog.component.html',
  styleUrls: ['./add-job-dialog.component.scss']
})
export class AddJobDialogComponent {
  jobForm: FormGroup;
  isParsing = false;
  isSaving = false;
  parsedSuccess = false;

  constructor(
    public dialogRef: MatDialogRef<AddJobDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private jobService: JobService
  ) {
    this.jobForm = this.fb.group({
      rawText: ['', Validators.required],
      companyName: [''],
      skillsRequired: [''], // Will handle array to string for display
      contactEmail: [''],
      contactPhone: [''],
      workMode: ['']
    });
  }

  parseJob() {
    if (!this.jobForm.get('rawText')?.value) return;

    this.isParsing = true;
    this.parsedSuccess = false;

    this.jobService.parseJobDescription(this.jobForm.value.rawText).subscribe({
      next: (res: any) => {
        if ((res.status === 'success' || res.success) && res.data) {
          this.jobForm.patchValue({
            companyName: res.data.companyName || '',
            skillsRequired: (res.data.skillsRequired || []).join(', '),
            contactEmail: res.data.contactEmail || '',
            contactPhone: res.data.contactPhone || '',
            workMode: res.data.workMode || ''
          });
          this.parsedSuccess = true;
        }
        this.isParsing = false;
      },
      error: (err) => {
        console.error('Failed to parse job', err);
        this.isParsing = false;
        alert('Failed to parse the job description. Please try again.');
      }
    });
  }

  saveJob() {
    if (this.jobForm.invalid) return;

    this.isSaving = true;
    
    // Convert comma-separated string back to array
    const skillsStr = this.jobForm.value.skillsRequired || '';
    const skillsArray = skillsStr.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);

    const payload = {
      ...this.jobForm.value,
      skillsRequired: skillsArray,
      status: 'Saved'
    };

    this.jobService.saveNewJob(payload).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Failed to save job', err);
        this.isSaving = false;
        alert('Failed to save job details.');
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }
}
