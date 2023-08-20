import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-startup-description',
  templateUrl: './startup-description.component.html',
})
export class StartupDescriptionComponent implements OnInit {
  @Input() company: any;

  constructor() {}

  ngOnInit(): void {}

  get industryNames() {
    return this.company.industries.data.map((x) => x.attributes.name);
  }
}
