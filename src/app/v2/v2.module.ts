import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { FooterComponent } from './components/footer/footer.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SearchFieldComponent } from './components/search-field/search-field.component';
import { UserMenuComponent } from './components/user-menu/user-menu.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { ComingSoonMessageComponent } from './routes/coming-soon/coming-soon-message/coming-soon-message.component';
import { ComingSoonSignupComponent } from './routes/coming-soon/coming-soon-signup/coming-soon-signup.component';
import { ComingSoonThanksComponent } from './routes/coming-soon/coming-soon-thanks/coming-soon-thanks.component';
import { CompaniesComponent } from './routes/companies/companies.component';
import { HomeComponent } from './routes/home/home.component';
import { V2RoutingModule } from './v2-routing.module';
import { NgChartsModule } from 'ng2-charts';
import { SettingsComponent } from './routes/settings/settings.component';
import { CopyrightComponent } from './components/copyright/copyright.component';
import { FoundersComponent } from './routes/founders/founders.component';
import { LoginComponent } from './routes/auth/login/login.component';
import { CompanyComponent } from './routes/company/company.component';
import { RegisterComponent } from './routes/auth/register/register.component';
import { VerifyEmailComponent } from './routes/auth/verify-email/verify-email.component';
import { CookiePolicyComponent } from './routes/cookie-policy/cookie-policy.component';
import { VerifedEmailComponent } from './routes/auth/verifed-email/verifed-email.component';
import { CompanySettingComponent } from './routes/settings/company-setting/company-setting.component';
import { FounderSettingComponent } from './routes/settings/founder-setting/founder-setting.component';
import { ImageUploadComponent } from './components/image-upload/image-upload.component';
import { ChartTabsComponent } from './components/chart-tabs/chart-tabs.component';
import { SocialLoginComponent } from './components/social-login/social-login.component';
import { GrowthComponent } from './components/growth/growth.component';
import { MarketComponent } from './routes/market/market.component';
import { MarketsComponent } from './routes/markets/markets.component';
import { ProfileSettingComponent } from './routes/settings/profile-setting/profile-setting.component';
import { SimilarCompaniesComponent } from './components/similar-companies/similar-companies.component';
import { MostFollowedCompaniesComponent } from './components/most-followed-companies/most-followed-companies.component';
import { TeamSettingComponent } from './routes/settings/team-setting/team-setting.component';
import { NotificationSettingComponent } from './routes/settings/notification-setting/notification-setting.component';
import { BillingSettingComponent } from './routes/settings/billing-setting/billing-setting.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { PageTitleComponent } from './components/page-title/page-title.component';
import { CountrySelectComponent } from './components/country-select/country-select.component';
import { CompareCompanyComponent } from './routes/compare-company/compare-company.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, V2RoutingModule, SharedModule, NgChartsModule,FormsModule],
  declarations: [
    FooterComponent,
    NavbarComponent,
    SearchFieldComponent,
    UserMenuComponent,
    CompaniesComponent,
    HomeComponent,
    ComingSoonMessageComponent,
    ComingSoonSignupComponent,
    ComingSoonThanksComponent,
    CompanyComponent,
    MainLayoutComponent,
    SettingsComponent,
    CopyrightComponent,
    FoundersComponent,
    LoginComponent,
    RegisterComponent,
    VerifyEmailComponent,
    VerifedEmailComponent,
    CookiePolicyComponent,
    CompanySettingComponent,
    FounderSettingComponent,
    ImageUploadComponent,
    MarketComponent,
    ChartTabsComponent,
    SocialLoginComponent,
    GrowthComponent,
    MarketsComponent,
    ProfileSettingComponent,
    SimilarCompaniesComponent,
    MostFollowedCompaniesComponent,
    TeamSettingComponent,
    NotificationSettingComponent,
    BillingSettingComponent,
    BreadcrumbComponent,
    PageTitleComponent,
    CountrySelectComponent,
    CompareCompanyComponent,
  ],
})
export class V2Module {}
