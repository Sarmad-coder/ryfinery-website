import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
})
export class ImageUploadComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  @Input() src!: string;
  @Output() browsed = new EventEmitter<File>();

  acceptTypes = ['jpg', 'jpeg', 'png', 'webp'].map((x) => `image/${x}`).join(',');

  constructor(private toastr: ToastrService) {}

  ngOnInit(): void {}

  async browse(files: FileList | undefined | null) {
    // if no file browsed
    if (!files?.length) return;

    const file = files[0];

    if (!this.isFileImage(file)) {
      this.toastr.error('image format is not supported');
      return;
    }

    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string); // base64 Image src
    });

    this.src = base64;
    this.browsed.emit(file);
  }

  fileInputChange(e: Event) {
    const files = (e.currentTarget as HTMLInputElement)?.files;
    this.browse(files);
  }

  drop(e: DragEvent) {
    const files = e.dataTransfer?.files;
    this.browse(files);
  }

  triggerBrowse() {
    const fileInput: HTMLInputElement = this.fileInput?.nativeElement;
    fileInput.click();
  }

  private isFileImage(file: File): boolean {
    return file.type.split('/')[0] === 'image';
  }
}
