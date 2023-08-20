import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, Renderer2 } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface IStyles {
  [key: string]: string;
}
export interface IConfig {
  img?: string;
  loaderStyles?: IStyles;
  imgStyles?: IStyles;
  hostStyles?: IStyles;
  percentStyles?: IStyles;
  // TODO AnimationOptions
  rotate?: {
    delay?: number;
    direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
    duration?: number;
    easing?: string;
    endDelay?: number;
    fill?: 'none' | 'forwards' | 'backwards' | 'both' | 'auto';
    id?: string;
    iterationStart?: number;
    iterations?: number;
  };
}

const initialConfig: IConfig = {
  // tslint:disable-next-line:max-line-length
  img: 'data:image/svg+xml;base64,PHN2ZyBjbGFzcz0ibGRzLXNwaW5uZXIiIHdpZHRoPSIzOXB4IiAgaGVpZ2h0PSIzOXB4IiAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIiBzdHlsZT0iYmFja2dyb3VuZDogbm9uZTsiPjxnIHRyYW5zZm9ybT0icm90YXRlKDAgNTAgNTApIj4gIDxyZWN0IHg9IjQ3LjUiIHk9Ii0zLjUiIHJ4PSIwLjk1MDAwMDAwMDAwMDAwMDEiIHJ5PSItMC4wNyIgd2lkdGg9IjUiIGhlaWdodD0iMjciIGZpbGw9IiNGOTc3NTYiPiAgICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJvcGFjaXR5IiB2YWx1ZXM9IjE7MCIga2V5VGltZXM9IjA7MSIgZHVyPSIxcyIgYmVnaW49Ii0wLjkxNjY2NjY2NjY2NjY2NjZzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSI+PC9hbmltYXRlPiAgPC9yZWN0PjwvZz48ZyB0cmFuc2Zvcm09InJvdGF0ZSgzMCA1MCA1MCkiPiAgPHJlY3QgeD0iNDcuNSIgeT0iLTMuNSIgcng9IjAuOTUwMDAwMDAwMDAwMDAwMSIgcnk9Ii0wLjA3IiB3aWR0aD0iNSIgaGVpZ2h0PSIyNyIgZmlsbD0iI0Y5Nzc1NiI+ICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9Im9wYWNpdHkiIHZhbHVlcz0iMTswIiBrZXlUaW1lcz0iMDsxIiBkdXI9IjFzIiBiZWdpbj0iLTAuODMzMzMzMzMzMzMzMzMzNHMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIj48L2FuaW1hdGU+ICA8L3JlY3Q+PC9nPjxnIHRyYW5zZm9ybT0icm90YXRlKDYwIDUwIDUwKSI+ICA8cmVjdCB4PSI0Ny41IiB5PSItMy41IiByeD0iMC45NTAwMDAwMDAwMDAwMDAxIiByeT0iLTAuMDciIHdpZHRoPSI1IiBoZWlnaHQ9IjI3IiBmaWxsPSIjRjk3NzU2Ij4gICAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ib3BhY2l0eSIgdmFsdWVzPSIxOzAiIGtleVRpbWVzPSIwOzEiIGR1cj0iMXMiIGJlZ2luPSItMC43NXMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIj48L2FuaW1hdGU+ICA8L3JlY3Q+PC9nPjxnIHRyYW5zZm9ybT0icm90YXRlKDkwIDUwIDUwKSI+ICA8cmVjdCB4PSI0Ny41IiB5PSItMy41IiByeD0iMC45NTAwMDAwMDAwMDAwMDAxIiByeT0iLTAuMDciIHdpZHRoPSI1IiBoZWlnaHQ9IjI3IiBmaWxsPSIjRjk3NzU2Ij4gICAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ib3BhY2l0eSIgdmFsdWVzPSIxOzAiIGtleVRpbWVzPSIwOzEiIGR1cj0iMXMiIGJlZ2luPSItMC42NjY2NjY2NjY2NjY2NjY2cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiPjwvYW5pbWF0ZT4gIDwvcmVjdD48L2c+PGcgdHJhbnNmb3JtPSJyb3RhdGUoMTIwIDUwIDUwKSI+ICA8cmVjdCB4PSI0Ny41IiB5PSItMy41IiByeD0iMC45NTAwMDAwMDAwMDAwMDAxIiByeT0iLTAuMDciIHdpZHRoPSI1IiBoZWlnaHQ9IjI3IiBmaWxsPSIjRjk3NzU2Ij4gICAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ib3BhY2l0eSIgdmFsdWVzPSIxOzAiIGtleVRpbWVzPSIwOzEiIGR1cj0iMXMiIGJlZ2luPSItMC41ODMzMzMzMzMzMzMzMzM0cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiPjwvYW5pbWF0ZT4gIDwvcmVjdD48L2c+PGcgdHJhbnNmb3JtPSJyb3RhdGUoMTUwIDUwIDUwKSI+ICA8cmVjdCB4PSI0Ny41IiB5PSItMy41IiByeD0iMC45NTAwMDAwMDAwMDAwMDAxIiByeT0iLTAuMDciIHdpZHRoPSI1IiBoZWlnaHQ9IjI3IiBmaWxsPSIjRjk3NzU2Ij4gICAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ib3BhY2l0eSIgdmFsdWVzPSIxOzAiIGtleVRpbWVzPSIwOzEiIGR1cj0iMXMiIGJlZ2luPSItMC41cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiPjwvYW5pbWF0ZT4gIDwvcmVjdD48L2c+PGcgdHJhbnNmb3JtPSJyb3RhdGUoMTgwIDUwIDUwKSI+ICA8cmVjdCB4PSI0Ny41IiB5PSItMy41IiByeD0iMC45NTAwMDAwMDAwMDAwMDAxIiByeT0iLTAuMDciIHdpZHRoPSI1IiBoZWlnaHQ9IjI3IiBmaWxsPSIjRjk3NzU2Ij4gICAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ib3BhY2l0eSIgdmFsdWVzPSIxOzAiIGtleVRpbWVzPSIwOzEiIGR1cj0iMXMiIGJlZ2luPSItMC40MTY2NjY2NjY2NjY2NjY3cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiPjwvYW5pbWF0ZT4gIDwvcmVjdD48L2c+PGcgdHJhbnNmb3JtPSJyb3RhdGUoMjEwIDUwIDUwKSI+ICA8cmVjdCB4PSI0Ny41IiB5PSItMy41IiByeD0iMC45NTAwMDAwMDAwMDAwMDAxIiByeT0iLTAuMDciIHdpZHRoPSI1IiBoZWlnaHQ9IjI3IiBmaWxsPSIjRjk3NzU2Ij4gICAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ib3BhY2l0eSIgdmFsdWVzPSIxOzAiIGtleVRpbWVzPSIwOzEiIGR1cj0iMXMiIGJlZ2luPSItMC4zMzMzMzMzMzMzMzMzMzMzcyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiPjwvYW5pbWF0ZT4gIDwvcmVjdD48L2c+PGcgdHJhbnNmb3JtPSJyb3RhdGUoMjQwIDUwIDUwKSI+ICA8cmVjdCB4PSI0Ny41IiB5PSItMy41IiByeD0iMC45NTAwMDAwMDAwMDAwMDAxIiByeT0iLTAuMDciIHdpZHRoPSI1IiBoZWlnaHQ9IjI3IiBmaWxsPSIjRjk3NzU2Ij4gICAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ib3BhY2l0eSIgdmFsdWVzPSIxOzAiIGtleVRpbWVzPSIwOzEiIGR1cj0iMXMiIGJlZ2luPSItMC4yNXMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIj48L2FuaW1hdGU+ICA8L3JlY3Q+PC9nPjxnIHRyYW5zZm9ybT0icm90YXRlKDI3MCA1MCA1MCkiPiAgPHJlY3QgeD0iNDcuNSIgeT0iLTMuNSIgcng9IjAuOTUwMDAwMDAwMDAwMDAwMSIgcnk9Ii0wLjA3IiB3aWR0aD0iNSIgaGVpZ2h0PSIyNyIgZmlsbD0iI0Y5Nzc1NiI+ICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9Im9wYWNpdHkiIHZhbHVlcz0iMTswIiBrZXlUaW1lcz0iMDsxIiBkdXI9IjFzIiBiZWdpbj0iLTAuMTY2NjY2NjY2NjY2NjY2NjZzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSI+PC9hbmltYXRlPiAgPC9yZWN0PjwvZz48ZyB0cmFuc2Zvcm09InJvdGF0ZSgzMDAgNTAgNTApIj4gIDxyZWN0IHg9IjQ3LjUiIHk9Ii0zLjUiIHJ4PSIwLjk1MDAwMDAwMDAwMDAwMDEiIHJ5PSItMC4wNyIgd2lkdGg9IjUiIGhlaWdodD0iMjciIGZpbGw9IiNGOTc3NTYiPiAgICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJvcGFjaXR5IiB2YWx1ZXM9IjE7MCIga2V5VGltZXM9IjA7MSIgZHVyPSIxcyIgYmVnaW49Ii0wLjA4MzMzMzMzMzMzMzMzMzMzcyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiPjwvYW5pbWF0ZT4gIDwvcmVjdD48L2c+PGcgdHJhbnNmb3JtPSJyb3RhdGUoMzMwIDUwIDUwKSI+ICA8cmVjdCB4PSI0Ny41IiB5PSItMy41IiByeD0iMC45NTAwMDAwMDAwMDAwMDAxIiByeT0iLTAuMDciIHdpZHRoPSI1IiBoZWlnaHQ9IjI3IiBmaWxsPSIjRjk3NzU2Ij4gICAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ib3BhY2l0eSIgdmFsdWVzPSIxOzAiIGtleVRpbWVzPSIwOzEiIGR1cj0iMXMiIGJlZ2luPSIwcyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiPjwvYW5pbWF0ZT4gIDwvcmVjdD48L2c+PC9zdmc+',
  loaderStyles: {
    position: 'absolute',
    left: '0',
    right: '0',
    top: '0',
    bottom: '0',
    background: 'rgba(255, 255, 255, 0.8)',
    'z-index': '999999',
    display: 'flex',
    'justify-content': 'center',
    'align-items': 'center',
  },
  imgStyles: {
    width: '30px',
  },
  percentStyles: {
    color: 'black',
    'font-size': '12px',
    position: 'absolute',
  },
  hostStyles: {
    position: 'relative',
  },
  rotate: {
    iterations: Infinity,
  },
};

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[loader]',
})
export class LoaderDirective implements AfterViewInit, OnDestroy {
  @Input()
  set loader(value: boolean | null | undefined) {
    this._loading$.next(value as any);
  }

