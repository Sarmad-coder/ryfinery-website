import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-growth',
  templateUrl: './growth.component.html',
})
export class GrowthComponent implements OnInit {
  @Input() value!: string;
  @Input() fill: boolean = false;
  @Input() size: 'sm' | 'lg' = 'sm';

  constructor() {}

  ngOnInit(): void {}

  get isDown() {
    return this.value.includes('-');
  }
}
