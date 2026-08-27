import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { JobService } from './job.service';
import { Job } from './job.model';
import { AddJobDialogComponent } from './add-job-dialog/add-job-dialog.component';
import { JobDetailsDialogComponent } from './job-details-dialog/job-details-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatTableModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
    BreadcrumbComponent
  ],
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit {
  breadscrums = [
    {
      title: 'Job Tracking',
      items: ['Student'],
      active: 'Jobs',
    },
  ];

  displayedColumns: string[] = ['companyName', 'skills', 'contactEmail', 'workMode', 'status', 'createdAt', 'actions'];
  dataSource: MatTableDataSource<Job> = new MatTableDataSource<Job>([]);
  isLoading = true;

  constructor(
    private jobService: JobService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    this.isLoading = true;
    this.jobService.getAllJobs().subscribe({
      next: (response) => {
        // Depending on backend structure, assuming response.data holds the array
        const jobs = response.data || response || [];
        this.dataSource.data = jobs;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load jobs', error);
        this.isLoading = false;
      }
    });
  }

  openAddJobDialog() {
    const dialogRef = this.dialog.open(AddJobDialogComponent, {
      width: '800px',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadJobs();
      }
    });
  }

  viewJob(job: Job) {
    this.dialog.open(JobDetailsDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: job
    });
  }

  updateStatus(job: Job, newStatus: 'Saved' | 'Applied' | 'Contacted' | 'Interviewing' | 'Rejected' | 'Offer') {
    if (!job._id) return;
    this.jobService.updateJobStatus(job._id, newStatus).subscribe({
      next: () => {
        job.status = newStatus;
      },
      error: (err) => {
        console.error('Failed to update status', err);
      }
    });
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'Saved': return 'badge-solid-blue';
      case 'Applied': return 'badge-solid-purple';
      case 'Contacted': return 'badge-solid-orange';
      case 'Interviewing': return 'badge-solid-cyan';
      case 'Offer': return 'badge-solid-green';
      case 'Rejected': return 'badge-solid-red';
      default: return 'badge-solid-blue';
    }
  }
}
