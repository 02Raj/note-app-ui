import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { ResourcesService } from './resourses.service';
import { TopicService } from '../topic/topic.service';
import { UploadResourceDialogComponent } from './upload-resource-dialog/upload-resource-dialog.component';


@Component({
    selector: 'app-resourses',
    imports: [
        CommonModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        BreadcrumbComponent,
        MatSelectModule,
        MatFormFieldModule,
        ReactiveFormsModule,
    ],
    templateUrl: './resourses.component.html',
    styleUrl: './resourses.component.scss'
})
export class ResoursesComponent implements OnInit {
  breadscrums = [{ title: 'Resources', items: ['Student'], active: 'Resources' }];
  isLoading = false;
  
  dataSource!: MatTableDataSource<any>;
  displayedColumns: string[] = ['name', 'fileType', 'createdAt', 'actions'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  allTopics: any[] = [];
  selectedTopic = new FormControl('');

  constructor(
    private resourcesService: ResourcesService,
    private topicService: TopicService, // Service to fetch topics
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAllTopics();
    
    // When the user selects a topic from the dropdown, load its resources
    this.selectedTopic.valueChanges.subscribe(topicId => {
      if (topicId) {
        this.loadResourcesForTopic(topicId);
      }
    });
  }

  loadAllTopics(): void {
    this.isLoading = true;
    this.topicService.getAllTopics().subscribe({
      next: (response:any) => {
        // --- THIS IS THE FIX ---
        // Assuming the API returns an object like { data: [...] }
        this.allTopics = response.data || [];
        this.isLoading = false;
        
        // By default, select the first topic if the list is not empty
        if(this.allTopics.length > 0) {
            this.selectedTopic.setValue(this.allTopics[0]._id);
        }
      },
      error: (err:any) => {
        this.isLoading = false;
        console.error("Failed to load topics", err);
      }
    });
  }
  
  loadResourcesForTopic(topicId: string): void {
    this.isLoading = true;
    this.resourcesService.getResourcesByTopic(topicId).subscribe({
      next: (response) => {
        // --- THIS IS THE FIX ---
        // Assuming the API returns an object like { data: [...] }
        this.dataSource = new MatTableDataSource(response.data || []);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
      }
    });
  }
  
  refresh(): void {
    if (this.selectedTopic.value) {
      this.loadResourcesForTopic(this.selectedTopic.value);
    }
  }

  openUploadDialog(): void {
    const selectedTopicId = this.selectedTopic.value;
    if (!selectedTopicId) {
        alert("Please select a topic first!");
        return;
    }
    const topicName = this.allTopics.find(t => t._id === selectedTopicId)?.name || '';

    const dialogRef = this.dialog.open(UploadResourceDialogComponent, {
      width: '400px',
      data: { topicId: selectedTopicId, topicName: topicName }
    });

    dialogRef.afterClosed().subscribe(result => {
      // If upload was successful, refresh the list
      if (result) {
        this.refresh();
      }
    });
  }
  
  deleteItem(resource: any): void {
    if (confirm(`Are you sure you want to delete "${resource.name}"?`)) {
      this.resourcesService.deleteResource(resource._id).subscribe({
        next: () => {
          this.refresh();
        },
        error: (err) => console.error(err)
      });
    }
  }

  getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) return 'picture_as_pdf';
    if (fileType.includes('image')) return 'image';
    if (fileType.includes('word')) return 'article';
    return 'description';
  }

  getViewableUrl(resource: any): string {
    let url = resource.url;
    // Check karein ki fileType PDF hai aur URL mein '/image/upload' hai
    if (resource.fileType === 'application/pdf' && url.includes('/image/upload')) {
      // '/image/upload' ko sirf '/upload' se replace karein
      // aur 'fl_attachment' flag add karein taaki file seedhe khule ya download ho
      return url.replace('/image/upload', '/upload/fl_attachment');
    }
    // Baaki sabhi files ke liye original URL hi istemaal karein
    return url;
  }
}
