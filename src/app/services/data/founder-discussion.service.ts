import { Injectable } from '@angular/core';
import { BaseDataService } from '@shared/BaseDataService';
import { FounderDiscussionVoteService } from './founder-discussion-vote.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class FounderDiscussionService extends BaseDataService {
  constructor(private voteService: FounderDiscussionVoteService, private userService: UserService) {
    super('founder-discussions');
  }

  async vote(id: number, type: 'inc' | 'dec') {
    const vote = await this.voteService.getOne({
      filters: {
        discussion: { id: { $eq: id } },
        user: { id: { $eq: this.userService.user?.id } },
      },
    });

    if (vote.data.length) throw new Error('Already voted');

    const entity = await this.getOne({ filters: { id: { $eq: id } }, fields: ['votes'] }); // get latest votes
    const { votes } = entity.data[0].attributes;

    const newVotes = (Number(votes) || 0) + (type == 'inc' ? 1 : -1);

    await this.update(id, { votes: newVotes });
    await this.voteService.create({ discussion: id, user: this.userService.user?.id });

    return newVotes;
  }
}
