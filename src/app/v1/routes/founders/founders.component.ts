import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FounderService } from '@services/data/founder.service';
import { FilterClearType } from '@v1/components/filter-tags/filter-tags.component';
import { FilterItem } from '@v1/components/filter/filter.component';
import { ISort } from '@v1/components/sorter/sorter.component';
import { omit, omitBy, isEmpty } from 'lodash-es';
import * as qs from 'qs';

@Component({
  selector: 'app-founders',
  templateUrl: './founders.component.html',
})
export class FoundersComponent implements OnInit, OnDestroy {
  data: any[] = [];
  page: any = {};
  selectedFilters = new Map<string, FilterItem | FilterItem[]>();
  showMobileFilter = false;

  hasFilters!: FilterItem[];

  paginator = this.founderService.createPaginator({
    fields: [
      // 'isNew',
      // 'isVerified',
      'fullname',
      'currentCompany',
      'position',
      'linkedin',
      'twitter',
      'facebook',
    ],
    populate: {
      image: {
        fields: ['url'],
      },
    },
  });

  sorts: ISort[] = [
    { name: 'Latest', value: `createdAt:desc`, icon: 'arrow-down', active: true },
    { name: 'Oldest', value: `createdAt:asc`, icon: 'arrow-narrow-up' },
    { name: 'Verified', value: 'isVerified:desc', icon: 'certificate-01' },
    { name: 'Recently updated', value: 'updatedAt:desc', icon: 'edit-04' },
  ];

  constructor(private founderService: FounderService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.paginator.data$.subscribe((x) => {
      this.data = x;
    });
    this.paginator.meta$.subscribe((x) => {
      this.page = x.pagination;
    });

    this.paginator.queryChanges$.subscribe((query) => {
      query = omit(query, 'fields', 'populate');
      query = omitBy(query, isEmpty);

      this.router.navigate([], {
        queryParams: {
          filter: qs.stringify(query, { encode: false }), // add query params in url
        },
      });
    });

    // init data
    let query = qs.parse(this.route.snapshot.queryParams['filter']); // get strapi query from url
    query = omit(query, 'fields', 'populate');
    query = omitBy(query, isEmpty);

    if (!isEmpty(query)) {
      this.paginator.load(query);
    } else {
      const sort = this.sorts.find((x) => x.active === true);
      if (sort) this.sort(sort.value);
    }

    this.hasFilters = [
      // { id: 'isVerified', name: 'Has Verified', total: 0 },
      { id: 'officialEmail', name: 'Has Email', total: 0 },
      { id: 'linkedin', name: 'Has Linkedin', total: 0 },
      { id: 'twitter', name: 'Has Twitter', total: 0 },
      { id: 'facebook', name: 'Has Facebook', total: 0 },
    ];
  }

  ngOnDestroy(): void {
    this.paginator.destroy();
  }

  sort(sort: string) {
    this.paginator.load({ sort: [sort] });
  }

  clearAllFilters() {
    this.paginator.resetFilter();
    this.selectedFilters.clear();
  }

  clearFilter({ key, value }: FilterClearType) {
    this.hasFilter(value as FilterItem[]); // has filters
  }

  hasFilter(items: FilterItem[]) {
    const filters = {};

    for (const item of items) {
      if (item.checked) {
        filters[item.id] = item.id === 'isVerified' ? { $eq: true } : { $notNull: true };
        this.selectedFilters.set(item.id.toString(), item);
      }
      //
      else {
        filters[item.id] = undefined;
        this.selectedFilters.delete(item.id.toString());
      }
    }

    this.paginator.load({ filters });
  }
}
