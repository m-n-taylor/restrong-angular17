import { Component, OnInit, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// RO Shared Components
import { OperaModalComponent } from '../shared/components/opera-modal/opera-modal.component';


// RO Models
import { User } from '../shared/models/user';
import { Restaurant } from '../shared/models/restaurant';
import { LoginAPIRequestData } from '../shared/models/login-api-request-data';
import { ROAPIRequestData } from '../shared/models/ro-api-request-data';

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
    selector: 'ro-signup',
    templateUrl: './signup.component.html'
})
export class SignupComponent implements OnInit {
    LOG_TAG = 'SignupComponent =>';

    busy = false;
    busyRegSelectedRest = false;
    busyVerifyEmail = false;
    busyAutoComplete = false;

    isBrowser = false;

    progressWidth = 0;

    captchaCode = '';
    verifyEmailToken = '';

    private _step: string;
    public get step(): string {
        return this._step;
    }
    public set step(v: string) {
        this._step = v;

        if (this._step == this.STEP_ZIPCODE) {
            this.progressWidth = 0;
        }
        else if (this._step == this.STEP_SUCCESS || this._step == this.STEP_SENT_EMAIL) {
            this.progressWidth = 100;
        }
        else {
            this.progressWidth = 50;
        }
    }

    STEP_ZIPCODE = 'STEP_ZIPCODE';
    STEP_REST_LIST = 'STEP_REST_LIST';
    STEP_NEW_REST = 'STEP_NEW_REST';
    STEP_EMAIL = 'STEP_EMAIL';
    STEP_VERIFY_PHONE = 'STEP_VERIFY_PHONE';
    STEP_VERIFY_CODE = 'STEP_VERIFY_CODE';
    STEP_SUCCESS = 'STEP_SUCCESS';
    STEP_SET_PASSWORD = 'STEP_SET_PASSWORD';
    STEP_SENT_EMAIL = 'STEP_SENT_EMAIL';
    STEP_VERIFY_EMAIL = 'STEP_VERIFY_EMAIL';
    STEP_ERROR_LINK = 'STEP_ERROR_LINK';

    zipCode = '';
    restName = '';
    restPhone = '';
    ownerEmail = '';
    opera = true;
    verifyCode = '';
    isCaptchaVerified = false;

    newPassword = '';
    newConfirmPassword = '';

    authCode = '';
    userID: number;

    showRestAutoComplete = false;

    restList = new Array<Restaurant>();
    selectedRest: Restaurant;
    newRest = new Restaurant();

    @ViewChild('operaModal') public operaModal: OperaModalComponent;

    constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, private ROService: ROService, private userService: UserService, private router: Router, public input: InputService, public sharedDataService: SharedDataService, private route: ActivatedRoute, private toastr: ToastsManager) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    ngOnInit() {
        Util.log(this.LOG_TAG, 'Init()');

        if (this.isBrowser) {
            this.initPage();
        }
    }

    initPage = () => {
        Util.log(this.LOG_TAG, 'initPage()');

        this.route.queryParams.subscribe((params: any) => {
            if (Util.isDefined(params.fireFlyID)) {
                var email = params.email || '';
                var opera = params.opera || '';
                var token = params.token || '';

                this.searchRestByFireFlyID(params.fireFlyID, email, opera, token);
            }
            else {
                this.step = this.STEP_ZIPCODE;
            }
            Util.log(this.LOG_TAG, params);
        });
    }

    captchaVerified(captchaResponse) {
        if (Util.isDefined(captchaResponse) && captchaResponse.length > 0) {
            this.isCaptchaVerified = true;
            this.captchaCode = captchaResponse;
        }
        else {
            this.isCaptchaVerified = false;
            this.captchaCode = '';
        }

        Util.log(this.LOG_TAG, 'setVerified()', captchaResponse);
    }

    continueStepZipCode = () => {
        this.step = this.STEP_REST_LIST;
    }

    continueStepRestList = () => {
        this.step = this.STEP_EMAIL;
    }

    restNotInList = () => {
        this.step = this.STEP_NEW_REST;
    }

    continueStepNewRest = () => {
        this.registerNewRest();
    }

    searchRestByFireFlyID = (fireFlyID, email, opera, token) => {
        Util.log('searchRestByFireFlyID', fireFlyID, email, opera);

        // Search Rest based on fireFlyID
        var requestData = new ROAPIRequestData();

        requestData.ff = fireFlyID;

        this.ROService.searchRegRest(requestData).subscribe(response => {
            // If rest found then, make it selected
            if (response.Status == this.constants.STATUS_SUCCESS && response.Data.length > 0) {
                this.selectedRest = response.Data[0];

                this.verifyEmailToken = token;
                this.opera = opera.toLowerCase() == 'true' ? true : false;

                // if email is passed then, and register it
                this.ownerEmail = email || '';

                if (Util.isEmail(email)) {
                    this.restPhone = this.selectedRest.Phone;

                    this.step = this.STEP_VERIFY_PHONE;
                }
                else {
                    this.continueStepRestList();
                }
            }
            else {
                if (response.Status == this.constants.STATUS_ERROR && response.Code == 'REST_ALREADY_REGISTERED') {
                    this.toastr.error('Restaurant is already registered. Please login to your account', 'Restaurant already registered');

                    this.router.navigate([`/${Path.RO.BASE}/${Path.RO.LOGIN}`]);
                }
                else {
                    this.step = this.STEP_ERROR_LINK;
                }
            }

            Util.log(this.LOG_TAG, 'searchRegRest', response);
        });
    }

    continueStepEmail = () => {
        this.busyVerifyEmail = true;

        var requestData = new ROAPIRequestData();

        requestData.ff = this.selectedRest.FireFlyID;
        requestData.e = this.ownerEmail;
        requestData.opera = this.opera;

        this.ROService.verifyRestEmail(requestData).subscribe(response => {
            this.step = this.STEP_VERIFY_EMAIL;

            this.busyVerifyEmail = false;

            Util.log(this.LOG_TAG, 'verifyRestEmail', response);
        });
    }

    continueStepVerifyPhone = () => {
        this.registerSelectedRest();
    }

    continueStepVerifyCode = (form) => {
        Util.log(this.LOG_TAG, 'continueStepVerifyCode()', form);
        this.verifyRestCode(form);
    }

    resendCode = () => {
        Util.log(this.LOG_TAG, 'resendCode()');

        this.busy = true;

        var requestData = new ROAPIRequestData();

        requestData.ff = this.selectedRest.FireFlyID;
        requestData.e = this.ownerEmail;

        this.ROService.resendCode(requestData).subscribe(response => {
            this.busy = false;

            Util.log(this.LOG_TAG, 'resendCode', response);
        });
    }

    continueStepNewPassword = () => {
        Util.log(this.LOG_TAG, 'continueStepNewPassword()');

        this.busy = true;

        var requestData = new ROAPIRequestData();

        requestData.uid = this.userID;
        requestData.authcode = this.authCode;
        requestData.np = this.newPassword;

        this.ROService.changePassword(requestData).subscribe(response => {
            this.busy = false;

            this.step = this.STEP_SUCCESS;

            Util.log(this.LOG_TAG, 'changePassword', response);
        });
    }

    continueStepSuccess = () => {
        this.sharedDataService.loginUserInfo = {};

        this.sharedDataService.loginUserInfo.Email = this.ownerEmail;
        this.sharedDataService.loginUserInfo.Password = this.newPassword || '';

        this.router.navigate([`/${Path.RO.BASE}/${Path.RO.LOGIN}`]);
    }

    continueStepSentEmail = () => {
        this.router.navigate([`/${Path.RO.BASE}/${Path.RO.LOGIN}`]);
    }

    searchRestTextChange = () => {
        this.selectedRest = null;

        this.searchRest();
    }

    searchRest = () => {
        Util.log(this.LOG_TAG, 'searchRest()', this.zipCode);

        this.showRestAutoComplete = true;
        this.busyAutoComplete = true;

        var requestData = new ROAPIRequestData();

        requestData.z = this.zipCode;
        requestData.rn = this.restName;

        this.ROService.searchRegRest(requestData).subscribe(response => {
            this.restList = response.Data;
            this.busyAutoComplete = false;

            Util.log(this.LOG_TAG, 'searchRegRest', response);
        });
    }

    restNameBlur = () => {
        setTimeout(() => {
            this.showRestAutoComplete = false;
        }, 200);
    }

    chooseRest = (rest: Restaurant) => {
        Util.log(this.LOG_TAG, 'chooseRest()', rest);

        this.selectedRest = rest;
        this.restName = this.selectedRest.Name;
    }

    registerSelectedRest = () => {
        Util.log(this.LOG_TAG, 'registerSelectedRest()');

        this.busyRegSelectedRest = true;

        var requestData = new ROAPIRequestData();

        requestData.ff = this.selectedRest.FireFlyID;
        requestData.e = this.ownerEmail;
        requestData.opera = this.opera;
        requestData.token = this.verifyEmailToken;
        requestData.x = this.captchaCode;

        this.ROService.registerRest(requestData).subscribe(response => {
            if (response.Status == this.constants.STATUS_SUCCESS) {
                this.step = this.STEP_VERIFY_CODE;
            }
            else {
                this.step = this.STEP_ERROR_LINK;
            }

            this.busyRegSelectedRest = false;

            Util.log(this.LOG_TAG, 'registerRest', response);
        });
    }

    registerNewRest = () => {
        Util.log(this.LOG_TAG, 'registerNewRest()');

        this.busy = true;

        var requestData = new ROAPIRequestData();

        requestData.rn = this.newRest.Name;
        requestData.a = this.newRest.Address_1;
        requestData.z = this.newRest.ZipCode;
        requestData.n = this.newRest.customerName;
        requestData.e = this.newRest.Email;
        requestData.p = this.newRest.Phone;
        requestData.opera = this.opera;

        this.ROService.registerNewRest(requestData).subscribe(response => {
            if (response.Status == this.constants.STATUS_SUCCESS) {
                this.restPhone = this.newRest.Phone;

                this.step = this.STEP_SENT_EMAIL;
            }

            this.busy = false;

            Util.log(this.LOG_TAG, 'registerNewRest', response);
        });
    }

    verifyRestCode = (form) => {
        Util.log(this.LOG_TAG, 'verifyPhone()');

        this.busy = true;

        var requestData = new ROAPIRequestData();

        requestData.ff = this.selectedRest.FireFlyID;
        requestData.e = this.ownerEmail;
        requestData.c = this.verifyCode;

        this.ROService.verifyRestCode(requestData).subscribe(response => {
            if (response.Status == this.constants.STATUS_SUCCESS) {

                if (response.Code == 'MSG_NEW_USER') {
                    this.authCode = response.AuthCode;
                    this.userID = response.UserID;
                    this.step = this.STEP_SET_PASSWORD;
                }
                else {
                    this.step = this.STEP_SUCCESS;
                }

            }
            else {
                form.controls.verifyCode.setErrors({ asyncInvalid: true });
            }

            this.busy = false;

            Util.log(this.LOG_TAG, 'verifyRestCode', response);
        });
    }

    openOperaModal = () => {
        Util.log(this.LOG_TAG, 'openOperaModal');

        this.operaModal.open();
    }
}
