import { Component, Input, OnInit } from '@angular/core';
import { Paginator } from '@shared/BaseDataService';

@Component({
  selector: 'app-load-more',
  templateUrl: './load-more.component.html',
})
export class LoadMoreComponent {
  @Input() paginator!: Paginator;
}
