import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CountryService } from '@services/data/country.service';

interface Keyword {
  name: string;
  id: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  companies: Keyword[] = [
    { name: 'Amazon.Com', id: '218468' },
    { name: 'Aluminium Bahrain', id: '24646' },
    { name: 'Almatrook Group', id: '14068' },
    { name: 'Afia Trading Services', id: '34662' },
    { name: 'Saudi Electricity', id: '53926' },
    { name: 'Dhl Worldwide Express', id: '34742' },
    { name: 'Emirates', id: '63928' },
    { name: 'Qatar Energy', id: '44575' },
  ];

  countries: any[] = [];
  countryControl = new FormControl(this.selected_country);

  constructor(private countryService: CountryService) {
    if (!this.selected_country) {
      localStorage.setItem('selected_country', 'Worldwide');
    }
  }

  get selected_country() {
    return localStorage.getItem('selected_country');
  }

  async ngOnInit() {
    const response = await this.countryService.getAll();
    this.countries = response.data.map((x) => ({ id: x.id, ...x.attributes }));

    if (!this.selected_country) {
      localStorage.setItem('selected_country', this.countryControl.value || '');
    }

    // on country change
    this.countryControl.valueChanges.subscribe((countryName) => {
      localStorage.setItem('selected_country', countryName || '');
      window.location.reload();
    });
  }
}
