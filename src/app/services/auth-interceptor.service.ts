import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  // timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  constructor(private router: Router, private authService: AuthService, private toastr: ToastrService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // const shop = this.userService.user?.shop;
    // const token = this.userService.token;

    // if (token && shop) {
    //   request = request.clone({
    //     setHeaders: {
    //       [TOKEN_KEY]: token,
    //       shop: JSON.stringify(shop),
    //     },
    //   });
    // }

    return next.handle(request).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          console.log('invalid token');
          this.authService.logout();
          window.location.reload();
          // this.router.navigate(['login']);
        }

        return throwError(() => error);
      })
    );
  }
}
