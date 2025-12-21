import { CommonModule, DatePipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
// import { MatDialogModule, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
// import { MatPaginatorModule, MatPaginatorModule } from '@angular/material/paginator';
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
    imports: [CommonModule,
        BreadcrumbComponent,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        DatePipe],
    templateUrl: './revision.component.html',
    styleUrl: './revision.component.scss'
})
export class RevisionComponent {
 // Breadcrumb configuration
  breadscrums = [
    {
      title: 'Revision',
      items: ['Student'],
      active: 'Due Notes',
    },
  ];

  // Table configuration
  displayedColumns: string[] = ['title', 'topicName', 'revisionStage', 'revisionDueDate', 'actions'];
  dataSource!: MatTableDataSource<any>;
  
  // Private property to manage all subscriptions, preventing memory leaks.
  private subs = new SubSink();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoading = true;

  constructor(
    private notesService: NotesService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadDueNotes();
  }

  ngAfterViewInit(): void {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }
  
  /**
   * Lifecycle hook that cleans up subscriptions when the component is destroyed.
   */
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  /**
   * Fetches the notes due for revision from the service.
   */
  loadDueNotes(): void {
    this.isLoading = true;
    this.subs.sink = this.notesService.getDueRevisionNotes().pipe(
      map(response => response.data) // Assuming API wraps data in a 'data' property
    ).subscribe({
      next: (dueNotes) => {
        this.isLoading = false;
        // The topic name might be nested, so we flatten it for display
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
        console.error("Failed to load due revision notes:", err);
      }
    });
  }

  /**
   * Handles the search input to filter the table.
   */
  onSearch(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Refreshes the list of due notes.
   */
  refresh(): void {
    this.loadDueNotes();
  }

  /**
   * Opens the note details dialog to view the note.
   * If the note is marked as revised, it reloads the list.
   * @param note - The note object to view.
   */
  viewNote(note: any): void {
    const dialogRef = this.dialog.open(NoteDetailsComponent, {
      data: note,
      width: '800px', // Adjust width as needed
      autoFocus: false
    });

    this.subs.sink = dialogRef.afterClosed().subscribe(result => {
      // The dialog returns 'true' if the revision was completed successfully.
      if (result === true) {
        this.refresh(); // Reload the list to remove the completed note.
      }
    });
  }

  /**
   * Deletes a note. (You might want to disable this for the revision list)
   * @param note - The note to delete.
   */
  deleteItem(note: any): void {
    // You can implement confirmation logic here if needed.
    this.subs.sink = this.notesService.deleteNote(note._id).subscribe({
      next: () => {
        this.refresh(); // Refresh list after deletion
      },
      error: (err) => {
        console.error("Failed to delete note:", err);
      }
    });
  }
}
