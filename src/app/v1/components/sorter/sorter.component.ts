import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

export interface ISort {
  name: string;
  value: string;
  icon: string;
  active?: boolean;
}

@Component({
  selector: 'app-sorter',
  templateUrl: './sorter.component.html',
  styleUrls: ['./sorter.component.scss'],
})
export class SorterComponent implements OnInit {
  @Output() sort = new EventEmitter<string>();
  @Input() sorts!: ISort[];
  @Input() totalName!: string;
  @Input() total: number | null = 0;

  form = new FormGroup({
    sort: new FormControl(),
  });

  constructor() {}

  ngOnInit(): void {
    const sort = this.sorts.find((x) => x.active === true);
    if (sort) {
      this.form.controls.sort.setValue(sort.value);
    }

    this.form.controls.sort.valueChanges.subscribe((x) => this.sort.emit(x));
  }
}
