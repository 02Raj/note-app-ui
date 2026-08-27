import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { NotesService } from './notes.service';
import { CreateNotesDialogComponent } from './create-notes-dialog/create-notes-dialog.component';
import { NoteDetailsComponent } from './note-details/note-details.component';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TopicService } from '../topic/topic.service';
import { Note } from './modal/notes.model';
import { Observable } from 'rxjs';
import { AiMergeDialogComponent } from './ai-merge-dialog/ai-merge-dialog.component';

// Color palette for note marking
const NOTE_COLORS = [
  { label: 'Red',    value: '#ffcdd2' },
  { label: 'Orange', value: '#ffe0b2' },
  { label: 'Yellow', value: '#fff9c4' },
  { label: 'Green',  value: '#c8e6c9' },
  { label: 'Blue',   value: '#bbdefb' },
  { label: 'Purple', value: '#e1bee7' },
  { label: 'Teal',   value: '#b2dfdb' },
  { label: 'Pink',   value: '#f8bbd0' },
];

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
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    BreadcrumbComponent,
    CommonModule,
    MatTooltipModule,
    MatMenuModule
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

  displayedColumns: string[] = ['color', 'title', 'priority', 'revisionStage', 'revisionDueDate', 'createdAt', 'actions'];
  dataSource: MatTableDataSource<Note> = new MatTableDataSource<Note>([]);
  isLoading = true;

  filterForm: FormGroup;
  topics: any[] = [];
  subtopics: any[] = [];

  // ── Color palette exposed to template ──
  noteColors = NOTE_COLORS;
  activeColorPicker: string | null = null; // holds _id of row whose picker is open
  colorPickerPos: { top: number; left: number } = { top: 0, left: 0 };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  selectedNoteId: string | null = null;
  viewMode: 'list' | 'grid' = 'list';
  obs$!: Observable<any>;

  // ── All raw notes (unfiltered) ──
  private allNotes: Note[] = [];

  constructor(
    private notesService: NotesService,
    private topicService: TopicService,
    private fb: FormBuilder,
    public dialog: MatDialog
  ) {
    this.filterForm = this.fb.group({
      topicId: [''],
      subtopicId: [{ value: '', disabled: true }],
      priority: [''],
      startDate: [null],
      endDate: [null],
    });
  }

  ngOnInit() {
    this.getAllNotes();
    this.loadTopics();
    this.setupFilterListeners();
  }

  ngAfterViewInit() {
    // intentionally left empty
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

    // Priority filter — purely frontend
    this.filterForm.get('priority')?.valueChanges.subscribe(() => this.applyFrontendFilters());

    // Date range filter — purely frontend
    this.filterForm.get('startDate')?.valueChanges.subscribe(() => this.applyFrontendFilters());
    this.filterForm.get('endDate')?.valueChanges.subscribe(() => this.applyFrontendFilters());
  }

  getAllNotes() {
    this.isLoading = true;
    this.notesService.getAllNotes().subscribe(response => {
      this.allNotes = response.data || [];
      this.applyFrontendFilters();
      this.isLoading = false;
    });
  }

  getNotesByTopic(topicId: string) {
    this.isLoading = true;
    this.notesService.getNotesByTopic(topicId).subscribe(response => {
      this.allNotes = response.data || [];
      this.applyFrontendFilters();
      this.isLoading = false;
    });
  }

  getNotesBySubtopic(subtopicId: string) {
    this.isLoading = true;
    this.notesService.getNotesBySubtopic(subtopicId).subscribe(response => {
      this.allNotes = response.data || [];
      this.applyFrontendFilters();
      this.isLoading = false;
    });
  }

  /** Apply priority + date-range filters on top of fetched notes */
  applyFrontendFilters() {
    const priority = this.filterForm.get('priority')?.value;
    const startDate: Date | null = this.filterForm.get('startDate')?.value;
    const endDate: Date | null = this.filterForm.get('endDate')?.value;

    let filtered = [...this.allNotes];

    if (priority) {
      filtered = filtered.filter(n => n.priority === priority);
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(n => new Date(n.createdAt) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(n => new Date(n.createdAt) <= end);
    }

    this.dataSource = new MatTableDataSource(filtered);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.obs$ = this.dataSource.connect();
  }

  handleNoteResponse(response: any) {
    this.isLoading = false;
    this.allNotes = response.data || [];
    this.applyFrontendFilters();
  }

  onSearch(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  clearDateRange() {
    this.filterForm.patchValue({ startDate: null, endDate: null });
  }

  // ── Priority quick-update ──
  onPriorityChange(row: Note, priority: 'low' | 'medium' | 'high') {
    this.notesService.updateNotePriority(row._id, priority).subscribe({
      next: (res) => {
        row.priority = priority;
        this.dataSource.data = [...this.dataSource.data];
      },
      error: (err) => console.error('Priority update failed', err)
    });
  }

  // ── Color picker ──
  toggleColorPicker(rowId: string, event: Event) {
    event.stopPropagation();
    if (this.activeColorPicker === rowId) {
      this.activeColorPicker = null;
      return;
    }
    // Calculate fixed position from the swatch button
    const btn = (event.currentTarget as HTMLElement);
    const rect = btn.getBoundingClientRect();
    this.colorPickerPos = {
      top: rect.bottom + 6,
      left: rect.left
    };
    this.activeColorPicker = rowId;
  }

  setColor(row: Note, color: string | null, event: Event) {
    event.stopPropagation();
    this.notesService.updateNoteColor(row._id, color).subscribe({
      next: () => {
        row.color = color;
        this.dataSource.data = [...this.dataSource.data];
        this.activeColorPicker = null;
      },
      error: (err) => console.error('Color update failed', err)
    });
  }

  deleteItem(row: Note) {
    if (confirm(`Are you sure you want to delete the note: "${row.title}"?`)) {
      this.notesService.deleteNote(row._id).subscribe({
        next: (res) => {
          console.log('Note deleted successfully:', res);
          this.allNotes = this.allNotes.filter(n => n._id !== row._id);
          this.applyFrontendFilters();
        },
        error: (err) => {
          console.error('Error deleting note:', err);
        }
      });
    }
  }

  openCreateDialog(noteData: any = null): void {

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

      if (result.status === 'success' && result.mode === 'create') {
        this.selectedNoteId = null;
        this.loadTopics();
        this.refresh();
      }

      if (result.status === 'success' && result.mode === 'edit') {
        this.updateRowInTable(result.updatedNote);
        this.selectedNoteId = result.updatedNote._id;
      }
    });
  }

  updateRowInTable(updatedNote: any): void {
    const idx = this.allNotes.findIndex(n => n._id === updatedNote._id);
    if (idx !== -1) this.allNotes[idx] = updatedNote;
    this.applyFrontendFilters();
  }

  refresh() {
    this.filterForm.reset({ topicId: '', subtopicId: { value: '', disabled: true }, priority: '', startDate: null, endDate: null });
    this.getAllNotes();
  }

  viewNote(note: any): void {
    this.selectedNoteId = note._id;
    this.activeColorPicker = null;

    const dialogRef = this.dialog.open(NoteDetailsComponent, {
      width: '1000px',
      maxWidth: '90vw',
      data: {
        note,
        openEdit: (note: any) => this.openCreateDialog(note)
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      // selectedNoteId rehne do taaki highlight dikhe
    });
  }

  markAsReviewed(row: Note): void {
    this.notesService.markNoteAsRevised(row._id).subscribe({
      next: (res) => {
        console.log('Revision successful', res);
        const updatedData = this.dataSource.data.map(note => {
          if (note._id === row._id) {
            return {
              ...note,
              revisionStage: note.revisionStage + 1,
              revisionDueDate: res.data.nextRevisionDate
            };
          }
          return note;
        });

        this.dataSource.data = updatedData;
      },
      error: (err) => {
        console.error('Revision failed', err);
      }
    });
  }

  isDue(row: Note): boolean {
    return new Date(row.revisionDueDate) <= new Date();
  }

  onAiSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    if (!query.trim()) {
      this.refresh();
      return;
    }

    this.isLoading = true;
    this.notesService.aiSearch(query).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.allNotes = res.data || [];
        this.applyFrontendFilters();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('AI Search failed', err);
        alert('AI Search failed. Did you add the API key?');
      }
    });
  }

  onAiMerge() {
    const topicId = this.filterForm.get('topicId')?.value;
    if (!topicId) return;

    const topicName = this.topics.find(t => t._id === topicId)?.name || 'Unknown Topic';

    this.isLoading = true;
    this.notesService.aiMerge(topicId, topicName).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.status === 'success') {
          this.dialog.open(AiMergeDialogComponent, {
            width: '900px',
            maxWidth: '95vw',
            maxHeight: '90vh',
            data: {
              topicName,
              mergedContent: res.data.mergedContent
            }
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('AI Merge failed', err);
        alert('Failed to merge notes via AI. Ensure notes exist for this topic.');
      }
    });
  }

  // ── Helpers ──
  getPriorityClass(priority: string | undefined): string {
    switch (priority) {
      case 'high':   return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low':    return 'priority-low';
      default:       return 'priority-medium';
    }
  }

  getPriorityIcon(priority: string | undefined): string {
    switch (priority) {
      case 'high':   return 'keyboard_double_arrow_up';
      case 'medium': return 'drag_handle';
      case 'low':    return 'keyboard_double_arrow_down';
      default:       return 'drag_handle';
    }
  }
}