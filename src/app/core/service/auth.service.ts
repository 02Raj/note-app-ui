import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, throwError } from 'rxjs';
import { User } from '../models/user';
import { Role } from '@core/models/role';
import { environment } from 'environments/environment';



@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
  private apiUrl = environment.apiUrl + '/auth';// Add API URL



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