  @Input()
  set loaderPercent(value: string) {
    this._percentage$.next(value);
  }

  private _element: HTMLElement;
  private _loaderElement!: HTMLDivElement;
  private _percentElement!: HTMLSpanElement;
  private _elementDefaultState!: { pointerEvents: string; disabled: boolean };
  private _loading$ = new ReplaySubject<boolean>();
  private _percentage$ = new ReplaySubject<string>();
  private _config: IConfig = initialConfig;

  constructor(el: ElementRef, private _renderer: Renderer2) {
    this._element = el.nativeElement;
  }

  ngAfterViewInit(): void {
    this._elementDefaultState = {
      pointerEvents: this._element.style.pointerEvents,
      disabled: (<any>this._element)?.disabled,
    };

    this._loading$.subscribe((value) => {
      if (!value) {
        // reset
        if (this._loaderElement) {
          this._toggleLoaderVisibility(false);
          this._toggleElementVisibility(true);
        }

        return;
      }

      if (!this._loaderElement) this._createLoader();

      this._toggleLoaderVisibility(true);
      this._toggleElementVisibility(false);
    });

    this._percentage$.pipe(filter(() => !!this._percentElement)).subscribe((value) => {
      this._renderer.setProperty(this._percentElement, 'innerHTML', value);
    });
  }

