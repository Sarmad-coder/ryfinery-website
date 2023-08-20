import { Directive, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { getInvalidControls, hasError } from '@shared/utils/reactive-form';

@Directive()
export abstract class BaseSaveComponent implements OnInit {
  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.initForm();
  }

  abstract initForm(): FormGroup;
  abstract submitForm(): void;

  hasError(controlName: string) {
    return hasError(this.form, controlName);
  }

  protected async isValid(): Promise<boolean> {
    await new Promise<boolean>((resolve, reject) => {
      if (this.form.pending) {
        let sub = this.form.statusChanges.subscribe((res) => {
          if (this.form.valid) {
            resolve(true);
          }

          resolve(false);
          sub.unsubscribe();
        });
      } else {
        resolve(true);
      }
    });

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      console.log('FORM ERROR:', getInvalidControls(this.form));
      return false;
    }

    return true;
  }
}
