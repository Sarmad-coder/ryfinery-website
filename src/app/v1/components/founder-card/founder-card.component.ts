import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FounderService } from '@services/data/founder.service';
import { UserService } from '@services/data/user.service';
import { LoginPopupService } from '@services/login-popup.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-founder-card',
  templateUrl: './founder-card.component.html',
})
export class FounderCardComponent implements OnInit {
  @Input() founder!: any;

  constructor(
    private router: Router,
    private founderService: FounderService,
    private userService: UserService,
    private loginPopupService: LoginPopupService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {}

  view() {
    if (!this.userService.hasUser) {
      this.loginPopupService.show = true;
      return;
    }

    this.router.navigate(['/founder-view', this.founder.id]);
  }

  vote() {
    if (!this.userService.hasUser) {
      this.loginPopupService.show = true;
      return;
    }

    this.founderService
      .vote(this.founder.id, 'inc')
      .then(() => {
        this.toastr.success('Voted!');
      })
      .catch((e) => {});
  }
}
