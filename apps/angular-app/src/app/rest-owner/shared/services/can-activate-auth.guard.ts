import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRoute, Router } from '@angular/router';
import { UserService } from './user.service';

import { PathService as Path } from '../../../shared/services/path.service';

@Injectable()
export class CanActivateViaAuthGuard implements CanActivate {

    constructor(private userService: UserService, private router: Router) { }

    canActivate() {
        console.log(this.userService.loginUser);
        if (this.userService.isLoggedIn) {
            return true;
        }
        else {
            console.log('You need to login to access this page');
            this.router.navigate([`/${Path.RO.BASE}/${Path.RO.LOGIN}`]);
            return false;
        }
    }
}