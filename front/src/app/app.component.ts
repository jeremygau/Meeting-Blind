import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationsService } from './services/notifications.service';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy{
  title = 'front';
  hasNewMessages = false;
  messagesNotificationSubscription!: Subscription;
  isConnected = false;
  connectionSubscription!: Subscription;

  constructor(private notificationsService: NotificationsService, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.messagesNotificationSubscription = this.notificationsService.newMessageSubject.subscribe(
      (hasNewMessages: boolean) => {
        this.hasNewMessages = hasNewMessages;
      }
    );
    this.connectionSubscription = this.authService.authSubject.subscribe(
      (isConnected: boolean) => {
        this.isConnected = isConnected;
      }
    );
  }

  disconnect(): void {
    this.authService.disconnectUser().subscribe(
      (response: any) => {
        if (response.status === 200) {
          this.authService.setIsConnected(false);
          this.router.navigate(['']);
          return;
        } else {
          alert('Un problème est survenu lors de la tentative de déconnexion, veuillez réessayer.');
        }
      },
      (error: any) => {
        console.log(error);
        alert('Un problème est survenu lors de la tentative de déconnexion, veuillez réessayer.');
      }
    );
  }

  ngOnDestroy(): void {
    this.messagesNotificationSubscription.unsubscribe();
    this.connectionSubscription.unsubscribe();
  }


}
