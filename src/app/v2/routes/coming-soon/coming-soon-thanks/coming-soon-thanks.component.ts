import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-coming-soon-thanks',
  templateUrl: './coming-soon-thanks.component.html',
  styleUrls: ['./coming-soon-thanks.component.scss'],
})
export class ComingSoonThanksComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  async share() {
    await navigator.share({
      title: 'Refinary',
      url: 'http://95.179.199.23/',
    });
  }
}
