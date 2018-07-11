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
import { AddUserModalComponent } from '../shared/components/add-user-modal/add-user-modal.component';
import { ConfirmModalComponent } from '../shared/components/confirm-modal/confirm-modal.component';

// 3rd Party Libs
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
    selector: 'ro-users',
    templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {
    LOG_TAG = 'UsersComponent =>';
    PAGINATION_ID = 'USERS_PAGINATION_ID';

    busy = false;

    userList = [];

    searchText = '';
    userLevel = -1;

    page = 1;
    pageSize: number;
    totalPages = 0;
    totalRows = 0;

    @ViewChild('addUserModal') public addUserModal: AddUserModalComponent;
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

        if (this.userLevel > -1)
            ROAPIRequestData.fillUserLevel(requestData, this.userLevel);

        this.ROService.getUserList(requestData).subscribe(response => {
            this.userList = response.Data;

            this.totalPages = response.Pagination.TotalPages;
            this.totalRows = response.Pagination.TotalRow;

            this.busy = false;

            Util.log(this.LOG_TAG, 'getRestList', response);
        });
    }

    searchTextEnter = () => {
        this.page = 1;

        this.loadData();
    }

    openAddUserModal = (user?: User) => {
        this.addUserModal.open({
            user: user
        });
    }

    selectUser = (user?: User) => {
        if (!user.EmailVerified) {
            this.toastr.error(`You can't edit the user until his Email is verified`, 'Verify Email');
        }
        else {
            this.openAddUserModal(user);
        }
    }

    addUserModalEvents = (event) => {
        if (event.action == AddUserModalComponent.EVENT_ADD_ITEM) {
            var user: User = event.data;

            this.userList.push(user);
        }

        Util.log(this.LOG_TAG, 'addUserModalEvents', event);
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
                            this.userList.splice(userIndex, 1);
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