import { Component, ChangeDetectionStrategy, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// Shared Models
import { QueryParams } from '../../shared/models/query-params';
import { OrderItem } from '../../shared/models/order-item';
import { OrderDetailsAPIRequestData } from '../../shared/models/order-details-api-request-data';
import { OrderItemsDetailsAPIRequestData } from '../../shared/models/order-items-details-api-request-data';
import { RateOrderItemAPIRequestData } from '../../shared/models/rate-order-item-api-request-data';

// Shared Services
import { AppService } from '../../shared/services/app.service';
import { UserService } from '../shared/services/user.service';
import { ShoppingCart } from '../../shared/services/shopping-cart.service';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.Emulated,
  selector: 'past-order-details',
  templateUrl: './past-order-details.component.html',
  providers: []
})
export class PastOrderDetailsComponent {

  busy: boolean;
  pastOrderID: number;
  pastOrder: any;
  pastOrderItems: Array<OrderItem> = [];

  constructor(public constants: Constants, public appService: AppService, private route: ActivatedRoute, private router: Router, public shoppingCart: ShoppingCart, private userService: UserService) {

    this.route.params.forEach((p) => {
      this.pastOrderID = p['id'];

      Util.log('slug params', p['id']);
    });

    this.route.queryParams.subscribe((params: any) => {
      Util.log('QueryParams', params);

      this.universalInit();
    });

  }

  universalInit() {
    Util.log('universalInit()');

    this.loadData();
  }

  loadData = () => {
    this.busy = true;

    var promises = [];

    // Past Order details
    var orderRequestData = new OrderDetailsAPIRequestData();
    orderRequestData.b = this.pastOrderID;
    OrderDetailsAPIRequestData.fillLoginUser(orderRequestData, this.userService.loginUser);

    promises.push(this.appService.getPastOrderDetails(orderRequestData));

    // Past Order Items Details
    var requestData = new OrderItemsDetailsAPIRequestData();
    requestData.a = this.pastOrderID;
    OrderItemsDetailsAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

    promises.push(this.appService.getPastOrderItemsDetails(requestData));

    // .subscribe(response => {
    //   this.pastOrderItems = response;

    //   this.busy = false;

    //   Util.log('getPastOrderDetails()', response);
    // });

    Observable.forkJoin(promises)
      .subscribe((data) => {
        this.busy = false;

        this.pastOrder = data[0];
        this.pastOrderItems = <Array<OrderItem>> data[1];

        Util.log('order details => completed', data);
      });
  }

  changeForkRating = (orderItem, rating) => {
    orderItem.CustomerRating = rating;

    Util.log('orderItem', orderItem);

    // User can submit, if he change any rating
    //vm.canSubmit = true;

    //$log.debug('fork Rating', orderItem, rating);
  }

  submitReview = () => {
    this.busy = true;

    var reviewPromises = [];

    for (var i in this.pastOrderItems) {
      var orderItem = this.pastOrderItems[i];

      if (Util.isDefined(orderItem.CustomerRating) && orderItem.CustomerRating > 0) {

        var requestData = new RateOrderItemAPIRequestData();

        RateOrderItemAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);
        RateOrderItemAPIRequestData.fillOrderItem(requestData, orderItem);

        reviewPromises.push(this.appService.rateOrderItem(requestData));

        // .subscribe(response => {
        //   Util.log('rateOrderItem', response);
        // });

        // orderItem.CustomerComment = null;
        // orderItem.CustomerRating = null;

        //reviewPromises.push(AppService.rateOrderItem(request));
      }
    }

    Observable.forkJoin(reviewPromises)
      .subscribe((data) => {
        Util.log('submitReview => Completed', data);

        this.busy = false;

        var totalPoints = 0;

        // Add User Points
        for (var i in data) {
          var item: any = data[i];

          totalPoints += parseInt(item.AddedCustomerPoints);
        }

        this.userService.addPoints(totalPoints);

        // SharedData.addPoints(totalPoints);

        // PageData.setData({
        //   totalPoints: totalPoints,
        //   order: vm.order
        // });

        // $state.go('app.tab.reviewPoints');

        // $log.debug('all reviews done', data);
      });

    // $log.debug('submitReview');
  }

}
