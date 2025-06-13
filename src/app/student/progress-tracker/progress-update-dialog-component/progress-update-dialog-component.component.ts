import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

// Import necessary Angular Material Modules for the dialog
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Import your services

import { ProgressTrackerService } from '../progress-tracker.service'; // Adjust path if needed
import { TopicService } from 'app/student/topic/topic.service';

@Component({
  selector: 'app-progress-update-dialog-component',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // Material Modules
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './progress-update-dialog-component.component.html',
  styleUrl: './progress-update-dialog-component.component.scss'
})
export class ProgressUpdateDialogComponentComponent implements OnInit {
  dialogTitle: string;
  progressForm: FormGroup;
  
  topics: any[] = [];
  subtopics: any[] = [];

  isTopicsLoading = false;
  isSubtopicsLoading = false;

  constructor(
    public dialogRef: MatDialogRef<ProgressUpdateDialogComponentComponent>,
    // Inject the data passed from the parent component. This data will contain the progress item for editing.
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    // Inject services
    private topicService: TopicService,
    // private subtopicService: SubtopicService,
    private progressService: ProgressTrackerService
  ) {
    // Determine if it's a new entry or an update
    this.dialogTitle = data._id ? 'Update Progress' : 'Add New Progress';
    
    // Initialize the form with validators and existing data if available
    this.progressForm = this.fb.group({
      topicId: [data.topicId?._id || '', [Validators.required]],
      subtopicId: [data.subtopicId?._id || null], // Optional
      progressPercent: [data.progressPercent || 0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit(): void {
    // Load the data needed for the form dropdowns
    this.loadTopics();
    this.loadSubtopics();
  }

  /**
   * Fetches the list of all topics to populate the topic dropdown.
   */
  loadTopics(): void {
    this.isTopicsLoading = true;
    this.topicService.getAllTopics().subscribe({
      next: (response: any) => {
        this.topics = response.data || [];
        this.isTopicsLoading = false;
      },
      error: (err) => {
        console.error("Failed to load topics", err);
        this.isTopicsLoading = false;
      }
    });
  }

  /**
   * Fetches the list of all subtopics to populate the subtopic dropdown.
   */
  loadSubtopics(): void {
    this.isSubtopicsLoading = true;
    this.topicService.getAllSubtopics().subscribe({
      next: (response: any) => {
        this.subtopics = response.data || [];
        this.isSubtopicsLoading = false;
      },
      error: (err) => {
        console.error("Failed to load subtopics", err);
        this.isSubtopicsLoading = false;
      }
    });
  }

  /**
   * Handles the form submission.
   * Validates the form and calls the service to create or update the progress entry.
   */
  onSave(): void {
    console.log("RRR")
    if (this.progressForm.invalid) {
      // If the form is invalid, do not proceed.
      // You can add logic here to mark fields as touched to show errors.
      return;
    }
    
    const payload = this.progressForm.value;
    
    // Call the service to create or update the record.
    // The service method should handle both cases based on whether an ID is present.
    this.progressService.createOrUpadate(payload).subscribe({
      next: () => {
        // On success, close the dialog and return `true` to signal a refresh is needed.
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error("Failed to save progress", err);
        // Optionally, show an error message to the user.
      }
    });
  }

  /**
   * Closes the dialog without saving any changes.
   */
  onCancel(): void {
    this.dialogRef.close();
  }
}
