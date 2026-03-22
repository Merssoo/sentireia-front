import { NotificationService } from './../../services/notification/notification.service';
import { AuthService } from './../../services/auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { NotificationDTO } from './../../services/notification/notification.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {filter, finalize} from 'rxjs/operators';
import {NotificationWebSocketService} from "../../services/web-socket/web-socket.service";

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
    this.listenToWebsocket();
  }
  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar,
    private notificationWebSocketService: NotificationWebSocketService
  ) {
    this.breakpointObserver.observe(["(max-width: 1200px)"])
      .subscribe(result => {
        this.isHandset = result.matches;
      });
  }

  private listenToWebsocket(): void {
    this.notificationWebSocketService.getNotifications()
      .pipe(
        filter((payload): payload is string => payload !== null && payload !== '')
      )
      .subscribe({
        next: (payload) => {
          try {
            const newNotif = JSON.parse(payload);
            this.notifications = [newNotif, ...this.notifications];
            this.newNotificationsCount++;
            this.snackBar.open('Nova notificação recebida!', 'Ok', { duration: 3000 });
          } catch (e) {
            console.error("Erro ao processar notificação via WebSocket", e);
          }
        }
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
        if (error.status !== 0 && error.error?.message) {
          this.snackBar.open(error.error.message, 'Fechar', {
            duration: 6000,
            verticalPosition: 'bottom',
            horizontalPosition: 'start'
          });
        }
      }
    });
  }

  clearNotifications(): void {
    this.isLoading = true;
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications = [];
        this.newNotificationsCount = 0;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
