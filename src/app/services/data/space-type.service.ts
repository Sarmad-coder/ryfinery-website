import { Injectable } from '@angular/core';
import { BaseDataService } from '@shared/BaseDataService';

@Injectable({
  providedIn: 'root',
})
export class SpaceTypeService extends BaseDataService {
  constructor() {
    super('space-types');
  }
}
