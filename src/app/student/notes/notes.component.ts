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



// Interface for a single Note for type safety
export interface Note {
  _id: string;
  title: string;
  content: string;
  topicName: string;
  subtopicName?: string;
  revisionStage: number;
  revisionDueDate: string;
  createdAt: string;
}

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [
    DatePipe,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
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

  // Define the columns to be displayed in the table
  displayedColumns: string[] = ['title', 'topicName', 'revisionStage', 'revisionDueDate', 'createdAt', 'actions'];
  dataSource!: MatTableDataSource<Note>;
  isLoading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private notesService: NotesService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getAllNotes();
  }

  ngAfterViewInit() {
    // This is intentionally left blank for now.
    // We link paginator/sort after data is loaded.
  }

  /**
   * Fetches all notes from the service and populates the table.
   */
  getAllNotes() {
    this.isLoading = true;
    this.notesService.getAllNotes().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status === 'success' && response.data) {
          this.dataSource = new MatTableDataSource(response.data);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching notes:', error);
      }
    });
  }

  /**
   * Applies a filter to the table when the user types in the search box.
   */
  onSearch(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Placeholder for the delete functionality.
   */
  deleteItem(row: Note) {
    console.log('Deleting note:', row);
    // this.notesService.deleteNote(row._id).subscribe(...)
  }

  /**
   * Opens the dialog to create a new note.
   */
  openCreateDialog(): void {
    /*
    const dialogRef = this.dialog.open(CreateNoteDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // If the dialog returns a result, refresh the table to show the new note
        this.refresh();
      }
    });
    */
  }

  /**
   * Reloads the data for the table.
   */
  refresh() {
    this.getAllNotes();
  }
}