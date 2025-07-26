import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {GituAuthComponent} from "./git-auth/gitu-auth";
import { GitCallBackComponent } from './git-call-back/git-call-back';
import { DataViewerComponent } from './data-viewer/data-viewer.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
     {
    path: 'auth',
    component: GituAuthComponent,
  },
     {
    path: 'callback',
    component: GitCallBackComponent,
  },
     {
    path: 'data',
    component: DataViewerComponent,
    canActivate: [AuthGuard]
  },
     {
    path: '',
    redirectTo: 'data',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GitRoutingModule {}

