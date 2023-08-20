import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FounderService } from '@services/data/founder.service';
import { IndustryService } from '@services/data/industry.service';
import { UserService } from '@services/data/user.service';
import { omit, omitBy, isEmpty, has } from 'lodash-es';
import * as qs from 'qs';
import { Papa } from 'ngx-papaparse';
import { firstValueFrom } from 'rxjs';
import { formatDate } from '@angular/common';
import { CountrySelectComponent } from '@v2/components/country-select/country-select.component';
import { Paginator } from '@shared/BaseDataService';

@Component({
  selector: 'app-founders',
  templateUrl: './founders.component.html',
})
export class FoundersComponent implements OnInit {
  @ViewChild(CountrySelectComponent, { static: true }) countrySelectComponent!: CountrySelectComponent;

  paginator!: Paginator<any>;

  industryPaginator = this.industryService.createPaginator(
    {
      fields: ['name'],
      sort: ['name:asc'],
    },
    { pageSize: 20 }
  );

  filterForm = new FormGroup({
    industry: new FormControl(),
    IPOStatus: new FormControl(),
    foundingYear: new FormControl(),
  });

  industries: any[] = [];
  showMobileFilter = false;
  loadingExport = false;

  constructor(
    public userService: UserService,
    private founderService: FounderService,
    private industryService: IndustryService,
    private router: Router,
    private route: ActivatedRoute,
    private papa: Papa,
    private location: Location
  ) {}

  async ngOnInit() {
    // get query params
    let query = qs.parse(this.route.snapshot.queryParams['filter']); // get strapi query from url
    query = omit(query, 'fields', 'populate');
    query = omitBy(query, isEmpty);

    // get country
    const country = query['filters']?.['country']?.$eq || localStorage.getItem('selected_country');

    // init founders paginator
    this.paginator = this.founderService.createPaginator(
      {
        fields: ['firstName', 'lastName', 'fullname', 'bio', 'country'],
        populate: {
          topics: {
            fields: ['name'],
          },
          industries: {
            fields: ['name'],
          },
          image: {
            fields: ['url'],
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

  getIndustryNames(founder: any) {
    return founder.industries.data.map((x) => x.attributes.name);
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
        const industry = this.industries.find((x) => filters.industries.id.$eq === x.name);
        this.filterForm.controls.industry.patchValue(industry);
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

  foundingYearFilter(item: any) {
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
      delete entity.image;
      if (entity.industries) {
        entity.industries = entity.industries.data?.[0]?.attributes?.name || '';
      }
      if (entity.topics) {
        entity.topics = entity.topics.data?.[0]?.attributes?.name || '';
      }
      return entity;
    });

    const csv = this.papa.unparse(entities);
    const csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const fileURL = URL.createObjectURL(csvData);

    const ancher = document.createElement('a');
    ancher.style.display = 'none';
    ancher.href = fileURL;
    ancher.download = `Founders (${formatDate(new Date(), 'd-MMM-y h-mm a', 'en-US')}).csv`;
    ancher.click();

    await new Promise((r) => setTimeout(r, 2000));
    this.loadingExport = false;
  }
}
