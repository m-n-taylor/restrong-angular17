import { Component, ViewChild, PLATFORM_ID, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// Shared Models
import { QueryParams } from '../../shared/models/query-params';
import { UserAddress } from '../../shared/models/user-address';
import { UserPayment } from '../../shared/models/user-payment';
import { UserAPIRequestData } from '../../shared/models/user-api-request-data';
import { OrderAPIRequestData } from '../../shared/models/order-api-request-data';
import { OrderItemAPIRequestData } from '../../shared/models/order-item-api-request-data';
import { SearchMenuAPIRequestData } from '../../shared/models/search-menu-api-request-data';
import { UserPaymentAPIRequestData } from '../../shared/models/user-payment-api-request-data';

// Shared Services
import { AppService } from '../../shared/services/app.service';
import { UserService } from '../shared/services/user.service';
import { SharedDataService } from '../../shared/services/shared-data.service';
import { ShoppingCart } from '../../shared/services/shopping-cart.service';

// Shared Components
import { ChooseUserPaymentModalComponent } from '../../shared/components/choose-user-payment-modal/choose-user-payment-modal.component';

// CR Shared Components
import { ChangeAddressModalComponent } from "../shared/components/change-address-modal/change-address-modal.component";
import { ManageUserAddressesModalComponent } from '../shared/components/manage-user-addresses-modal/manage-user-addresses-modal.component';

declare var google;

@Component({
  selector: 'checkout',
  templateUrl: './checkout.component.html',
  providers: []
})
export class CheckoutComponent {
  busy = false;

  queryParams: QueryParams;

  userPayments = new Array<UserPayment>();
  userAddresses = new Array<UserAddress>();

  selectedUserPayment: UserPayment;

  orderPromiseList = [];
  orderItemsPromiseList = [];
  payOrderPromiseList = [];

  @ViewChild('changeAddressModal') public changeAddressModal: ChangeAddressModalComponent;
  @ViewChild('manageUserAddressesModal') public manageUserAddressesModal: ManageUserAddressesModalComponent;
  @ViewChild('chooseUserPaymentModal') public chooseUserPaymentModal: ChooseUserPaymentModalComponent;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private userService: UserService, public constants: Constants, public sharedDataService: SharedDataService, public appService: AppService, private route: ActivatedRoute, private router: Router, public shoppingCart: ShoppingCart) {

  }

  ngOnInit() {
    this.queryParams = new QueryParams();

    if (isPlatformBrowser(this.platformId)) {

      this.route.queryParams
        .subscribe((params: any) => {

          QueryParams.fillParams(this.queryParams, params);

          Util.log('QueryParams', params);

          this.initPage();

        });

    }

    Util.log('ngOnInit()');
  }

  initPage() {
    Util.log('initPage()');

    if (this.userService.isLoggedIn) {
      this.loadData();
      this.loadUserLocationMap();
    }
    else {
      this.queryParams.returnUrl = 'checkout';
      this.router.navigate(['login'], { queryParams: this.queryParams });
    }
  }

  loadUserAddresses = () => {
    var requestData = new UserAPIRequestData();

    return this.appService.getUserAddresses(requestData);
  }

  loadUserPayments = () => {
    var requestData = new UserAPIRequestData();

    return this.appService.getUserPayments(requestData);
  }

  loadData = () => {
    this.busy = true;

    var userAddressesPromise = this.loadUserAddresses();
    var userPaymentsPromise = this.loadUserPayments();

    Observable.forkJoin([userAddressesPromise, userPaymentsPromise]).subscribe(response => {

      // User Addresses
      this.userAddresses = <Array<UserAddress>>response[0];
      //this.selectedUserAddress = UserAddress.getDefaultOrFirst(this.userAddresses);

      Util.log('manage userAddresses', this.userAddresses);

      // User Payments
      this.userPayments = <Array<UserPayment>>response[1];
      this.selectedUserPayment = UserPayment.getDefaultOrFirst(this.userPayments);

      Util.log('manage userPayments', this.userPayments);

      this.busy = false;
    });
  }

  loadUserLocationMap = () => {
    setTimeout(() => {
      var latLng = UserAddress.getLatLng(this.sharedDataService.userAddress);

      var mapOptions = Util.clone(this.constants.DEFAULT_MAP_OPTIONS);
      mapOptions.draggable = false;
      mapOptions.center = latLng;

      // this.zone.run(() => {
      var map = new google.maps.Map(document.getElementById('delivery-address-map'), mapOptions);
      // });

      map.addListener('center_changed', () => {
        // this.queryParams.lat = this.menuMap.center.lat();
        // this.queryParams.lng = this.menuMap.center.lng();

        // this.router.navigate(['rest-map-view'], { queryParams: this.queryParams });

        // Util.log('center changed', this.queryParams);
      });
    }, 100);
  }

  setDefaultUserPayment = (userPayment: UserPayment) => {
    this.busy = true;

    for (var i in this.userPayments) {
      var uPayment = this.userPayments[i];

      uPayment.Is_Default = false;
    }

    userPayment.Is_Default = true;

    var requestData = new UserPaymentAPIRequestData();

    UserPaymentAPIRequestData.fillUserPaymentID(requestData, userPayment);

    this.appService.setDefaultUserPayment(requestData).subscribe(response => {

      Util.log('setDefaultUserPayment()', response);

      if (Util.isDefined(response) && Util.isDefined(response.Code) && response.Code == 'SET_DEFAULT_CREDIT_CARD') {
        alert(response.Message);
      }

      this.busy = false;
    });
  }

  openUserAddressesModal = () => {
    this.manageUserAddressesModal.open(this.userAddresses);
  }

  openUserPaymentsModal = () => {
    this.chooseUserPaymentModal.open(this.userPayments);
  }

  userAddressesModalEvents = (event) => {
    if (event.action == 'close') {

      if (Util.isDefined(event.data)) {
        this.sharedDataService.userAddress = event.data;
      }

    }
    Util.log('event data', event);
  }

  userPaymentsModalEvents = (event) => {
    if (event.action == 'close') {

      if (Util.isDefined(event.data)) {
        this.selectedUserPayment = event.data;
      }

    }
    Util.log('event data', event);
  }

  driverTipChanged = () => {
    this.shoppingCart.refresh();

    Util.log('driver tip changed');
  }

  checkout = () => {
    this.busy = true;

    this.orderPromiseList = [];
    this.orderItemsPromiseList = [];
    this.payOrderPromiseList = [];

    var newOrderIDList = [];

    var cartItems = this.shoppingCart.cartItems;

    for (var i in cartItems) {
      var cartItem = cartItems[i];

      var requestData = new OrderAPIRequestData();

      OrderAPIRequestData.fillCartItem(requestData, cartItem);
      OrderAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);
      OrderAPIRequestData.fillUserAddress(requestData, this.sharedDataService.userAddress);
      OrderAPIRequestData.fillUserPayment(requestData, this.selectedUserPayment);

      // Filling info
      requestData.s = this.constants.SERVICE_TYPE_ID[this.sharedDataService.serviceType];
      requestData.dtp = this.sharedDataService.driverTipPercent;
      requestData.m = this.sharedDataService.aptSuiteNo;
      requestData.n = this.sharedDataService.deliveryNotes;

      // Placing order
      var orderPromise = this.appService.placeOrder(requestData);

      this.orderPromiseList.push(orderPromise);
    }

    Observable.forkJoin(this.orderPromiseList)
      .subscribe(ordersResult => {

        Util.log('order process completed', ordersResult);

        var totalPoints = 0;

        for (var i in ordersResult) {
          var orderResult: any = ordersResult[i];

          var orderID = orderResult.NewID;

          totalPoints += orderResult.AddedCustomerPoints;

          newOrderIDList.push(orderID);

          for (var j in cartItem.menuItems) {
            var menuItem = cartItem.menuItems[j];

            var orderItemRequestData = new OrderItemAPIRequestData();

            // Filling login User 
            OrderItemAPIRequestData.fillLoginUser(orderItemRequestData, this.userService.loginUser);

            // Filling order ID
            orderItemRequestData.b = orderID;

            // Filling menu item
            OrderItemAPIRequestData.fillMenuItem(orderItemRequestData, menuItem);

            // Adding order item into order
            var orderItemPromise = this.appService.placeOrderItem(orderItemRequestData);

            this.orderItemsPromiseList.push(orderItemPromise);
          }
        }

        if (totalPoints > 0)
          this.userService.addPoints(totalPoints);

        Observable.forkJoin(this.orderItemsPromiseList)
          .subscribe(orderItemsResult => {

            Util.log('order items process completed', orderItemsResult);

            for (var i in newOrderIDList) {
              var orderID = newOrderIDList[i];

              var requestData = new OrderAPIRequestData();

              // Filling order ID
              requestData.b = orderID;

              var promise = this.appService.payOrder(requestData);

              this.payOrderPromiseList.push(promise);
            }

            Observable.forkJoin(this.payOrderPromiseList)
              .subscribe(payOrderResult => {

                this.shoppingCart.clear();

                this.busy = false;

                alert('Thank you, Your order is placed successfully...');

                this.router.navigate(['/']);

                Util.log('order payment process completed', payOrderResult);

              });
          });
      });

    Util.log('checkout');
  }

  openChangeAddressModal = () => {
    this.changeAddressModal.open();
  }

}
