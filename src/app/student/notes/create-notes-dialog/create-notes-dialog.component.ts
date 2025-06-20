import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { QuillModule } from 'ngx-quill';
import { NotePayload, NotesService } from '../notes.service';
import { TopicService } from 'app/student/topic/topic.service';
import { CreateTopicDialogComponent } from 'app/student/topic/create-topic-dialog/create-topic-dialog.component';
import { CreateSubtopicDialogComponent } from 'app/student/topic/subtopic/create-subtopic-dialog/create-subtopic-dialog.component';

// Custom validator to check if Quill editor is empty
export function quillRequiredValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (value) {
      const tempElement = document.createElement('div');
      tempElement.innerHTML = value;
      const text = tempElement.textContent || tempElement.innerText || '';
      if (text.trim().length === 0) {
        return { required: true }; // Return error if only whitespace
      }
    } else {
      return { required: true }; // Return error if null/undefined
    }
    return null; // Valid
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
    QuillModule,
    MatDividerModule,
  ],
  templateUrl: './create-notes-dialog.component.html',
  styleUrls: ['./create-notes-dialog.component.scss']
})
export class CreateNotesDialogComponent implements OnInit {
  noteForm: FormGroup;
  topics: any[] = [];
  subtopics: any[] = [];
  dialogTitle = 'Create New Note';
  isEditMode = false; // To track if it's an edit operation

  quillEditorModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'], ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }], [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }], [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }], [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }], [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }], [{ 'align': [] }], ['clean'], ['link', 'image']
    ],
  };

  private previousTopicId: string | null = null;
  private previousSubtopicId: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<CreateNotesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public note: any, // Injected data
    private fb: FormBuilder,
    private topicService: TopicService,
    private notesService: NotesService,
    public dialog: MatDialog
  ) {
    // Check if data was passed for editing
    if (this.note && this.note._id) {
      this.isEditMode = true;
      this.dialogTitle = 'Edit Note';
    }

    this.noteForm = this.fb.group({
      title: ['', Validators.required],
      topicId: ['', Validators.required],
      subtopicId: [''], // Optional
      content: ['', [Validators.required, quillRequiredValidator()]] // Added custom validator
    });
  }

  ngOnInit(): void {
    this.loadTopics();

    // If in edit mode, populate the form with existing note data
    if (this.isEditMode) {
      this.noteForm.patchValue({
        title: this.note.title,
        topicId: this.note.topicId,
        content: this.note.content
        // subtopicId is set in onTopicChange after subtopics load
      });
    }

    // --- Logic for Topic dropdown changes ---
    this.noteForm.get('topicId')?.valueChanges.subscribe(value => {
      if (value === 'createNewTopic') {
        setTimeout(() => {
          this.noteForm.get('topicId')?.setValue(this.previousTopicId, { emitEvent: false });
          this.openTopicDialog();
        });
      } else {
        this.previousTopicId = value;
        this.onTopicChange(value);
      }
    });

    // --- Logic for Subtopic dropdown changes ---
    this.noteForm.get('subtopicId')?.valueChanges.subscribe(value => {
      if (value === 'createNewSubtopic') {
        setTimeout(() => {
          this.noteForm.get('subtopicId')?.setValue(this.previousSubtopicId, { emitEvent: false });
          this.openSubtopicDialog();
        });
      } else {
        this.previousSubtopicId = value;
      }
    });
  }

  loadTopics(): void {
    this.topicService.getAllTopics().subscribe({
      next: (response) => this.topics = response.data || [],
      error: (err) => console.error('Error loading topics', err)
    });
  }

  onTopicChange(topicId: string): void {
    this.subtopics = [];
    this.noteForm.get('subtopicId')?.setValue('');

    if (topicId) {
      this.topicService.getSubtopicsByTopic(topicId).subscribe({
        next: (response) => {
          this.subtopics = response.data || [];
          // If in edit mode, and the loaded topic is the note's original topic,
          // then set the subtopic value.
          if (this.isEditMode && this.note && this.note.topicId === topicId) {
            this.noteForm.get('subtopicId')?.setValue(this.note.subtopicId);
          }
        },
        error: (err) => console.error('Error loading subtopics', err)
      });
    }
  }

  onSave(): void {
    if (this.noteForm.invalid) {
      this.noteForm.markAllAsTouched(); // Show validation errors on all fields
      console.log('Form is invalid. Please fill all required fields.');
      // Optional: Log invalid controls for debugging
      Object.keys(this.noteForm.controls).forEach(field => {
        const control = this.noteForm.get(field);
        if (control?.invalid) {
          console.log(`Field -> '${field}' is invalid. Errors:`, control.errors);
        }
      });
      return;
    }

    const payload: NotePayload = this.noteForm.value;

    if (this.isEditMode) {
      // --- UPDATE NOTE LOGIC ---
      this.notesService.updateNote(this.note._id, payload).subscribe({
        next: (response) => {
          console.log('Note updated successfully!', response);
          this.dialogRef.close(true); // Close dialog and signal success
        },
        error: (err) => console.error('Error updating note', err)
      });
    } else {
      // --- CREATE NOTE LOGIC ---
      this.notesService.createNote(payload).subscribe({
        next: (response) => {
          console.log('Note created successfully!', response);
          this.dialogRef.close(true); // Close dialog and signal success
        },
        error: (err) => console.error('Error creating note', err)
      });
    }
  }
  
  onContentChanged(event: any): void {
    // This function is correctly bound in the template.
    // The custom validator handles the 'required' check automatically.
    // You can add more logic here if needed.
    console.log('Content changed:', event.html);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
  
  refreshTopics(): void {
    this.loadTopics();
  }

  openTopicDialog(): void {
    const dialogRef = this.dialog.open(CreateTopicDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result._id) {
        console.log('Topic created:', result);
        this.refreshTopics();
        this.noteForm.get('topicId')?.setValue(result._id); // Select the newly created topic
      } else {
         this.noteForm.get('topicId')?.setValue(this.previousTopicId);
      }
    });
  }

  openSubtopicDialog(): void {
    const currentTopicId = this.noteForm.get('topicId')?.value;
    if (!currentTopicId || currentTopicId === 'createNewTopic') {
      // You can replace alert with a more modern notification if you have a service for it
      alert('Please select a topic before creating a subtopic.');
      return;
    }

    const dialogRef = this.dialog.open(CreateSubtopicDialogComponent, {
      width: '400px',
      data: { topicId: currentTopicId } // Pass parent topic ID
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result._id) {
        console.log('Subtopic created:', result);
        this.onTopicChange(currentTopicId); // Refresh subtopic list
        this.noteForm.get('subtopicId')?.setValue(result._id); // Select the new subtopic
      } else {
        this.noteForm.get('subtopicId')?.setValue(this.previousSubtopicId);
      }
    });
  }
}