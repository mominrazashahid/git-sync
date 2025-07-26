import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {GituAuthComponent} from "./git-auth/gitu-auth";
import { GitCallBackComponent } from './git-call-back/git-call-back';

export const routes: Routes = [
     {
    path: 'auth',
    component: GituAuthComponent,
  },
     {
    path: 'callback',
    component: GitCallBackComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GitRoutingModule {}

