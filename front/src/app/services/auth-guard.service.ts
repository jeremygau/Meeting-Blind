import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean |
    UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.authService.getRequesterId().pipe(map(
      (response: {id: number}) => {
        if (response.id >= 0) {
          this.authService.setIsConnected(true);
          return true;
        } else {
          this.authService.setIsConnected(false);
          this.router.navigate(['login']);
          return false;
        }
      }), catchError( (error) => {
        console.log(error);
        this.router.navigate(['login']);
        return of(false);
      })
    );

  }

}
