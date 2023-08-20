import { Injectable } from '@angular/core';
import { BaseDataService } from '@shared/BaseDataService';
import { FounderVoteService } from './founder-vote.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class FounderService extends BaseDataService {
  constructor(private voteService: FounderVoteService, private userService: UserService) {
    super('founders');
  }

  async vote(id: number, type: 'inc' | 'dec') {
    const vote = await this.voteService.getOne({
      filters: {
        founder: { id: { $eq: id } },
        user: { id: { $eq: this.userService.user?.id } },
      },
    });

    if (vote.data.length) throw new Error('Already voted');

    const entity = await this.getOne({ filters: { id: { $eq: id } }, fields: ['votes'] }); // get latest votes
    const { votes } = entity.data[0].attributes;

    const newVotes = (Number(votes) || 0) + (type == 'inc' ? 1 : -1);

    await this.update(id, { votes: newVotes });
    await this.voteService.create({ founder: id, user: this.userService.user?.id });

    return newVotes;
  }
}
