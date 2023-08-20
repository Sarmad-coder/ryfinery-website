import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CompanyService } from '@services/data/company.service';
import { ClaimProfileSaveComponent } from '@v1/components/claim-profile-save/claim-profile-save.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-startup-view',
  templateUrl: './startup-view.component.html',
  styleUrls: ['./startup-view.component.scss'],
})
export class StartupViewComponent implements OnInit {
  company: any;
  similarCompanies: any[] = [];
  discussionCount?: number;

  constructor(private router: Router, private route: ActivatedRoute, private companyService: CompanyService, private modalService: NgbModal) {}

  async ngOnInit(): Promise<void> {
    const params = await firstValueFrom(this.route.params);
    const id = Number(params['id']);

    const company = await this.companyService.getOne({
      filters: {
        id: { $eq: id },
      },
      fields: [
        'name',
        'about',
        'fundingStatus',
        'totalInvestors',
        'city',
        'country',
        'foundingDate',
        'lastFundingDate',
        'employees',
        'numberOfFounders',
        'fundingRounds',
        'votes',
        'isProcessing',
        'isVerified',
        'website',
        'phoneNumber',
        'contactEmail',
        'employees',
        'facebook',
        'linkedin',
        'twitter',
        'youtube',
      ],
      populate: {
        companyType: {
          fields: ['name'],
        },
        investorTypes: {
          fields: ['name'],
        },
        investorStages: {
          fields: ['name'],
        },
        industries: {
          fields: ['name'],
        },
        logo: {
          fields: ['url'],
        },
        founders: {
          fields: ['fullname', 'position', 'bio', 'linkedin', 'twitter', 'facebook'],
          populate: {
            image: {
              fields: ['url'],
            },
          },
        },
        topFiveInvestors: true,
      },
    });

    this.company = { ...company.data[0].attributes, id };
    console.log('Company', this.company);

    this.similarCompanies = (
      await this.companyService.getAll({
        filters: {
          id: { $ne: this.company.id },
          industries: { id: { $in: [this.company.industries.data[0].id] } },
        },
        fields: ['name', 'votes'],
        populate: {
          logo: {
            fields: ['url'],
          },
        },
        pagination: { limit: 5 },
      })
    ).data.map((x) => ({ ...x.attributes, id: x.id }));
  }

  routeCompany(company) {
    this.router.navigate(['/startup-view', company.id]);
  }

  claimYourProfile() {
    const modalRef = this.modalService.open(ClaimProfileSaveComponent);
    modalRef.componentInstance.company = this.company;
  }

  async shareProfile() {
    await navigator.share({
      title: 'Share Company Profile',
      url: window.location.href,
    });
  }

  vote() {
    // this.companyService
    //   .vote(this.company.id, 'inc')
    //   .then((x) => (this.company.votes = x))
    //   .catch((e) => {});
  }
}

// router.events
//   .pipe(
//     filter((x) => x instanceof NavigationEnd),
//     map(() => router.getCurrentNavigation()?.extras?.state)
//   )
//   .subscribe((startup: any) => {
//   });
