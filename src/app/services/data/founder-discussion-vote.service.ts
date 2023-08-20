import { Injectable } from '@angular/core';
import { BaseDataService } from '@shared/BaseDataService';

@Injectable({
  providedIn: 'root',
})
export class FounderDiscussionVoteService extends BaseDataService {
  constructor() {
    super('founder-discussion-votes');
  }
}
