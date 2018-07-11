import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// RO Models
import { User } from '../shared/models/user';
import { ROAPIRequestData } from '../shared/models/ro-api-request-data';
import { LoginAPIRequestData } from '../shared/models/login-api-request-data';

// Shared Services
import { InputService } from '../../shared/services/input.service';
import { PathService as Path } from '../../shared/services/path.service';

// RO Services
import { ROService } from '../shared/services/ro.service';
import { UserService } from '../shared/services/user.service';
import { SharedDataService } from '../shared/services/shared-data.service';

// 3rd Party Libs
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
    selector: 'ro-login',
    templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
    LOG_TAG = 'LoginComponent =>';

    loginUser = new User();

    isBrowser: boolean;

    LOGIN_TYPE_PASSWORD = 1;
    LOGIN_TYPE_AUTHCODE = 2;

    busy = false;
    showPassword = false;

    envToggleLive: boolean;
    enabledBetaFeatures: boolean;

    constructor(@Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, private ROService: ROService, private userService: UserService, private router: Router, private route: ActivatedRoute, public sharedDataService: SharedDataService, public input: InputService, private toastr: ToastsManager) {
        this.isBrowser = isPlatformBrowser(this.platformId);

        this.envToggleLive = Constants.ENV == Constants.ENV_LIVE;
        this.enabledBetaFeatures = this.constants.ENABLE_BETA_FEATURES;
    }

    envToggleChange = () => {
        Util.log(this.LOG_TAG, 'envToggleChange()', this.envToggleLive);

        localStorage.setItem('app_env', this.envToggleLive ? Constants.ENV_LIVE : Constants.ENV_DEV);

        window.location.reload();
    }

    enableBetaFeaturesChange = () => {
        Util.log(this.LOG_TAG, 'enableBetaFeaturesChange()', this.enabledBetaFeatures);

        localStorage.setItem('app_enable_beta_features', `${this.enabledBetaFeatures}`);

        window.location.reload();
    }

    ngOnInit() {
        Util.log(this.LOG_TAG, 'Init()', this.userService.loginUser);

        if (this.isBrowser) {
            this.route.queryParams.subscribe((params: any) => {
                Util.log(this.LOG_TAG, 'queryParams()', params);

                if (Util.isDefined(params.session) && params.session == 'expired') {
                    this.toastr.warning('Please login again', 'Session expired!');
                }

                var data: any = {};
                var loginType = null;

                if (this.userService.isLoggedIn) {
                    data.email = this.userService.loginUser.Email;
                    data.authcode = this.userService.loginUser.AuthCode;

                    loginType = this.LOGIN_TYPE_AUTHCODE;
                }
                else if (params.email && params.authcode) {
                    loginType = this.LOGIN_TYPE_AUTHCODE;
                }
                else {
                    loginType = this.LOGIN_TYPE_PASSWORD;
                }

                this.initPage(loginType, data);
            });
        }
    }

    initPage = (loginType: number, data) => {
        if (loginType == this.LOGIN_TYPE_AUTHCODE) {
            this.loginWithAuthCode(data.email, data.authcode);
        }
        else {
            this.sharedDataService.loginUserInfo = this.sharedDataService.loginUserInfo || {};
            this.loginUser.Email = this.sharedDataService.loginUserInfo.Email;
            this.loginUser.Password = this.sharedDataService.loginUserInfo.Password;
            this.sharedDataService.loginUserInfo = {};

            if (Util.isDefined(this.loginUser.Email) && this.loginUser.Email.length > 0 && Util.isDefined(this.loginUser.Password) && this.loginUser.Password.length > 0) {
                this.login();
            }
        }
    }

    toggleShowPassword = () => {
        this.showPassword = !this.showPassword;
    }

    login = () => {
        Util.log(this.LOG_TAG, 'login()', this.loginUser);

        this.busy = true;

        var request = new LoginAPIRequestData();

        LoginAPIRequestData.fillUser(request, this.loginUser);

        this.ROService.login(request).subscribe(this.onLoginComplete);
    }

    loginWithAuthCode = (email, authcode) => {
        Util.log(this.LOG_TAG, 'loginWithAuthCode()', this.loginUser);

        this.busy = true;

        var request = new ROAPIRequestData();

        request.e = email;
        request.authcode = authcode;

        this.ROService.loginWithAuthCode(request).subscribe(this.onLoginComplete);
    }

    onLoginComplete = (response) => {
        this.busy = false;

        if (response.Status == this.constants.STATUS_SUCCESS) {
            var user = response.Data;

            // user.NotificationTone = user.NotificationTone || this.constants.DEFAULT_NOTIFICATION_TONE;
            this.userService.loginUser = user;

            if (this.userService.loginUser.Terms) {
                this.router.navigate([`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`]);
            }
            else {
                this.router.navigate([`/${Path.RO.BASE}/${Path.RO.TERMS_CONDITIONS}`]);
            }

        }
        else {
            this.userService.loginUser = null;

            if (response.Code == 'ERR_EMAIL_UNVERIFIED') {
                this.toastr.error('Email is not verified, Please verify it and try again.', 'Error!');
            }
            else {
                this.toastr.error('Invalid Username/password', 'Error!');
            }
        }

        Util.log(this.LOG_TAG, 'response', response);
    }

    signup = () => {
        this.router.navigate([`/${Path.RO.BASE}/${Path.RO.SIGNUP}`]);
    }
}