import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as qs from 'qs';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

export const TOKEN_KEY = 'x-access-token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  url = environment.apiUrl;

  constructor(private http: HttpClient) {}

  sendPasswordLessLink(data: any) {
    return firstValueFrom(this.http.post(this.url + 'passwordless/send-link', data));
  }

  passwordlessLoginByToken(token: string) {
    return firstValueFrom(this.http.get(`${this.url}passwordless/login`, { params: { loginToken: token } }));
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
  }

  // login(token: string) {
  //   return this.http.get(this.url + 'passwordless/login?loginToken=' + token);
  // }

  // isLoggedIn() {
  //   if (localStorage.getItem('user') && localStorage.getItem('jwt')) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  // localLogin(resp: any) {
  //   localStorage.setItem('jwt', resp['jwt']);
  //   localStorage.setItem('user', JSON.stringify(resp['user']));
  // }

  // getUserByEmail(email: string) {
  //   return this.http.get<any>(this.url + 'users?filters[email][$eq]=' + email);
  // }

  // logout() {
  //   localStorage.removeItem('user');
  //   localStorage.removeItem('jwt');
  // }
}
