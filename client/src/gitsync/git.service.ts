import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GitService {
  private backendUrl = '/api/github/callback';
  private dataUrl = '/api/github/data';

  constructor(private http: HttpClient) {}

  sendGithubCode(code: string): Observable<any> {
    const url = `${this.backendUrl}?code=${code}`;
    return this.http.get(url);
  }

  getGithubData(collection: string | undefined, page: number = 1, limit: number = 10, search: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

      if(collection){
        params = params.set('collection', collection);
      }
      
      if(search.trim()){
        params = params.set('search', search.trim());
      }
    
    return this.http.get(this.dataUrl, { 
      params,
      observe: 'response'
    }).pipe(
      map((response: any) => response.body),
      catchError((error: any) => {
        console.error('HTTP Error details:', error);
        if (error.status === 401) {
          console.error('Authentication failed. Please login again.');
          // Optionally redirect to login or show auth error
        }
        throw error;
      })
    );
  }


  // Method to store token after successful authentication
  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  // Method to store user data
  setUserData(userData: any): void {
    localStorage.setItem('user', JSON.stringify(userData));
  }

  // Method to remove token on logout
  clearAuthToken(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // Method to check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }
}
