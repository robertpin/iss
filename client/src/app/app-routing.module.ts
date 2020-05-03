import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConferencesComponent } from './conferences/conferences.component';
import { ConfDetailsComponent } from './conf-details/conf-details.component';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  {path:'', component: ConferencesComponent},
  {path: 'conference/:id', component: ConfDetailsComponent},
  {path: 'register/:id', component: RegisterComponent},
  {path: 'signin/:user', component: LoginComponent},
  {path: 'signin', component: LoginComponent},
  {path: 'profile', component: ProfileComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
