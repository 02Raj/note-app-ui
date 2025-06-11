import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { DatePipe } from '@angular/common';
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
  standalone: true,
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
    BreadcrumbComponent
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
    // Implement your delete logic here
    console.log('Deleting note:', row);
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateNotesDialogComponent, { width: '800px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refresh();
      }
    });
  }

  refresh() {
    this.filterForm.reset({ topicId: '', subtopicId: { value: '', disabled: true } });
    this.getAllNotes();
  }

  viewNote(note: any): void {
    this.dialog.open(NoteDetailsComponent, {
      width: '600px',
      data: note
    });
  }
}