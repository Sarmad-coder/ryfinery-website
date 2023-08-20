import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-startup-founders',
  templateUrl: './startup-founders.component.html',
})
export class StartupFoundersComponent implements OnInit {
  @Input() company: any;

  constructor() {}

  ngOnInit(): void {}
}
