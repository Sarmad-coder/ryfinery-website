import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-founder-investors',
  templateUrl: './founder-investors.component.html',
})
export class FounderInvestorsComponent implements OnInit {
  @Input() company: any;

  constructor() {}

  ngOnInit(): void {}
}
