import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-influencer-card',
  templateUrl: './influencer-card.component.html',
})
export class InfluencerCardComponent implements OnInit {
  @Input() name!: string;

  constructor() {}

  ngOnInit(): void {}
}
