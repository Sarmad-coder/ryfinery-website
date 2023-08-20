import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-founder-widgets',
  templateUrl: './founder-widgets.component.html',
})
export class FounderWidgetsComponent implements OnInit {
  @Input() company: any;

  constructor() {}

  ngOnInit(): void {}
}
