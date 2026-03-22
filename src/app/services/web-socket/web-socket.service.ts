import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';
import {environment} from "../../../environments/environment";
import {AuthService} from "../auth/auth.service";

@Injectable({
  providedIn: 'root'
})
export class NotificationWebSocketService {
  private notificationSubject = new BehaviorSubject<string | null>(null);
  private stompClient: Client = new Client();

  constructor(private authSerivece: AuthService) {
    this.initWebSocket();
  }

  private initWebSocket() {
    const url = environment.apiBaseUrl + '/ws-notification';
    const token = this.authSerivece.getToken();
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(url),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      reconnectDelay: 5000,
    });

    this.stompClient.onConnect = (frame) => {
      console.log('Conectado ao WebSocket');

      const userId = this.authSerivece.getUserId()

      this.stompClient.subscribe(`/topic/notifications/${userId}`, (message: Message) => {
        this.notificationSubject.next(message.body);
      });
    };

    this.stompClient.activate();
  }

  getNotifications(): Observable<string | null> {
    return this.notificationSubject.asObservable();
  }
}
