import { Component, Inject } from '@angular/core';
// Material Module Imports
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DeadlineService } from '../deadline.service';
import { TopicService } from 'app/student/topic/topic.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable } from 'rxjs';

// Custom Services and Models

@Component({
  selector: 'app-deadlinedialog',
  standalone: true,
  imports: [ CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatNativeDateModule],
  templateUrl: './deadlinedialog.component.html',
  styleUrl: './deadlinedialog.component.scss'
})
export class DeadlinedialogComponent {
  deadlineForm: FormGroup;
  dialogTitle = 'Create New Deadline';
  topics: any[] = [];
  subtopics: any[] = [];
  isLoading = false;
  isEditMode = false;

  constructor(
    public dialogRef: MatDialogRef<DeadlinedialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private deadlineService: DeadlineService,
    private topicService: TopicService,
  ) {
    // Check if data is passed for editing
    if (this.data && this.data._id) {
      this.isEditMode = true;
      this.dialogTitle = 'Update Deadline Status';
    }

    this.deadlineForm = this.fb.group({
      title: ['', [Validators.required]],
      dueDate: ['', [Validators.required]],
      topicId: [null],
      subtopicId: [null]
    });

    // Disable subtopic until a topic is selected
    this.deadlineForm.get('subtopicId')?.disable();
  }

  ngOnInit(): void {
    this.loadTopics();
    this.onTopicChange();

    // If in edit mode, populate the form
    if (this.isEditMode) {
      this.deadlineForm.patchValue({
        title: this.data.title,
        dueDate: this.data.dueDate,
        topicId: this.data.topicId?._id, // Bind the topic ID
        // subtopicId will be patched after subtopics are loaded
      });
    }
  }

  loadTopics(): void {
    this.topicService.getAllTopics().subscribe((response: any) => {
      if (response && response.data) {
        this.topics = response.data;
      }
    });
  }

  onTopicChange(): void {
    this.deadlineForm.get('topicId')?.valueChanges.subscribe(topicId => {
      const subtopicControl = this.deadlineForm.get('subtopicId');
      subtopicControl?.reset();
      this.subtopics = [];

      if (topicId) {
        subtopicControl?.enable();
        this.topicService.getSubtopicsByTopic(topicId).subscribe((response: any) => {
          if (response && response.data) {
            this.subtopics = response.data;
            // If in edit mode, patch the subtopic value after they have been loaded
            if (this.isEditMode && this.data.subtopicId) {
              subtopicControl?.patchValue(this.data.subtopicId);
            }
          }
        });
      } else {
        subtopicControl?.disable();
      }
    });
  }

 onSave(): void {
    if (this.deadlineForm.invalid) {
      this.deadlineForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formData = this.deadlineForm.value;

    this.deadlineService.createDeadline(formData).subscribe({
      next: (newDeadline) => {
        this.isLoading = false;
        this.dialogRef.close(newDeadline);
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Error creating deadline:", err);
      }
    });
  }


  onMarkAsCompleted(): void {
    if (!this.isEditMode) return;

    this.isLoading = true;
    this.deadlineService.updateStatus(this.data._id, 'completed').subscribe({
        next: (response) => {
            this.isLoading = false;
            this.dialogRef.close(response); // Close dialog and return updated data
        },
        error: (err) => {
            this.isLoading = false;
            console.error("Error updating status:", err);
        }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}