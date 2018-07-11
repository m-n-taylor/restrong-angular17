import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { Constants } from "../../shared/constants";
import { SharedDataService } from "../../shared/services/shared-data.service";
import { Util } from "../../shared/util";
import { UserAPIRequestData } from "../../shared/models/user-api-request-data";
import { AppService } from "../../shared/services/app.service";
import { UserService } from "../shared/services/user.service";
import { WriteReviewModalComponent } from '../shared/components/write-review-modal/write-review-modal.component';
import { ThankYouPointsModalComponent } from '../shared/components/thank-you-points-modal/thank-you-points-modal.component';

@Component({
    selector: 'profile-orders',
    templateUrl: './profile-orders.component.html',

})
export class ProfileOrdersComponent {
    LOG_TAG = 'ProfileOrdersComponent';

    searchText = '';
    pastOrders = new Array<any>();

    busy = false;

    @ViewChild('writeReviewModal') writeReviewModal: WriteReviewModalComponent;
    @ViewChild('thankYouPointsModal') thankYouPointsModal: ThankYouPointsModalComponent;

    constructor(public constants: Constants, public sharedDataService: SharedDataService, public userService: UserService, public appService: AppService, private router: Router) {
    }

    ngOnInit() {
        Util.log(this.LOG_TAG, 'ngOnInit');

        this.loadData();
    }

    loadData = () => {
        Util.log(this.LOG_TAG, 'loadData');

        this.busy = true;

        var requestData = new UserAPIRequestData();

        UserAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

        this.appService.getPastOrders(requestData).subscribe(response => {
            this.pastOrders = response;

            this.busy = false;

            Util.log(this.LOG_TAG, 'getPastOrders()', response);
        });
    }

    openOrderDetails = (pastOrder) => {
        this.router.navigate(['past-orders', pastOrder.ID]);
    }

    openOrderChat = (pastOrder) => {
        this.router.navigate(['past-orders/chat', pastOrder.OrderNumber]);
    }

    writeReview = (pastOrder) => {
        this.writeReviewModal.open({ pastOrder: pastOrder })
            .then((data) => {

                if (Util.isDefined(data)) {
                    this.thankYouPointsModal.open({
                        totalPoints: data.totalPoints,
                        pastOrder: pastOrder
                    });

                    Util.log(this.LOG_TAG, 'writeReview Data', data);
                }

            });
        Util.log(this.LOG_TAG, 'writeReview()');
    }
}