import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import { Constants } from "../../shared/constants";
import { Util } from "../../shared/util";
import { SharedDataService } from "../../shared/services/shared-data.service";
import { UserAPIRequestData } from "../../shared/models/user-api-request-data";
import { AppService } from "../../shared/services/app.service";
import { OrderItemsDetailsAPIRequestData } from "../../shared/models/order-items-details-api-request-data";
import { OrderDetailsAPIRequestData } from "../../shared/models/order-details-api-request-data";
import { OrderItem } from "../../shared/models/order-item";
import { UserService } from "../shared/services/user.service";
import { WriteReviewModalComponent } from '../shared/components/write-review-modal/write-review-modal.component';
import { ThankYouPointsModalComponent } from '../shared/components/thank-you-points-modal/thank-you-points-modal.component';

@Component({
    selector: 'profile-order-details',
    templateUrl: './profile-order-details.component.html',

})
export class ProfileOrderDetailsComponent {
    LOG_TAG = 'ProfileOrderDetailsComponent';

    pastOrderID: number;
    pastOrder: any = {};
    pastOrderItems = new Array<OrderItem>();
    busy = false;

    couponDiscount = 0;

    @ViewChild('writeReviewModal') writeReviewModal: WriteReviewModalComponent;
    @ViewChild('thankYouPointsModal') thankYouPointsModal: ThankYouPointsModalComponent;

    constructor(public constants: Constants, public sharedDataService: SharedDataService, public userService: UserService, public appService: AppService, private router: Router, private route: ActivatedRoute) {
    }

    ngOnInit() {
        Util.log(this.LOG_TAG, 'ngOnInit');

        this.route.params.subscribe((params: any) => {
            Util.log('QueryParams', params);

            this.pastOrderID = params.id;

            this.loadData();
        });
    }

    loadData = () => {
        this.busy = true;

        var promises = [];

        // Past Order details
        var orderRequestData = new OrderDetailsAPIRequestData();
        orderRequestData.o = this.pastOrderID;
        OrderDetailsAPIRequestData.fillLoginUser(orderRequestData, this.userService.loginUser);

        promises.push(this.appService.getPastOrders(orderRequestData));

        // Past Order Items Details
        var requestData = new OrderItemsDetailsAPIRequestData();
        requestData.a = this.pastOrderID;
        OrderItemsDetailsAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

        promises.push(this.appService.getPastOrderItemsDetails(requestData));

        Observable.forkJoin(promises)
            .subscribe((response: any) => {
                this.busy = false;

                var pastOrderResponse = response[0];

                if (pastOrderResponse.length > 0) {
                    this.pastOrder = pastOrderResponse[0];
                }

                this.pastOrderItems = response[1];

                Util.log(this.LOG_TAG, 'loadData', response);
            });
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

    goBack = () => {
        this.router.navigate(['past-orders']);
    }
}