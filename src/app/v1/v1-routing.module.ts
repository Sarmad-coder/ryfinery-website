import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@shared/guards/auth.guard';
import { UnAuthGuard } from '@shared/guards/unauth.guard';
import { NotFoundComponent } from './components/error-pages/not-found/not-found.component';
import { BlankLayoutComponent } from './layout/blank-layout/blank-layout.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
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
import { ProfileSaveComponent } from './routes/profile-save/profile-save.component';
import { RegisterComponent } from './routes/register/register.component';
import { NotificationComponent } from './routes/setting/notification/notification.component';
import { PasswordComponent } from './routes/setting/password/password.component';
import { ProfileComponent } from './routes/setting/profile/profile.component';
import { SettingComponent } from './routes/setting/setting.component';
import { StartupSaveComponent } from './routes/startup-save/startup-save.component';
import { StartupViewComponent } from './routes/startup-view/startup-view.component';
import { StartupsComponent } from './routes/startups/startups.component';
import { VerifedEmailComponent } from './routes/verifed-email/verifed-email.component';
import { VerifyEmailComponent } from './routes/verify-email/verify-email.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '',
    component: MainLayoutComponent,
    // canActivate: [AuthGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'startups', component: StartupsComponent },
      { path: 'founders', component: FoundersComponent },
      { path: 'influencers', component: InfluencersComponent },
      { path: 'co-working-spaces', component: CoWorkingSpacesComponent },
      { path: 'events', component: EventsComponent },
      { path: 'startup-view/:id', component: StartupViewComponent, canActivate: [AuthGuard] },
      { path: 'founder-view/:id', component: FounderViewComponent, canActivate: [AuthGuard] },
      { path: 'profile-save', component: ProfileSaveComponent },
      { path: 'startup-save', component: StartupSaveComponent },
      { path: 'cookie-policy', component: CookiePolicyComponent },
      { path: 'verify-email', component: VerifyEmailComponent },
      { path: 'email-login', component: VerifedEmailComponent },
      { path: 'check-email', component: CheckEmailComponent },
      {
        path: 'setting',
        component: SettingComponent,
        children: [
          {
            path: '',
            redirectTo: 'profile',
            pathMatch: 'full',
          },
          { path: 'profile', component: ProfileComponent },
          { path: 'password', component: PasswordComponent },
          { path: 'notification', component: NotificationComponent },
        ],
      },
    ],
  },
  {
    path: '',
    component: BlankLayoutComponent,
    canActivate: [UnAuthGuard],
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
    ],
  },
  // { path: 'coming-soon-message', component: ComingSoonMessageComponent },
  // { path: 'coming-soon-signup', component: ComingSoonSignupComponent },
  // { path: 'coming-soon-thanks', component: ComingSoonThanksComponent },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class V1RoutingModule {}
