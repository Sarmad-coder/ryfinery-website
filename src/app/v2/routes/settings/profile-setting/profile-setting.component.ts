import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from '@env';
import { UserService } from '@services/data/user.service';
import { UploadService } from '@services/upload.service';
import { BaseSaveComponent } from '@shared/BaseSaveComponent';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile-setting',
  templateUrl: './profile-setting.component.html',
  styleUrls: ['./profile-setting.component.scss'],
})
export class ProfileSettingComponent extends BaseSaveComponent implements OnInit {
  imageSource!: string;
  selectedImage!: File;

  topics!: { id: number; name: string }[];
  industries!: { id: number; name: string }[];
  countries!: { id: number; name: string }[];
  populateUser?: any;

  constructor(private uploadService: UploadService, private userService: UserService, private toastr: ToastrService) {
    super();
  }

  override async ngOnInit() {
    super.ngOnInit();

    const user = (
      await this.userService.getOne({
        filters: { id: { $eq: this.userService.user?.id } },
        populate: { image: { fields: ['url'] } },
      })
    )[0];

    console.log(user);
    if (user) {
      this.populateUser = user;

      if (user.image) {
        this.imageSource = environment.uploadUrl + user.image.url;
      }

      this.form.patchValue({
        fullName: user.username, // fullName is stored in username
        email: user.email,
      });
    }
  }

  initForm(): FormGroup {
    return new FormGroup(
      {
        fullName: new FormControl(null, [Validators.required]),
        email: new FormControl(null, [Validators.required, Validators.email]),
      },
      { updateOn: 'submit' }
    );
  }

  async submitForm() {
    if (!this.isValid()) return;

    const formValues = this.form.value;
    let imageId = null;

    // upload image
    if (this.selectedImage) {
      imageId = (await this.uploadService.upload([this.selectedImage]))[0].id;
    }

    // update
    if (this.populateUser) {
      console.log(this.populateUser.id, {
        ...formValues,
        image: imageId,
        username: formValues.fullName,
      });
      await this.userService.update(this.populateUser.id, {
        ...formValues,
        image: imageId,
        username: formValues.fullName,
      });
    }

    this.toastr.success('Saved successfully');
  }

  async browsed(file: File) {
    this.selectedImage = file;
  }
}
