import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Message } from '../models/message.model';
import { NotificationsService } from './notifications.service';
import { ConnexionId } from '../models/connexionId.model';
import { Conversation } from '../models/conversation.model';


@Injectable()
export class HttpService {
  private serverUrl = 'http://localhost:8080/';

  constructor(private http: HttpClient, private notificationsService: NotificationsService) {
  }

  private headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

  public getUsersForTown(town: string): Observable<any> {
    this.checkForNewMessages();
    return this.http.get(this.serverUrl + 'search/' + town);
  }

  public getUser(id: number): Observable<any> {
    this.checkForNewMessages();
    return this.http.get(this.serverUrl + 'users/' + id);
  }

  public createUser(user: User): Observable<any> {
    return this.http.post<User>(this.serverUrl + 'users', user, {headers: this.headers});
  }

  public deleteUser(id: number): Observable<any> {
    return this.http.delete(this.serverUrl + 'users/' + id, {observe: 'response'});
  }

  public updateUser(user: User): Observable<any> {
    return this.http.put<User>(this.serverUrl + 'users', user, {headers: this.headers});
  }

  public like(idLiked: number): Observable<any> {
    return this.http.put(this.serverUrl + 'like/', {id: idLiked.toString()});
  }

  public dislike(idLiked: number): Observable<any> {
    return this.http.delete(this.serverUrl + 'like/' + idLiked.toString());
  }

  public getConversations(): Observable<Conversation[]> {
    this.checkForNewMessages();
    return this.http.get<Conversation[]>(this.serverUrl + 'conv/');
  }

  public getConversation(userId: number): Observable<Conversation> {
    return this.http.get<Conversation>(this.serverUrl + 'conv/' + userId.toString());
  }

  public deleteConversation(userId: number): Observable<any> {
    this.checkForNewMessages();
    return this.http.delete(this.serverUrl + 'conv/' + userId.toString(), {observe: 'response'});
  }

  public addMessage(message: Message): Observable<Conversation> {
    return this.http.post<Conversation>(this.serverUrl + 'conv/', message, {headers: this.headers});
  }

  public deleteMessage(userId: number, messageId: number): Observable<Conversation> {
    const params = new HttpParams().set('userId', userId.toString()).set('messageId', messageId.toString());

    return this.http.delete<Conversation>(this.serverUrl + 'conv/', {params});
  }

  public connectUser(connexionId: ConnexionId): Observable<ConnexionId> {
    return this.http.post<ConnexionId>(this.serverUrl + 'connection/connect', connexionId, {headers: this.headers});
  }

  public disconnectUser(): Observable<any> {
    return this.http.get(this.serverUrl + 'connection/disconnect', {observe: 'response'});
  }

  public getRequesterId(): Observable<any> {
    return this.http.get(this.serverUrl + 'cookieStatus', {responseType: 'json'});
  }

  public checkForNewMessages(): void {
    this.http.get(this.serverUrl + 'conv/check/newMessages', {responseType: 'text'}).subscribe(
      (response) => {
        const hasNewMessages = response === 'true';
        this.notificationsService.setMessageNotification(hasNewMessages);
      }, () => {
        console.log('error in checkMessages');
        return false;
      }
    );
  }
}
