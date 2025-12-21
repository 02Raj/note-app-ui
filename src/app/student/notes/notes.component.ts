import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { NotesService } from './notes.service';
import { CreateNotesDialogComponent } from './create-notes-dialog/create-notes-dialog.component';
import { NoteDetailsComponent } from './note-details/note-details.component';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TopicService } from '../topic/topic.service';
import { Note } from './modal/notes.model';
 // Assuming you have a separate model file

@Component({
    selector: 'app-notes',
    imports: [
        DatePipe,
        ReactiveFormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatFormFieldModule,
        BreadcrumbComponent,
        CommonModule
    ],
    templateUrl: './notes.component.html',
    styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit, AfterViewInit {
  breadscrums = [
    {
      title: 'My Notes',
      items: ['Student'],
      active: 'Notes',
    },
  ];

  displayedColumns: string[] = ['title', 'topicName', 'revisionStage', 'revisionDueDate', 'createdAt', 'actions'];
  dataSource!: MatTableDataSource<Note>;
  isLoading = true;

  filterForm: FormGroup;
  topics: any[] = [];
  subtopics: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  selectedNoteId: string | null = null;

  constructor(
    private notesService: NotesService,
    private topicService: TopicService,
    private fb: FormBuilder,
    public dialog: MatDialog
  ) {
    this.filterForm = this.fb.group({
      topicId: [''],
      subtopicId: [{ value: '', disabled: true }]
    });
  }

  ngOnInit() {
    this.getAllNotes();
    this.loadTopics();
    this.setupFilterListeners();
  }

  ngAfterViewInit() {
    // This method is intentionally left empty. 
    // MatTableDataSource should be configured after data is fetched.
  }

  loadTopics() {
    this.topicService.getAllTopics().subscribe(response => {
      if (response.status === 'success') {
        this.topics = response.data;
      }
    });
  }

  setupFilterListeners() {
    this.filterForm.get('topicId')?.valueChanges.subscribe(topicId => {
      this.filterForm.get('subtopicId')?.reset('', { emitEvent: false });
      this.subtopics = [];

      if (topicId) {
        this.filterForm.get('subtopicId')?.enable({ emitEvent: false });
        this.topicService.getSubtopicsByTopic(topicId).subscribe(response => {
          this.subtopics = response.data || [];
        });
        this.getNotesByTopic(topicId);
      } else {
        this.filterForm.get('subtopicId')?.disable({ emitEvent: false });
        this.getAllNotes();
      }
    });

    this.filterForm.get('subtopicId')?.valueChanges.subscribe(subtopicId => {
      if (subtopicId) {
        this.getNotesBySubtopic(subtopicId);
      } else if (this.filterForm.get('topicId')?.value) {
        this.getNotesByTopic(this.filterForm.get('topicId')?.value);
      }
    });
  }

  getAllNotes() {
    this.isLoading = true;
    this.notesService.getAllNotes().subscribe(response => this.handleNoteResponse(response));
  }

  getNotesByTopic(topicId: string) {
    this.isLoading = true;
    this.notesService.getNotesByTopic(topicId).subscribe(response => this.handleNoteResponse(response));
  }

  getNotesBySubtopic(subtopicId: string) {
    this.isLoading = true;
    this.notesService.getNotesBySubtopic(subtopicId).subscribe(response => this.handleNoteResponse(response));
  }

  handleNoteResponse(response: any) {
    this.isLoading = false;
    this.dataSource = new MatTableDataSource(response.data || []);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onSearch(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

deleteItem(row: Note) {
  if (confirm(`Are you sure you want to delete the note: "${row.title}"?`)) {
    this.notesService.deleteNote(row._id).subscribe({
      next: (res) => {
        console.log('Note deleted successfully:', res);
        this.dataSource.data = this.dataSource.data.filter(
          (note: Note) => note._id !== row._id
        );
      },
      error: (err) => {
        console.error('Error deleting note:', err);
      }
    });
  }
}

openCreateDialog(noteData: any = null): void {

  // ⭐ EDIT case: jis row ko edit kiya, use mark karo
  if (noteData && noteData._id) {
    this.selectedNoteId = noteData._id;
  }

  const dialogRef = this.dialog.open(CreateNotesDialogComponent, {
    width: '1000px',
    maxWidth: '90vw',
    data: noteData
  });

  dialogRef.afterClosed().subscribe(result => {
    if (!result) return;

    // CREATE MODE → full refresh
    if (result.status === 'success' && result.mode === 'create') {
      this.selectedNoteId = null; // create pe kisi row ka context nahi
      this.loadTopics();
      this.refresh();
    }

    // EDIT MODE → row update + highlight
    if (result.status === 'success' && result.mode === 'edit') {
      this.updateRowInTable(result.updatedNote);

      // ⭐ ensure edited row stays highlighted
      this.selectedNoteId = result.updatedNote._id;
    }
  });
}

updateRowInTable(updatedNote: any): void {
  let data = this.dataSource.data;
  console.log("data",data);
  
  const index = data.findIndex(n => n._id === updatedNote._id);
  console.log("data",index);

  if (index !== -1) {
    data[index] = updatedNote;
    this.dataSource.data = [...data]; //
  }
}



  refresh() {
    this.filterForm.reset({ topicId: '', subtopicId: { value: '', disabled: true } });
    this.getAllNotes();
  }

viewNote(note: any): void {

  // 1️⃣ save which row was clicked
  this.selectedNoteId = note._id;

  const dialogRef = this.dialog.open(NoteDetailsComponent, {
    width: '1000px',
    maxWidth: '90vw',
    data: {
      note,
      openEdit: (note: any) => this.openCreateDialog(note)
    }
  });

  // 2️⃣ dialog close hone ke baad bhi state rahe
  dialogRef.afterClosed().subscribe(() => {
    // intentionally empty
    // selectedNoteId rehne do taaki highlight dikhe
  });
}



}