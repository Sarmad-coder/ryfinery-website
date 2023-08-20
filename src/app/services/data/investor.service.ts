import { Injectable } from '@angular/core';
import { BaseDataService } from '@shared/BaseDataService';

@Injectable({
  providedIn: 'root',
})
export class InvestorService extends BaseDataService {
  constructor() {
    super('investors');
  }
}
