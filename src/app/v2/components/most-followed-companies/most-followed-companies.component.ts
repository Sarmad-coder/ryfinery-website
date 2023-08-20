import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CompanyFollowerService } from '@services/data/company-follower.service';
import { CompanyService } from '@services/data/company.service';
import { UserService } from '@services/data/user.service';
import slugify from 'slugify';

@Component({
  selector: 'app-most-followed-companies',
  templateUrl: './most-followed-companies.component.html',
  styleUrls: ['./most-followed-companies.component.scss'],
})
export class MostFollowedCompaniesComponent implements OnInit {
  @Input() company?: any;
  mostFollowedCompanies: any[] = [];

  constructor(
    private companyService: CompanyService,
    private companyFollowerService: CompanyFollowerService,
    private userService: UserService,
    private router: Router
  ) {}

  async ngOnInit() {
    // get most followed companies
    this.mostFollowedCompanies = (
      await this.companyService.getAll({
        filters: {
          id: { $ne: this.company?.id || undefined },
        },
        sort: ['followers:desc'],
        fields: ['name', 'followers', 'lastRevenueGrowth'],
        populate: {
          logo: {
            fields: ['url'],
          },
        },
        pagination: { limit: 5 },
      })
    ).data.map((x) => ({ ...x.attributes, id: x.id }));

    if (this.userService.user?.id) {
      this.mostFollowedCompanies = await Promise.all(
        this.mostFollowedCompanies.map(async (item) => {
          const res = (await this.companyFollowerService.getOne({ filters: { company: item.id, user: this.userService.user?.id } })).data[0];
          item.hasFollowed = Boolean(res);
          return item;
        })
      );
    }
  }

  routeCompany(company: any) {
    this.router.navigate(['/company', company.id, slugify(company.name)]);
  }

  follow(company: any, type: 'follow' | 'unfollow') {
    if (!this.userService.hasUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.companyService
      .follow(company.id, type)
      .then((x) => {
        if (!x) return;

        company.followers = x.followers;
        company.hasFollowed = x.following;
      })
      .catch((e) => {});
  }
}
