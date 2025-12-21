import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TopicService } from '../topic.service';

@Component({
    selector: 'app-create-topic-dialog',
    imports: [ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        MatIconModule],
    templateUrl: './create-topic-dialog.component.html',
    styleUrl: './create-topic-dialog.component.scss'
})
export class CreateTopicDialogComponent {
  topicForm: FormGroup;
  dialogTitle: string;

  constructor(
    public dialogRef: MatDialogRef<CreateTopicDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, 
    private fb: FormBuilder,
    private topicService: TopicService
  ) {
    this.dialogTitle = 'Create New Topic';
    
    this.topicForm = this.fb.group({
      name: ['', [Validators.required]]
    });
  }

  createTopic(): void {
    if (this.topicForm.valid) {
      const topicName = this.topicForm.get('name')?.value;
      this.topicService.createTopic(topicName).subscribe({
        next: (response) => {
          this.dialogRef.close(response);
        },
        error: (error) => {
          console.error('Error creating topic:', error);
        }
      });
    }
  }

}
