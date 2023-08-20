import { Injectable } from '@angular/core';
import { BaseDataService } from '@shared/BaseDataService';
import { User } from '@models/user';
import { firstValueFrom } from 'rxjs';
import { TOKEN_KEY } from '@services/auth.service';
import { LoginPopupService } from '@services/login-popup.service';

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseDataService {
  private _user?: User;

  constructor() {
    super('users');
  }

  get user(): User | undefined {
    return this._user;
  }

  get hasUser(): boolean {
    return !!this.user;
  }

  async loadUser() {
    const token = localStorage.getItem(TOKEN_KEY) as string;

    if (token) {
      const user = await this.getUserByToken(token, {
        populate: {
          image: {
            fields: ['url'],
          },
        },
      });

      this._user = user;
      console.log('Login User:', user);

      return user;
    }

    return null;
  }

  // Get authenticated user info
  getUserByToken(token: string, query?: any) {
    return firstValueFrom(
      this.http.get<User>(`${this.url}/me?${this.queryToString(query)}`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      })
    );
  }

  count() {
    return firstValueFrom(this.http.get<number>(`${this.url}/count`));
  }
}
