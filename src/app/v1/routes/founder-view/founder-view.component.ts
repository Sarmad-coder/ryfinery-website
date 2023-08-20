import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FounderService } from '@services/data/founder.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-founder-view',
  templateUrl: './founder-view.component.html',
  styleUrls: ['./founder-view.component.scss'],
})
export class FounderViewComponent implements OnInit {
  founder: any;
  similarFounders: any[] = [];
  discussionCount!: number;

  constructor(private router: Router, private route: ActivatedRoute, private founderService: FounderService) {}

  async ngOnInit(): Promise<void> {
    const params = await firstValueFrom(this.route.params);
    const id = Number(params['id']);

    const founder = await this.founderService.getOne({
      filters: {
        id: { $eq: id },
      },
      fields: ['fullname', 'position', 'company', 'bio', 'website', 'officialEmail', 'phoneNumber', 'votes', 'facebook', 'linkedin', 'twitter', 'youtube'],
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
    });

    this.founder = { ...founder.data[0].attributes, id };
    console.log('Founder', this.founder);

    this.similarFounders = (
      await this.founderService.getAll({
        filters: {
          id: { $ne: this.founder.id },
          industries: { id: { $in: [this.founder.industries.data[0]?.id] } },
        },
        fields: ['fullname', 'votes'],
        populate: {
          image: {
            fields: ['url'],
          },
        },
        pagination: { limit: 5 },
      })
    ).data.map((x) => ({ ...x.attributes, id: x.id }));
  }

  routeFounder(founder) {
    this.router.navigate(['/founder-view', founder.id]);
  }

  async shareProfile() {
    await navigator.share({
      title: 'Share Founder Profile',
      url: window.location.href,
    });
  }

  vote() {
    this.founderService
      .vote(this.founder.id, 'inc')
      .then((x) => (this.founder.votes = x))
      .catch((e) => {});
  }
}

// router.events
//   .pipe(
//     filter((x) => x instanceof NavigationEnd),
//     map(() => router.getCurrentNavigation()?.extras?.state)
//   )
//   .subscribe((founder: any) => {
//   });
