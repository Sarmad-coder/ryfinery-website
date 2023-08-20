import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '@env';

@Pipe({
  name: 'imageUrl',
})
export class ImageUrlPipe implements PipeTransform {
  transform(path: any): unknown {
    if (!path) return '';

    return environment.uploadUrl + path;
  }
}
