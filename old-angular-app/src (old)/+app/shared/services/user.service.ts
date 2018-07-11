import { Injectable } from '@angular/core';
import { isBrowser } from 'angular2-universal';

import { Util } from '../util';

import { User } from '../models/user';

/**
 * UserService
 */
@Injectable()
export class UserService {
    private static LOGIN_USER_KEY = 'LOGIN_USER_KEY';

    private _loginUser: User;
    public get loginUser(): User {

        // If its a browser then try to load user from session storage if it exists
        if (isBrowser) {
            if (typeof this._loginUser === 'undefined' || !this._loginUser) {

                var user = sessionStorage.getItem(UserService.LOGIN_USER_KEY);

                if (typeof user !== 'undefined' && user) {
                    this._loginUser = JSON.parse(user);
                }
            }
        }

        return this._loginUser;
    }
    public set loginUser(user: User) {
        if (user == null) {
            sessionStorage.removeItem(UserService.LOGIN_USER_KEY);
        }
        else {
            this.saveCustomerLocally(user);
        }

        this._loginUser = user;
    }

    private saveCustomerLocally = (user: User) => {
        sessionStorage.setItem(UserService.LOGIN_USER_KEY, JSON.stringify(user));
    }

    public get isLoggedIn() : string {
        return Util.isDefined(this.loginUser);
    }

    public addPoints = (points) => {
        this._loginUser.Points += parseFloat(points);

        this.saveCustomerLocally(this._loginUser);
    }

    constructor() {
        window['userService'] = this;
    }
}