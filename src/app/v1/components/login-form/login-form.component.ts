import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '@services/data/user.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
})
export class LoginFormComponent implements OnInit {
  @Output() done = new EventEmitter();

  userForm = new FormGroup(
    {
      email: new FormControl('', [Validators.email, Validators.required]),
    },
    { updateOn: 'submit' }
  );

  constructor(private router: Router, private authSrv: AuthService, private userService: UserService, private toast: ToastrService) {}

  ngOnInit(): void {}

  async submit() {
    if (this.userForm.invalid) return;

    // get user by email
    const user: any = await this.userService.getOne({
      filters: {
        email: { $eq: this.userForm.value.email?.toLowerCase() },
      },
    });

    if (!user.length) {
      this.toast.error('This email is not registered with us, try signup');
      return;
    }

    await this.authSrv.sendPasswordLessLink(this.userForm.value);
    this.done.emit();
    this.router.navigate(['verify-email'], {
      state: { email: this.userForm.value.email },
    });
  }
}
