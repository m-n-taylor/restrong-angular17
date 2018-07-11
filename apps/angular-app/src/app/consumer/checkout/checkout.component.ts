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

// Shared Components
import { ChooseUserPaymentModalComponent } from '../../shared/components/choose-user-payment-modal/choose-user-payment-modal.component';

// CR Shared Components
import { ChangeAddressModalComponent } from "../shared/components/change-address-modal/change-address-modal.component";
import { UserAddressListModalComponent } from "../shared/components/user-address-list-modal/user-address-list-modal.component";
import { ShoppingCart } from "../shared/services/shopping-cart.service";
import { CheckoutConfirmAddressModalComponent } from '../shared/components/checkout-confirm-address-modal/checkout-confirm-address-modal.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { ThankYouOrderModalComponent } from '../shared/components/thank-you-order-modal/thank-you-order-modal.component';
import { ToastsManager } from 'ng2-toastr';

declare var google;

@Component({
	selector: 'checkout',
	templateUrl: './checkout.component.html'
})
export class CheckoutComponent {
	LOG_TAG = 'CheckoutComponent';

	isBrowser = false;
	busy = false;

	// queryParams: QueryParams;

	// userPayments = new Array<UserPayment>();
	// userAddresses = new Array<UserAddress>();
	userLocationMap = null;

	selectedUserPayment: UserPayment;

	totalOrderSuccess = [];
	totalOrderError = [];
	totalOrderPaySuccess = [];
	totalOrderPayError = [];

	orderPromiseList = [];
	orderItemsPromiseList = [];
	payOrderPromiseList = [];

	@ViewChild('confirmModal') public confirmModal: ConfirmModalComponent;
	@ViewChild('userAddressListModalComponent') public userAddressListModalComponent: UserAddressListModalComponent;
	@ViewChild('chooseUserPaymentModal') public chooseUserPaymentModal: ChooseUserPaymentModalComponent;
	@ViewChild('checkoutConfirmAddressModal') public checkoutConfirmAddressModal: CheckoutConfirmAddressModalComponent;
	@ViewChild('thankYouOrderModal') public thankYouOrderModal: ThankYouOrderModalComponent;

	constructor(@Inject(PLATFORM_ID) private platformId: Object, public userService: UserService, public constants: Constants, public sharedDataService: SharedDataService, public appService: AppService, private route: ActivatedRoute, private router: Router, public shoppingCart: ShoppingCart, private toastr: ToastsManager) {
		this.isBrowser = isPlatformBrowser(this.platformId);
	}

	ngOnInit() {
		Util.log(this.LOG_TAG, 'ngOnInit()');

		// this.queryParams = new QueryParams();

		if (this.isBrowser) {
			this.initPage();

			// this.route.queryParams
			// 	.subscribe((params: any) => {

			// 		// QueryParams.fillParams(this.queryParams, params);

			// 		Util.log(this.LOG_TAG, 'QueryParams', params);



			// 	});
		}
	}

	initPage() {
		Util.log(this.LOG_TAG, 'initPage()');

		if (this.userService.isLoggedIn) {
			this.loadData();
			this.initUserLocationMap();
		}
		else {
			this.router.navigate(['login'], { queryParams: { returnUrl: 'checkout' } });
		}
	}

	// loadUserAddresses = () => {
	// 	var requestData = new UserAPIRequestData();

	// 	return this.appService.getUserAddresses(requestData);
	// }

	// loadUserPayments = () => {
	// 	var requestData = new UserAPIRequestData();

	// 	return this.appService.getUserPayments(requestData);
	// }

	loadData = () => {
		// this.busy = true;

		// var userAddressesPromise = this.loadUserAddresses();
		// var userPaymentsPromise = this.loadUserPayments();

		// Observable.forkJoin([userAddressesPromise, userPaymentsPromise]).subscribe(response => {

		// 	// User Addresses
		// 	this.userAddresses = <Array<UserAddress>>response[0];
		// 	//this.selectedUserAddress = UserAddress.getDefaultOrFirst(this.userAddresses);

		// 	Util.log(this.LOG_TAG, 'manage userAddresses', this.userAddresses);

		// 	// User Payments
		// 	this.userPayments = <Array<UserPayment>>response[1];
		// 	this.selectedUserPayment = UserPayment.getDefaultOrFirst(this.userPayments);

		// 	Util.log(this.LOG_TAG, 'manage userPayments', this.userPayments);

		// 	this.busy = false;
		// });
	}

