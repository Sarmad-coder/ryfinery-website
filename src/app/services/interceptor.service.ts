import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable()
export class InterceptorService implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): any {
    return next.handle(req).pipe((event: any) => {
      if (event instanceof HttpResponse) {
        event = event.clone({
          body: { success: true, statusCode: 200, body: req.body },
        });
      }
      return event;
    });
  }
}
