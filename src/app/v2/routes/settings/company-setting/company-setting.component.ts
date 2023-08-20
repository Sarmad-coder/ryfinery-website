import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
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
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-company-setting',
  templateUrl: './company-setting.component.html',
  styleUrls: ['./company-setting.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CompanySettingComponent extends BaseSaveComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  acceptTypes = ['jpg', 'jpeg', 'png', 'webp'].map((x) => `image/${x}`).join(',');
  imgUrl!: string;
  imageFile!: File;

  topics!: { id: number; name: string }[];
  industries!: { id: number; name: string }[];
  countries!: { id: number; name: string }[];
  operatingStatus = [
    "Active",
    "Inactive",
  ];
  IPOStatus = [
    'Public',
    'Private',
  ];
  populateCompany?: any;
  companies: any;
  checkFounder: any;
  closeResult: any;
  editForm: Boolean = false;

  constructor(
    private topicService: TopicService,
    private industryService: IndustryService,
    private countryService: CountryService,
    private uploadService: UploadService,
    private companyService: CompanyService,
    private founderService: FounderService,
    private userService: UserService,
    private toastr: ToastrService,
    private router: Router,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal
  ) {
    super();
  }

  openLg(content) {
    this.modalService.open(content, { size: 'lg' });
  }

  async getCompanies() {
    var companies: any = await this.companyService.getAll({
      filters: {
        founders: {
          user: {
            id: { $eq: this.userService.user?.id },
          },
        },
      },
      populate: {
        logo: {
          fields: ['url'],
        },
        industries: true,
        topics: true,
        founders: true,
      },
    });

    companies = companies.data;

    return companies;
  }

  override async ngOnInit() {
    super.ngOnInit();

    this.topics = (await this.topicService.getAll()).data.map((x) => ({ id: x.id, name: x.attributes.name }));
    this.industries = (await this.industryService.getAll()).data.map((x) => ({ id: x.id, name: x.attributes.name }));
    this.countries = (await this.countryService.getAll()).data.map((x) => ({ id: x.id, name: x.attributes.name }));

    this.companies = await this.getCompanies();
    // this.populateCompany=this.companies[0]
    this.checkFounder = this.companies[0];

    const company = (
      await this.companyService.getOne({
        filters: {
          id: { $eq: 899898 },
          // founders: {
          //   user: {
          //     id: { $eq: this.userService.user?.id },
          //   },
          // },
        },
        populate: {
          logo: {
            fields: ['url'],
          },
          industries: true,
          topics: true,
          founders: true,
        },
      })
    ).data[0];

    if (company) {
      this.populateCompany = company;

      if (company.attributes?.logo?.data) {
        this.imgUrl = environment.uploadUrl + company.attributes.logo.data?.attributes.url;
      }

      this.form.patchValue({
        name: company.attributes.name,
        employees: company.attributes.employees,
        contactEmail: company.attributes.contactEmail,
        phoneNumber: company.attributes.phoneNumber,
        topics: company.attributes.topics.data.map((x) => x.id),
        industry: company.attributes.industries.data[0]?.id,

        foundingDate: company.attributes.foundingDate,
        revenue: company.attributes.revenue,
        operatingStatus: company.attributes.operatingStatus,
        IPOStatus: company.attributes.IPOStatus,
        isic: company.attributes.isic,
        state: company.attributes.state,
        streetAddress: company.attributes.streetAddress,

        isMatched: company.attributes.isMatched,
        slug: company.attributes.slug,
        website: company.attributes.website,
        linkedin: company.attributes.linkedin,
        twitter: company.attributes.twitter,
        facebook: company.attributes.facebook,
        youtube: company.attributes.youtube,
        description: company.attributes.description,
        country: company.attributes.country,
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

        foundingDate: new FormControl(),
        revenue: new FormControl(),
        operatingStatus: new FormControl(),
        IPOStatus: new FormControl(),
        isic: new FormControl(),
        state: new FormControl(),
        streetAddress: new FormControl(),

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

  editCompany(id: any) {
    this.editForm = true;

    let company = this.companies.filter((item) => {
      return item.id == id;
    });

    company = company[0];

    if (company) {
      this.populateCompany = company;

      if (company.attributes?.logo?.data) {
        this.imgUrl = environment.uploadUrl + company.attributes.logo.data?.attributes.url;
      }

      this.form.patchValue({
        name: company.attributes.name,
        employees: company.attributes.employees,
        contactEmail: company.attributes.contactEmail,
        phoneNumber: company.attributes.phoneNumber,
        topics: company.attributes.topics.data.map((x) => x.id),
        industry: company.attributes.industries.data[0]?.id,

        foundingDate: company.attributes.foundingDate,
        revenue: company.attributes.revenue,
        operatingStatus: company.attributes.operatingStatus,
        IPOStatus: company.attributes.IPOStatus,
        isic: company.attributes.isic,
        state: company.attributes.state,
        streetAddress: company.attributes.streetAddress,

        isMatched: company.attributes.isMatched,
        slug: company.attributes.slug,
        website: company.attributes.website,
        linkedin: company.attributes.linkedin,
        twitter: company.attributes.twitter,
        facebook: company.attributes.facebook,
        youtube: company.attributes.youtube,
        description: company.attributes.description,
        country: company.attributes.country,
      });
    }
  }

  async deleteCompany(id: any) {
    const response = await this.companyService.delete(id);
    this.companies = await this.getCompanies();
    this.populateCompany = undefined;
    this.imgUrl = '';
    this.form.reset();

    //
  }

  clickClose() {
    this.populateCompany = undefined;
    this.imgUrl = '';
    this.form.reset();
    this.editForm = false;
  }

  async submitForm() {
    if (!this.isValid()) return;

    const formValues = this.form.value;
    let imageId;

    // upload image
    if (this.imageFile) {
      imageId = (await this.uploadService.upload([this.imageFile]))[0].id;
    }

    // get founder
    let founderId =
      this.checkFounder?.attributes.founders?.data[0]?.id ||
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
          image: this.userService.user?.image?.id,
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
        industry: null,
      });
    }
    // add company
    else {
      await this.companyService.create({
        ...formValues,
        founders: [founderId],
        logo: imageId,
        industries: [Number(formValues.industry)],
        industry: null,
        user: this.userService.user?.id,
      });
    }

    this.populateCompany = undefined;
    this.imgUrl = '';
    this.form.reset();
    this.companies = await this.getCompanies();
    this.editForm = false;

    // const companies = await this.companyService.getAll({
    //   filters: {
    //     founders: {
    //       user: {
    //         id: { $eq: this.userService.user?.id },
    //       },
    //     },
    //   },
    //   populate: {
    //     logo: {
    //       fields: ['url'],
    //     },
    //     industries: true,
    //     topics: true,
    //     founders: true,
    //   },
    // })
    // this.companies = companies.data

    this.toastr.success('Saved successfully');
    this.activeModal.close();

    // this.router.navigate(['profile-save']);

    // this.form.reset();
    // this.imageFile = null as any;
    // this.imgUrl = null as any;
  }

  async browsed(file: File) {
    this.imageFile = file;
  }
}
