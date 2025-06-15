import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule, ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ResumeAnalyzerService } from './resum-analyzer.service';


@Component({
  selector: 'app-resume-analyzer',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './resume-analyzer.component.html',
  styleUrl: './resume-analyzer.component.scss'
})
export class ResumeAnalyzerComponent implements OnInit {
  breadscrums = [{ title: 'Resume Analyzer', items: ['Student'], active: 'Resume Analyzer' }];
  
  // UI State Management
  uiState: 'upload' | 'loading' | 'report' = 'upload';
  
  // Data Stores
  selectedFile: File | null = null;
  fileName: string | null = null;
  analysisReport: any = null;
  errorMessage: string | null = null;
  
  // For engaging loading text
  loadingText = 'Uploading your resume...';
  private loadingInterval: any;

  constructor(private resumeService: ResumeAnalyzerService) {}

  ngOnInit(): void {}

  /**
   * Handles the file selection from the input.
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.fileName = this.selectedFile.name;
    }
  }

  /**
   * Starts the resume analysis process.
   */
  startAnalysis(): void {
    if (!this.selectedFile) {
      this.errorMessage = "Please select a file first.";
      return;
    }

    this.uiState = 'loading';
    this.errorMessage = null;
    this.startLoadingTextAnimation();

    this.resumeService.analyzeResume(this.selectedFile).subscribe({
      next: (response) => {
        clearInterval(this.loadingInterval);
        this.analysisReport = response.data;
        this.uiState = 'report';
      },
      error: (err) => {
        clearInterval(this.loadingInterval);
        this.errorMessage = err.error?.message || "An unknown error occurred during analysis.";
        this.uiState = 'upload'; // Go back to upload screen on error
        console.error(err);
      }
    });
  }

  /**
   * Resets the state to go back to the upload screen.
   */
  analyzeAnotherResume(): void {
    this.uiState = 'upload';
    this.selectedFile = null;
    this.fileName = null;
    this.analysisReport = null;
    this.errorMessage = null;
  }

  /**
   * Creates an engaging text animation during the loading state.
   */
  private startLoadingTextAnimation(): void {
    const texts = [
      'Extracting key skills from your resume...',
      'AI is analyzing your profile against industry standards...',
      'Scanning for top job opportunities...',
      'Generating personalized interview questions...',
      'Finalizing your comprehensive report...'
    ];
    let i = 0;
    this.loadingText = texts[i];
    this.loadingInterval = setInterval(() => {
      i++;
      if (i < texts.length) {
        this.loadingText = texts[i];
      } else {
        // Keeps the last message until the process is done
      }
    }, 2500); // Change text every 2.5 seconds
  }
}
