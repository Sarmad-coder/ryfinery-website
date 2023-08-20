import { Injectable } from '@angular/core';
import { BaseDataService } from '@shared/BaseDataService';

@Injectable({ providedIn: 'root' })
export class OutlookCategoryService extends BaseDataService {
  constructor() {
    super('outlook-categories');
  }
}
