import { DatePipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { TopicService } from '../topic.service';
import { CreateTopicDialogComponent } from '../create-topic-dialog/create-topic-dialog.component';
import { CreateSubtopicDialogComponent } from './create-subtopic-dialog/create-subtopic-dialog.component';



export interface Topic {
  _id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  __v: number;
}
@Component({
  selector: 'app-subtopic',
  standalone: true,
  imports: [BreadcrumbComponent,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    DatePipe,
    MatProgressSpinnerModule,
    MatDialogModule],
  templateUrl: './subtopic.component.html',
  styleUrl: './subtopic.component.scss'
})
export class SubtopicComponent {
  breadscrums = [
    {
      title: 'Topics',
      items: ['Student'],
      active: 'Topics',
    },
  ];

  displayedColumns: string[] = ['name', 'createdAt', 'actions'];
  dataSource!: MatTableDataSource<Topic>;
  isLoading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private topicService: TopicService,public dialog: MatDialog) {}

  ngOnInit() {
    this.getAllSubtopics();
  }

  ngAfterViewInit() {
    // Es importante configurar el paginador y la ordenación después de que la vista se haya inicializado
  }

  getAllSubtopics() {
    this.isLoading = true;
    this.topicService.getAllSubtopics().subscribe({
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
    console.log('Eliminar tema:', row);

  }
  
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateSubtopicDialogComponent, {
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
    this.getAllSubtopics();
  }

}
