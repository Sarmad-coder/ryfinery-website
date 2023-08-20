import { Injectable } from '@angular/core';
import { BaseDataService } from '@shared/BaseDataService';

@Injectable({
  providedIn: 'root',
})
export class CountryService extends BaseDataService {
  private _countries!: any[];

  constructor() {
    super('countries');
  }

  get countries(): any[] {
    return this._countries;
  }

  async loadCountries() {
    const res = await this.getAll();
    this._countries = res.data.map((x) => ({ id: x.id, ...x.attributes }));
    this._countries.unshift({ id: 0, name: 'Worldwide' });
  }
}
