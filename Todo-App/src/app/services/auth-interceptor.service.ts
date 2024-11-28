import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private cookieService: CookieService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (
      req.url === 'http://localhost:3000/login' ||
      req.url === 'http://localhost:3000/signup'
    ) {
      return next.handle(req);
    }

    console.log('Interceptor Called!');

    const sessionID = this.cookieService.get('sessionID');

    const authReq = req.clone({
      headers: req.headers.set('authorization', sessionID),
    });

    return next.handle(authReq);
  }
}
