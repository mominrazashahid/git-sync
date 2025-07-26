import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { GitService } from './git.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private gitService: GitService,
    private router: Router
  ) {}

  canActivate(
  ): boolean {
    // Check if user is authenticated (token exists in localStorage)
    if (this.gitService.isAuthenticated()) {
      return true;
    }
    
    this.router.navigate(['/auth']);
    return false;
  }
}