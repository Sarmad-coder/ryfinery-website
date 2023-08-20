import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AsyncValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { SubscriberService } from '@services/data/subscriber.service';
import { BaseSaveComponent } from '@shared/BaseSaveComponent';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-subscriber',
  templateUrl: './subscriber.component.html',
})
export class SubscriberComponent extends BaseSaveComponent implements OnInit {
  @Input() hideHint: boolean = false;

  constructor(private subscriberService: SubscriberService, private toastr: ToastrService) {
    super();
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  initForm(): FormGroup {
    return new FormGroup(
      {
        email: new FormControl<string>('', {
          validators: [Validators.email, Validators.required],
          asyncValidators: [this.isDuplicate()],
        }),
      },
      { updateOn: 'submit' }
    );
  }

  async submitForm() {
    if (!(await this.isValid())) return;

    const formValues = this.form.value;
    formValues.email = formValues.email?.toLowerCase();

    await this.subscriberService.create(formValues);
    this.toastr.success('Subscribed Successfully');
  }

  private isDuplicate(): AsyncValidatorFn {
    return async ({ value }: AbstractControl): Promise<ValidationErrors | null> => {
      if (!value) return null;

      const res = await this.subscriberService.getOne({
        filters: {
          email: { $eq: value.toLowerCase() || undefined },
        },
      });

      return Boolean(res.data[0]?.id) ? { duplicated: true } /* invalid */ : null; /* valid */
    };
  }
}
