import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { ConnexionId } from '../models/connexionId.model';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class AuthService {
  authSubject = new Subject<boolean>();
  private isAuth = false;

  constructor(private httpService: HttpService) { }

  public emitSubject(): void {
    this.authSubject.next(this.isAuth);
  }

  public isConnected(): Observable<boolean> {
    return this.httpService.getRequesterId().pipe(map(
      (response: {id: number}) => {
        if (response.id >= 0) {
          this.setIsConnected(true);
          return true;
        } else {
          this.setIsConnected(false);
          return false;
        }
      }), catchError( (error) => {
        console.log(error);
        this.setIsConnected(false);
        return of(false);
      })
    );
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
