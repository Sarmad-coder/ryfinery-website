import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyService } from '@services/data/company.service';
import { FounderService } from '@services/data/founder.service';
import { OutlookService } from '@services/data/outlook.service';
import * as qs from 'qs';
import { map, Subject, combineLatest } from 'rxjs';
import slugify from 'slugify';

@Component({
  selector: 'app-search-field',
  templateUrl: './search-field.component.html',
  styleUrls: ['./search-field.component.scss'],
})
export class SearchFieldComponent implements OnInit {
  companyPaginator = this.companyService.createPaginator(
    { fields: ['name', 'country'], filters: { country: { $eq: this.selected_country }, isStatista: { $eq: true } } },
    { initialLoading: false, pageSize: 6 }
  );

  outlookPaginator = this.outlookService.createPaginator(
    { fields: ['name', 'location'], filters: { location: { $eq: this.selected_country } } },
    { initialLoading: false, pageSize: 6 }
  );

  founderPaginator = this.founderService.createPaginator(
    { fields: ['fullname', 'country'], filters: { country: { $eq: this.selected_country } } },
    { initialLoading: false, pageSize: 6 }
  );

  data$ = new Subject<{ name: string; item: any }[]>();
  loading$ = combineLatest([this.companyPaginator.loading$, this.outlookPaginator.loading$, this.founderPaginator.loading$]).pipe(map((x) => x.includes(true)));

  activeTab: number = 0;
  currentTerm: string = '';
  searchText: string = '';
  showSearch: string = '';
  compare: boolean = false;
  @Input() company1: string="";
  @Input() company2: string="";
  @Input() id1: any;
  @Input() id2: any;

  constructor(private companyService: CompanyService,
    private outlookService: OutlookService,
    private founderService: FounderService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.searchText = localStorage.getItem('searchText') || '';
  }

  get selected_country() {
    const x = localStorage.getItem('selected_country');
    return x === 'Worldwide' ? undefined : x;
  }

  async ngOnInit() {
    console.log(this.company1)
    localStorage.getItem("compareCompany1") ? this.compare = true : this.compare = false
    console.log(this.compare)
    await this.companyPaginator.load();
    this.companyPaginator.data$.subscribe(async (data) => {
      this.data$.next(data.map((x) => ({ name: x.name, item: x })));
    });

    this.outlookPaginator.data$.subscribe((data) => {
      this.data$.next(data.map((x) => ({ name: x.name, item: x })));
    });

    this.founderPaginator.data$.subscribe((data) => {
      this.data$.next(data.map((x) => ({ name: x.fullname, item: x })));
    });
  }

  openResults() {
    if (this.activeTab === 0) {
      if (this.company2) {
        this.router.navigate(['/compareCompany/' + this.id1 + "/" + this.id2]);
      } else {
        this.router.navigate(['/companies'], {
          queryParams: {
            filter: qs.stringify(
              {
                filters: { name: { $containsi: this.searchText || undefined } },
              },
              { encode: false }
            ),
          },
        });
      }

      localStorage.setItem('searchText', this.searchText);
    }
  }

  filter(e: any) {
    this.id1 = e.id
    if (this.compare) {
      localStorage.setItem("compareCompany2", e.id)
      return
    } else {
      if (this.company2) {
        this.router.navigate(['/compareCompany/' + e.id + "/" + this.id2]);
      } else {
        if (this.activeTab === 0) {
          this.router.navigate(['/company', e.id, slugify(e.name)]);
        } else if (this.activeTab === 1) {
          this.router.navigate(['/market', e.id, slugify(e.name)]);
        } else if (this.activeTab === 2) {
          // TODO: add founder single page route here
        }
      }

    }

  }
  filter2(e: any) {
    this.id2 = e.id
    
      if (this.company2) {
        this.router.navigate(['/compareCompany/' + this.id1 + "/" + e.id]);
      } else {
        if (this.activeTab === 0) {
          this.router.navigate(['/company', e.id, slugify(e.name)]);
        } else if (this.activeTab === 1) {
          this.router.navigate(['/market', e.id, slugify(e.name)]);
        } else if (this.activeTab === 2) {
          // TODO: add founder single page route here
        }
      }
    

  }

  search(e: any) {
    this.searchText = e.term;

    if (this.currentTerm !== e) {
      this.currentTerm = e.term;
      this.textSearch();
    }
  }

  tabChange(e: any) {
    if (this.activeTab !== e) {
      this.activeTab = e;
      this.textSearch();
    }
  }

  private textSearch() {
    if (this.activeTab === 0) {
      this.companyPaginator.textSearch(this.currentTerm);
    } else if (this.activeTab === 1) {
      this.outlookPaginator.textSearch(this.currentTerm);
    } else if (this.activeTab === 2) {
      this.founderPaginator.textSearch(this.currentTerm, 'fullname');
    }
  }
}
