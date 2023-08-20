import { Injectable } from '@angular/core';
import { BaseDataService } from '@shared/BaseDataService';

@Injectable({
  providedIn: 'root',
})
export class CompanyFollowerService extends BaseDataService {
  constructor() {
    super('company-followers');
  }
}
