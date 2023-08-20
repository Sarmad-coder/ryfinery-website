import { Injectable } from '@angular/core';
import { BaseDataService } from '@shared/BaseDataService';

@Injectable({
  providedIn: 'root',
})
export class FundingStageService extends BaseDataService {
  constructor() {
    super('funding-stages');
  }
}
