import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cookie-policy',
  templateUrl: './cookie-policy.component.html',
  styleUrls: ['./cookie-policy.component.scss'],
})
export class CookiePolicyComponent implements OnInit {
  legal = true;
  simple = false;

  constructor() {}

  ngOnInit(): void {}

  check() {
    this.legal = true;
    this.simple = false;
  }

  check2() {
    this.legal = false;
    this.simple = true;
  }
}
