import { Component, OnInit } from '@angular/core';
import { User } from '@models/user';
import { AuthService } from '@services/auth.service';
import { UserService } from '@services/data/user.service';

interface Menu {
  label?: string;
  icon?: string;
  shortcut?: string;
  routerLink?: string;
  line?: boolean;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  show = false;
  user: User | undefined;

  menu: Menu[] = [
    { label: 'View Profile', icon: 'user-01', shortcut: 'view-profile-shortcut', routerLink: '' },
    { label: 'Settings', icon: 'settings-01', shortcut: 'settings-shortcut', routerLink: '' },
    { line: true },
    { label: 'Company Profile', icon: 'home-line', shortcut: 'company-profile-shortcut', routerLink: '' },
    { label: 'Team', icon: 'users-01', shortcut: 'team-shortcut', routerLink: '' },
    { label: 'Invite Colleagues', icon: 'user-plus-01', shortcut: 'invite-colleagues-shortcut', routerLink: '' },
    { line: true },
    { label: 'Changelog', icon: 'layers-two-01', shortcut: 'changelog-shortcut', routerLink: '' },
    { label: 'Slack Community', icon: 'message-smile-circle', shortcut: 'slack-community-shortcut', routerLink: '' },
    { label: 'Support', icon: 'help-circle', shortcut: 'support-shortcut', routerLink: '' },
    { line: true },
    { label: 'Log out', icon: 'log-out-01', shortcut: 'logout-shortcut', routerLink: '' },
  ];

  constructor(private authService: AuthService, private userService: UserService) {
    this.user = userService.user;
  }

  get isLoggedIn() {
    return this.userService.hasUser;
  }

  ngOnInit(): void {}

  showbox() {
    this.show == false ? (this.show = true) : (this.show = false);
  }

  logout() {
    this.authService.logout();
    window.location.href = '';
  }
}
