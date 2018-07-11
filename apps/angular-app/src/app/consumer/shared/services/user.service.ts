import { PLATFORM_ID, Inject, Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { Util } from '../../../shared/util';
import { Constants } from '../../../shared/constants';

import { User } from '../../../shared/models/user';

import { BaseUserService } from '../../../shared/services/base.user.service';

/**
 * UserService
 */
@Injectable()
export class UserService extends BaseUserService {
    
    constructor(@Inject(PLATFORM_ID) platformId: Object) {
        super(platformId, 'lcuk', 'localStorage');
    }

    public get loginUser(): User {
        return <User>this.getLoginUser();
    }

    public set loginUser(user: User) {
        this.setLoginUser(user);
    }

    public addPoints = (points) => {
        var loginUser = this._loginUser as User;

        loginUser.Points += parseFloat(points);

        this.saveCustomerLocally(loginUser);
    }

    public setAllowReviewOrderCount = (value) => {
        var loginUser = this._loginUser as User;

        loginUser.AllowReviewOrderCount = parseInt(value);

        this.saveCustomerLocally(loginUser);
    }
}