import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { ConnexionId } from '../models/connexionId.model';
import {Observable, Subject} from 'rxjs';

@Injectable()
export class AuthService {
  authSubject = new Subject<boolean>();
  private isAuth = false;

  constructor(private httpService: HttpService) { }

  emitSubject(): void {
    this.authSubject.next(this.isAuth);
  }

  public getRequesterId(): Observable<any> {
    return this.httpService.getRequesterId();
  }

  public connectUser(email: string, password: string): Observable<any> {
    const connexionId = new ConnexionId(email, password);
    return this.httpService.connectUser(connexionId);
  }

  public disconnectUser(): Observable<any> {
    return this.httpService.disconnectUser();
  }

  public setIsConnected(status: boolean): void {
    if (status !== this.isAuth) {
      this.isAuth = status;
      this.emitSubject();
    }
  }



}
