import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IndustryService } from '@services/data/industry.service';
import { InvestorTypeService } from '@services/data/investor-type.service';
import { CountryService } from '@services/data/country.service';
import { CompanyService } from '@services/data/company.service';
import { omit, omitBy, isEmpty, has } from 'lodash-es';
import * as qs from 'qs';
import { UserService } from '@services/data/user.service';
import { FilterClearType } from '@v1/components/filter-tags/filter-tags.component';
import { FilterItem } from '@v1/components/filter/filter.component';
import { ISort } from '@v1/components/sorter/sorter.component';

@Component({
  selector: 'app-startups',
  templateUrl: './startups.component.html',
})
export class StartupsComponent implements OnInit, OnDestroy {
  data: any[] = [];
  page: any = {};
  selectedFilters = new Map<string, FilterItem | FilterItem[]>();
  showMobileFilter = false;

  industries!: FilterItem[];
  investorTypes!: FilterItem[];
  countries!: FilterItem[];
  hasFilters!: FilterItem[];

  sorts: ISort[] = [
    { name: 'Latest', value: `foundingDate:desc`, icon: 'arrow-down', active: true },
    { name: 'Oldest', value: `foundingDate:asc`, icon: 'arrow-narrow-up' },
    { name: 'Verified', value: 'isVerified:desc', icon: 'certificate-01' },
    { name: 'Recently updated', value: 'updatedAt:desc', icon: 'edit-04' },
  ];

  paginator = this.companyService.createPaginator({
    fields: ['isTrending', 'isLatest', 'isVerified', 'name', 'linkedin', 'twitter', 'facebook', 'youtube', 'about', 'streetAddress', 'foundingDate'],
    populate: {
      logo: {
        fields: ['url'],
      },
      founders: {
        populate: {
          image: {
            fields: ['url'],
          },
        },
      },
      industries: {
        fields: ['name'],
      },
    },
  });

  industryPaginator = this.industryService.createPaginator(
    {
      fields: ['name'],
      sort: ['name:asc'],
    },
    { pageSize: 5 }
  );

  investorTypePaginator = this.investorTypeService.createPaginator(
    {
      fields: ['name'],
      sort: ['name:asc'],
    },
    { pageSize: 5 }
  );

  countryPaginator = this.countryService.createPaginator(
    {
      fields: ['name'],
      sort: ['name:asc'],
    },
    { pageSize: 20 }
  );

  constructor(
    public userService: UserService,
    private companyService: CompanyService,
    private countryService: CountryService,
    private industryService: IndustryService,
    private investorTypeService: InvestorTypeService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  getYears() {}

  async ngOnInit() {
    this.paginator.data$.subscribe((x) => {
      this.data = x;
    });

    this.paginator.meta$.subscribe((x) => {
      this.page = x.pagination;
    });

    await this.industryPaginator.load();
    this.industryPaginator.data$.subscribe((res) => {
      this.industries = res.map((x: any) => ({ id: x.id, name: x.attributes.name, total: 0 }));
    });

    await this.investorTypePaginator.load();
    this.investorTypePaginator.data$.subscribe((res) => {
      this.investorTypes = res.map((x: any) => ({ id: x.id, name: x.attributes.name, total: 0 }));
    });

    await this.countryPaginator.load();
    this.countryPaginator.data$.subscribe((res) => {
      this.countries = res.map((x: any) => ({ id: x.id, name: x.attributes.name, total: 0 }));
    });

    this.hasFilters = [
      { id: 'isVerified', name: 'Has Verified', total: 0 },
      { id: 'phoneNumber', name: 'Has Phone', total: 0 },
      { id: 'contactEmail', name: 'Has Email', total: 0 },
      { id: 'linkedin', name: 'Has Linkedin', total: 0 },
      { id: 'twitter', name: 'Has Twitter', total: 0 },
      { id: 'facebook', name: 'Has Facebook', total: 0 },
      { id: 'youtube', name: 'Has Youtube', total: 0 },
    ];

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

    const filters: any = query['filters'];

    if (!isEmpty(query) && filters) {
      if (has(filters, 'industries')) {
        const item = this.industries.find((x) => x.id === Number(filters.industries.id.$eq));
        this.selectedFilters.set('industries', item as any);
      }

      if (has(filters, 'investorTypes')) {
        const item = this.investorTypes.find((x) => x.id === Number(filters.investorTypes.id.$eq));
        this.selectedFilters.set('investorTypes', item as any);
      }

      if (has(filters, 'country')) {
        const items = this.countries.filter((x) => (filters.country.$in as string[]).includes(x.name));
        items.forEach((x) => (x.checked = true));
        this.selectedFilters.set('country', items);
      }

      this.hasFilters.forEach((x) => {
        if (has(filters, x.id)) {
          x.checked = true;
          this.selectedFilters.set(x.id.toString(), x);
        }
      });

      this.paginator.load(query);
    } else {
      const sort = this.sorts.find((x) => x.active === true);
      if (sort) this.sort(sort.value);
    }
  }

  ngOnDestroy(): void {
    this.paginator.destroy();
    this.industryPaginator.destroy();
    this.investorTypePaginator.destroy();
    this.countryPaginator.destroy();
  }

  sort(sort: string) {
    this.paginator.load({ sort: [sort] });
  }

  clearAllFilters() {
    this.paginator.resetFilter();
    this.selectedFilters.clear();
  }

  clearFilter({ key, value }: FilterClearType) {
    if (key === 'industries') {
      this.industryFilter(null);
    } else if (key === 'investorTypes') {
      this.investorTypeFilter(null);
    } else if (key === 'country') {
      this.countryFilter(value as FilterItem[]);
    } else {
      this.hasFilter(value as FilterItem[]);
    }
  }

  industrySearch(value: string) {
    this.industryPaginator.load(
      {
        filters: {
          name: { $containsi: value || undefined },
        },
      },
      { delay: true }
    );
  }

  investorTypeSearch(value: string) {
    this.investorTypePaginator.load(
      {
        filters: {
          name: { $containsi: value || undefined },
        },
      },
      { delay: true }
    );
  }

  industryFilter(item: FilterItem | undefined | null) {
    this.paginator.load({
      filters: {
        industries: {
          id: item ? { $eq: item.id } : undefined,
        },
      },
    });

    item ? this.selectedFilters.set('industries', item) : this.selectedFilters.delete('industries');
  }

  investorTypeFilter(item: FilterItem | undefined | null) {
    this.paginator.load({
      filters: {
        investorTypes: {
          id: item ? { $eq: item.id } : undefined,
        },
      },
    });

    item ? this.selectedFilters.set('investorTypes', item) : this.selectedFilters.delete('investorTypes');
  }

  countryFilter(items: FilterItem[]) {
    const countries: FilterItem[] = items.filter((x) => x.checked);

    this.paginator.load({
      filters: {
        country: countries.length ? { $in: countries.map((x) => x.name) } : undefined,
      },
    });

    countries.length ? this.selectedFilters.set('country', countries) : this.selectedFilters.delete('country');
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
