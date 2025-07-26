import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private backendUrl = '/api/github/callback';

  constructor(private http: HttpClient) {}

  sendGithubCode(code: string): Observable<any> {
    const url = `${this.backendUrl}?code=${code}`;
    return this.http.get(url);
  }

  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  setUserData(userData: any): void {
    localStorage.setItem('user', JSON.stringify(userData));
  }

  clearAuthToken(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }
}