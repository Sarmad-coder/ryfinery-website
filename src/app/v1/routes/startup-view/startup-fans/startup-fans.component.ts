import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CompanyVoteService } from '@services/data/company-vote.service';
import { Paginator } from '@shared/BaseDataService';

@Component({
  selector: 'app-startup-fans',
  templateUrl: './startup-fans.component.html',
  styleUrls: ['./startup-fans.component.scss'],
})
export class StartupFansComponent implements OnInit {
  @Input() company: any;

  fans: any[] = [];
  companyVotePaginator!: Paginator<any>;

  constructor(private companyVoteService: CompanyVoteService) {}

  async ngOnInit(): Promise<void> {
    this.companyVotePaginator = this.companyVoteService.createPaginator(
      {
        sort: ['createdAt:desc'],
        filters: {
          company: { id: { $eq: this.company.id } },
        },
        populate: {
          user: {
            populate: ['image'],
          },
        },
      },
      { pageSize: 5 }
    );

    this.companyVotePaginator.load();
    this.companyVotePaginator.data$.subscribe((x) => {
      this.fans = x;
    });
  }
}
