import { isPlatformBrowser } from '@angular/common';

import { Util } from '../util';
import { Constants } from '../constants';

import { BaseUser } from '../models/base-user';

import { Md5 } from 'ts-md5/dist/md5';
import { BaseStorageService } from './base-storage.service';

/**
 * UserService
 */
export abstract class BaseUserService extends BaseStorageService {
    protected _loginUser: BaseUser;

    public get isLoggedIn(): boolean {
        return Util.isDefined(this._loginUser);
    }

    constructor(platformId: Object, loginUserKey: string, storageType: string) {
        super(platformId, loginUserKey, storageType);

        this.platformId = platformId;
    }

    protected getLoginUser = (): BaseUser => {
        // If its a browser then try to load user from session storage if it exists
        if (isPlatformBrowser(this.platformId)) {
            if (typeof this._loginUser === 'undefined' || !this._loginUser) {
                var loginUser = this.getLocally();

                if (loginUser) {
                    this._loginUser = loginUser;
                }
            }
        }

        return this._loginUser;
    }

    protected setLoginUser = (user: BaseUser) => {
        if (user == null) {
            this.removeLocally();
        }
        else {
            this.saveCustomerLocally(user);
        }

        this._loginUser = user;
    }

    protected saveCustomerLocally = (user: BaseUser) => {
        this.saveLocally(user);
    }
}