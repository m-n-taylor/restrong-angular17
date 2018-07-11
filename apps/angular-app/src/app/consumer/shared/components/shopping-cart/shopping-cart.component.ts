import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

// Shared Helpers
import { Constants } from '../../../../shared/constants';
import { Util } from '../../../../shared/util';

// Shared Models
import { Cuisine } from '../../../../shared/models/cuisine';
import { CartItem } from '../../../../shared/models/cart-item';
import { QueryParams } from '../../../../shared/models/query-params';
import { SearchMenuAPIRequestData } from '../../../../shared/models/search-menu-api-request-data';

// Shared Services
import { AppService } from '../../../../shared/services/app.service';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { ToastsManager } from "ng2-toastr/ng2-toastr";
import { UserService } from "../../services/user.service";
import { ShoppingCart } from "../../services/shopping-cart.service";
import { AvailableCouponsModalComponent } from "../available-coupons-modal/available-coupons-modal.component";
import { ConfirmModalComponent } from "../../../../shared/components/confirm-modal/confirm-modal.component";
import { MenuItem } from "../../../../shared/models/menu-item";

@Component({
	selector: 'shopping-cart',
	templateUrl: './shopping-cart.component.html'
})
export class ShoppingCartComponent {
	LOG_TAG = 'ShoppingCartComponent';
	MODE_NORMAL = 'MODE_NORMAL';
	MODE_MODAL = 'MODE_MODAL';

	busy = false;

	@Input() mode: string = this.MODE_MODAL;
	@Input() availableCouponsModal: AvailableCouponsModalComponent;
	@Input() confirmModal: ConfirmModalComponent;

	@Output() completeOrder = new EventEmitter<any>();

	constructor(public constants: Constants, public sharedDataService: SharedDataService, private appService: AppService, public shoppingCart: ShoppingCart, private router: Router, private toastr: ToastsManager, private userService: UserService) {
		Util.log(this.LOG_TAG, 'constructor()');
	}

	ngOnInit() {
		Util.log(this.LOG_TAG, 'ngOnInit()');

		this.shoppingCart.refresh();

		this.getAllVisibleCoupons();
	}

	toggleShoppingCart = () => {
		if (this.mode == this.MODE_MODAL) {
			this.sharedDataService.toggleShoppingCart();
		}
	}

	updateQty = (cartItem: CartItem, menuItem: MenuItem, increment) => {
		var newQty = (increment + menuItem.quantity);

		if ((increment + menuItem.quantity) > this.constants.CART_ITEM_MAX_LIMIT) {
			this.toastr.error(`You can't add more then ${this.constants.CART_ITEM_MAX_LIMIT} items`, 'Error!');
		}
		else {
			if (newQty > 0) {
				menuItem.quantity = newQty;

				this.shoppingCart.refresh();
			}
			else {
				this.confirmModal.open({ message: `Are you sure you want to delete ${menuItem.MenuItemName}?` })
					.then((confirm) => {
						if (confirm) {
							this.shoppingCart.removeMenuItem(menuItem, cartItem);
						}
					});
			}
		}
	};

	viewMenu = (cartItem: CartItem) => {
		if (cartItem.menuItems.length > 0) {
			this.toggleShoppingCart();

			var menuItem = cartItem.menuItems[0];

			this.router.navigate([`/restaurant/${this.sharedDataService.serviceType}/${Util.replaceSpaceWithDash(menuItem.CuisineName)}/${Util.replaceSpaceWithDash(menuItem.RestaurantName)}-${Util.replaceSpaceWithDash(menuItem.Address)}/${menuItem.FFID}`]);
		}
	}

	validateCouponCode = (cartItem: CartItem) => {
		var duplicateCouponExist = cartItem.appliedCoupons.filter((c) => {
			return c.CouponCode == cartItem.couponCode;
		});

		if (duplicateCouponExist.length > 0) {
			this.toastr.error('Coupon Code is already applied', 'Error!');
		} else {
			cartItem.busyAddCouponCode = true;

			// create a request to send to validate coupon code
			var request: any = {
				a: cartItem.FFID,
				b: cartItem.couponCode,
			};

			// add auth code and customer id to the request if user is logged in
			if (this.userService.isLoggedIn) {
				request.i = this.userService.loginUser.ID;
				request.x = this.userService.loginUser.AuthCode;
			}

			this.appService.validateCouponCode(request)
				.subscribe((response) => {
					cartItem.busyAddCouponCode = false;

					var hasError = false;

					cartItem.couponCode = '';

					if (response.Status == this.constants.STATUS_SUCCESS) {
						var coupon = response;

						cartItem.appliedCoupons.push(coupon);
					} else {
						hasError = true;
					}

					if (hasError) {
						this.toastr.error('Unable to apply coupon', 'Error!');
					}

					this.shoppingCart.refresh();

					Util.log(this.LOG_TAG, 'validateCouponCode => success', coupon);
				});
		}
	}

	/**
	 * Get All Visible Coupons
	 */
	getAllVisibleCoupons = () => {
		this.busy = true;

		var promiseList = [];
		var couponCartItems = new Array<CartItem>();

		for (var i in this.shoppingCart.cartItems) {
			var cartItem = this.shoppingCart.cartItems[i];

			if (cartItem.coupons.length == 0) {
				// create a request to send to get visible coupons for each restaurant
				var request: any = {
					a: cartItem.FFID,
					b: this.constants.SERVICE_TYPE_ID[this.sharedDataService.serviceType],
				};

				// add auth code and customer id to the request if user is logged in
				if (this.userService.isLoggedIn) {
					request.i = this.userService.loginUser.ID;
					request.x = this.userService.loginUser.AuthCode;
				}

				couponCartItems.push(cartItem);

				promiseList.push(this.appService.getVisibleCoupons(request));
			}
		}

		Observable.forkJoin(promiseList).subscribe((responseList: Array<any>) => {
			for (var i in responseList) {
				var response = responseList[i];

				if (response.Status == this.constants.STATUS_SUCCESS) {
					couponCartItems[i].coupons = response.Data;
				}
			}

			this.busy = false;
		});
	}

	/**
	 * Remove Coupon Code
	 */
	removeCouponCode = (cartItem, index) => {
		cartItem.appliedCoupons.splice(index, 1);

		this.shoppingCart.refresh();
	}

	showAvailableCouponsModal = (cartItem: CartItem) => {
		this.availableCouponsModal.open({
			cartItem: cartItem
		}).then((data) => {
			if (Util.isDefined(data) && Util.isDefined(data.coupon)) {
				cartItem.couponCode = data.coupon.CouponCode;

				this.validateCouponCode(cartItem);
			}

			Util.log(this.LOG_TAG, 'showAvailableCouponsModal', data);
		});
	}

	placeOrder = () => {
		if (this.shoppingCart.minOrderCartItems.length == 0) {
			if (this.mode == this.MODE_NORMAL) {
				this.completeOrder.emit();
			}
			else {
				this.toggleShoppingCart();
				this.router.navigate(['checkout']);
			}
		}
	}

}
