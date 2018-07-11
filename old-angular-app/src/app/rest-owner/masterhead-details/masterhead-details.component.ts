import { Component, OnInit, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// Shared Components
import { BreadcrumbService } from '../../shared/components/breadcrumb/breadcrumb.module';

// RO Models
import { Restaurant } from '../shared/models/restaurant';
import { Head } from '../shared/models/head';
import { MasterHead } from '../shared/models/master-head';
import { ROAPIRequestData } from '../shared/models/ro-api-request-data';

// Shared Services
import { PathService as Path } from '../../shared/services/path.service';

// RO Services
import { ROService } from '../shared/services/ro.service';
import { HelperService } from '../shared/services/helper.service';

// RO Shared Components
import { SaveHeadModalComponent } from "../shared/components/save-head-modal/save-head-modal.component";
import { SaveDeliveryZoneModalComponent } from '../shared/components/save-delivery-zone-modal/save-delivery-zone-modal.component';
import { SaveScheduleModalComponent } from '../shared/components/save-schedule-modal/save-schedule-modal.component';
import { ConfirmModalComponent } from '../shared/components/confirm-modal/confirm-modal.component';

// 3rd Party Libs
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
    selector: 'ro-masterhead-details',
    templateUrl: './masterhead-details.component.html'
})
export class MasterHeadDetailsComponent implements OnInit {
    LOG_TAG = 'MasterHeadDetailsComponent => ';

    busy = false;
    isBrowser = false;

    masterHeadID: number;
    fireFlyID: string;

    restInfo = new Restaurant();
    masterHead: any = {};
    headList: any = [];

    @ViewChild('saveHeadModal') public saveHeadModal: SaveHeadModalComponent;
    @ViewChild('saveDeliveryZoneModal') public saveDeliveryZoneModal: SaveDeliveryZoneModalComponent;
    @ViewChild('saveScheduleModal') public saveScheduleModal: SaveScheduleModalComponent;
    @ViewChild('confirmModal') public confirmModal: ConfirmModalComponent;

    constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, private ROService: ROService, private router: Router, private location: Location, private activatedRoute: ActivatedRoute, private helperService: HelperService, private breadcrumbService: BreadcrumbService, private toastr: ToastsManager) {
    }

    ngOnInit() {
        Util.log(this.LOG_TAG, 'Init()');

        this.isBrowser = isPlatformBrowser(this.platformId);

        if (isPlatformBrowser(this.platformId)) {
            this.initPage();
        }
    }

    initPage = () => {
        Util.log(this.LOG_TAG, 'initPage()');

        this.activatedRoute.params.subscribe((params: any) => {
            Util.log(this.LOG_TAG, 'params', params);

            this.masterHeadID = params.id;
            this.fireFlyID = params.fireFlyID;

            this.loadData();
        });
    }

    loadData = () => {
        Util.log(this.LOG_TAG, 'loadData()');

        this.busy = true;

        var restInfoPromise = this.loadRestInfo();
        var masterHeadInfoPromise = this.loadMasterHeadInfo();
        var headListPromise = this.loadHeadList();

        Observable.forkJoin([restInfoPromise, masterHeadInfoPromise, headListPromise]).subscribe(response => {
            var restInfoResponse: any = response[0];
            this.restInfo = restInfoResponse.Data;

            var masterHeadInfoResponse: any = response[1];
            this.masterHead = masterHeadInfoResponse.Data;

            var headListResponse: any = response[2];
            this.headList = headListResponse.Data;

            this.breadcrumbService.addFriendlyNameForRoute(`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}/${this.fireFlyID}`, this.restInfo.Name);
            this.breadcrumbService.addFriendlyNameForRoute(`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}/${this.fireFlyID}/${Path.RO.MENU_DETAILS}/${this.masterHeadID}`, this.masterHead.Name)

            this.busy = false;

            Util.log(this.LOG_TAG, 'loadData => forkJoin', response, this.restInfo);
        });
    }

    public onHeadDragSuccess = (event) => {
        Util.log(this.LOG_TAG, 'onHeadDragSuccess', event, this.headList);

        this.helperService.calculateSortID(this.headList);

        this.saveHeadsSortOrder();
    }

    saveHeadsSortOrder = () => {
        this.busy = true;

        var requestData = new ROAPIRequestData();

        ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);

        var body = {
            SortDetails: []
        };

        for (var index in this.headList) {
            var head = this.headList[index];

            body.SortDetails.push({
                ID: head.ID,
                SortID: head.SortID,
            });
        }

        this.ROService.updateHeadSortOrder(requestData, body).subscribe(response => {
            this.busy = false;

            Util.log(this.LOG_TAG, 'updateHeadSortOrder', response);
        });
    }

    loadRestInfo = () => {
        var requestData = new ROAPIRequestData();

        ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);

        return this.ROService.getRestInfo(requestData);
    }

    loadMasterHeadInfo = () => {
        var requestData = new ROAPIRequestData();

        ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
        ROAPIRequestData.fillID(requestData, this.masterHeadID);

        return this.ROService.getMasterHeadInfo(requestData);
    }

    openSaveDeliveryZoneModal = (masterHead: MasterHead) => {
        this.saveDeliveryZoneModal.open({
            fireFlyID: this.fireFlyID,
            masterHeadID: masterHead.ID,
        });
    }

    openSaveScheduleModal = (masterHead: MasterHead) => {
        this.saveScheduleModal.open({
            fireFlyID: this.fireFlyID,
            masterHead: masterHead,
        });
    }

    toggleActiveMasterHead = (masterHead: MasterHead) => {
        Util.log(this.LOG_TAG, 'toggleActiveMasterHead', masterHead);

        this._saveMasterHead(masterHead);
    }

    private _saveMasterHead = (masterHead: MasterHead) => {
        Util.log(this.LOG_TAG, '_saveMasterHead()');

        this.busy = true;

        var data = {
            fireFlyID: this.fireFlyID,
            masterHead: masterHead
        };

        this.ROService.saveMasterHead(data).subscribe((response: any) => {

            this.busy = false;

            if (response.Status == this.constants.STATUS_SUCCESS) {
                this.toastr.success(`${masterHead.Name} updated successfully.`, 'Success!');
            }
            else {
                this.toastr.error('Unable to update item, Please try later.', 'Error!');
            }

            Util.log(this.LOG_TAG, 'updateMasterHead', response);
        });
    }

    loadHeadList = () => {
        var requestData = new ROAPIRequestData();

        ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
        ROAPIRequestData.fillMasterHeadID(requestData, this.masterHeadID);

        return this.ROService.getHeadList(requestData);
    }

    openSaveHeadModal = (head?: Head) => {
        this.saveHeadModal.open({
            fireFlyID: this.fireFlyID,
            masterHeadID: this.masterHeadID,
            head: head
        });
    }

    saveHeadModalEvents = (event) => {
        if (event.action == SaveHeadModalComponent.EVENT_ADD_ITEM) {
            var head: Head = event.data;

            this.headList.push(head);
        }

        Util.log(this.LOG_TAG, 'saveHeadModalEvents', event);
    }

    toggleActiveHead = (head: Head) => {
        Util.log(this.LOG_TAG, 'toggleActiveHead', head);

        this._saveHead(head);
    }

    private _saveHead = (head: Head) => {
        Util.log(this.LOG_TAG, '_saveHead()');

        this.busy = true;

        var data = {
            fireFlyID: this.fireFlyID,
            masterHeadID: this.masterHeadID,
            head: head
        };

        this.ROService.saveHead(data).subscribe((response: any) => {

            this.busy = false;

            if (response.Status == this.constants.STATUS_SUCCESS) {
                this.toastr.success(`${head.Name} updated successfully.`, 'Success!');
            }
            else {
                this.toastr.error('Unable to update item, Please try later.', 'Error!');
            }

            Util.log(this.LOG_TAG, 'saveHead', response);
        });
    }

    deleteHead = (headIndex, head: Head) => {
        this.confirmModal.open({ message: `Are you sure you want to delete ${head.Name}?` })
            .then((confirm) => {
                if (confirm) {

                    Util.log(this.LOG_TAG, 'deleteHead()');

                    this.busy = true;

                    var requestData = new ROAPIRequestData();

                    ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
                    ROAPIRequestData.fillID(requestData, head.ID);

                    this.ROService.deleteHead(requestData).subscribe((response: any) => {

                        this.busy = false;

                        if (response.Status == this.constants.STATUS_SUCCESS) {
                            this.headList.splice(headIndex, 1);
                        }
                        else {
                            this.toastr.error('Unable to delete item, Please try later.', 'Sorry!')
                        }

                        Util.log(this.LOG_TAG, 'deleteHead', response);
                    });
                }
            });
    }

    viewHeadDetails = (head) => {
        this.router.navigate([`${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`, this.fireFlyID, Path.RO.MENU_DETAILS, this.masterHeadID, Path.RO.CATEGORY_DETAILS, head.ID]);
    }

    goBack = () => {
        this.router.navigate([`${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`, this.fireFlyID]);

        Util.log(this.LOG_TAG, 'goBack');
    }
}
