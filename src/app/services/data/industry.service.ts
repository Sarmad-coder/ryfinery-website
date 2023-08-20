import { Injectable } from '@angular/core';
import { BaseDataService } from '@shared/BaseDataService';

@Injectable({
  providedIn: 'root',
})
export class IndustryService extends BaseDataService {
  constructor() {
    super('industries');
  }
}
