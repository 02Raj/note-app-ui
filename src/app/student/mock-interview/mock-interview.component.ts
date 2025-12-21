import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

// Material imports
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

// Third-party
import { QuillModule } from 'ngx-quill';

// Shared
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { MockInterviewService } from './mock-interview.service';
import { AuthService } from '@core';
import { SafeHtmlPipe } from '@shared/pipes/safe-html.pipe';

declare var webkitSpeechRecognition: any;

@Component({
    selector: 'app-mock-interview',
    imports: [
        CommonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatIconModule,
        MatChipsModule,
        MatAutocompleteModule,
        MatButtonToggleModule,
        QuillModule,
        BreadcrumbComponent,
        SafeHtmlPipe,
        ReactiveFormsModule
    ],
    templateUrl: './mock-interview.component.html',
    styleUrl: './mock-interview.component.scss'
})
export class MockInterviewComponent implements OnInit {
  interviewState: 'setup' | 'in_progress' | 'paused' | 'generating_feedback' | 'completed' = 'setup';
  interviewMode: 'voice' | 'text' = 'voice';
  isLoading = false;
  errorMessage: string | null = null;

  setupForm: FormGroup;
  answerForm: FormGroup;
  sessionData: any = null;
  finalReport: any = null;
  currentUser: any = null;

  // --------- Chips + Autocomplete ---------
  breadscrums = [
    { title: 'Mock Interview', items: ['Interview'], active: 'Start' }
  ];

  topicCtrl = new FormControl('');
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredTopics!: Observable<string[]>;

  topics: string[] = [];
  allTopics: string[] = ['Java', 'Spring', 'Angular', 'Node.js', 'SQL'];

  // --------- Custom Questions ---------
  customQuestions: string[] = [];
  newCustomQuestion: string = '';
  questionCount: number = 10;
  timeLimit: number = 0;

  // --------- Voice Recognition ---------
  recognition: any = null;
  isListening: boolean = false;
  statusText: string = 'Click Start Interview';
  liveVoiceTranscript: string = '';
  private _finalTranscript: string = '';

  constructor(
    private fb: FormBuilder,
    private mockInterviewService: MockInterviewService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.setupForm = this.fb.group({
      jobProfile: ['', Validators.required],
      experience: ['', Validators.required],
      topics: [[]],
      questionCount: [10],
      timeLimit: [0],
      customQuestions: [[]]
    });

    this.answerForm = this.fb.group({
      userAnswer: ['', Validators.required]
    });

    // Browser speech recognition setup
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.setupSpeechRecognition();
    }

    // Setup autocomplete filtering
    this.filteredTopics = this.topicCtrl.valueChanges.pipe(
      startWith(null),
      map((value: string | null) =>
        value ? this._filter(value) : this.allTopics.slice()
      )
    );
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
  }

  // --------- Chips + Autocomplete Methods ---------
  addTopic(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.topics.includes(value)) {
      this.topics.push(value);
      this.setupForm.get('topics')?.setValue(this.topics);
    }
    event.chipInput!.clear();
    this.topicCtrl.setValue(null);
  }

  removeTopic(topic: string): void {
    const index = this.topics.indexOf(topic);
    if (index >= 0) {
      this.topics.splice(index, 1);
      this.setupForm.get('topics')?.setValue(this.topics);
    }
  }

  selectedTopic(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.value;
    if (value && !this.topics.includes(value)) {
      this.topics.push(value);
      this.setupForm.get('topics')?.setValue(this.topics);
    }
    this.topicCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allTopics.filter(topic =>
      topic.toLowerCase().includes(filterValue)
    );
  }

  // --------- Voice Recognition ---------
  setupSpeechRecognition(): void {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.statusText = 'Listening...';
      this.liveVoiceTranscript = '';
      this._finalTranscript = '';
      this.cdr.detectChanges();
    };
    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          this._finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      this.liveVoiceTranscript = (this._finalTranscript + interimTranscript).trim();
      this.answerForm.get('userAnswer')?.setValue(this.liveVoiceTranscript);
      this.cdr.detectChanges();
    };

    this.recognition.onerror = () => {
      this.isListening = false;
      this.statusText = 'Mic error.';
      this.cdr.detectChanges();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.statusText = 'Mic stopped.';
      this.answerForm.get('userAnswer')?.setValue(this.liveVoiceTranscript.trim());
      this.cdr.detectChanges();
    };
  }

  startListening(): void {
    if (this.recognition && !this.isListening) {
      this.answerForm.reset();
      this.liveVoiceTranscript = '';
      this._finalTranscript = '';
      this.recognition.start();
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      this.statusText = 'Stopped listening.';
      this.cdr.detectChanges();
    }
  }

  // --------- AI Voice Speaking ---------
  speak(text: string, onEndCallback: () => void): void {
    if (!('speechSynthesis' in window)) {
      onEndCallback();
      return;
    }
    this.statusText = 'Interviewer is asking a question...';
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find(v => v.name.toLowerCase().includes('female')) || null;
    utterance.onend = onEndCallback;
    window.speechSynthesis.speak(utterance);
  }

  // --------- Interview Logic ---------
  onStartInterview(): void {
    if (this.setupForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = null;
    const userId = this.currentUser?._id;
    const formData = {
      userId,
      ...this.setupForm.value,
      customQuestions: this.customQuestions,
      questionCount: this.questionCount,
      timeLimit: this.timeLimit
    };
    this.mockInterviewService.startInterview(formData).subscribe({
      next: (response) => {
        this.sessionData = response;
        this.interviewState = 'in_progress';
        this.isLoading = false;
        if (this.interviewMode === 'voice') {
          this.speak(response.questionText, () => {
            this.startListening();
          });
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to start interview.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmitAnswer(): void {
    if (this.answerForm.invalid) return;
    this.isLoading = true;
    const data = {
      sessionId: this.sessionData.sessionId,
      questionNumber: this.sessionData.questionNumber,
      userAnswer: this.answerForm.value.userAnswer,
      source: 'manual'
    };
    this.mockInterviewService.submitAnswer(data).subscribe({
      next: (response) => {
        this.answerForm.reset();
        this.liveVoiceTranscript = '';
        this._finalTranscript = '';
        if (response.interviewComplete) {
          this.interviewState = 'generating_feedback';
          this.getFinalReport();
        } else {
          this.sessionData = response;
          if (this.interviewMode === 'voice') {
            this.speak(response.questionText, () => {
              this.startListening();
            });
          }
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to submit answer.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getFinalReport(): void {
    this.isLoading = true;
    this.mockInterviewService.getResults(this.sessionData.sessionId).subscribe({
      next: (response) => {
        this.finalReport = response;
        this.interviewState = 'completed';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to fetch report.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --------- Custom Question Methods ---------
  addCustomQuestion(): void {
    const value = this.newCustomQuestion.trim();
    if (value && !this.customQuestions.includes(value)) {
      this.customQuestions.push(value);
      this.setupForm.get('customQuestions')?.setValue(this.customQuestions);
      this.newCustomQuestion = '';
    }
  }

  removeCustomQuestion(q: string): void {
    const idx = this.customQuestions.indexOf(q);
    if (idx >= 0) this.customQuestions.splice(idx, 1);
    this.setupForm.get('customQuestions')?.setValue(this.customQuestions);
  }
}
