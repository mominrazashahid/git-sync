import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
    private readonly gitService: GitService
  ) {}

   ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      if (code) {
        this.gitService.sendGithubCode(code).subscribe((res) => {
          console.log(res.data,'Data>>>>>>>>>>>>>');
          if(res.data && res.data.accessToken){
            localStorage.setItem('Authtoken', res.data.accessToken);
            localStorage.setItem('user', res.data.user);

          }
        });
      } else {
        console.error('GitHub code not found in query params');
      }
    });
  }

 
}

// daed476c68190e0bf1ae
