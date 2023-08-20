import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CompanyService } from '@services/data/company.service';
import slugify from 'slugify';

@Component({
  selector: 'app-similar-companies',
  templateUrl: './similar-companies.component.html',
  styleUrls: ['./similar-companies.component.scss'],
})
export class SimilarCompaniesComponent implements OnInit {
  @Input() company: any;
  similarCompanies: any[] = [];

  constructor(private companyService: CompanyService, private router: Router) {}

  async ngOnInit() {
    this.similarCompanies = (
      await this.companyService.getAll({
        filters: {
          id: { $ne: this.company.id },
          industries: { id: { $in: this.company ? [this.company.industries.data[0].id] : undefined } },
        },
        fields: ['name', 'followers', 'lastRevenueGrowth'],
        populate: {
          logo: {
            fields: ['url'],
          },
        },
        pagination: { limit: 5 },
      })
    ).data.map((x) => ({ ...x.attributes, id: x.id }));
  }

  routeCompany(company: any) {
    this.router.navigate(['/company', company.id, slugify(company.name)]);
  }
}
