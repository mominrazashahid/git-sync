import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthService } from '../../app/auth.service';
import { SharedModule } from '../../app/shared.module';

@Component({
  selector: 'app-git-auth',
  templateUrl: './git-auth.html',
  styleUrls: ['./git-auth.scss'],
  imports: [SharedModule]
})
export class GituAuthComponent implements OnInit {
  isConnected = false;
  userData: any = null;
  connectionDate: string = '';
  isLoading = true;
  isConnecting = false;

  constructor(private authService: AuthService,  private cdr: ChangeDetectorRef,) {}

  ngOnInit() {
    setTimeout(() => {
      this.checkConnectionStatus();
      this.isLoading = false;
       this.cdr.detectChanges();
    }, 1500);
  }

  checkConnectionStatus() {
    this.isConnected = this.authService.isAuthenticated();
    console.log(this.isConnected,'isConnected');
    if (this.isConnected) {
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        try {
          this.userData = JSON.parse(userDataString);
          // Get connection date from localStorage or set current date
          const storedDate = this.userData.created_at;
          if (storedDate) {
            this.connectionDate = new Date(storedDate).toLocaleDateString();
          } else {
            // If no stored date, use current date and store it
            const now = new Date().toISOString();
            localStorage.setItem('connectionDate', now);
            this.connectionDate = new Date(now).toLocaleDateString();
          }
         
        } catch (error) {
          console.error('Error parsing user data:', error);
          this.isConnected = false;
        }
      }
    }
  }

  connectToGitHub() {
    this.isConnecting = true;
    // Add a small delay for visual feedback
    setTimeout(() => {
      window.location.href = 'http://104.168.152.172:3000/api/github/';
    }, 800);
  }

  disconnect() {
    this.authService.clearAuthToken();
    localStorage.removeItem('connectionDate');
    this.isConnected = false;
    this.userData = null;
    this.connectionDate = '';
  }
}
