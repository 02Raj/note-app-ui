import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

// --- NEW: Define the structure for the chart data ---
export interface ChartData {
  series: {
    name: string;
    data: number[];
  }[];
  categories: string[];
}

// --- UPDATED: The complete interface for your dashboard statistics ---
export interface DashboardStats {
  topics: {
    total: number;
    completed: number;
  };
  notes: {
    total: number;
    dueForRevision: number;
  };
  deadlines: {
    upcoming: number;
    missed: number;
    completed: number;
  };
  mockInterviews: {
    total: number;
    averageScore: number;
    recentScores: { score: number; createdAt: string }[];
  };
  // --- NEW: Add properties from your backend response here ---
  topProgressingTopics: {
    name: string;
    progress: number;
  }[];
  timeSpent: {
    hours: number;
    minutes: number;
  };
  learningTimeChart: ChartData;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // Replace with your actual API endpoint
  private apiUrl = `${environment.apiUrl}/dashboard/stats`;

  constructor(private http: HttpClient) { }

  getDashboardStats(): Observable<{data: DashboardStats}> {
    return this.http.get<{data: DashboardStats}>(this.apiUrl);
  }
}
