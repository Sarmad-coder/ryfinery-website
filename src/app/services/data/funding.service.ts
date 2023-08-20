import { Injectable } from '@angular/core';
import { BaseDataService } from '@shared/BaseDataService';

@Injectable({
  providedIn: 'root',
})
export class FundingService extends BaseDataService {
  constructor() {
    super('fundings');
  }
}
