import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-startup-widgets',
  templateUrl: './startup-widgets.component.html',
})
export class StartupWidgetsComponent implements OnInit {
  @Input() company: any;

  constructor() {}

  ngOnInit(): void {}
}
