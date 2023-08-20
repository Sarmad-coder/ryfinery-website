import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { has } from 'lodash-es';

export interface FilterItem {
  id: number | string;
  name: string;
  total?: number;
  checked?: boolean;
}

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  host: { class: 'tw-w-full tw-block tw-px-5 tw-py-7' },
})
export class FilterComponent {
  @Input() title!: string;
  @Input() mode: 'default' | 'checkbox' = 'default';
  @Input() loading!: boolean | null;
  @Input() canLoadMore!: boolean | null;
  @Input() items!: FilterItem[];
  @Output() search = new EventEmitter<any>();
  @Output() selection = new EventEmitter<any>();
  @Output() loadMore = new EventEmitter<void>();

  protected searchControl = new FormControl();

  constructor() {
    this.searchControl.valueChanges.subscribe((x) => this.search.emit(x));
  }

  onCheckboxChange(item: FilterItem, event: any) {
    const result = this.items.find((x) => x.name === item.name);
    if (result) result.checked = event.target.checked; // update

    this.selection.emit(this.items.filter((x) => has(x, 'checked')));
  }
}
