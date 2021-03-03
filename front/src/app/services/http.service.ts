import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Message } from '../models/message.model';


@Injectable()
export class HttpService {
  private serverUrl = 'http://localhost:8080/';

  constructor(private http: HttpClient) {
  }

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  public getUsersForTown(town: string): Observable<any> {
    return this.http.get(this.serverUrl + 'search/' + town);
  }

  public getUser(id: number): Observable<any> {
    return this.http.get(this.serverUrl + 'users/' + id);
  }

  public createUser(user: User): Observable<any> {
    return this.http.post<User>(this.serverUrl + 'users', user, this.httpOptions);
  }

  public like(idLiked: number): Observable<any> {
    return this.http.put(this.serverUrl + 'like/', {id: idLiked.toString()});
  }

  public dislike(idLiked: number): Observable<any> {
    return this.http.delete(this.serverUrl + 'like/' + idLiked.toString());
  }

  public getConversations(): Observable<any> {
    return this.http.get(this.serverUrl + 'conv/');
  }

  public getConversation(userId: number): Observable<any> {
    return this.http.get(this.serverUrl + 'conv/' + userId.toString());
  }

  public deleteConversation(userId: number): Observable<any> {
    return this.http.delete(this.serverUrl + 'conv/' + userId.toString(), {observe: 'response'});
  }

  public addMessage(userId: number, message: Message): Observable<any> {
    return this.http.post<Message>(this.serverUrl + 'conv/', message, this.httpOptions);
  }

  public deleteMessage(userId: number, messageId: number): Observable<any> {
    const params = new HttpParams()
            .set('userId', userId.toString())
            .set('messageId', messageId.toString());
    return this.http.delete(this.serverUrl + 'conv/', {params, observe: 'response'});
  }

}
