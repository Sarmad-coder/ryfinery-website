import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoginPopupService {
  private _show: boolean = false;

  public get show(): boolean {
    return this._show;
  }

  public set show(v: boolean) {
    this._show = v;
  }

  constructor() {}
}
