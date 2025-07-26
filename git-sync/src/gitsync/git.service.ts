import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GitService {
  private backendUrl = 'api/github/callback';

  constructor(private http: HttpClient) {}

  sendGithubCode(code: string): Observable<any> {
    const url = `${this.backendUrl}?code=${code}`;
    return this.http.get(url);
  }
}
