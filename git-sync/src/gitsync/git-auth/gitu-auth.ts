import { Component } from '@angular/core';

@Component({
  selector: 'app-git-auth',
  templateUrl: './git-auth.html',
  styleUrls: ['./git-auth.scss']
})
export class GituAuthComponent {

  constructor(){

  }

  connectToGitHub(){
    window.location.href = 'http://104.168.152.172:3000/api/github/';
  }
}
