import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResumeAnalyzerService {
  private apiUrl = `${environment.apiUrl}/api/resume`; 
  // Aapka backend server ka URL
  // private apiUrl = 'http://localhost:5000/api/resume'; // Isko apne URL se badal lein

  constructor(private http: HttpClient) { }

  /**
   * Analyzes the uploaded resume file.
   * @param resumeFile - The resume file (PDF/DOCX) to be analyzed.
   */
  analyzeResume(resumeFile: File): Observable<any> {
    const formData = new FormData();
    // Backend 'upload.single('resume')' is field ko dhoondhega
    formData.append('resume', resumeFile, resumeFile.name);

    // Authentication token HttpClient interceptor ke through apne aap lag jaana chahiye
    return this.http.post<any>(`${this.apiUrl}/analyze`, formData);
  }
}
