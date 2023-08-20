import { Injectable } from '@angular/core';
import { BaseDataService } from '@shared/BaseDataService';

@Injectable({
  providedIn: 'root',
})
export class EventService extends BaseDataService {
  constructor() {
    super('events');
  }
}
