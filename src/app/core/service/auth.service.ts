import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, throwError } from 'rxjs';
import { User } from '../models/user';
import { Role } from '@core/models/role';
import { environment } from 'environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
  private apiUrl = environment.apiUrl + '/auth';// Add API URL

  private users = [
    {
      id: 1,
      img: 'assets/images/user/admin.jpg',
      username: 'admin@school.org',
      password: 'admin@123',
      firstName: 'Sarah',
      lastName: 'Smith',
      role: Role.Admin,
      token: 'admin-token',
    },
    {
      id: 2,
      img: 'assets/images/user/teacher.jpg',
      username: 'teacher@school.org',
      password: 'teacher@123',
      firstName: 'Ashton',
      lastName: 'Cox',
      role: Role.Teacher,
      token: 'teacher-token',
    },
    {
      id: 3,
      img: 'assets/images/user/student.jpg',
      username: 'student@school.org',
      password: 'student@123',
      firstName: 'Ashton',
      lastName: 'Cox',
      role: Role.Student,
      token: 'student-token',
    },
  ];

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage.getItem('currentUser') || '{}')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  register(name: string, email: string, password: string) {
    return this.http.post(`${this.apiUrl}/register`, { name, email, password })
      .pipe(
        catchError(error => {
          return throwError(error.error.message || 'Registration failed');
        })
      );
  }

  login(email: string, password: string) {
    return this.http.post(`${this.apiUrl}/login`, { email, password })
      .pipe(
        map((response: any) => {
          const user = response.data;
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError(error => {
          return throwError(error.error.message || 'Login failed');
        })
      );
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next({} as User);
    return of({ success: true });
  }
}