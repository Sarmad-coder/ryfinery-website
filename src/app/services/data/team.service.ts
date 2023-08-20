import { Injectable } from '@angular/core';
import { BaseDataService } from '@shared/BaseDataService';

@Injectable({
  providedIn: 'root',
})
export class TeamService extends BaseDataService {
  constructor() {
    super('teams');
  }
}
