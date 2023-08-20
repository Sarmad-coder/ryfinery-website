import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  userForm = new FormGroup(
    {
      username: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'), Validators.required]),
    },
    { updateOn: 'submit' }
  );

  constructor(private router: Router, private authSrv: AuthService) {}

  ngOnInit(): void {}

  async submit() {
    if (this.userForm.valid) {
      this.userForm.value.email = this.userForm.value.email?.toLowerCase();

      await this.authSrv.sendPasswordLessLink(this.userForm.value);

      this.router.navigate(['verify-email'], {
        state: { email: this.userForm.value.email },
      });
    }
  }

  goToSignIn() {
    this.router.navigate(['login']);
  }
}