	initUserLocationMap = () => {
		setTimeout(() => {
			var mapOptions = Util.clone(this.constants.DEFAULT_MAP_OPTIONS);
			mapOptions.draggable = false;
			
			if (this.sharedDataService.hasUserAddress()) {
				mapOptions.center = UserAddress.getLatLng(this.sharedDataService.userAddress);
			}

			this.userLocationMap = new google.maps.Map(document.getElementById('delivery-address-map'), mapOptions);
		}, 100);
	}

	updateUserLocationMap = () => {
		if (this.userLocationMap) {
			var latLng = UserAddress.getLatLng(this.sharedDataService.userAddress);

			this.userLocationMap.setCenter(latLng);
		}
	}

	// setDefaultUserPayment = (userPayment: UserPayment) => {
	// 	this.busy = true;

	// 	for (var i in this.userPayments) {
	// 		var uPayment = this.userPayments[i];

	// 		uPayment.Is_Default = false;
	// 	}

	// 	userPayment.Is_Default = true;

	// 	var requestData = new UserPaymentAPIRequestData();

	// 	UserPaymentAPIRequestData.fillUserPaymentID(requestData, userPayment);

	// 	this.appService.setDefaultUserPayment(requestData).subscribe(response => {

	// 		Util.log(this.LOG_TAG, 'setDefaultUserPayment()', response);

	// 		if (Util.isDefined(response) && Util.isDefined(response.Code) && response.Code == 'SET_DEFAULT_CREDIT_CARD') {
	// 			alert(response.Message);
	// 		}

	// 		this.busy = false;
	// 	});
	// }

	openUserAddressListModal = () => {
		// if (this.shoppingCart.cartItems.length > 0) {
		// 	this.confirmModal.open({ message: this.constants.MSG_WARN_CHANGE_ADDRESS, okText: 'Continue', cancelText: 'Cancel' })
		// 		.then((confirm) => {
		// 			if (confirm) {
		// 				this._openUserAddressListModal();
		// 			}
		// 		});
		// }
		// else {
		this._openUserAddressListModal();
		// }
	}

	private _openUserAddressListModal = () => {
		this.userAddressListModalComponent.open()
			.then((data) => {
				this.updateUserLocationMap();
			});
	}

	// userAddressListModalEvents = (event) => {
	// 	if (event.action == 'close') {

	// 		if (Util.isDefined(event.data)) {
	// 			this.sharedDataService.userAddress = event.data;
	// 		}

	// 	}
	// 	Util.log(this.LOG_TAG, 'event data', event);
	// }

	// openUserPaymentsModal = () => {
	// 	this.chooseUserPaymentModal.open(this.userPayments);
	// }

	// userPaymentsModalEvents = (event) => {
	// 	if (event.action == 'close') {

	// 		if (Util.isDefined(event.data)) {
	// 			this.selectedUserPayment = event.data;
	// 		}

	// 	}
	// 	Util.log(this.LOG_TAG, 'event data', event);
	// }

	// driverTipChanged = () => {
	// 	this.shoppingCart.refresh();

	// 	Util.log(this.LOG_TAG, 'driver tip changed');
	// }
	checkout1 = () => {
		this.thankYouOrderModal.open({});
	}

	checkout = () => {
		Util.log(this.LOG_TAG, 'driver tip changed');

		if (!this.sharedDataService.hasUserAddress()) {
			this.toastr.error('Please choose your address.', 'Error!');
		}
		else if (!this.selectedUserPayment) {
			this.toastr.error('Please choose atleast 1 payment method.', 'Error!');
		}
		else {
			this.checkoutConfirmAddressModal.open()
				.then((confirm) => {
					if (confirm) {
						this.busy = true;

						// Tasks needs to perform before calling place order API
						var promiseList = [];

						var userAddress = this.sharedDataService.userAddress;

						if (!Util.isDefined(userAddress.ID)) {
							promiseList.push(this.appService.saveUserAddress({ userAddress: userAddress }));
						}

						if (promiseList.length > 0) {
							Observable.forkJoin(promiseList).subscribe((responseList: Array<any>) => {
								var i = 0;

								if (!Util.isDefined(userAddress.ID)) {
									var userAddressResponse = responseList[i++];

									if (Util.isDefined(userAddressResponse.Code) && userAddressResponse.Code == 'ADD_DELIVERY_ADDRESS') {
										userAddress.ID = userAddressResponse.NewID;

										this.sharedDataService.save();
									}
								}

								this._placeOrder();
							});
						}
						else {
							this._placeOrder();
						}
					}
				});
		}
	}

