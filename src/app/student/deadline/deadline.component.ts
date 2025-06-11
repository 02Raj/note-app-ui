import { Component, ViewChild } from '@angular/core';
// Imports - Standalone Component ke liye
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { Deadline } from './models/deadline.model';
import { DeadlineService } from './deadline.service';
import { MatDialog } from '@angular/material/dialog';
import { DeadlinedialogComponent } from './deadlinedialog/deadlinedialog.component';
@Component({
  selector: 'app-deadline',
  standalone: true,
  imports: [ CommonModule,
    BreadcrumbComponent,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSelectModule,],
  templateUrl: './deadline.component.html',
  styleUrl: './deadline.component.scss'
})
export class DeadlineComponent {
  breadscrums = [
    {
      title: 'Deadlines',
      items: ['Student'],
      active: 'Deadlines',
    },
  ];

  displayedColumns: string[] = ['title', 'topic', 'dueDate', 'status', 'actions'];
  dataSource!: MatTableDataSource<Deadline>;
  isLoading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private deadlineService: DeadlineService,
    public dialog: MatDialog,
    // private toastService: ToastService // Optional
  ) {
    this.dataSource = new MatTableDataSource<Deadline>([]);
  }

  ngOnInit() {
    this.loadDeadlines();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadDeadlines() {
    this.isLoading = true;
    this.deadlineService.getDeadlines().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error fetching deadlines:", err);
        this.isLoading = false;
        // this.toastService.showError("Could not load deadlines.");
      }
    });
  }

  refresh() {
    this.loadDeadlines();
  }
  
  onSearch(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

openDeadlineDialog(deadline?: Deadline): void {
    const dialogRef = this.dialog.open(DeadlinedialogComponent, {
      width: '800px',
      data: deadline // Pass the deadline object if editing, otherwise it's undefined
    });

    dialogRef.afterClosed().subscribe(result => {
      // If the dialog returned a result, it means something was created or updated
      if (result) {
        this.refresh();
      }
    });
  }

  deleteItem(deadline: Deadline) {
    if (confirm(`Are you sure you want to delete "${deadline.title}"?`)) {
      this.deadlineService.deleteDeadline(deadline._id).subscribe({
        next: () => {
          this.refresh();
          // this.toastService.showSuccess("Deadline deleted successfully!");
        },
        error: (err) => {
          console.error("Error deleting deadline:", err);
          // this.toastService.showError("Could not delete deadline.");
        }
      });
    }
  }

  updateStatus(deadline: Deadline, newStatus: 'pending' | 'completed' | 'missed') {
    this.deadlineService.updateStatus(deadline._id, newStatus).subscribe({
      next: (updatedDeadline) => {
        // Find the index and update the item in the datasource for a smooth UX
        const index = this.dataSource.data.findIndex(d => d._id === deadline._id);
        if (index > -1) {
          const data = this.dataSource.data;
          data[index] = updatedDeadline;
          this.dataSource.data = data;
        }
        // this.toastService.showSuccess("Status updated!");
      },
      error: (err) => {
        console.error("Error updating status:", err);
        // To revert the visual change on error
        this.refresh();
        // this.toastService.showError("Could not update status.");
      }
    });
  }
}
