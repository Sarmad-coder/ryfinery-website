import { Component, OnInit } from '@angular/core';
import { LoginPopupService } from '@services/login-popup.service';

@Component({
  selector: 'app-login-popup',
  templateUrl: './login-popup.component.html',
})
export class LoginPopupComponent implements OnInit {
  constructor(public loginPopupService: LoginPopupService) {}

  ngOnInit(): void {}
}
