import { Injectable } from '@angular/core';
import { BaseDataService } from '@shared/BaseDataService';

@Injectable({
  providedIn: 'root',
})
export class TopicService extends BaseDataService {
  constructor() {
    super('topics');
  }
}
