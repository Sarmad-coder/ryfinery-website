import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '@services/data/user.service';
import { BillingService } from '@services/data/billing.service';
import { BaseSaveComponent } from '@shared/BaseSaveComponent';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-billing-setting',
  templateUrl: './billing-setting.component.html',
  styleUrls: ['./billing-setting.component.scss'],
})
export class BillingSettingComponent extends BaseSaveComponent implements OnInit {
  usersOnPlan = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  userEmail: any = this.userService.user?.email;
  emailBoxShow: string = '';

  basicPlanFeatures = [
    'Access to basic features',
    'Basic reporting + analytics',
    'Up to 10 individual users',
    '20GB individual data',
    'Basic chat support',
    'Attend events',
    'Automatic updates',
    'Backup your account',
    'Audit log and notes',
    'Feature requests',
  ];
  features = [
    {
      icon: 'message-chat-circle',
      title: 'Share team inboxes',
      description: 'Whether you have a team of 2 or 200, our shared team inboxes keep everyone on the same page and in the loop.',
    },
    {
      icon: 'zap',
      title: 'Deliver instant answers',
      description: 'An all-in-one customer service platform that helps you balance everything your customers need to be happy.',
    },
    {
      icon: 'chart-breakout-square',
      title: 'Manage your team with reports',
      description: 'Measure what matters with Untitled’s easy-to-use reports. You can filter, export, and drilldown on the data in a couple clicks.',
    },
  ];
  constructor(private userService: UserService, private billingService: BillingService, private toastr: ToastrService) {
    super();
  }

  override ngOnInit() {
    super.ngOnInit();
    this.form.controls['alternateEmail'].disable({ emitEvent: false });
    this.form.valueChanges.subscribe((x) => {
      if (x.contactDetailRadio == 'alternateEmail') {
        this.form.controls['alternateEmail'].enable({ emitEvent: false });
      } else {
        this.form.controls['alternateEmail'].disable({ emitEvent: false });
      }
    });
    console.log(this.form.controls);
  }

  initForm(): FormGroup<any> {
    return new FormGroup({
      alternateEmail: new FormControl('', [Validators.required, Validators.email]),
      contactDetailRadio: new FormControl('myEmail', [Validators.required]),
    });
  }

  async submitForm() {
    if (!(await this.isValid())) {
      return;
    }
    console.log(this.form.value);
    if (this.form.value.contactDetailRadio == 'myEmail') {
      const response = await this.billingService.create({
        contact_email: this.userEmail,
        user: this.userService.user?.id,
      });
      this.toastr.success('Saved successfully');
    } else {
      const response = await this.billingService.create({
        contact_email: this.form.value.alternateEmail,
        user: this.userService.user?.id,
      });
      console.log(response);
    }
  }
}
