import { Injectable } from '@angular/core';
import { BaseDataService } from '@shared/BaseDataService';

@Injectable({ providedIn: 'root' })
export class OutlookService extends BaseDataService {
  constructor() {
    super('outlooks');
  }
}
