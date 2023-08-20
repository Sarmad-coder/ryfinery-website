import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env';
import { BaseDataService } from '@shared/BaseDataService';
import { firstValueFrom } from 'rxjs';
import * as uuid from 'uuid';

@Injectable({ providedIn: 'root' })
export class UploadService extends BaseDataService {
  constructor(http: HttpClient) {
    super('upload/files', http);
  }

  upload(files: File[]) {
    const formData = new FormData();

    for (const file of files) {
      formData.append('files', file, uuid.v4());
    }

    return firstValueFrom(this.http.post<any[]>(environment.apiUrl + 'upload', formData));
  }
}
