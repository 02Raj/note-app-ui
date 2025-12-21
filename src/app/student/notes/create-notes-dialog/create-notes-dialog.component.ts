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
import { Observable, tap } from 'rxjs';

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
  // Load topics and *then* if edit mode populate the form and load subtopics
  this.loadTopics().subscribe({
    next: () => {
      if (this.isEditMode && this.note) {
        // Patch title/content without triggering valueChanges for topic/subtopic
        this.noteForm.patchValue({
          title: this.note.title,
          content: this.note.content,
          topicId: this.note.topicId,
          subtopicId: '' // set subtopic after subtopics load
        }, { emitEvent: false });

        // set previous ids so create-new flows behave correctly
        this.previousTopicId = this.note.topicId;
        this.previousSubtopicId = this.note.subtopicId;

        // Now load subtopics for this topic and set the subtopic once loaded
        this.onTopicChange(this.note.topicId);
      }
    },
    error: (err) => console.error('Error loading topics', err)
  });

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

// Return an observable so caller can wait for completion (useful for edit mode)
loadTopics(): Observable<any> {
  return this.topicService.getAllTopics().pipe(
    tap((response) => this.topics = response.data || [])
  );
}

onTopicChange(topicId: string): void {
  this.subtopics = [];
  // Clear subtopic value without emitting a change event that would try to create new
  this.noteForm.get('subtopicId')?.setValue('', { emitEvent: false });

  if (topicId) {
    this.topicService.getSubtopicsByTopic(topicId).subscribe({
      next: (response) => {
        this.subtopics = response.data || [];

        // If in edit mode and the loaded topic is the note's original topic,
        // then set the subtopic value (use emitEvent:false to avoid loops)
        if (this.isEditMode && this.note && this.note.topicId === topicId && this.note.subtopicId) {
          // Only set if the subtopic exists in the returned list (optional safety)
          const exists = this.subtopics.some(s => s._id === this.note.subtopicId);
          if (exists) {
            this.noteForm.get('subtopicId')?.setValue(this.note.subtopicId, { emitEvent: false });
          } else {
            // If not found, you may want to keep previousSubtopicId or show a warning
            console.warn('Note subtopic not found in current topic subtopics.');
            this.noteForm.get('subtopicId')?.setValue('', { emitEvent: false });
          }
        }
      },
      error: (err) => console.error('Error loading subtopics', err)
    });
  }
}


  onSave(): void {
  if (this.noteForm.invalid) {
    this.noteForm.markAllAsTouched();
    return;
  }

  const payload: NotePayload = this.noteForm.value;

  if (this.isEditMode) {
    // UPDATE
    this.notesService.updateNote(this.note._id, payload).subscribe({
      next: (response) => {
        console.log('Note updated successfully!', response);

        this.dialogRef.close({
          status: 'success',
          mode: 'edit',
          updatedNote: response.data
        });
      },
      error: (err) => console.error('Error updating note', err)
    });
  } else {
    // CREATE
    this.notesService.createNote(payload).subscribe({
      next: (response) => {
        console.log('Note created successfully!', response);

        this.dialogRef.close({
          status: 'success',
          mode: 'create'
        });
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