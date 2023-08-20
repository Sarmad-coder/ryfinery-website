import { Injectable } from '@angular/core';
import { environment } from '@env';
import { BaseDataService } from '@shared/BaseDataService';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserPermissionService extends BaseDataService {
  constructor() {
    super('users-permissions/roles');
  }

  // Get default generated permissions
  permissions() {
    return firstValueFrom(this.http.get<{ permissions: any }>(`${environment.apiUrl}users-permissions/permissions`));
  }
}
