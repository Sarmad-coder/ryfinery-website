import { Injectable } from '@angular/core';
import { BaseDataService } from '@shared/BaseDataService';

@Injectable({
  providedIn: 'root',
})
export class CompanyVoteService extends BaseDataService {
  constructor() {
    super('company-votes');
  }
}
