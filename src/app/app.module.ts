import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { ToastrModule } from 'ngx-toastr';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { LoadingBarModule } from '@ngx-loading-bar/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ImportComponent } from './import/import.component';

import { UserService } from '@services/data/user.service';
import { AuthInterceptor } from '@services/auth-interceptor.service';
import { SharedModule } from '@shared/shared.module';
import { CustomRouteReuseStrategy } from '@shared/CustomRouteReuseStrategy';
import { RouteReuseStrategy } from '@angular/router';
import { CountryService } from '@services/data/country.service';

function initFactory(userService: UserService, countryService: CountryService) {
  return async () => {
    await userService.loadUser();
    await countryService.loadCountries();
  };
}

@NgModule({
  declarations: [AppComponent, ImportComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserAnimationsModule,
    AppRoutingModule,
    SharedModule,
    ToastrModule.forRoot({ timeOut: 2500 }),
    LoadingBarModule,
    LoadingBarHttpClientModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initFactory,
      deps: [UserService, CountryService],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    { provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy },
    // { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true },
    // { provide: ErrorHandler, useClass: ErrorHandlerService},
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
