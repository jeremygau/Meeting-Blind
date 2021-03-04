import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { ConnexionId } from '../models/connexionId.model';
import {Subject} from 'rxjs';

@Injectable()
export class AuthService {
  authSubject = new Subject<boolean>();
  private isAuth = false;

  constructor(private httpService: HttpService) { }

  emitSubject(): void {
    this.authSubject.next(this.isAuth);
  }

  public isConnected(): boolean {
    this.httpService.getRequesterId().subscribe(
      (response: {status: number}) => {
        const previousStatus = this.isAuth;
        this.isAuth = response.status !== -1;
        if (previousStatus !== this.isAuth) { this.emitSubject(); }
        return this.isAuth;
      },
      (error: any) => {
        console.log(error);
        return false;
      }
    );
    return false;
  }

  public connectUser(email: string, password: string): boolean {
    const connexionId = new ConnexionId(email, password);
    this.httpService.connectUser(connexionId).subscribe(
      (response: string) => {
         if (response === 'ok') {
           this.isAuth = true;
           this.emitSubject();
           return true;
         }
         return false;
      },
      (error: any ) => {
        console.log(error);
        return false;
      }
    );
    return this.isAuth;
  }

  public disconnectUser(): boolean {
    this.httpService.disconnectUser().subscribe(
      (response: { status: number; }) => {
        if (response.status === 200) {
          this.isAuth = false;
          this.emitSubject();
          return true;
        }
        return false;
      },
      (error: any) => {
        console.log(error);
        return false;
      }
    );
    return this.isAuth;
  }



}
