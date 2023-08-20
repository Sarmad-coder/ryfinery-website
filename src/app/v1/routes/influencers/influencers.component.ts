import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-influencers',
  templateUrl: './influencers.component.html',
})
export class InfluencersComponent implements OnInit {
  showMobileFilter = false;
  influencers = [
    'Raymond Zhong',
    'Raymond Zhong',
    'Raymond Zhong',
    'Raymond Zhong',
    'Raymond Zhong',
    'Raymond Zhong',
    'Raymond Zhong',
    'Raymond Zhong',
    'Raymond Zhong',
  ];
  constructor() {}

  ngOnInit(): void {}
}
