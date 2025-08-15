import { NotificationService } from './../../services/notification/notification.service';
import { AuthService } from './../../services/auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { NotificationDTO } from './../../services/notification/notification.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit{
  isHandset = false;
  notifications: any[] = [];
  newNotificationsCount: number = 0;
  isLoading = false; 

  ngOnInit(): void {
    this.getNotifications();
  }
  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar
  ) {
    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        this.isHandset = result.matches;
      });
  }

   getNotifications(): void {
    this.isLoading = true;
    this.notificationService.getUnreadNotifications().pipe(finalize(() => this.isLoading = false)).subscribe({
      next: (notifications: NotificationDTO[]) => {
        this.notifications = notifications;
        this.newNotificationsCount = notifications.length;
      },
      error: error => {
        this.snackBar.open('Erro ao buscar notificações', 'Fechar', {
          duration: 6000,
          verticalPosition: 'bottom',
          horizontalPosition: 'start'
        });
      }
    });
  }

  clearNotifications(): void {
    this.isLoading = true;
    this.notificationService.markAllAsRead().pipe().subscribe();
    this.notificationService.getUnreadNotifications().pipe(finalize(() => this.isLoading = false)).subscribe({
      next: (notifications: NotificationDTO[]) => {
        this.notifications = notifications;
        this.newNotificationsCount = notifications.length;
      },
      error: error => {
        this.snackBar.open('Erro ao buscar notificações', 'Fechar', {
          duration: 6000,
          verticalPosition: 'bottom',
          horizontalPosition: 'start'
        });
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
