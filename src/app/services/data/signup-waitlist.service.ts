import { Injectable } from '@angular/core';
import { BaseDataService } from '@shared/BaseDataService';

@Injectable({
  providedIn: 'root',
})
export class SignupWaitlistService extends BaseDataService {
  constructor() {
    super('signup-waitlists');
  }
}
