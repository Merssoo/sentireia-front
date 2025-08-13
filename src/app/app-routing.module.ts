import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { authGuard } from './guards/auth.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { CadastroComponent } from './auth/cadastro/register.component';
import { ConfirmCodeComponent } from './auth/confirm-code/confirm-code.component';
import { ResendCodeComponent } from './auth/resend-code/resend-code.component';
import { DashboardComponent } from './layouts/dashboard/dashboard.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroComponent},
  { path: 'confirm-code', component: ConfirmCodeComponent, canActivate : [authGuard] },
  { path: 'resend-code', component: ResendCodeComponent},
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
