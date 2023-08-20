import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '@services/data/user.service';
import { LoginPopupService } from '@services/login-popup.service';

@Component({
  selector: 'app-startup-card',
  templateUrl: './startup-card.component.html',
})
export class StartupCardComponent implements OnInit {
  @Input() startup!: any;

  constructor(private router: Router, private userService: UserService, private loginPopupService: LoginPopupService) {}

  ngOnInit(): void {}

  get industryNames() {
    return this.startup.attributes.industries.data.map((x) => x.attributes.name);
  }

  get founderImages() {
    return this.startup?.attributes.founders.data.map((x) => x.attributes.image.data?.attributes.url).filter((x) => x);
  }

  view() {
    if (!this.userService.hasUser) {
      this.loginPopupService.show = true;
      return;
    }

    this.router.navigate(['/startup-view', this.startup.id]);
  }
}