  ngOnDestroy(): void {
    // this._renderer.removeChild(this._element, this.loaderElement);
    this._loading$.complete();
    this._percentage$.complete();
  }

  private _createLoader(): void {
    const { hostStyles, loaderStyles, imgStyles, percentStyles, img, rotate } = initialConfig;

    const loaderEl: HTMLDivElement = this._renderer.createElement('div');
    const percentEl: HTMLSpanElement = this._renderer.createElement('span');
    const imgEl: HTMLImageElement = this._renderer.createElement('img');

    imgEl.animate([{ transform: 'rotate(360deg)' }, { transform: 'rotate(0deg)' }], rotate);

    this._renderer.appendChild(this._element, loaderEl);
    this._renderer.appendChild(loaderEl, imgEl);
    this._renderer.appendChild(loaderEl, percentEl);

    this._setStyles(this._element, hostStyles as any);
    this._setStyles(loaderEl, loaderStyles as any);
    this._setStyles(imgEl, imgStyles as any);
    this._setStyles(percentEl, percentStyles as any);

    this._renderer.setAttribute(imgEl, 'src', img as any);

    this._loaderElement = loaderEl;
    this._percentElement = percentEl;
  }

  private _toggleElementVisibility(enable: boolean): void {
    const { disabled, pointerEvents } = this._elementDefaultState;

    this._renderer.setProperty(this._element, 'disabled', enable ? false : disabled);
    this._setStyles(this._element, { 'pointer-events': enable ? 'auto' : pointerEvents || 'none' });
  }

  private _toggleLoaderVisibility(enable: boolean): void {
    this._setStyles(this._loaderElement, { display: enable ? 'flex' : 'none' });
  }

  private _setStyles(element: HTMLElement, styles: { [key: string]: string }): void {
    Object.keys(styles).forEach((key: any) => {
      this._renderer.setStyle(element, key, styles[key]);
    });
  }
}
