import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SubscriberService } from '@services/data/subscriber.service';
import { hasError } from '@shared/utils/reactive-form';
import { ToastrService } from 'ngx-toastr';
import { SwiperOptions } from 'swiper';
import { SwiperComponent } from 'swiper/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  @ViewChild(SwiperComponent, { static: false }) swiper!: SwiperComponent;

  swiperConfig: SwiperOptions = {
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 0,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 60,
      },
      1440: {
        slidesPerView: 4,
        spaceBetween: 60,
      },
    },
  };

  subscribeForm = new FormGroup(
    {
      email: new FormControl<string>('', [Validators.email, Validators.required]),
    },
    { updateOn: 'submit' }
  );

  constructor(private subscriberService: SubscriberService, private toastr: ToastrService) {}

  ngOnInit(): void {}

  async subscribeSubmit() {
    if (this.subscribeForm.invalid) {
      this.subscribeForm.markAllAsTouched();
      return;
    }

    const formValues = this.subscribeForm.value;
    formValues.email = formValues.email?.toLowerCase();

    const duplicate = await this.subscriberService.getOne({
      filters: {
        email: { $eq: formValues.email || undefined },
      },
    });

    if (duplicate.data[0]?.id) {
      this.toastr.error('This email is already subscribed');
      return;
    }

    await this.subscriberService.create(formValues);
    this.toastr.success('Subscribed Successfully');
  }

  hasError(controlName: string) {
    return hasError(this.subscribeForm, controlName);
  }

  prevSlide() {
    this.swiper.swiperRef.slidePrev();
  }

  nextSlide() {
    this.swiper.swiperRef.slideNext();
  }
}
