import { NgModule } from '@angular/core';
import { CheckEmailComponent } from './routes/check-email/check-email.component';
import { CoWorkingSpacesComponent } from './routes/co-working-spaces/co-working-spaces.component';
// import { ComingSoonMessageComponent } from './routes/coming-soon/coming-soon-message/coming-soon-message.component';
// import { ComingSoonSignupComponent } from './routes/coming-soon/coming-soon-signup/coming-soon-signup.component';
// import { ComingSoonThanksComponent } from './routes/coming-soon/coming-soon-thanks/coming-soon-thanks.component';
import { CookiePolicyComponent } from './routes/cookie-policy/cookie-policy.component';
import { EventsComponent } from './routes/events/events.component';
import { FounderViewComponent } from './routes/founder-view/founder-view.component';
import { FoundersComponent } from './routes/founders/founders.component';
import { HomeComponent } from './routes/home/home.component';
import { InfluencersComponent } from './routes/influencers/influencers.component';
import { LoginComponent } from './routes/login/login.component';
import { LoginPopupComponent } from './routes/login-popup/login-popup.component';
import { ProfileSaveComponent } from './routes/profile-save/profile-save.component';
import { RegisterComponent } from './routes/register/register.component';
import { SettingComponent } from './routes/setting/setting.component';
import { StartupSaveComponent } from './routes/startup-save/startup-save.component';
import { StartupViewComponent } from './routes/startup-view/startup-view.component';
import { StartupsComponent } from './routes/startups/startups.component';
import { VerifedEmailComponent } from './routes/verifed-email/verifed-email.component';
import { VerifyEmailComponent } from './routes/verify-email/verify-email.component';
import { BlankLayoutComponent } from './layout/blank-layout/blank-layout.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { FounderDiscussionsComponent } from './routes/founder-view/founder-discussions/founder-discussions.component';
import { FounderDescriptionComponent } from './routes/founder-view/founder-description/founder-description.component';
import { FounderFansComponent } from './routes/founder-view/founder-fans/founder-fans.component';
import { FounderInvestorsComponent } from './routes/founder-view/founder-investors/founder-investors.component';
import { FounderWidgetsComponent } from './routes/founder-view/founder-widgets/founder-widgets.component';
import { NotificationComponent } from './routes/setting/notification/notification.component';
import { PasswordComponent } from './routes/setting/password/password.component';
import { ProfileComponent } from './routes/setting/profile/profile.component';
import { StartupDescriptionComponent } from './routes/startup-view/startup-description/startup-description.component';
import { StartupDiscussionsComponent } from './routes/startup-view/startup-discussions/startup-discussions.component';
import { StartupFansComponent } from './routes/startup-view/startup-fans/startup-fans.component';
import { StartupFoundersComponent } from './routes/startup-view/startup-founders/startup-founders.component';
import { StartupInvestorsComponent } from './routes/startup-view/startup-investors/startup-investors.component';
import { StartupWidgetsComponent } from './routes/startup-view/startup-widgets/startup-widgets.component';
import { CantFindBannerComponent } from './components/cant-find-banner/cant-find-banner.component';
import { EventCardComponent } from './components/event-card/event-card.component';
import { FilterComponent } from './components/filter/filter.component';
import { FilterTagsComponent } from './components/filter-tags/filter-tags.component';
import { FooterComponent } from './components/footer/footer.component';
import { FounderCardComponent } from './components/founder-card/founder-card.component';
import { InfluencerCardComponent } from './components/influencer-card/influencer-card.component';
import { LoadMoreComponent } from './components/load-more/load-more.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SorterComponent } from './components/sorter/sorter.component';
import { StartupCardComponent } from './components/startup-card/startup-card.component';
import { SubscriberComponent } from './components/subscriber/subscriber.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { SharedModule } from '@shared/shared.module';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { ClaimProfileSaveComponent } from './components/claim-profile-save/claim-profile-save.component';
import { CoWorkingSpaceCardComponent } from './components/co-working-space-card/co-working-space-card.component';
import { CommentComponent } from './components/comment/comment.component';
import { CopyrightComponent } from './components/copyright/copyright.component';
import { NotFoundComponent } from './components/error-pages/not-found/not-found.component';
import { V1RoutingModule } from './v1-routing.module';
import { NgRatingBarModule } from 'ng-rating-bar';
import { AutosizeModule } from 'ngx-autosize';
import { SwiperModule } from 'swiper/angular';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule, V1RoutingModule, SharedModule, NgOtpInputModule, NgxIntlTelInputModule, NgRatingBarModule, AutosizeModule, SwiperModule],
  declarations: [
    CheckEmailComponent,
    CoWorkingSpacesComponent,
    // ComingSoonMessageComponent,
    // ComingSoonSignupComponent,
    // ComingSoonThanksComponent,
    CookiePolicyComponent,
    EventsComponent,
    FounderViewComponent,
    FoundersComponent,
    FounderDescriptionComponent,
    FounderDiscussionsComponent,
    FounderFansComponent,
    FounderInvestorsComponent,
    FounderWidgetsComponent,
    HomeComponent,
    InfluencersComponent,
    LoginComponent,
    LoginPopupComponent,
    ProfileSaveComponent,
    RegisterComponent,
    SettingComponent,
    NotificationComponent,
    PasswordComponent,
    ProfileComponent,
    StartupSaveComponent,
    StartupViewComponent,
    StartupDescriptionComponent,
    StartupDiscussionsComponent,
    StartupFansComponent,
    StartupFoundersComponent,
    StartupInvestorsComponent,
    StartupWidgetsComponent,
    StartupsComponent,
    VerifedEmailComponent,
    VerifyEmailComponent,
    BlankLayoutComponent,
    MainLayoutComponent,
    CantFindBannerComponent,
    EventCardComponent,
    FilterComponent,
    FilterTagsComponent,
    FooterComponent,
    FounderCardComponent,
    InfluencerCardComponent,
    LoadMoreComponent,
    LoginFormComponent,
    NavbarComponent,
    SorterComponent,
    StartupCardComponent,
    SubscriberComponent,
    ClaimProfileSaveComponent,
    CoWorkingSpaceCardComponent,
    CommentComponent,
    CopyrightComponent,
    NotFoundComponent,
  ],
})
export class V1Module {}
