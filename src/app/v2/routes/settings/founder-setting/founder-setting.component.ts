import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from '@env';
import { CountryService } from '@services/data/country.service';
import { FounderService } from '@services/data/founder.service';
import { IndustryService } from '@services/data/industry.service';
import { TopicService } from '@services/data/topic.service';
import { UserService } from '@services/data/user.service';
import { UploadService } from '@services/upload.service';
import { BaseSaveComponent } from '@shared/BaseSaveComponent';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-founder-setting',
  templateUrl: './founder-setting.component.html',
  styleUrls: ['./founder-setting.component.scss'],
})
export class FounderSettingComponent extends BaseSaveComponent implements OnInit {
  imageSource!: string;
  selectedImage!: File;

  topics!: { id: number; name: string }[];
  industries!: { id: number; name: string }[];
  countries!: { id: number; name: string }[];
  populateFounder?: any;

  constructor(
    private topicService: TopicService,
    private industryService: IndustryService,
    private uploadService: UploadService,
    private countryService: CountryService,
    private founderService: FounderService,
    private userService: UserService,
    private toastr: ToastrService
  ) {
    super();
  }

  override async ngOnInit() {
    super.ngOnInit();

    this.topics = (await this.topicService.getAll()).data.map((x) => ({ id: x.id, name: x.attributes.name }));
    this.industries = (await this.industryService.getAll()).data.map((x) => ({ id: x.id, name: x.attributes.name }));
    this.countries = (await this.countryService.getAll()).data.map((x) => ({ id: x.id, name: x.attributes.name }));

    const founder = (
      await this.founderService.getOne({
        filters: {
          user: {
            id: { $eq: this.userService.user?.id },
          },
        },
        populate: {
          image: {
            fields: ['url'],
          },
          industries: true,
          topics: true,
        },
      })
    ).data[0];

    if (founder) {
      this.populateFounder = founder;

      if (founder.attributes.image.data) {
        this.imageSource = environment.uploadUrl + founder.attributes.image.data?.attributes.url;
      }

      this.form.patchValue({
        firstName: founder.attributes.firstName,
        lastName: founder.attributes.lastName,
        officialEmail: founder.attributes.officialEmail,
        phoneNumber: founder.attributes.phoneNumber,
        topics: founder.attributes.topics?.data.map((x) => x.id),
        industry: founder.attributes.industries.data[0]?.id,
        isMatched: founder.attributes.isMatched,
        slug: founder.attributes.slug,
        website: founder.attributes.website,
        linkedin: founder.attributes.linkedin,
        twitter: founder.attributes.twitter,
        facebook: founder.attributes.facebook,
        youtube: founder.attributes.youtube,
        description: founder.attributes.description,
        country: founder.attributes.country,
      });
    }
  }

  initForm(): FormGroup {
    return new FormGroup(
      {
        firstName: new FormControl(null, [Validators.required]),
        lastName: new FormControl(null, [Validators.required]),
        officialEmail: new FormControl(null, [Validators.required, Validators.email]),
        phoneNumber: new FormControl(null, [Validators.required]),
        topics: new FormControl(null),
        industry: new FormControl(null, [Validators.required]),
        isMatched: new FormControl(),
        slug: new FormControl(null, [Validators.required]),
        website: new FormControl(),
        linkedin: new FormControl(),
        twitter: new FormControl(),
        facebook: new FormControl(),
        youtube: new FormControl(),
        description: new FormControl(),
        country: new FormControl(null, [Validators.required]),
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
    if (this.populateFounder) {
      await this.founderService.update(this.populateFounder.id, {
        ...formValues,
        image: imageId,
        industries: [Number(formValues.industry)],
      });
    }
    // add
    else {
      await this.founderService.create({
        ...formValues,
        user: this.userService.user?.id,
        image: imageId,
        industries: [Number(formValues.industry)],
      });
    }

    this.toastr.success('Saved successfully');
  }

  async browsed(file: File) {
    this.selectedImage = file;
  }
}
