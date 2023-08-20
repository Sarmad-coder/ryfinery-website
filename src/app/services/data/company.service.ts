import { Injectable } from '@angular/core';
import { BaseDataService } from '@shared/BaseDataService';
import { CompanyFollowerService } from './company-follower.service';
import { CompanyVoteService } from './company-vote.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class CompanyService extends BaseDataService {
  constructor(private voteService: CompanyVoteService, private followerService: CompanyFollowerService, private userService: UserService) {
    super('companies');
  }

  // override
  // protected override queryToString(query: any) {
  //   // hiding crunchbase companies
  //   query.filters = {
  //     ...query.filters,
  //     isStatista: { $eq: true },
  //   };

  //   return super.queryToString(query);
  // }

  // override
  // override getAll(query?: any) {
  //   // hiding crunchbase companies
  //   query.filters = {
  //     ...query.filters,
  //     isStatista: { $eq: true },
  //   };

  //   return super.getAll(query);
  // }

  async getFollow(companyId: number) {
    const userId = this.userService.user?.id;
    if (!userId) {
      return; // user not found or login
    }

    const follower = await this.followerService.getOne({
      filters: {
        company: { id: { $eq: companyId } },
        user: { id: { $eq: userId } },
      },
    });

    return follower;
  }

  async getVote(companyId: number) {
    const userId = this.userService.user?.id;
    if (!userId) {
      return; // user not found or login
    }

    const vote = await this.voteService.getOne({
      filters: {
        company: { id: { $eq: companyId } },
        user: { id: { $eq: userId } },
      },
    });

    return vote;
  }

  async follow(id: number, type: 'follow' | 'unfollow') {
    const userId = this.userService.user?.id;
    if (!userId) {
      return; // user not found or login
    }

    const follower = await this.getFollow(id);

    if (type == 'unfollow' && !follower?.data.length) {
      return; // can't unfollow because follower not found
    }

    if (type == 'follow' && follower?.data.length) {
      return; // already follow
    }
    const entity = await this.getOne({ filters: { id: { $eq: id } }, fields: ['followers'] }); // get latest followers
    const { followers } = entity.data[0].attributes;

    const newFollower = (Number(followers) || 0) + (type == 'follow' ? 1 : -1);

    console.log('asasdasd 1', id, followers, type, newFollower);
    await this.update(id, { followers: newFollower });
    console.log('asasdasd 2', followers, type, newFollower);

    if (type == 'follow') {
      console.log('cret 1');
      await this.followerService.create({ company: id, user: userId });
      console.log('cret 2');
    } else {
      await this.followerService.delete(follower?.data[0].id);
    }

    return { followers: newFollower, following: type == 'follow' };
  }

  async vote(companyId: number, type: 'like' | 'dislike') {
    const userId = this.userService.user?.id;
    if (!userId) {
      return; // user not found or login
    }

    /** save vote */

    const vote = (await this.getVote(companyId))?.data[0];
    let voteRes;

    if (vote?.attributes?.type === type) return;

    if (vote) {
      voteRes = await this.voteService.update(vote.id, { type });
    } else {
      voteRes = await this.voteService.create({ company: companyId, user: userId, type });
    }

    /** save likes/dislikes */

    const entity = await this.getOne({ filters: { id: { $eq: companyId } }, fields: ['likes', 'dislikes'] }); // get latest votes
    const { likes, dislikes } = entity.data[0].attributes;

    const newLikes = (Number(likes) || 0) + (type === 'like' ? 1 : vote && type === 'dislike' ? -1 : 0);
    const newDislikes = (Number(dislikes) || 0) + (type === 'dislike' ? 1 : vote && type === 'like' ? -1 : 0);

    await this.update(companyId, { likes: newLikes, dislikes: newDislikes });

    return { likes: newLikes, vote: voteRes };
  }

  // @deprecated
  // async vote(id: number, type: 'inc' | 'dec') {
  //   const userId = this.userService.user?.id;
  //   if (!userId) {
  //     return; // user not found or login
  //   }

  //   const vote = await this.getVote(id);

  //   if (type == 'dec' && !vote?.data.length) {
  //     return; // can't decrement because vote not found
  //   }

  //   if (type == 'inc' && vote?.data.length) {
  //     return; // already voted
  //   }

  //   const entity = await this.getOne({ filters: { id: { $eq: id } }, fields: ['votes'] }); // get latest votes
  //   const { votes } = entity.data[0].attributes;

  //   const newVotes = (Number(votes) || 0) + (type == 'inc' ? 1 : -1);

  //   await this.update(id, { votes: newVotes });

  //   if (type == 'inc') {
  //     await this.voteService.create({ company: id, user: userId });
  //   } else {
  //     await this.voteService.delete(vote?.data[0].id);
  //   }

  //   return newVotes;
  // }
}
