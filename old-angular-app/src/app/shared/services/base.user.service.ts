import { isPlatformBrowser } from '@angular/common';

import { Util } from '../util';
import { Constants } from '../constants';

import { BaseUser } from '../models/base-user';

/**
 * UserService
 */
export class BaseUserService {
    LOGIN_USER_KEY = '';

    private platformId: Object;

    protected _loginUser: BaseUser;

    public get isLoggedIn(): boolean {
        return Util.isDefined(this._loginUser);
    }

    constructor(platformId: Object, loginUserKey: string, private storageType: string) {
        this.platformId = platformId;
        this.LOGIN_USER_KEY = loginUserKey;
    }

    protected getLoginUser = (): BaseUser  => {
        // If its a browser then try to load user from session storage if it exists
        if (isPlatformBrowser(this.platformId)) {
            if (typeof this._loginUser === 'undefined' || !this._loginUser) {

                var user = window[this.storageType].getItem(this.LOGIN_USER_KEY);

                if (typeof user !== 'undefined' && user) {
                    this._loginUser = JSON.parse(user);
                }
            }
        }

        return this._loginUser;
    }

    protected setLoginUser = (user: BaseUser) => {
        if (user == null) {
            window[this.storageType].removeItem(this.LOGIN_USER_KEY);
        }
        else {
            this.saveCustomerLocally(user);
        }

        this._loginUser = user;
    }

    protected saveCustomerLocally = (user: BaseUser) => {
        window[this.storageType].setItem(this.LOGIN_USER_KEY, JSON.stringify(user));
    }
}