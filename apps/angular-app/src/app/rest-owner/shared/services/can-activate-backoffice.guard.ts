import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRoute, Router } from '@angular/router';
import { UserService } from './user.service';

import { PathService as Path } from '../../../shared/services/path.service';
import { Constants } from '../../../shared/constants';

@Injectable()
export class CanActivateBackofficeGuard implements CanActivate {

    constructor(private constants: Constants) {
    }

    canActivate() {
        return this.constants.APP_TYPE.indexOf(this.constants.APP_TYPE_BACKOFFICE) > -1;
    }
}