import { Injectable } from '@angular/core';
import { BaseDataService } from '@shared/BaseDataService';

@Injectable({
  providedIn: 'root',
})
export class NotificationService extends BaseDataService {
  constructor() {
    super('notifications');
  }
}
