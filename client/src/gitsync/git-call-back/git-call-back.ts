import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GitService } from '../git.service';

@Component({
  selector: 'app-git-call-back',
  templateUrl: './git-call-back.html',
  styleUrl: './git-call-back.scss',
  providers: [GitService]
})
export class GitCallBackComponent {
    constructor(
    private route: ActivatedRoute,
    private readonly gitService: GitService,
    private readonly router: Router
  ) {}

   ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      if (code) {
        this.gitService.sendGithubCode(code).subscribe((res) => {
          if(res.data && res.data.accessToken){
            this.gitService.setAuthToken(res.data.accessToken);
            this.gitService.setUserData(res.data.user);
            this.router.navigate(['/data']);
          }
        });
      } else {
        console.error('GitHub code not found in query params');
      }
    });
  }

 
}

// daed476c68190e0bf1ae
