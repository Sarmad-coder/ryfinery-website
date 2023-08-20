import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { isArray } from 'lodash-es';
import { FilterItem } from '../filter/filter.component';

export interface FilterClearType {
  key: string;
  value: FilterItem | FilterItem[];
}

@Component({
  selector: 'app-filter-tags',
  templateUrl: './filter-tags.component.html',
  styleUrls: ['./filter-tags.component.scss'],
})
export class FilterTagsComponent implements OnInit {
  @Input() selectedFilters!: Map<string, FilterItem | FilterItem[]>;
  @Output() clear = new EventEmitter<FilterClearType>();
  @Output() clearAll = new EventEmitter<void>();

  constructor() {}

  ngOnInit(): void {}

  onClear(item: FilterClearType, nested?: FilterItem) {
    if (nested) nested.checked = false;
    this.clear.emit(item);
  }

  onClearAll() {
    this.selectedFilters.forEach((x) => {
      if (isArray(x)) {
        x.map((n) => (n.checked = false));
      } else {
        x.checked = false;
      }
    });

    this.clearAll.emit();
  }

  isArray(value: any): boolean {
    return isArray(value);
  }
}
