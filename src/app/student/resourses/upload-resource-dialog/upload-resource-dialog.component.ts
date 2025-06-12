import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

// --- Required Material and Service Imports ---
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select'; // <-- Import MatSelectModule
import { ResourcesService } from '../resourses.service';
import { TopicService } from 'app/student/topic/topic.service';


@Component({
  selector: 'app-upload-resource-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    CommonModule,
    MatSelectModule, // <-- Add to imports
  ],
  templateUrl: './upload-resource-dialog.component.html',
  styleUrl: './upload-resource-dialog.component.scss'
})
export class UploadResourceDialogComponent implements OnInit {
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  fileName = '';
  topics: any[] = []; // To store the list of topics

  constructor(
    public dialogRef: MatDialogRef<UploadResourceDialogComponent>,
    private fb: FormBuilder,
    private resourcesService: ResourcesService,
    private topicService: TopicService // Inject TopicService
  ) {
    this.uploadForm = this.fb.group({
      resourceFile: [null, Validators.required],
      topicId: [null] // Optional topic selection
    });
  }

  ngOnInit(): void {
    this.loadTopics();
  }

  // Fetches the list of topics to populate the dropdown
  loadTopics(): void {
    this.topicService.getAllTopics().subscribe({
      next: (response:any) => {
        // Assuming the API returns an object like { data: [...] }
        this.topics = response.data || [];
      },
      error: (err:any) => {
        console.error("Failed to load topics for dialog", err);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.fileName = this.selectedFile.name;
      this.uploadForm.patchValue({ resourceFile: this.selectedFile });
    }
  }

  onUpload(): void {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('resource', this.selectedFile, this.selectedFile.name);
    
    // Get the selected topicId from the form
    const topicId = this.uploadForm.get('topicId')?.value;
    if (topicId) {
        // Append topicId only if a topic was selected
        formData.append('topicId', topicId);
    }

    this.resourcesService.uploadResource(formData).subscribe({
      next: (response) => {
        // Success! Close the dialog and return the new resource data.
        this.dialogRef.close(response);
      },
      error: (err) => {
        console.error('Upload failed', err);
        // You can add user-facing error handling here, e.g., using a snackbar.
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
