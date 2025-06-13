import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { ProgressUpdateDialogComponentComponent } from './progress-update-dialog-component/progress-update-dialog-component.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ProgressTrackerService } from './progress-tracker.service';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule, DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { TopicService } from '../topic/topic.service';



@Component({
  selector: 'app-progress-tracker',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, DatePipe,
    // Material Modules
    MatTableModule, MatPaginatorModule, MatSortModule, MatFormFieldModule, MatSelectModule,
    MatInputModule, MatButtonModule, MatIconModule, MatTooltipModule,
    MatProgressSpinnerModule, MatProgressBarModule,
    // Custom Components
    BreadcrumbComponent,
  ],
  templateUrl: './progress-tracker.component.html',
  styleUrl: './progress-tracker.component.scss'
})
export class ProgressTrackerComponent implements OnInit, AfterViewInit {
  breadscrums = [{
    title: 'Progress Tracker',
    items: ['Home'],
    active: 'My Progress',
  }];

  displayedColumns: string[] = ['topicName', 'subtopicName', 'progressPercent', 'updatedAt', 'actions'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  isLoading = true;

  filterForm: FormGroup;
  // --- CHANGE: Initialize topics and subtopics as empty arrays ---
  topics: any[] = [];
  subtopics: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private progressService: ProgressTrackerService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    // --- CHANGE: Inject your services ---
    private topicService: TopicService,
    // private subtopicService: SubtopicService
  ) {
    this.filterForm = this.fb.group({
      topicId: [''],
      subtopicId: [''],
      search: ['']
    });
  }

  ngOnInit() {
    this.loadProgressData();
    // --- CHANGE: Load filter data from services ---
    this.loadTopics();
    this.loadSubtopics();
    this.setupFilters();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadProgressData() {
    this.isLoading = true;
    this.progressService.getUserProgress().subscribe({
      next: (response: any) => {
        const progressData = response.data.map((item: any) => ({
          ...item,
          topicName: item.topicId?.name || 'N/A',
          subtopicName: item.subtopicId?.name || '---'
        }));
        this.dataSource.data = progressData;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Failed to load progress", err);
        this.isLoading = false;
      }
    });
  }

  // --- NEW METHOD: Load topics from TopicService ---
  loadTopics(): void {
    // Assuming the service has a method `getAllTopics` which returns an Observable.
    // The response is expected to have a `data` property containing the array of topics.
    this.topicService.getAllTopics().subscribe({
      next: (response: any) => {
        this.topics = response.data;
      },
      error: (err) => {
        console.error("Failed to load topics", err);
        // Optionally handle the error, e.g., show a notification
      }
    });
  }

  // --- NEW METHOD: Load subtopics from SubtopicService ---
  loadSubtopics(): void {
    // Assuming the service has a method `getAllSubtopics`
    this.topicService.getAllSubtopics().subscribe({
      next: (response: any) => {
        this.subtopics = response.data;
      },
      error: (err) => {
        console.error("Failed to load subtopics", err);
      }
    });
  }

  setupFilters() {
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  applyFilters() {
    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      const filterValues = JSON.parse(filter);
      const searchStr = (data.topicName + data.subtopicName).toLowerCase();

      const topicMatch = !filterValues.topicId || data.topicId?._id === filterValues.topicId;
      const subtopicMatch = !filterValues.subtopicId || data.subtopicId?._id === filterValues.subtopicId;
      const searchMatch = !filterValues.search || searchStr.includes(filterValues.search.toLowerCase());

      return topicMatch && subtopicMatch && searchMatch;
    };
    this.dataSource.filter = JSON.stringify(this.filterForm.value);
  }

  onSearch(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterForm.get('search')?.setValue(filterValue.trim());
  }

  refresh() {
    this.loadProgressData();
    // Also refresh the filter data in case it has changed
    this.loadTopics();
    this.loadSubtopics();
  }

  openUpdateDialog(progressItem: any = {}): void {
    const dialogRef = this.dialog.open(ProgressUpdateDialogComponentComponent, {
      width: '450px',
      data: progressItem
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.refresh();
      }
    });
  }
}