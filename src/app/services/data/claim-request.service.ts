import { Injectable } from '@angular/core';
import { BaseDataService } from '@shared/BaseDataService';

@Injectable({
  providedIn: 'root',
})
export class ClaimRequestService extends BaseDataService {
  constructor() {
    super('claim-requests');
  }
}
