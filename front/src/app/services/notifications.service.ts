import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';
import has = Reflect.has;

@Injectable()
export class NotificationsService {
  hasNewMessage = false;
  newMessageSubject = new Subject<boolean>();

  private emitMessageNotification(): void {
    this.newMessageSubject.next(this.hasNewMessage);
  }

  public setMessageNotification(hasNewMessage: boolean): void {
    if (! this.hasNewMessage === hasNewMessage) {
      this.hasNewMessage = hasNewMessage;
      this.emitMessageNotification();
    }
  }
}
