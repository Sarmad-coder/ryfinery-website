import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-founder-description',
  templateUrl: './founder-description.component.html',
})
export class FounderDescriptionComponent implements OnInit {
  @Input() founder: any;

  constructor() {}

  ngOnInit(): void {}

  get industryNames() {
    return this.founder.topics.data.map((x) => x.attributes.name);
  }
}