	private _placeOrder = () => {
		this.totalOrderSuccess = [];
		this.totalOrderError = [];

		this.totalOrderPaySuccess = [];
		this.totalOrderPayError = [];

		this.orderPromiseList = [];
		this.orderItemsPromiseList = [];
		this.payOrderPromiseList = [];

		// var newOrderIDList = [];

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

			var coupons = cartItem.appliedCoupons.filter((c) => !c.errors || c.errors.length == 0);

			var body = {
				Coupons: coupons.map(c => c.CouponCode)
			}

			// Placing order
			var orderPromise = this.appService.placeOrder(requestData, body);

			this.orderPromiseList.push(orderPromise);
		}

		Observable.forkJoin(this.orderPromiseList)
			.subscribe(ordersResult => {
				Util.log(this.LOG_TAG, 'order process completed', ordersResult);

				var totalPoints = 0;

				for (var i in ordersResult) {
					var orderResult: any = ordersResult[i];
					var orderCartItem = cartItems[i];
					orderCartItem.orderResult = orderResult;

					if (Util.isDefined(orderResult.Code) && orderResult.Code == 'ADD_ORDER') {
						this.totalOrderSuccess.push(orderCartItem);

						var orderID = orderResult.NewID;
						totalPoints += orderResult.AddedCustomerPoints;

						// newOrderIDList.push(orderID);

						// Order items
						for (var j in orderCartItem.menuItems) {
							var menuItem = orderCartItem.menuItems[j];

							var orderItemRequestData = new OrderItemAPIRequestData();

							// Filling login User 
							OrderItemAPIRequestData.fillLoginUser(orderItemRequestData, this.userService.loginUser);

							// Filling order ID
							orderItemRequestData.b = orderID;
							orderItemRequestData.m = menuItem.menuItemSuggestion;

							// Filling menu item
							OrderItemAPIRequestData.fillMenuItem(orderItemRequestData, menuItem);

							// Adding order item into order
							var orderItemPromise = this.appService.placeOrderItem(orderItemRequestData);

							this.orderItemsPromiseList.push(orderItemPromise);
						}

						// Order pay
						var requestData = new OrderAPIRequestData();
						// Filling order ID
						requestData.b = orderID;
						var promise = this.appService.payOrder(requestData);

						this.payOrderPromiseList.push(promise);
					}
					else {
						this.totalOrderError.push(orderCartItem);
					}
				}

				if (totalPoints > 0) {
					this.userService.addPoints(totalPoints);
				}

				if (this.orderItemsPromiseList.length > 0) {
					Observable.forkJoin(this.orderItemsPromiseList)
						.subscribe(orderItemsResult => {

							Util.log(this.LOG_TAG, 'order items process completed', orderItemsResult);

							Observable.forkJoin(this.payOrderPromiseList)
								.subscribe((payOrdersResult: Array<any>) => {

									for (var payOrderIndex in payOrdersResult) {
										var payOrderResult = payOrdersResult[payOrderIndex];
										var orderCartItem = this.totalOrderSuccess[payOrderIndex];

										if (Util.isDefined(payOrderResult.Code) && payOrderResult.Code == 'PAY_ORDER_SUCCESS') {
											this.totalOrderPaySuccess.push(orderCartItem);

											Util.log(this.LOG_TAG, 'order payment process completed', payOrderResult);
										}
										else {
											this.totalOrderPayError.push(orderCartItem);
										}
									}

									this._onPlaceOrderCompleted();
								});
						});
				}
				else {
					this._onPlaceOrderCompleted();
				}
			});

		Util.log(this.LOG_TAG, 'checkout');
	}

	private _onPlaceOrderCompleted = () => {
		this.busy = false;

		// Successfull placed orders = (this.totalOrderPaySuccess)
		// Unsuccessfull placed orders = (this.totalOrderError + totalOrderPayError)

		Util.log(this.LOG_TAG, 'Order Success/Error', this.totalOrderSuccess, this.totalOrderError);
		Util.log(this.LOG_TAG, 'Order Pay Success/Error', this.totalOrderPaySuccess, this.totalOrderPayError);

		this.thankYouOrderModal.open({
			totalOrderPaySuccess: this.totalOrderPaySuccess,
			totalOrderError: this.totalOrderError,
			totalOrderPayError: this.totalOrderPayError
		}).then(() => {
			this.router.navigate(['/search']);
		});

		// Dont clear cart, only remove those which are successfully placed...
		for (var i in this.totalOrderPaySuccess) {
			var cartItem = this.totalOrderPaySuccess[i];

			this.shoppingCart.removeCartItem(cartItem);
		}

		// alert('Thank you, Your order is placed successfully...');
	}
}
