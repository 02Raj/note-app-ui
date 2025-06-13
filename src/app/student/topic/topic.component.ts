import { Component, OnInit, ViewChild } from '@angular/core';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { TopicService } from './topic.service';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { CreateTopicDialogComponent } from './create-topic-dialog/create-topic-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar'; 
export interface Topic {
  _id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  __v: number;
}
@Component({
  selector: 'app-topic',
  standalone: true,
  imports: [ BreadcrumbComponent,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    DatePipe,
    MatProgressSpinnerModule,
    MatDialogModule ],
  templateUrl: './topic.component.html',
  styleUrl: './topic.component.scss'
})
export class TopicComponent implements OnInit {
  breadscrums = [
    {
      title: 'Topics',
      items: ['Student'],
      active: 'Topics',
    },
  ];

  // Columnas que se mostrarán en la tabla. Deben coincidir con los matColumnDef en el HTML.
  displayedColumns: string[] = ['name', 'createdAt', 'actions'];
  dataSource!: MatTableDataSource<Topic>;
  isLoading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private topicService: TopicService,public dialog: MatDialog, private snackBar: MatSnackBar ) {}

  ngOnInit() {
    this.getAllTopics();
  }

  ngAfterViewInit() {
    // Es importante configurar el paginador y la ordenación después de que la vista se haya inicializado
  }

  getAllTopics() {
    this.isLoading = true;
    this.topicService.getAllTopics().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status === 'success' && response.data) {
          // Inicializa el dataSource con los datos recibidos
          this.dataSource = new MatTableDataSource(response.data);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          console.log("Datos asignados al dataSource:", this.dataSource.data);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching topics:', error);
      }
    });
  }
  
  // Función de búsqueda simple
  onSearch(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // Función de ejemplo para el botón de eliminar
  deleteItem(row: Topic) {
    // Using window.confirm for a simple confirmation dialog.
    // For a better user experience, you could create a custom MatDialog component.
    // if (confirm(`Are you sure you want to delete the topic "${row.name}"?`)) {
      this.topicService.deleteTopic(row._id).subscribe({
        next: () => {
          this.snackBar.open('Topic deleted successfully!', 'Close', { duration: 3000 });
          this.refresh(); // Refresh table data
        },
        error: (error) => {
          console.error('Error deleting topic:', error);
          this.snackBar.open('Failed to delete topic.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
        }
      });
    // }
  }
  
  
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateTopicDialogComponent, {
      width: '400px', 
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Diálogo cerrado con resultado:', result);
        this.refresh();
      }
    });
  }
  refresh() {
    this.getAllTopics();
  }
}