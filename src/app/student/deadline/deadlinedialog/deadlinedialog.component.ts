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

  constructor(
    public dialogRef: MatDialogRef<DeadlinedialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private deadlineService: DeadlineService,
    private topicService: TopicService, // Using TopicService for both
  ) {
    this.deadlineForm = this.fb.group({
      title: ['', [Validators.required]],
      dueDate: ['', [Validators.required]],
      topicId: [null],
      subtopicId: [null]
    });

    this.deadlineForm.get('subtopicId')?.disable();
  }

  ngOnInit(): void {
    this.loadTopics();
    this.onTopicChange();
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
      this.subtopics = []; // Clear previous subtopics

      if (topicId) {
        subtopicControl?.enable();
        // Assuming your TopicService has a method to get subtopics for a specific topic
        this.topicService.getSubtopicsByTopic(topicId).subscribe((response: any) => {
          // **FIX APPLIED HERE**
          // Extract the .data array from the response object
          if (response && response.data) {
            this.subtopics = response.data;
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

  onCancel(): void {
    this.dialogRef.close();
  }
}
