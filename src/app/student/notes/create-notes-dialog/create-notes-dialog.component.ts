import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl, FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

// Import the Quill editor module
import { QuillModule } from 'ngx-quill';
import { NotePayload, NotesService } from '../notes.service';
import { TopicService } from 'app/student/topic/topic.service';
// Adjust path if necessary
// DEBUGGING VERSION of the validator
export function quillRequiredValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;

    if (value) {
      const tempElement = document.createElement('div');
      tempElement.innerHTML = value;
      const text = tempElement.textContent || tempElement.innerText || '';

      if (text.trim().length === 0) {
        return { required: true };
      }
    } else {
      return { required: true };
    }

    return null;
  };
}



@Component({
  selector: 'app-create-notes-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    QuillModule ,
    FormsModule,          

  ],
  templateUrl: './create-notes-dialog.component.html',
  styleUrls: ['./create-notes-dialog.component.scss']
})
export class CreateNotesDialogComponent implements OnInit {
  noteForm: FormGroup;
  topics: any[] = [];
  subtopics: any[] = [];
  dialogTitle = 'Create New Note';

  // Configuration for the Quill Rich Text Editor
  quillEditorModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image'] // link and image uploading
    ],
    // syntax: true // Enable syntax highlighting
  };

  constructor(
    public dialogRef: MatDialogRef<CreateNotesDialogComponent>,
    private fb: FormBuilder,
    private topicService: TopicService,
    private notesService: NotesService
  ) {
    this.noteForm = this.fb.group({
      title: ['', Validators.required],
      topicId: ['', Validators.required],
      subtopicId: [''], // Optional
      content: ['']
    });
  }

  ngOnInit(): void {
    this.loadTopics();

    // When the user selects a topic, load its subtopics
    this.noteForm.get('topicId')?.valueChanges.subscribe(topicId => {
      this.onTopicChange(topicId);
    });
  }

  loadTopics(): void {
    this.topicService.getAllTopics().subscribe({
      next: (response) => this.topics = response.data || [],
      error: (err) => console.error('Error loading topics', err)
    });
  }

  onTopicChange(topicId: string): void {
    // Reset subtopic selection and list
    this.subtopics = [];
    this.noteForm.get('subtopicId')?.setValue('');

    if (topicId) {
      this.topicService.getSubtopicsByTopic(topicId).subscribe({
        next: (response) => this.subtopics = response.data || [],
        error: (err) => console.error('Error loading subtopics', err)
      });
    }
  }

  onSave(): void {
    if (this.noteForm.invalid) {
      console.log('Form is invalid. Finding error fields...');
      this.noteForm.markAllAsTouched();
  
      Object.keys(this.noteForm.controls).forEach(field => {
        const control = this.noteForm.get(field);
        if (control?.invalid) {
          console.log(`Field -> '${field}' is invalid. Errors:`, control.errors);
          console.log(`Value of '${field}':`, control.value);
        }
      });
  
      return;
    }
  
    const payload: NotePayload = this.noteForm.value;
    console.log("Final payload:", payload); // Debug
  
    this.notesService.createNote(payload).subscribe({
      next: (response) => {
        console.log('Note created successfully!', response);
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error creating note', err);
      }
    });
  }
  
  
// Add this method inside your CreateNotesDialogComponent class

public onEditorCreated(editor: any) {
  editor.on('text-change', () => {
    const html = editor.root.innerHTML;
    const control = this.noteForm.get('content');

    const isEmpty = html === '<p><br></p>';

    if (control) {
      control.setValue(isEmpty ? '' : html);
      control.markAsTouched(); // Ensures dirty/touched status
      control.updateValueAndValidity(); // Triggers validator
      console.log('Updated content value:', control.value);
    }
  });
}

// Yeh aapka TypeScript function hai jo call nahi ho raha
onContentChanged(event: any): void {
  console.log('Function called!', event);
}


  onCancel(): void {
    this.dialogRef.close();
  }
}