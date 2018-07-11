import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRoute, Router } from '@angular/router';
import { UserService } from './user.service';

import { PathService as Path } from '../../../shared/services/path.service';

@Injectable()
export class CanActivateUserGuard implements CanActivate {

    constructor(private userService: UserService, private router: Router) {
    }

    canActivate() {
        if (this.userService.isUser) {
            return true;
        }
        else {
            if (this.userService.isAgent) {
                this.router.navigate([`/${Path.RO.BASE}/${Path.RO.CHAT}`]);
            }
            return false;
        }
    }
}