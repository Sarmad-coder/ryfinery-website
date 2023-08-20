import { Component, Renderer2 } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { UserPermissionService } from '@services/data/user-permission.service';
import { UserService } from '@services/data/user.service';
import { getClosestTailwindColor } from '@shared/utils/get-closest-tailwind-color';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'ryfinery-website';

  constructor(private router: Router, private renderer: Renderer2, private userService: UserService, private userPermissionService: UserPermissionService) {
    // console.log('CLOSEST COLOR:', getClosestTailwindColor('#344054'));
    // this.router.events.subscribe((evt) => {
    //   if (evt instanceof NavigationEnd) {
    //     // trick the Router into believing it's last link wasn't previously loaded
    //     this.router.navigated = false;
    //     // if you need to scroll back to top, here is the right place
    //     window.scrollTo(0, 0);
    //   }
    // });
    // set text direction to body
    // this.renderer.setAttribute(document.body, 'dir', 'rtl');
  }
}
