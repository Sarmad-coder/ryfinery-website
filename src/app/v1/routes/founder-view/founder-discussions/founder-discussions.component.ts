import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FounderDiscussionService } from '@services/data/founder-discussion.service';
import { UserService } from '@services/data/user.service';
import { Paginator } from '@shared/BaseDataService';

@Component({
  selector: 'app-founder-discussions',
  templateUrl: './founder-discussions.component.html',
})
export class FounderDiscussionsComponent implements OnInit {
  @Input() founder: any;
  @Output() count = new EventEmitter<number>();

  discussions: any[] = [];
  discussionPaginator!: Paginator<any>;

  discussControl = new FormControl();
  replyControl = new FormControl();

  private populate = {
    user: {
      populate: {
        image: {
          fields: ['url'],
        },
      },
    },
  };

  constructor(private discussionService: FounderDiscussionService, public userService: UserService) {}

  async ngOnInit(): Promise<void> {
    this.discussionPaginator = this.discussionService.createPaginator(
      {
        sort: ['votes:desc', 'createdAt:asc'],
        filters: {
          founder: { id: { $eq: this.founder.id } },
          parent: { id: { $null: true } },
        },
        populate: this.populate,
      },
      {
        pageSize: 5,
      }
    );

    this.discussionPaginator.load();
    this.discussionPaginator.data$.subscribe(async (data) => {
      for (const item of data as any) {
        const replies = await this.discussionService.getAll({
          sort: ['votes:desc', 'createdAt:asc'],
          filters: {
            parent: {
              id: { $eq: item.id },
            },
          },
          populate: this.populate,
        });

        item.replies = replies.data;
        this.discussions.push(item);
      }
    });

    this.discussionPaginator.meta$.subscribe((x) => {
      this.count.emit(x.pagination.total);
    });
  }

  reply(discussion: any) {
    discussion.showReplyField = true;
  }

  async sendDiscuss() {
    const discussion = await this.discussionService.create(
      {
        message: this.discussControl.value,
        founder: this.founder.id,
        user: this.userService.user?.id,
      },
      { populate: this.populate }
    );

    this.discussions.unshift(discussion.data);
    this.discussControl.reset();
  }

  async sendReply(discussion: any) {
    const reply = await this.discussionService.create(
      {
        message: this.replyControl.value,
        founder: this.founder.id,
        user: this.userService.user?.id,
        parent: discussion.id,
      },
      { populate: this.populate }
    );

    discussion.showReplyField = false;
    discussion.replies.unshift(reply.data);
    this.replyControl.reset();
  }

  voteUp(discussion: any) {
    this.discussionService
      .vote(discussion.id, 'inc')
      .then((x) => (discussion.attributes.votes = x))
      .catch((e) => {});
  }

  voteDown(discussion: any) {
    this.discussionService
      .vote(discussion.id, 'dec')
      .then((x) => (discussion.attributes.votes = x))
      .catch((e) => {});
  }
}
