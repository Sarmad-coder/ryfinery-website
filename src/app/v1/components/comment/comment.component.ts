import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UserService } from '@services/data/user.service';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
})
export class CommentComponent implements OnInit {
  @Input() discussion: any;
  @Output() reply = new EventEmitter();
  @Output() voteUp = new EventEmitter();
  @Output() voteDown = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}
}
