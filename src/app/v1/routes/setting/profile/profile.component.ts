import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '@env';
import { CompanyService } from '@services/data/company.service';
import { CountryService } from '@services/data/country.service';
import { FounderService } from '@services/data/founder.service';
import { IndustryService } from '@services/data/industry.service';
import { TopicService } from '@services/data/topic.service';
import { UserService } from '@services/data/user.service';
import { UploadService } from '@services/upload.service';
import { BaseSaveComponent } from '@shared/BaseSaveComponent';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent extends BaseSaveComponent implements OnInit {
  @ViewChild('fileInput1') fileInput1!: ElementRef;
  @ViewChild('fileInput2') fileInput2!: ElementRef;
  acceptTypes = ['jpg', 'jpeg', 'png', 'webp'].map((x) => `image/${x}`).join(',');
  imgUrl1!: string;
  imageFile1!: File;
  imgUrl2!: string;
  imageFile2!: File;

  topics!: { id: number; name: string }[];
  industries!: { id: number; name: string }[];
  countries!: { id: number; name: string }[];
  populateCompany?: any;
  populateFounder?: any;

  constructor(
    private topicService: TopicService,
    private industryService: IndustryService,
    private countryService: CountryService,
    private uploadService: UploadService,
    private companyService: CompanyService,
    private founderService: FounderService,
    private userService: UserService,
    private toastr: ToastrService,
    private router: Router
  ) {
    super();
  }

  override async ngOnInit() {
    super.ngOnInit();

    this.topics = (await this.topicService.getAll()).data.map((x) => ({ id: x.id, name: x.attributes.name }));
    this.industries = (await this.industryService.getAll()).data.map((x) => ({ id: x.id, name: x.attributes.name }));
    this.countries = (await this.countryService.getAll()).data.map((x) => ({ id: x.id, name: x.attributes.name }));

    const company = (
      await this.companyService.getOne({
        filters: { founders: { user: { id: { $eq: this.userService.user?.id } } } },
        populate: { logo: { fields: ['url'] }, industries: true, topics: true, founders: true },
      })
    ).data[0];

    if (company) {
      this.populateCompany = company;

      if (company.attributes.logo.data) {
        this.imgUrl2 = environment.uploadUrl + company.attributes.logo.data?.attributes.url;
      }

      this.form.patchValue({
        name: company.attributes.name,
        employees: company.attributes.employees,
        contactEmail: company.attributes.contactEmail,
        phoneNumber: company.attributes.phoneNumber,
        topics: company.attributes.topics.data.map((x) => x.id),
        industry: company.attributes.industries.data[0]?.id,
        isMatched: company.attributes.isMatched,
        slug: company.attributes.slug,
        // website: company.attributes.website,
        linkedin: company.attributes.linkedin,
        twitter: company.attributes.twitter,
        facebook: company.attributes.facebook,
        youtube: company.attributes.youtube,
        description: company.attributes.description,
        country: company.attributes.country,
      });
    }

    const founder = (
      await this.founderService.getOne({
        filters: { user: { id: { $eq: this.userService.user?.id } } },
        populate: { image: { fields: ['url'] }, industries: true, topics: true },
      })
    ).data[0];

    if (founder) {
      this.populateFounder = founder;

      if (founder.attributes.image.data) {
        this.imgUrl1 = environment.uploadUrl + founder.attributes.image.data?.attributes.url;
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
        // website: founder.attributes.website,
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
        name: new FormControl(null, [Validators.required]),
        employees: new FormControl(null, [Validators.required]),
        contactEmail: new FormControl(null, [Validators.required, Validators.email]),
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

        tagline: new FormControl(),
        hasReport: new FormControl(),
        hasEmail: new FormControl(),

        firstName: new FormControl(null, [Validators.required]),
        lastName: new FormControl(null, [Validators.required]),
        officialEmail: new FormControl(null, [Validators.required, Validators.email]),
      },
      { updateOn: 'submit' }
    );
  }

  async submitForm() {
    this.submitForm2();
    this.submitForm1();
  }

  async submitForm2() {
    if (!this.isValid()) return;

    const formValues = this.form.value;
    let imageId;

    // upload image
    if (this.imageFile1) {
      imageId = (await this.uploadService.upload([this.imageFile1]))[0].id;
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
  }

  async submitForm1() {
    if (!this.isValid()) return;

    const formValues = this.form.value;
    let imageId;

    const duplicate = await this.companyService.getOne({
      filters: {
        id: { $ne: this.populateCompany.id || undefined },
        name: { $eqi: formValues.name },
      },
    });

    if (duplicate.data[0]?.id) {
      this.toastr.error('This company name already exists');
      return;
    }

    // upload image
    if (this.imageFile2) {
      imageId = (await this.uploadService.upload([this.imageFile2]))[0].id;
    }

    // get founder
    let founderId =
      this.populateCompany?.attributes.founders.data[0]?.id ||
      (
        await this.founderService.getOne({
          filters: {
            user: { id: { $eq: this.userService.user?.id } },
          },
        })
      ).data[0]?.id;

    // add founder if not found
    if (!founderId) {
      const [firstName, lastName] = this.userService.user?.username.split(' ') || [];
      founderId = (
        await this.founderService.create({
          firstName,
          lastName,
          image: this.userService.user?.image.id,
          user: this.userService.user?.id,
        })
      ).data[0]?.id;
    }

    // update company
    if (this.populateCompany) {
      await this.companyService.update(this.populateCompany.id, {
        ...formValues,
        founders: [founderId],
        logo: imageId,
        industries: [Number(formValues.industry)],
      });
    }
    // add company
    else {
      await this.companyService.create({
        ...formValues,
        founders: [founderId],
        logo: imageId,
        industries: [Number(formValues.industry)],
      });
    }

    this.toastr.success('Saved successfully');
  }

  async browse1(files: FileList | undefined | null) {
    // if no file browsed
    if (!files?.length) return;

    const file = files[0];

    if (!this.isFileImage(file)) {
      this.toastr.error('image format is not supported');
      return;
    }

    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string); // base64 Image src
    });

    this.imgUrl2 = base64;
    this.imageFile2 = file;
  }

  async browse2(files: FileList | undefined | null) {
    // if no file browsed
    if (!files?.length) return;

    const file = files[0];

    if (!this.isFileImage(file)) {
      this.toastr.error('image format is not supported');
      return;
    }

    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string); // base64 Image src
    });

    this.imgUrl1 = base64;
    this.imageFile1 = file;
  }

  fileInputChange1(e: Event) {
    const files = (e.currentTarget as HTMLInputElement)?.files;
    this.browse1(files);
  }

  drop1(e: DragEvent) {
    const files = e.dataTransfer?.files;
    this.browse1(files);
  }

  triggerBrowse1() {
    const fileInput: HTMLInputElement = this.fileInput1?.nativeElement;
    fileInput.click();
  }

  fileInputChange2(e: Event) {
    const files = (e.currentTarget as HTMLInputElement)?.files;
    this.browse2(files);
  }

  drop2(e: DragEvent) {
    const files = e.dataTransfer?.files;
    this.browse2(files);
  }

  triggerBrowse2() {
    const fileInput: HTMLInputElement = this.fileInput2?.nativeElement;
    fileInput.click();
  }

  private isFileImage(file: File): boolean {
    return file.type.split('/')[0] === 'image';
  }
}
