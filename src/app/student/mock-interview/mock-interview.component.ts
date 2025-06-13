import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

// --- Third-party Imports ---
import { QuillModule } from 'ngx-quill'; // <<--- 1. IMPORT QUILL MODULE

// --- Required Material Imports ---
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

// --- Shared Components & Services ---
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { MockInterviewService } from './mock-interview.service';
import { AuthService } from '@core';
import { SafeHtmlPipe } from '@shared/pipes/safe-html.pipe';

declare var webkitSpeechRecognition: any;

@Component({
  selector: 'app-mock-interview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    BreadcrumbComponent,
    MatProgressBarModule,
    MatIconModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatButtonToggleModule,
    SafeHtmlPipe,
    QuillModule, // <<--- 2. ADD IT TO THE COMPONENT'S IMPORTS ARRAY
  ],
  templateUrl: './mock-interview.component.html',
  styleUrl: './mock-interview.component.scss'
})
export class MockInterviewComponent implements OnInit {
  // --- State Management ---
  interviewState: 'setup' | 'in_progress' | 'generating_feedback' | 'completed' = 'setup';
  interviewMode: 'voice' | 'text' = 'voice';
  isLoading = false;
  errorMessage: string | null = null;

  // --- Forms & Data ---
  setupForm: FormGroup;
  answerForm: FormGroup;
  sessionData: any = null;
  finalReport: any = null;
  currentUser: any = null;
  breadscrums = [{ title: 'Mock Interview', items: ['Home'], active: 'Mock Interview' }];

  // --- Voice Feature Properties ---
  isListening = false;
  statusText = 'Click "Start Interview" to begin.';
  recognition: any;

  // --- Chip Input Properties ---
  separatorKeysCodes: number[] = [ENTER, COMMA];
  topicCtrl = new FormControl('');
  filteredTopics: Observable<string[]>;
  allTopics: string[] = ['React', 'Angular', 'Node.js', 'Express', 'MongoDB', 'JavaScript'];
  @ViewChild('topicInput') topicInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private mockInterviewService: MockInterviewService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.setupForm = this.fb.group({
      jobProfile: ['', [Validators.required]],
      experience: ['', [Validators.required]],
      topics: [[]]
    });
    this.answerForm = this.fb.group({
      userAnswer: ['', [Validators.required]]
    });
    this.filteredTopics = this.topicCtrl.valueChanges.pipe(
      startWith(null),
      map((topic: string | null) => (topic ? this._filter(topic) : this.allTopics.slice())),
    );
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new webkitSpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.lang = 'en-US';
      this.setupSpeechRecognition();
    } else {
      console.warn("Speech Recognition not supported.");
    }
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
  }

  // --- Chip Input Methods ---
  get topics(): string[] { return this.setupForm.get('topics')?.value; }
  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.topics.includes(value)) { this.topics.push(value); }
    this.setupForm.get('topics')?.setValue(this.topics);
    event.chipInput!.clear();
    this.topicCtrl.setValue(null);
  }
  remove(topic: string): void {
    const index = this.topics.indexOf(topic);
    if (index >= 0) { this.topics.splice(index, 1); }
    this.setupForm.get('topics')?.setValue(this.topics);
  }
  selected(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;
    if (!this.topics.includes(value)) { this.topics.push(value); }
    this.setupForm.get('topics')?.setValue(this.topics);
    this.topicInput.nativeElement.value = '';
    this.topicCtrl.setValue(null);
  }
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allTopics.filter(topic => topic.toLowerCase().includes(filterValue));
  }

  // --- Voice Feature Methods ---
  speak(text: string, onEndCallback: () => void): void {
    if (!('speechSynthesis' in window)) { onEndCallback(); return; }
    this.statusText = 'AI is asking a question...';
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.onend = () => { onEndCallback(); };
    window.speechSynthesis.speak(utterance);
  }
  setupSpeechRecognition(): void {
    if (!this.recognition) return;
    this.recognition.onstart = () => {
      this.isListening = true;
      this.statusText = 'Listening...';
      this.cdr.detectChanges();
    };
    this.recognition.onresult = (event: any) => { this.answerForm.get('userAnswer')?.setValue(event.results[0][0].transcript); };
    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      this.statusText = 'Could not hear you. Click the mic to try again.';
      this.cdr.detectChanges();
    };
    this.recognition.onend = () => {
      this.isListening = false;
      this.statusText = 'Processing your answer...';
      this.cdr.detectChanges();
      if (this.answerForm.valid) { this.onSubmitAnswer(); }
    };
  }
  startListening(): void {
    if (this.recognition && !this.isListening) {
      this.answerForm.reset();
      this.recognition.start();
    }
  }

  // --- Main Feature Logic ---
  onStartInterview(): void {
    if (this.setupForm.invalid) { return; }
    this.isLoading = true;
    this.errorMessage = null;
    const userId = this.currentUser?._id;
    if (!userId) {
        this.errorMessage = "User not found. Please log in again.";
        this.isLoading = false;
        return;
    }
    const formData = { userId, ...this.setupForm.value };

    this.mockInterviewService.startInterview(formData).subscribe({
      next: (response) => {
        this.sessionData = response;
        this.interviewState = 'in_progress';
        this.isLoading = false;
        this.cdr.detectChanges(); 
        if (this.interviewMode === 'voice') {
          this.speak(response.questionText, () => {
            this.startListening();
          });
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to start the interview. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmitAnswer(): void {
    if (this.answerForm.invalid) {
      if (this.interviewMode === 'voice') {
        this.statusText = "I didn't catch that. Please click the mic and speak again.";
      }
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;
    const data = {
      sessionId: this.sessionData.sessionId,
      questionNumber: this.sessionData.questionNumber,
      userAnswer: this.answerForm.value.userAnswer
    };
    this.mockInterviewService.submitAnswer(data).subscribe({
      next: (response) => {
        this.answerForm.reset();
        if (response.interviewComplete) {
          this.interviewState = 'generating_feedback';
          this.getFinalReport();
        } else {
          this.sessionData = response;
          this.isLoading = false;
          if (this.interviewMode === 'voice') {
            this.speak(response.questionText, () => {
              this.startListening();
            });
          }
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Failed to submit answer. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }
  getFinalReport(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.mockInterviewService.getResults(this.sessionData.sessionId).subscribe({
      next: (response) => {
        this.finalReport = response;
        this.interviewState = 'completed';
        this.isLoading = false;
        this.cdr.detectChanges();
        if (this.interviewMode === 'voice') {
          this.speak("Here is your performance report.", () => { });
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to fetch your report. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }
}
