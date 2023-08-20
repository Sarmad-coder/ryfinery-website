import { Injectable } from '@angular/core';
import { BaseDataService } from '@shared/BaseDataService';

@Injectable({
  providedIn: 'root',
})
export class InvestorStageService extends BaseDataService {
  constructor() {
    super('investor-stages');
  }
}
