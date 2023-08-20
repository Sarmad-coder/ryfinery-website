import { Injectable } from '@angular/core';
import { BaseDataService } from '@shared/BaseDataService';

@Injectable({
  providedIn: 'root',
})
export class SubscriberService extends BaseDataService {
  constructor() {
    super('subscribers');
  }
}
