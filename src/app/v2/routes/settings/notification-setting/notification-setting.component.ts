import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NotificationService } from '@services/data/notification.service';
import { UserService } from '@services/data/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-notification-setting',
  templateUrl: './notification-setting.component.html',
  styleUrls: ['./notification-setting.component.scss'],
})
export class NotificationSettingComponent implements OnInit {
  notificationForm = new FormGroup({
    market_push: new FormControl(false),
    market_email: new FormControl(false),
    market_sms: new FormControl(false),
    company_push: new FormControl(false),
    company_email: new FormControl(false),
    company_sms: new FormControl(false),
    people_push: new FormControl(false),
    people_email: new FormControl(false),
    people_sms: new FormControl(false),
    trend_push: new FormControl(false),
    trend_email: new FormControl(false),
    trend_sms: new FormControl(false),
    newsletter_push: new FormControl(false),
    newsletter_email: new FormControl(false),
    newsletter_sms: new FormControl(false),
    update_push: new FormControl(false),
    update_email: new FormControl(false),
    update_sms: new FormControl(false),
    billing_push: new FormControl(false),
    billing_email: new FormControl(false),
    billing_sms: new FormControl(false),
    ryfinery_push: new FormControl(false),
    ryfinery_email: new FormControl(false),
    ryfinery_sms: new FormControl(false),
  });

  constructor(private notificationService: NotificationService, private userService: UserService, private toastr: ToastrService) {}

  async ngOnInit() {
    let response: any = await this.notificationService.getAll({
      filters: { user: { id: { $eq: this.userService.user?.id } } },
    });
    let form = response.data[0]?.attributes;
    // console.log(response)
    delete form.createdAt;
    delete form.updatedAt;
    delete form.publishedAt;

    this.notificationForm.setValue(form);
    const id = response.data[0]?.id;
    if (response.data[0]?.id) {
      this.notificationForm.valueChanges.subscribe(async (x) => {
        const response = await this.notificationService.update(id, x);
        this.toastr.success('Update Sucessfully ');
      });
    } else {
      let formData: any = this.notificationForm.value;
      formData.user = this.userService.user?.id;
      const response = await this.notificationService.create(formData);
      console.log(response);
    }
  }
}
