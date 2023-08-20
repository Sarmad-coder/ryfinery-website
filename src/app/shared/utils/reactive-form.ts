import { FormGroup, FormArray, FormControl, AbstractControl, ValidationErrors } from '@angular/forms';

export function markAllAsDirty(form: FormGroup | FormArray | FormControl | AbstractControl | null): void {
  if (form instanceof FormGroup || form instanceof FormArray) {
    if (form.controls) {
      Object.keys(form.controls).forEach((key) => {
        markAllAsDirty(form.get(key));
      });
    }
  } else if (form instanceof FormControl) {
    form.markAsDirty();
  }
}

export function hasError(form: FormGroup, controlName: string) {
  const control = form?.get(controlName);
  const result = control?.invalid && control?.errors && (control?.dirty || control?.touched);
  return result ? control : undefined;
}

export function getInvalidControls(form: FormGroup) {
  const invalid: { name: string; value: any; error: ValidationErrors | null }[] = [];
  const controls = form.controls;

  for (const name in controls) {
    const control = controls[name];
    if (control.invalid) invalid.push({ name, value: control.value, error: control.errors });
  }

  return invalid;
}
