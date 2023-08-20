import { Injectable } from '@angular/core';
import { BaseDataService } from '@shared/BaseDataService';

@Injectable({
  providedIn: 'root',
})
export class CompanyTypeService extends BaseDataService {
  constructor() {
    super('company-types');
  }
}
