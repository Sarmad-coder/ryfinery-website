import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Config } from 'ng-otp-input/lib/models/config';

@Component({
  selector: 'app-check-email',
  templateUrl: './check-email.component.html',
  styleUrls: ['./check-email.component.scss'],
})
export class CheckEmailComponent implements OnInit {
  otpConfig: Config = {
    length: 4,
    allowNumbersOnly: true,
    inputClass: 'otp-custom-input',
    containerClass: 'opt-container',
  };
  constructor(private router: Router) {}

  ngOnInit(): void {}
  onOtpChange(event: any) {
    console.log(event);
  }

  submit() {
    this.router.navigate(['verified-email']);
  }
  back() {
    this.router.navigate(['login']);
  }
}
