import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private skipAuthRoutes = [
    '/api/github/callback',
    '/api/github/auth',
    '/auth'
  ];

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    const shouldSkipAuth = this.skipAuthRoutes.some(route => req.url.includes(route));
    
    if (shouldSkipAuth) {
      return next.handle(req);
    }

    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    
    // If token exists, clone the request and add Authorization header
    if (token) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Auth interceptor: Adding Bearer token to request', authReq.url);
      return next.handle(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          // Handle 401 errors (unauthorized)
          if (error.status === 401) {
            console.log('Auth interceptor: Token invalid or expired, logging out user');
            this.handleAuthError();
          }
          return throwError(() => error);
        })
      );
    }
    
 
    this.handleAuthError();
    return throwError(() => new Error('No authentication token'));
  }

  private handleAuthError(): void {
    // Clear all authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Navigate to auth route
    this.router.navigate(['/auth']);
  }
}