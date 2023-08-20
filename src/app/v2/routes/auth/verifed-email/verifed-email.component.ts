import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, TOKEN_KEY } from '@services/auth.service';
import { UserService } from '@services/data/user.service';

@Component({
  selector: 'app-verifed-email',
  templateUrl: './verifed-email.component.html',
  styleUrls: ['./verifed-email.component.scss'],
})
export class VerifedEmailComponent implements OnInit {
  title = 'Signing In...';
  subTitle1 = 'Take a seat and wait while we are doing our thing.';
  subTitle2 = 'We are doing our magic.';
  loginButton = false;

  constructor(private router: Router, private activeRoute: ActivatedRoute, private authService: AuthService, private userService: UserService) {}

  ngOnInit(): void {
    var token = this.activeRoute.snapshot.queryParams['loginToken'];

    if (!token) {
      this.router.navigate(['login']);
    } else {
      this.authService.passwordlessLoginByToken(token).then(
        async (resp: any) => {
          localStorage.setItem(TOKEN_KEY, resp['jwt']);
          await this.userService.loadUser();

          setTimeout(() => this.router.navigate(['']), 2000);
        },
        (error: HttpErrorResponse) => {
          this.title = 'Ops, something went wrong';
          this.subTitle1 = 'Your token has been expired, we cant do our magic now.';
          this.subTitle2 = 'try to login again.';
          this.loginButton = true;
        }
      );
    }
  }

  submit() {
    this.router.navigate(['']);
  }
}
