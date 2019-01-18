import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRoute, Router } from '@angular/router';
import { UserService } from './user.service';

import { PathService as Path } from '../../../shared/services/path.service';

@Injectable()
export class CanActivateUserTermsGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router) { }

  canActivate() {
    if (this.userService.isLoggedIn && this.userService.loginUser.Terms) {
      return true;
    }
    else {
      //TODO: remove in production
      console.log('You need to be Accept terms to access this page');
      
      if (this.router.url == '/') {
        this.router.navigate([`/${Path.RO.BASE}/${Path.RO.TERMS_CONDITIONS}`]);
      }
      return false;
    }
  }
}
// update: 2025-07-31T20:16:02.344841

// update: 2025-07-31T20:21:08.182607

// update: 2025-07-31T20:26:17.751322
