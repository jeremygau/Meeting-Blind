import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean |
    UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.authService.isConnected().pipe(map(
      (isAuth: boolean) => {
        if (isAuth) { return true; }
        else {
          this.router.navigate(['login']);
          return false;
        }
      },
      (error: any) => {
        console.log('Auth error : ' + error);
        return of(false);
      }
    ));
  }

}
