import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../app/auth.service';
import { SharedModule } from '../../app/shared.module';

@Component({
  selector: 'app-git-call-back',
  templateUrl: './git-call-back.html',
  styleUrl: './git-call-back.scss',
  imports: [SharedModule],
  providers: [AuthService]
})
export class GitCallBackComponent implements OnInit {
  isLoading = true;
  loadingMessage = 'Connecting to GitHub...';
  progressSteps = [
    'Verifying authorization code',
    'Exchanging tokens',
    'Fetching user data',
    'Setting up your account',
    'Redirecting to dashboard'
  ];
  currentStep = 0;
    constructor(
    private route: ActivatedRoute,
    private readonly authService: AuthService,
    public readonly router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      if (code) {
        this.simulateProgress();
        this.authService.sendGithubCode(code).subscribe((res) => {
          if(res.data && res.data.accessToken){
            this.authService.setAuthToken(res.data.accessToken);
            this.authService.setUserData(res.data.user);
            // Store connection date
            localStorage.setItem('connectionDate', new Date().toISOString());
            
            // Complete the progress and redirect
            this.currentStep = this.progressSteps.length - 1;
            setTimeout(() => {
              this.router.navigate(['/data']);
            }, 1000);
          }
        }, (error) => {
          this.loadingMessage = 'Connection failed. Please try again.';
          this.isLoading = false;
        });
      } else {
        this.loadingMessage = 'Authorization code not found. Please try again.';
        this.isLoading = false;
      }
    });
  }

  simulateProgress() {
    const interval = setInterval(() => {
      if (this.currentStep < this.progressSteps.length - 2) {
        this.currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 800);
  }

 
}

// daed476c68190e0bf1ae
