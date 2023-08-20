import { Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { UserService } from '@services/data/user.service';
import { BaseSaveComponent } from '@shared/BaseSaveComponent';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent extends BaseSaveComponent {
  loading = false;

  constructor(private router: Router, private authService: AuthService, private userService: UserService, private toast: ToastrService) {
    super();
  }

  initForm(): FormGroup<any> {
    return new FormGroup(
      {
        email: new FormControl('', {
          validators: [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'), Validators.required],
          asyncValidators: [this.isEmailRegistered()],
        }),
      },
      { updateOn: 'submit' }
    );
  }

  async submitForm() {
    this.loading = true;

    if (!(await this.isValid())) {
      this.loading = false;
      return;
    }

    const formValues = this.form.value;
    formValues.email = formValues.email.toLowerCase();

    await this.authService.sendPasswordLessLink(formValues);

    this.router.navigate(['verify-email'], {
      state: formValues,
    });

    this.loading = false;
  }

  private isEmailRegistered(): AsyncValidatorFn {
    return async ({ value }: AbstractControl): Promise<ValidationErrors | null> => {
      if (!value) return null;

      const res = await this.userService.getOne({
        fields: ['id'],
        filters: {
          email: { $eq: value.toLowerCase() || undefined },
          confirmed: { $eq: true },
        },
      });

      return Boolean(res[0]?.id) ? null /* valid */ : { registered: true }; /* invalid */
    };
  }
}
