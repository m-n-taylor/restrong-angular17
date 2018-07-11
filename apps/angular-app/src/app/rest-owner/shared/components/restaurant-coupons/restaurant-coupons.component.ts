import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

// Shared Helpers
import { Constants } from "../../../../shared/constants";
import { Util } from '../../../../shared/util';

// RO Models
import { ROAPIRequestData } from '../../models/ro-api-request-data';
import { Coupon } from '../../models/coupon';

// RO Services
import { ROService } from '../../services/ro.service';

// RO Shared Components
import { MenuItemPreviewModalComponent } from '../menu-item-preview-modal/menu-item-preview-modal.component';
import { SaveCouponModalComponent } from '../save-coupon-modal/save-coupon-modal.component';

import { ConfirmModalComponent } from "../../../../shared/components/confirm-modal/confirm-modal.component";

// 3rd Party Libs
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { Restaurant } from '../../models/restaurant';

@Component({
    selector: 'restaurant-coupons',
    templateUrl: './restaurant-coupons.component.html',
    
})
export class RestaurantCouponsComponent {
    LOG_TAG = 'RestaurantCouponsComponent =>';

    busy = false;
    coupons = new Array<Coupon>();
    searchText = '';
    rest: Restaurant;

    @Input() fireFlyID: string;

    @ViewChild('confirmModal') public confirmModal: ConfirmModalComponent;
    @ViewChild('saveCouponModal') public saveCouponModal: SaveCouponModalComponent;

    constructor(private ROService: ROService, public constants: Constants, private toastr: ToastsManager) {
        Util.log(this.LOG_TAG, 'constructor', this.fireFlyID);
    }

    clickoutside = () => {

    }

    ngOnInit() {
        Util.log(this.LOG_TAG, 'loadCouponsTab()');

        this.loadData(true);
    }

    loadRestInfo = () => {
        var requestData = new ROAPIRequestData();

        ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);

        return this.ROService.getRestInfo(requestData);
    }

    loadCouponList = () => {
        var requestData = new ROAPIRequestData();

        requestData.ff = this.fireFlyID;

        if (Util.isDefined(this.searchText) && this.searchText.length > 0) {
            requestData.search = this.searchText;
        }

        return this.ROService.getCouponList(requestData);
    }

    loadData = (firstTime: boolean) => {
        this.busy = true;

        var promiseList = [];

        promiseList.push(this.loadCouponList());

        if (firstTime) {
            promiseList.push(this.loadRestInfo());
        }

        Observable.forkJoin(promiseList).subscribe((responseList: Array<any>) => {
            if (responseList[0].Status == this.constants.STATUS_SUCCESS) {
                this.coupons = responseList[0].Data;
            }

            if (firstTime) {
                this.rest = responseList[1].Data;
            }

            this.busy = false;

            Util.log(this.LOG_TAG, 'loadData', responseList);
        });
    }

    searchTextEnter = () => {
        this.loadData(false);
    }

    openSaveCouponModal = (coupon?: Coupon) => {
        this.saveCouponModal.open({
            fireFlyID: this.fireFlyID,
            coupon: coupon,
            rest: this.rest
        });
    }

    saveCouponModalEvents = (event) => {
        if (event.action == SaveCouponModalComponent.EVENT_ADD_ITEM) {
            var coupon: Coupon = event.data;

            this.coupons.unshift(coupon);
        }

        Util.log(this.LOG_TAG, 'saveCouponModalEvents', event);
    }

    saveCoupon = (coupon: Coupon) => {
        coupon.busy = true;

        var data = {
            fireFlyID: this.fireFlyID,
            coupon: coupon
        };

        this.ROService.saveCoupon(data).subscribe(response => {
            coupon.busy = false;

            if (response.Status == this.constants.STATUS_SUCCESS) {
                this.toastr.success('Coupon saved successfully.', 'Success!');
            }

            Util.log(this.LOG_TAG, 'save', response);
        }, (err) => {
            coupon.busy = false;

            this.toastr.error('Unable to perform operation at the moment. Please try later.', 'Oops!');
        });

        Util.log(this.LOG_TAG, 'saveCoupon', coupon);
    }

    deleteCoupon = (couponIndex, coupon: Coupon) => {
        this.confirmModal.open({ message: `Are you sure you want to ${coupon.RedeemCount == 0 ? 'delete' : 'archive'} ${coupon.CouponCode}?` })
            .then((confirm) => {
                if (confirm) {
                    Util.log(this.LOG_TAG, 'deleteCoupon()');

                    coupon.busyDelete = true;

                    var requestData = new ROAPIRequestData();

                    ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
                    ROAPIRequestData.fillID(requestData, coupon.ID);

                    this.ROService.deleteCoupon(requestData).subscribe((response: any) => {

                        coupon.busyDelete = false;

                        if (response.Status == this.constants.STATUS_SUCCESS) {
                            this.coupons.splice(couponIndex, 1);
                        }
                        else {
                            this.toastr.error('Unable to delete item, Please try later.', 'Error!');
                        }

                        Util.log(this.LOG_TAG, 'deleteCoupon', response);
                    });
                }
            });
    }
}