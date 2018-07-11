import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRoute, Router } from '@angular/router';
import { Constants } from '../constants';

@Injectable()
export class RestrictOnMobileAppAuthGuard implements CanActivate {

    constructor(private constants: Constants) { }

    canActivate() {
        return this.constants.APP_TYPE.indexOf(this.constants.APP_TYPE_MOBILE) === -1;
    }
}