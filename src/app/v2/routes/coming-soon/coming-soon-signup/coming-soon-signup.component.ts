import { Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IndustryService } from '@services/data/industry.service';
import { SignupWaitlistService } from '@services/data/signup-waitlist.service';
import { BaseSaveComponent } from '@shared/BaseSaveComponent';
import { ChangeData, CountryISO } from 'ngx-intl-tel-input';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-coming-soon-signup',
  templateUrl: './coming-soon-signup.component.html',
  styleUrls: ['./coming-soon-signup.component.scss'],
})
export class ComingSoonSignupComponent extends BaseSaveComponent implements OnInit {
  industries!: { id: number; name: string }[];
  intlDefaultCountry = CountryISO.Bahrain;

  constructor(
    private signupWaitlistService: SignupWaitlistService,
    private industryService: IndustryService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    super();
  }

  override async ngOnInit() {
    super.ngOnInit();

    this.industries = (await this.industryService.getAll()).data.map((x) => ({ id: x.id, name: x.attributes.name }));
  }

  initForm(): FormGroup<any> {
    return new FormGroup(
      {
        name: new FormControl(null, [Validators.required]),
        email: new FormControl<string>('', {
          validators: [Validators.email, Validators.required],
          asyncValidators: [this.isDuplicate()],
        }),
        industry: new FormControl(null, [Validators.required]),
        // phone: new FormControl(null, [Validators.required]),
        company: new FormControl(null, [Validators.required]),
      },
      { updateOn: 'submit' }
    );
  }

  async submitForm() {
    if (!(await this.isValid())) return;

    const formValues = this.form.value;
    // formValues.phone = (formValues.phone as ChangeData).e164Number;
    formValues.email = formValues.email?.toLowerCase();

    await this.signupWaitlistService.create(formValues);

    this.router.navigate(['/coming-soon-thanks']);
  }

  private isDuplicate(): AsyncValidatorFn {
    return async ({ value }: AbstractControl): Promise<ValidationErrors | null> => {
      if (!value) return null;

      const res = await this.signupWaitlistService.getOne({
        filters: {
          email: { $eq: value.toLowerCase() || undefined },
        },
      });

      return Boolean(res.data[0]?.id) ? { duplicated: true } /* invalid */ : null; /* valid */
    };
  }
}
