import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';


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

  public getUser(id: number): Observable<User> {
    return this.http.get(this.serverUrl + 'users/' + id);
  }

  public createUser(user: User): Observable<any> {
    return this.http.post<User>(this.serverUrl + 'users', user, this.httpOptions);
  }
}
