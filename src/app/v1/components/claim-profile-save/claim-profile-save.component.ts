import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ClaimRequestService } from '@services/data/claim-request.service';
import { CompanyService } from '@services/data/company.service';
import { BaseSaveComponent } from '@shared/BaseSaveComponent';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-claim-profile-save',
  templateUrl: './claim-profile-save.component.html',
  styleUrls: ['./claim-profile-save.component.scss'],
})
export class ClaimProfileSaveComponent extends BaseSaveComponent implements OnInit {
  @Input() company: any;

  loading = false;
  gender = ['male', 'female'];

  constructor(
    public activeModal: NgbActiveModal,
    private claimRequestService: ClaimRequestService,
    private companyService: CompanyService,
    private toastr: ToastrService
  ) {
    super();
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  initForm(): FormGroup<any> {
    return new FormGroup(
      {
        firstName: new FormControl<string>('', [Validators.required]),
        lastName: new FormControl<string>('', [Validators.required]),
        position: new FormControl<string>('', [Validators.required]),
        gender: new FormControl<string>('', [Validators.required]),
        email: new FormControl<string>('', [Validators.required, Validators.email]),
        linkedIn: new FormControl<string>('', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]),
        twitter: new FormControl<string>('', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]),
        facebook: new FormControl<string>('', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]),
      },
      { updateOn: 'submit' }
    );
  }

  async submitForm(): Promise<void> {
    if (!(await this.isValid())) return;

    this.loading = true;

    const formValues = this.form.value;
    formValues.fullName = formValues.firstName + ' ' + formValues.lastName;
    formValues.email = formValues.email.toLowerCase();
    formValues.company = this.company.id;

    await this.claimRequestService.create(formValues);
    await this.companyService.update(this.company.id, { isProcessing: true });
    location.reload();

    this.toastr.success('Saved successfully');
    this.loading = false;
    this.activeModal.close();
  }
}
