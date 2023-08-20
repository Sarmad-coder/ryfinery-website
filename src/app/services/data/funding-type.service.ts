import { Injectable } from '@angular/core';
import { BaseDataService } from '@shared/BaseDataService';

@Injectable({
  providedIn: 'root',
})
export class FundingTypeService extends BaseDataService {
  constructor() {
    super('funding-types');
  }
}
