import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationsService } from './services/notifications.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy{
  title = 'front';
  hasNewMessages = false;
  messagesNotificationSubscription!: Subscription;

  constructor(private notificationsService: NotificationsService) { }

  ngOnInit(): void {
    this.messagesNotificationSubscription = this.notificationsService.newMessageSubject.subscribe(
      (hasNewMessages: boolean) => {
        this.hasNewMessages = hasNewMessages;
      }
    );
  }

  ngOnDestroy(): void {
    this.messagesNotificationSubscription.unsubscribe();
  }


}
