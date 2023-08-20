import { Component, Input, OnInit } from '@angular/core';
import { FounderVoteService } from '@services/data/founder-vote.service';
import { Paginator } from '@shared/BaseDataService';

@Component({
  selector: 'app-founder-fans',
  templateUrl: './founder-fans.component.html',
  styleUrls: ['./founder-fans.component.scss'],
})
export class FounderFansComponent implements OnInit {
  @Input() founder: any;

  fans: any[] = [];
  founderVotePaginator!: Paginator<any>;

  constructor(private founderVoteService: FounderVoteService) {}

  async ngOnInit(): Promise<void> {
    this.founderVotePaginator = this.founderVoteService.createPaginator(
      {
        sort: ['createdAt:desc'],
        filters: {
          founder: { id: { $eq: this.founder.id } },
        },
        populate: {
          user: {
            populate: ['image'],
          },
        },
      },
      { pageSize: 5 }
    );

    this.founderVotePaginator.load();
    this.founderVotePaginator.data$.subscribe((x) => {
      this.fans = x;
    });
  }
}
