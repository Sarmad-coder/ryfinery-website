import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@shared/guards/auth.guard';
import { FalseGuard } from '@shared/guards/false.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { LoginComponent } from './routes/auth/login/login.component';
import { RegisterComponent } from './routes/auth/register/register.component';
import { VerifedEmailComponent } from './routes/auth/verifed-email/verifed-email.component';
import { VerifyEmailComponent } from './routes/auth/verify-email/verify-email.component';
import { ComingSoonMessageComponent } from './routes/coming-soon/coming-soon-message/coming-soon-message.component';
import { ComingSoonSignupComponent } from './routes/coming-soon/coming-soon-signup/coming-soon-signup.component';
import { ComingSoonThanksComponent } from './routes/coming-soon/coming-soon-thanks/coming-soon-thanks.component';
import { CompaniesComponent } from './routes/companies/companies.component';
import { CompanyComponent } from './routes/company/company.component';
import { CookiePolicyComponent } from './routes/cookie-policy/cookie-policy.component';
import { FoundersComponent } from './routes/founders/founders.component';
import { HomeComponent } from './routes/home/home.component';
import { MarketComponent } from './routes/market/market.component';
import { MarketsComponent } from './routes/markets/markets.component';
import { SettingsComponent } from './routes/settings/settings.component';
import { CompareCompanyComponent } from './routes/compare-company/compare-company.component';

const routes: Routes = [
  // {
  //   path: '',
  //   redirectTo: 'home',
  //   pathMatch: 'full',
  // },
  { path: '', component: HomeComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'companies', component: CompaniesComponent },
      { path: 'company/:id/:name', component: CompanyComponent },
      { path: 'compareCompany/:id1/:id2', component: CompareCompanyComponent },
      { path: 'peoples', component: FoundersComponent },
      { path: 'markets', component: MarketsComponent },
      { path: 'market/:id/:name', component: MarketComponent },
      { path: 'cookie-policy', component: CookiePolicyComponent },
      { path: 'settings', component: SettingsComponent },
    ],
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent, canActivate: [FalseGuard] },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'email-login', component: VerifedEmailComponent },
  { path: 'coming-soon-message', component: ComingSoonMessageComponent },
  { path: 'coming-soon-signup', component: ComingSoonSignupComponent },
  { path: 'coming-soon-thanks', component: ComingSoonThanksComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class V2RoutingModule {}
