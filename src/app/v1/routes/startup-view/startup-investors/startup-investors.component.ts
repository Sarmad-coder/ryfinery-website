import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-startup-investors',
  templateUrl: './startup-investors.component.html',
})
export class StartupInvestorsComponent implements OnInit {
  @Input() company: any;

  constructor() {}

  ngOnInit(): void {}
}
