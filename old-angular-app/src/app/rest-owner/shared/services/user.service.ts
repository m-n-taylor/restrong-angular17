import { PLATFORM_ID, Inject, Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { Util } from '../../../shared/util';
import { Constants } from '../../../shared/constants';

import { User } from '../models/user';

import { BaseUserService } from '../../../shared/services/base.user.service';

/**
 * UserService
 */
@Injectable()
export class UserService extends BaseUserService {

    constructor( @Inject(PLATFORM_ID) platformId: Object, public constants: Constants) {
        super(platformId, 'lruk', 'localStorage');
    }

    public get loginUser(): User {
        return <User>this.getLoginUser();
    }

    public set loginUser(user: User) {
        this.setLoginUser(user);
    }

    public get isAdmin(): boolean {
        var adminRoles = [1, 2, this.constants.RO_USER_LEVEL_ADMIN];

        return Util.isDefined(this.loginUser) && (adminRoles.indexOf(this.loginUser.UserLevel) > -1);
    }

    public get isUser(): boolean {
        return Util.isDefined(this.loginUser); // && (this.loginUser.UserLevel == this.constants.RO_USER_LEVEL_ADMIN || this.loginUser.UserLevel == this.constants.RO_USER_LEVEL_USER)
    }

    public get isAgent(): boolean {
        return Util.isDefined(this.loginUser) && (this.loginUser.UserLevel == this.constants.RO_USER_LEVEL_AGENT_ADMIN || this.loginUser.UserLevel == this.constants.RO_USER_LEVEL_AGENT);
    }

    public acceptTerms = () => {
        this.loginUser.Terms = true;
        this.saveCustomerLocally(this.loginUser);
    }

    public setNotificationTone = (tone) => {
        this.loginUser.NotificationTone = tone;
        this.saveCustomerLocally(this.loginUser);
    }
}