import { Injectable } from '@angular/core';
import { BaseDataService } from '@shared/BaseDataService';

@Injectable({
  providedIn: 'root',
})
export class FounderVoteService extends BaseDataService {
  constructor() {
    super('founder-votes');
  }
}
