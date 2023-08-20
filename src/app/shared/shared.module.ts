import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ImageUrlPipe } from './pipes/image-url.pipe';
import { NgSelectModule } from '@ng-select/ng-select';
import { SlugifyPipe } from './pipes/slugify.pipe';
import { UrlPipe } from './pipes/url.pipe';
import { LoaderDirective } from './directives/loader.directive';

const COMPONENTS = [];
const PIPES = [ImageUrlPipe, SlugifyPipe, UrlPipe];
const DIRECTIVES = [LoaderDirective];

@NgModule({
  declarations: [...COMPONENTS, ...PIPES, ...DIRECTIVES],
  imports: [HttpClientModule, FormsModule, ReactiveFormsModule, NgSelectModule, AngularSvgIconModule.forRoot(), NgbModule],
  exports: [HttpClientModule, FormsModule, ReactiveFormsModule, NgSelectModule, AngularSvgIconModule, NgbModule, ...COMPONENTS, ...PIPES, ...DIRECTIVES],
  providers: [NgbActiveModal],
})
export class SharedModule {}
