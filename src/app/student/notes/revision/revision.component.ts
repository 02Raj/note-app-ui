import { CommonModule, DatePipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { NotesService } from '../notes.service';
import { map } from 'rxjs';
import { NoteDetailsComponent } from '../note-details/note-details.component';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-revision',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    DatePipe
  ],
  templateUrl: './revision.component.html',
  styleUrl: './revision.component.scss'
})
export class RevisionComponent {

  breadscrums = [{ title: 'Revision', items: ['Student'], active: 'Due Notes' }];

  // ── Table config ───────────────────────────────────────
  displayedColumns: string[] = ['title', 'topicName', 'revisionStage', 'revisionDueDate', 'actions'];
  dataSource!: MatTableDataSource<any>;
  private subs = new SubSink();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoading = true;

  // ── Drill mode state ───────────────────────────────────
  isDrillMode = false;
  drillNotes: any[] = [];
  currentDrillIndex = 0;
  showAnswer = false;
  isDrillLoading = false;
  drillFinished = false;

  // ── Weak notes state ───────────────────────────────────
  weakNotes: any[] = [];
  isWeakLoading = false;

  constructor(
    private notesService: NotesService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadDueNotes();
    this.loadWeakNotes();
  }

  ngAfterViewInit(): void {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // ── Due Notes ──────────────────────────────────────────
  loadDueNotes(): void {
    this.isLoading = true;
    this.subs.sink = this.notesService.getDueRevisionNotes().pipe(
      map(response => response.data)
    ).subscribe({
      next: (dueNotes) => {
        this.isLoading = false;
        const processedNotes = dueNotes.map((note: any) => ({
          ...note,
          topicName: note.topicId ? note.topicId.name : 'N/A'
        }));
        this.dataSource = new MatTableDataSource(processedNotes);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to load due revision notes:', err);
      }
    });
  }

  // ── Weak Notes ─────────────────────────────────────────
  loadWeakNotes(): void {
    this.isWeakLoading = true;
    this.subs.sink = this.notesService.getWeakNotes().pipe(
      map(response => response.data)
    ).subscribe({
      next: (notes) => {
        this.isWeakLoading = false;
        this.weakNotes = notes;
      },
      error: (err) => {
        this.isWeakLoading = false;
        console.error('Failed to load weak notes:', err);
      }
    });
  }

  // ── Drill Mode ─────────────────────────────────────────
  startDrill(): void {
    this.isDrillLoading = true;
    this.subs.sink = this.notesService.getDrillNotes().pipe(
      map(response => response.data)
    ).subscribe({
      next: (notes) => {
        this.isDrillLoading = false;
        this.drillNotes = notes;
        this.currentDrillIndex = 0;
        this.showAnswer = false;
        this.drillFinished = false;
        this.isDrillMode = true;
      },
      error: (err) => {
        this.isDrillLoading = false;
        console.error('Failed to load drill notes:', err);
      }
    });
  }

  exitDrill(): void {
    this.isDrillMode = false;
    this.drillFinished = false;
    this.loadDueNotes();
    this.loadWeakNotes();
  }

  get currentDrillNote(): any {
    return this.drillNotes[this.currentDrillIndex];
  }

  revealAnswer(): void {
    this.showAnswer = true;
  }

  submitRating(rating: 'got_it' | 'shaky' | 'forgot'): void {
    const noteId = this.currentDrillNote._id;

    this.notesService.markNoteAsRevised(noteId, rating).subscribe({
      next: () => {
        this.goToNext();
      },
      error: (err) => {
        console.error('Failed to mark note:', err);
        this.goToNext(); // skip on error
      }
    });
  }

  private goToNext(): void {
    this.showAnswer = false;
    if (this.currentDrillIndex < this.drillNotes.length - 1) {
      this.currentDrillIndex++;
    } else {
      this.drillFinished = true;
    }
  }

  // ── Table helpers ──────────────────────────────────────
  onSearch(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  refresh(): void {
    this.loadDueNotes();
    this.loadWeakNotes();
  }

viewNote(note: any): void {
  const dialogRef = this.dialog.open(NoteDetailsComponent, {
    data: { note: note, openEdit: null }, 
    width: '800px',
    autoFocus: false
  });

  this.subs.sink = dialogRef.afterClosed().subscribe(result => {
    if (result === true) {
      this.refresh();
    }
  });
}

  deleteItem(note: any): void {
    this.subs.sink = this.notesService.deleteNote(note._id).subscribe({
      next: () => this.refresh(),
      error: (err) => console.error('Failed to delete note:', err)
    });
  }
}