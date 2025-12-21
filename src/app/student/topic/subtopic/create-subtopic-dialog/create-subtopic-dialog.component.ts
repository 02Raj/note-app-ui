import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select'; // <-- Import MatSelectModule for the dropdown
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TopicService } from '../../topic.service';
// Adjust path if necessary

export interface Topic {
  _id: string;
  name: string;
}
@Component({
    selector: 'app-create-subtopic-dialog',
    imports: [ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatIconModule],
    templateUrl: './create-subtopic-dialog.component.html',
    styleUrl: './create-subtopic-dialog.component.scss'
})
export class CreateSubtopicDialogComponent {
  subtopicForm: FormGroup;
  topics: Topic[] = []; // Array to store the list of topics
  dialogTitle: string;

  constructor(
    public dialogRef: MatDialogRef<CreateSubtopicDialogComponent>,
    private fb: FormBuilder,
    private topicService: TopicService // Inject the service to get topics
  ) {
    this.dialogTitle = 'Create New Subtopic';

    // Create a form with 'name' and 'topicId' controls
    this.subtopicForm = this.fb.group({
      name: ['', Validators.required],
      topicId: ['', Validators.required] // This will hold the ID of the selected parent topic
    });
  }

  ngOnInit(): void {
    // When the component initializes, load the topics for the dropdown
    this.loadTopics();
  }

  /**
   * Fetches the list of all topics from the service.
   */
  loadTopics(): void {
    this.topicService.getAllTopics().subscribe({
      next: (response:any) => {
        if (response.status === 'success' && response.data) {
          this.topics = response.data;
        }
      },
      error: (error:any) => {
        console.error('Error fetching topics:', error);
      }
    });
  }

  /**
   * Called when the save button is clicked.
   * If the form is valid, creates new subtopic using service
   */
  onSave(): void {
    if (this.subtopicForm.valid) {
      this.topicService.createSubtopic(this.subtopicForm.value).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.dialogRef.close(response.data);
          }
        },
        error: (error) => {
          console.error('Error creating subtopic:', error);
        }
      });
    }
  }

  /**
   * Called when the cancel button is clicked. Closes the dialog.
   */
  onCancel(): void {
    this.dialogRef.close();
  }

}
