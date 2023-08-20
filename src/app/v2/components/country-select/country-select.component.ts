import { Component, EventEmitter, Output } from '@angular/core';
import { CountryService } from '@services/data/country.service';

@Component({
  selector: 'app-country-select',
  template: `
    <div ngbDropdown class="country-dropdown" *ngIf="country">
      <button type="button" id="country-dropdown" class="btn btn-outline-light btn-action" ngbDropdownToggle>
        <img class="flag" src="assets/flags/{{ country.name }}.png" />
        <span class="text">{{ country.name }}</span>
        <svg-icon class="chevron-down" src="assets/icons/chevron-down.svg"></svg-icon>
      </button>
      <div ngbDropdownMenu aria-labelledby="country-dropdown">
        <button ngbDropdownItem *ngFor="let item of countries" (click)="change(item)">
          <img class="flag" src="assets/flags/{{ item.name }}.png" />
          {{ item.name }}
        </button>
      </div>
    </div>
  `,
})
export class CountrySelectComponent {
  @Output() selected = new EventEmitter<any>();

  country: any;
  countries: any = [];

  constructor(countryService: CountryService) {
    this.countries = countryService.countries;
  }

  setCountry(value: any): void {
    this.country = typeof value === 'string' ? this.countries.find((x) => x.name === value) : value;
  }

  change(value: any) {
    this.country = value;
    this.selected.emit(value);
  }
}
