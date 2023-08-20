import { Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { UserService } from '@services/data/user.service';
import { BaseSaveComponent } from '@shared/BaseSaveComponent';
import { updateWith } from 'lodash-es';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent extends BaseSaveComponent {
  loading = false;

  constructor(private router: Router, private authService: AuthService, private userService: UserService) {
    super();
  }

  initForm(): FormGroup {
    return new FormGroup(
      {
        fullName: new FormControl('', [Validators.required]),
        username: new FormControl('', {
          validators: [Validators.required],
          asyncValidators: [this.isUsernameDuplicate()],
        }),
        email: new FormControl<string>('', {
          validators: [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'), Validators.required],
          asyncValidators: [this.isEmailDuplicate()],
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
    formValues.username = formValues.username.toLowerCase();
    formValues.email = formValues.email.toLowerCase();

    await this.authService.sendPasswordLessLink(formValues);

    this.router.navigate(['verify-email'], {
      state: formValues,
    });

    this.loading = false;
  }

  private isUsernameDuplicate(): AsyncValidatorFn {
    return async ({ value }: AbstractControl): Promise<ValidationErrors | null> => {
      if (!value) return null;

      const res = await this.userService.getOne({
        fields: ['id'],
        filters: {
          username: { $eq: value.toLowerCase() },
          confirmed: { $eq: true },
        },
      });

      return Boolean(res[0]?.id) ? { duplicated: true } /* invalid */ : null; /* valid */
    };
  }

  private isEmailDuplicate(): AsyncValidatorFn {
    return async ({ value }: AbstractControl): Promise<ValidationErrors | null> => {
      if (!value) return null;

      const res = await this.userService.getOne({
        fields: ['id'],
        filters: {
          email: { $eq: value.toLowerCase() },
          confirmed: { $eq: true },
        },
      });

      return Boolean(res[0]?.id) ? { duplicated: true } /* invalid */ : null; /* valid */
    };
  }
}
