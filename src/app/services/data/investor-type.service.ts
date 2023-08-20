import { Injectable } from '@angular/core';
import { BaseDataService } from '@shared/BaseDataService';

@Injectable({
  providedIn: 'root',
})
export class InvestorTypeService extends BaseDataService {
  constructor() {
    super('investor-types');
  }
}
