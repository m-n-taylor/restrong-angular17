import { Component, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from "@angular/router";
import { Constants } from "../../shared/constants";
import { SharedDataService } from "../../shared/services/shared-data.service";
import { Util } from "../../shared/util";
import { UserAPIRequestData } from "../../shared/models/user-api-request-data";
import { AppService } from "../../shared/services/app.service";
import { UserService } from "../shared/services/user.service";
import { UserAddress } from "../../shared/models/user-address";
import { ChangeAddressModalComponent } from "../shared/components/change-address-modal/change-address-modal.component";

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import { UserAddressAPIRequestData } from "../../shared/models/user-address-api-request-data";
import { APIRequestData } from "../../shared/models/api-request-data";
import { SoldOutActionAPIRequestData } from "../../shared/models/soldout-action-api-request-data";
import { ToastsManager } from "ng2-toastr/ng2-toastr";
import { InputService } from "../../shared/services/input.service";
import { ChangePasswordAPIRequestData } from "../../shared/models/change-password-api-request-data";
import { ChangePassword } from "../../shared/models/change-password";

@Component({
    selector: 'profile-settings',
    templateUrl: './profile-settings.component.html',
    
})
export class ProfileSettingsComponent {
    LOG_TAG = 'ProfileSettingsComponent';

    userAddresses = new Array<UserAddress>();
    selectedUserAddress = new UserAddress();

    soldOutActions = new Array<any>();
    selectedSoldOutAction: any = {};

    showCurrentPassword = false;
    showNewPassword = false;
    showNewConfirmPassword = false;
    userPassword = new ChangePassword();

    busy = false;
    busySoldOutAction = false;
    busyChangePassword = false;

    constructor(public constants: Constants, public sharedDataService: SharedDataService, public userService: UserService, public appService: AppService, private router: Router, private toastr: ToastsManager, private changeDetectorRef: ChangeDetectorRef, public input: InputService) {
        // this.userPassword.oldPassword = 'test1234';
        // this.userPassword.newPassword = 'test1234';
        // this.userPassword.confirmPassword = 'test1234';
    }

    ngOnInit() {
        Util.log(this.LOG_TAG, 'ngOnInit', this.userService);

        this.loadData();
    }

    loadData = () => {
        Util.log(this.LOG_TAG, 'loadData');

        this.busy = true;

        var promiseList = [];

        var requestData = new UserAPIRequestData();
        promiseList.push(this.appService.getUserAddresses(requestData));

        promiseList.push(this.appService.getAppSettings(requestData));

        Observable.forkJoin(promiseList).subscribe((responseList: any) => {
            var userAddressResponse = responseList[0];
            this.userAddresses = userAddressResponse;

            var appSettingsResponse = responseList[1];
            this.soldOutActions = appSettingsResponse.SoldOutActions;

            var userSoldOutAction = this.userService.loginUser.SoldOutAction;

            if (Util.isDefined(userSoldOutAction)) {
                var temp = this.soldOutActions.filter(s => s.ID == userSoldOutAction.ID);

                if (temp.length > 0) {
                    var item = temp[0];

                    this.selectedSoldOutAction = item;
                }
            }

            this.busy = false;

            Util.log(this.LOG_TAG, 'promiseList()', responseList);
        });

        // var requestData = new UserAPIRequestData();

        // UserAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

        // this.appService.getPastOrders(requestData).subscribe(response => {
        //     this.pastOrders = response;

        //     this.busy = false;

        //     Util.log(this.LOG_TAG, 'getPastOrders()', response);
        // });
    }

    changeSoldOutAction = (soldOutAction) => {
        Util.log(this.LOG_TAG, 'changeSoldOutAction()');

        this.selectedSoldOutAction = soldOutAction;

        this.busySoldOutAction = true;

        var requestData = new SoldOutActionAPIRequestData();
        requestData.a = this.selectedSoldOutAction.ID;

        this.appService.updateSoldOutAction(requestData)
            .subscribe(response => {

                if (Util.isDefined(response) && Util.isDefined(response.Code)) {
                    if (response.Code == 'CUSTOMER_SETTINGS_UPDATED') {
                        this.userService.loginUser.SoldOutAction = this.selectedSoldOutAction;

                        this.toastr.success('Successfully updated Sold Out Action.', 'Success!');
                    }
                }

                this.busySoldOutAction = false;

                Util.log('changeSoldOutAction()', response);
            });
    }

    toggleShowCurrentPassword = () => {
        this.showCurrentPassword = !this.showCurrentPassword;
    }

    toggleShowNewPassword = () => {
        this.showNewPassword = !this.showNewPassword;
    }

    toggleShowNewConfirmPassword = () => {
        this.showNewConfirmPassword = !this.showNewConfirmPassword;
    }

    save = (form) => {
        Util.log(this.LOG_TAG, 'save()', form);

        this.busyChangePassword = true;

        var requestData = new ChangePasswordAPIRequestData();
        ChangePasswordAPIRequestData.fillUserPassword(requestData, this.userPassword);
        ChangePasswordAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

        this.appService.changePassword(requestData).subscribe(response => {

            if (Util.isDefined(response) && Util.isDefined(response.Code) && response.Code == 'PASSWORD_UPDATED') {
                this.toastr.success('Password updated successfully.', 'Success!');
            }
            else {
                this.toastr.error('Unable to update password.', 'Error!');
            }

            form.resetForm();

            this.userPassword = new ChangePassword();

            this.busyChangePassword = false;

            Util.log('response', response);
        });
    }
}