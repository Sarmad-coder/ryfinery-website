import { Injectable } from '@angular/core';
import { BaseDataService } from '@shared/BaseDataService';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class CompanyDiscussionVoteService extends BaseDataService {
  constructor() {
    super('company-discussion-votes');
  }
}
