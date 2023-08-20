import { formatDate } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CompanyService } from '@services/data/company.service';
import { IndustryService } from '@services/data/industry.service';
import { UserService } from '@services/data/user.service';
import { omit, omitBy, isEmpty, has } from 'lodash-es';
import { Papa } from 'ngx-papaparse';
import * as qs from 'qs';
import { firstValueFrom } from 'rxjs';
import { Location } from '@angular/common';
import { CountrySelectComponent } from '@v2/components/country-select/country-select.component';
import { Paginator } from '@shared/BaseDataService';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
})
export class CompaniesComponent implements OnInit, OnDestroy {
  @ViewChild(CountrySelectComponent, { static: true }) countrySelectComponent!: CountrySelectComponent;

  paginator!: Paginator<any>;
  industryPaginator = this.industryService.createPaginator(
    {
      fields: ['name'],
      sort: ['name:asc'],
    },
    { pageSize: 20 }
  );

  IPOStatus = ['Public', 'Private'];
  operatingStatus = ['Acive', 'Inactive'];
  showMobileFilter = false;

  filterForm = new FormGroup({
    industry: new FormControl(),
    IPOStatus: new FormControl(),
    operatingStatus: new FormControl(),
    foundingDate: new FormControl(),
  });

  loadingExport = false;
  searchText = '';

  constructor(
    public userService: UserService,
    private companyService: CompanyService,
    private industryService: IndustryService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private papa: Papa
  ) {
    this.searchText = localStorage.getItem('searchText') || '';
  }

  async ngOnInit() {
    // get query params
    let query = qs.parse(this.route.snapshot.queryParams['filter']); // get strapi query from url
    query = omit(query, 'fields', 'populate');
    query = omitBy(query, isEmpty);

    // get country
    const country = query['filters']?.['country']?.$eq || localStorage.getItem('selected_country');

    // init companies paginator
    this.paginator = this.companyService.createPaginator(
      {
        filters: { isStatista: { $eq: true }, country: { $eq: country } },
        fields: ['name', 'country', 'fullDescription'],
        populate: {
          logo: {
            fields: ['url'],
          },
          industries: {
            fields: ['name'],
          },
        },
      },
      { mode: 'page' }
    );

    // set country
    this.countrySelectComponent.setCountry(country);

    // set filters
    this.setFilters(query);

    // patched: for not to show isStatista in url params
    if (query?.['filters']?.['isThat']) {
      delete query['filters']['isThat'];
      query['filters']['isStatista'] = true;
    }

    await this.industryPaginator.load(); // load industries
    await this.paginator.load(query); // load companies

    // watch for query changes
    this.paginator.queryChanges$.subscribe((query) => {
      let _query = omit(query, 'fields', 'populate');
      _query = omitBy(_query, isEmpty);

      // patched: for not to show isStatista in url params
      if (_query?.['filters']?.isStatista) {
        delete _query['filters'].isStatista;
        _query['filters'].isThat = true;
      }

      // update url params
      const urlTree = this.router.createUrlTree([], {
        queryParams: {
          filter: qs.stringify(_query, { encode: false }), // add query params in url
        },
        queryParamsHandling: 'merge',
        preserveFragment: true,
      });
      this.location.go(urlTree.toString());
    });
  }

  ngOnDestroy(): void {
    // this.paginator.destroy();
  }

  getIndustryNames(company: any) {
    return company.industries.data.map((x) => x.attributes.name);
  }

  getYearsList() {
    let yearsList: number[] = [];
    const startYear = 1748;
    const endYear = new Date().getFullYear();

    for (let i = endYear; i >= startYear; i--) {
      yearsList = [...yearsList, i];
    }

    return yearsList;
  }

  setFilters(query: qs.ParsedQs) {
    const filters: any = query['filters'];

    // set values in filters
    if (!isEmpty(query) && filters) {
      if (has(filters, 'industries')) {
        this.industryService.getOne({ filters: { id: { $eq: filters.industries.id.$eq } } }).then((item) => {
          this.filterForm.controls.industry.patchValue({ id: item.data[0].id, ...item.data[0].attributes });
        });
      }

      if (has(filters, 'IPOStatus')) {
        this.filterForm.controls.IPOStatus.patchValue(filters.IPOStatus.$eq);
      }

      if (has(filters, 'operatingStatus')) {
        this.filterForm.controls.operatingStatus.patchValue(filters.operatingStatus.$eq);
      }

      if (has(filters, 'foundingDate')) {
        this.filterForm.controls.foundingDate.patchValue(filters.foundingDate.$containsi);
      }
    }
  }

  industryFilter(item: any) {
    this.paginator.load({
      filters: {
        industries: {
          id: item ? { $eq: item.id } : undefined,
        },
      },
    });
  }

  countryFilter(item: any) {
    this.paginator.load({
      filters: {
        country: item.name !== 'Worldwide' && item ? { $eq: item.name } : undefined,
      },
    });
  }

  IPOStatusFilter(item: any) {
    this.paginator.load({
      filters: {
        IPOStatus: item ? { $eq: item.$ngOptionLabel } : undefined,
      },
    });
  }

  operatingStatusFilter(item: any) {
    this.paginator.load({
      filters: {
        operatingStatus: item ? { $eq: item.$ngOptionLabel } : undefined,
      },
    });
  }

  foundingDateFilter(item: any) {
    this.paginator.load({
      filters: {
        foundingDate: item ? { $containsi: item.$ngOptionLabel } : undefined,
      },
    });
  }

  async export() {
    this.loadingExport = true;

    // get data
    let entities = await firstValueFrom(this.paginator.data$);

    // change reference to name
    entities = entities.map((entity) => {
      delete entity.logo;
      if (entity.industries) entity.industries = entity.industries.data[0].attributes.name;

      return entity;
    });

    const csv = this.papa.unparse(entities);
    const csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const fileURL = URL.createObjectURL(csvData);

    const ancher = document.createElement('a');
    ancher.style.display = 'none';
    ancher.href = fileURL;
    ancher.download = `Companies (${formatDate(new Date(), 'd-MMM-y h-mm a', 'en-US')}).csv`;
    ancher.click();

    await new Promise((r) => setTimeout(r, 2000));
    this.loadingExport = false;
  }
}
