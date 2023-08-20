import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss'],
})
export class VerifyEmailComponent {
  email: string = '';

  constructor(private router: Router) {
    this.email = this.router.getCurrentNavigation()?.extras.state?.['email'];
    if (!this.email) {
      this.router.navigate(['login']);
    }
  }
}
