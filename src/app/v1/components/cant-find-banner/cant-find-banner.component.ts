import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-cant-find-banner',
  templateUrl: './cant-find-banner.component.html',
  styleUrls: ['./cant-find-banner.component.scss'],
})
export class CantFindBannerComponent {
  @Input() heading!: string;
  @Input() description!: string;
  @Output() click = new EventEmitter();
}
