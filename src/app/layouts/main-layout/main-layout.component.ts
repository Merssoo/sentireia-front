import { AuthService } from './../../services/auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit{
  isHandset = false;
  notifications: any[] = [];
  newNotificationsCount: number = 0;

  ngOnInit(): void {
    this.notifications = [
    { id: 1, message: 'Novo agendamento com Maria' },
    { id: 2, message: 'Prontuário de João atualizado' },
    { id: 3, message: 'Lembrete: consulta com Pedro em 1h' }
    ];
    this.newNotificationsCount = this.notifications.length;
  }
  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private router: Router
  ) {
    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        this.isHandset = result.matches;
      });
  }

  clearNotifications(): void {
    this.notifications = [];
    this.newNotificationsCount = 0;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
