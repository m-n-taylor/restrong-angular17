import { Component, OnInit, ViewChild, PLATFORM_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// RO Models
import { User } from '../shared/models/user';
import { ROAPIRequestData } from '../shared/models/ro-api-request-data';

// Shared Services
import { PathService as Path } from '../../shared/services/path.service';

// RO Services
import { UserService } from '../shared/services/user.service';
import { ROService } from '../shared/services/ro.service';
import { SharedDataService } from '../shared/services/shared-data.service';

// RO Shared Components
import { SavePaymentMethodModalComponent } from "../shared/components/save-payment-method-modal/save-payment-method-modal.component";
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';

// 3rd Party Libs
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { ROResponse } from "../shared/models/ro-response";

@Component({
    selector: 'ro-manage-payments',
    templateUrl: './manage-payments.component.html'
})
export class ManagePaymentsComponent implements OnInit {
    LOG_TAG = 'ManagePaymentsComponent =>';
    PAGINATION_ID = 'MANAGE_PAYMENTS_PAGINATION_ID';

    busy = false;

    paymentMethods = [];

    searchText = '';
    userLevel = -1;

    page = 1;
    pageSize: number;
    totalPages = 0;
    totalRows = 0;

    @ViewChild('savePaymentMethodModal') public savePaymentMethodModal: SavePaymentMethodModalComponent;
    @ViewChild('confirmModal') public confirmModal: ConfirmModalComponent;

    constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, private ROService: ROService, private router: Router, public userService: UserService, private toastr: ToastsManager, private sharedDataService: SharedDataService) {
        this.pageSize = this.sharedDataService.pageSizeList[this.PAGINATION_ID] || 25;
    }

    ngOnInit() {
        Util.log(this.LOG_TAG, 'Init()');

        if (isPlatformBrowser(this.platformId)) {

            if (this.userService.isAdmin) {
                this.initPage();
            }
            else {
                this.router.navigate([`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`]);
            }

        }
    }

    initPage = () => {
        this.loadData();
    }

    loadData = () => {
        Util.log(this.LOG_TAG, 'loadData()');

        this.busy = true;

        var requestData = new ROAPIRequestData();
        ROAPIRequestData.fillSearch(requestData, this.searchText);

        ROAPIRequestData.fillPage(requestData, this.page);
        ROAPIRequestData.fillPageSize(requestData, this.pageSize);

        requestData.ff = 'LGL528';

        // if (this.userLevel > -1)
        //     ROAPIRequestData.fillUserLevel(requestData, this.userLevel);

        this.ROService.getPaymentMethods(requestData).subscribe((response: ROResponse) => {
            if (response.Status == this.constants.STATUS_SUCCESS) {
                this.paymentMethods = response.Data;

                this.totalPages = response.Pagination.TotalPages;
                this.totalRows = response.Pagination.TotalRow;
            }

            this.busy = false;

            Util.log(this.LOG_TAG, 'getPaymentMethods', response);
        });
    }

    searchTextEnter = () => {
        this.page = 1;

        this.loadData();
    }

    openAddPaymentMethodModal = (user?: User) => {
        this.savePaymentMethodModal.open({
            user: user
        });
    }

    selectUser = (user?: User) => {
        if (!user.EmailVerified) {
            this.toastr.error(`You can't edit the user until his Email is verified`, 'Verify Email');
        }
        else {
            this.openAddPaymentMethodModal(user);
        }
    }

    savePaymentMethodModalEvents = (event) => {
        if (event.action == SavePaymentMethodModalComponent.EVENT_ADD_ITEM) {
            var user: User = event.data;

            this.paymentMethods.push(user);
        }

        Util.log(this.LOG_TAG, 'savePaymentMethodModalEvents', event);
    }

    toggleActiveUser = (user: User) => {
        Util.log(this.LOG_TAG, 'toggleActiveUser', user);

        this._saveUser(user);
    }

    private _saveUser = (user: User) => {
        Util.log(this.LOG_TAG, '_saveUser()');

        this.busy = true;

        this.ROService.saveUser({ user: user }).subscribe((response: any) => {
            this.busy = false;

            if (response.Status != this.constants.STATUS_SUCCESS) {
                this.toastr.error('Unable to update item, Please try later.', 'Error!');
            }

            Util.log(this.LOG_TAG, 'saveUser', response);
        });
    }

    deleteUser = (userIndex, user: User) => {
        this.confirmModal.open({ message: `Are you sure you want to delete ${user.Email}?` })
            .then((confirm) => {
                if (confirm) {

                    Util.log(this.LOG_TAG, 'deleteUser()');

                    this.busy = true;

                    var requestData = new ROAPIRequestData();

                    ROAPIRequestData.fillID(requestData, user.id);

                    this.ROService.deleteUser(requestData).subscribe((response: any) => {

                        this.busy = false;

                        if (response.Status == this.constants.STATUS_SUCCESS) {
                            this.paymentMethods.splice(userIndex, 1);
                        }
                        else {
                            this.toastr.error('Unable to delete item, Please try later.');
                        }

                        Util.log(this.LOG_TAG, 'deleteUser', response);
                    });
                }
            });
    }
}