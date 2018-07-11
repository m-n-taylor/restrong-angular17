import { Component, OnInit, ViewChild } from '@angular/core';
import { Location, CurrencyPipe, DatePipe } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// RO Shared Components
import { MapCustomerRouteModalComponent } from '../shared/components/map-customer-route-modal/map-customer-route-modal.component';
import { ConfirmModalComponent } from "../../shared/components/confirm-modal/confirm-modal.component";

// RO Models
import { MasterHead } from '../shared/models/master-head';
import { Head } from '../shared/models/head';
import { Restaurant } from '../shared/models/restaurant';
import { ROAPIRequestData } from '../shared/models/ro-api-request-data';

// Shared Services
import { PathService as Path } from '../../shared/services/path.service';
import { BreadcrumbService } from '../../libs/breadcrumb/breadcrumb.module';
import { MenuItem as CRMenuItem } from "../../shared/models/menu-item";
import { CartItem } from "../../shared/models/cart-item";

// RO Services
import { ROService } from '../shared/services/ro.service';
import { SharedDataService } from '../shared/services/shared-data.service';
import { ROHelperService } from '../shared/services/helper.service';
import { ShoppingCart } from "../shared/services/shopping-cart.service";

// Shared Pipes
import { PhonePipe } from '../../shared/pipes/phone';

// 3rd Party Libs
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { APIRequestData } from "../../shared/models/api-request-data";
import { OrderDetail } from "../shared/models/order-detail";
import { MenuDetail } from "../shared/models/menu-detail";
import { ROMenuItem } from "../shared/models/ro-menu-item";
import { Coupon } from "../shared/models/coupon";
import { ROResponse } from "../shared/models/ro-response";
import { OrderMenuOptionDetail } from "../shared/models/order-menu-option-detail";
import { MenuItemAPIRequestData } from "../shared/models/menu-item-api-request-data";
import { RightSidebarAnimation } from "../../shared/animations/right-sidebar.animation";

@Component({
	selector: 'ro-edit-order',
	templateUrl: './edit-order.component.html',
	providers: [ShoppingCart],
	animations: [RightSidebarAnimation],
})
export class EditOrderComponent implements OnInit {
	LOG_TAG = 'EditOrderComponent => ';

	busy = false;
	busyCart = false;
	busySearch = false;
	busyMenuItems = false;
	busySaveOrder = false;
	busySaveAndAcceptOrder = false;

	orderID: string;
	fireFlyID: string;

	restInfo = new Restaurant();

	order = {
		OrderDetail: <OrderDetail>{},
		CustomerInfo: <any>{},
		MenuDetail: new Array<MenuDetail>(),
	};

	masterHeads = new Array<MasterHead>();
	selectedMasterHead = new MasterHead();

	heads = new Array<Head>();
	selectedHead = new Head();

	menuItems = new Array<ROMenuItem>();

	couponCode: string;
	coupons: Array<Coupon>;

	isOpenSelectedMenuItem = false;
	// selectedMenuItem: IROMenuItem;
	// selectedMenuItemAction: string;
	selectedMenuItemData: any;
	selectedCRMenuItem: CRMenuItem;

	@ViewChild('confirmModal') public confirmModal: ConfirmModalComponent;
	@ViewChild('mapCustomerRouteModal') public mapCustomerRouteModal: MapCustomerRouteModalComponent;

	constructor(public constants: Constants, private ROService: ROService, private router: Router, private location: Location, private activatedRoute: ActivatedRoute, private breadcrumbService: BreadcrumbService, private toastr: ToastsManager, private currencyPipe: CurrencyPipe, private phonePipe: PhonePipe, private datePipe: DatePipe, public sharedDataService: SharedDataService, private helperService: ROHelperService, public shoppingCart: ShoppingCart) { }

	ngOnInit() {
		Util.log(this.LOG_TAG, 'Init()');

		// Get Data from URL
		this.activatedRoute.params.subscribe((params: any) => {
			Util.log(this.LOG_TAG, 'params', params);

			this.orderID = params.id;
			this.fireFlyID = params.fireFlyID;

			this.loadData();
		});
	}

	loadRestInfo = () => {
		var requestData = new ROAPIRequestData();

		ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);

		return this.ROService.getRestInfo(requestData);
	}

	loadOrderDetails = () => {
		var requestData = new ROAPIRequestData();

		ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
		ROAPIRequestData.fillOrderID(requestData, this.orderID);

		return this.ROService.getOrderInfo(requestData);
	}

	loadCouponList = () => {
		var requestData = new ROAPIRequestData();

		ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);

		return this.ROService.getCouponList(requestData);
	}

	loadMasterHeads = () => {
		Util.log(this.LOG_TAG, 'loadMasterHeads()');

		this.busy = true;

		var requestData = new ROAPIRequestData();

		requestData.ff = this.fireFlyID;

		return this.ROService.getMasterHeadList(requestData);
	}

	loadHeadList = (masterHeadID) => {
		var requestData = new ROAPIRequestData();

		ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
		ROAPIRequestData.fillMasterHeadID(requestData, masterHeadID);

		return this.ROService.getHeadList(requestData);
	}

	loadMenuItemList = (headID) => {
		this.busyMenuItems = true;
		this.menuItems = [];

		var requestData = new ROAPIRequestData();

		ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
		ROAPIRequestData.fillHeadID(requestData, headID);

		return this.ROService.getMenuItemList(requestData);
	}

	loadData = () => {
		Util.log(this.LOG_TAG, 'loadData()');

		this.busy = true;

		// Load Rest Info
		var restInfoPromise = this.loadRestInfo();

		// Load Order Details
		var orderDetailsPromise = this.loadOrderDetails();

		// Coupons
		var couponsPromise = this.loadCouponList();

		// Load Master Headings of current Restaurant
		var masterHeadsPromise = this.loadMasterHeads();

		Observable.forkJoin([restInfoPromise, orderDetailsPromise, couponsPromise, masterHeadsPromise]).subscribe((response: any) => {
			var i = 0;

			var restInfoResponse: any = response[i++];
			this.restInfo = restInfoResponse.Data;

			var orderDetailsResponse: any = response[i++];
			this.order = orderDetailsResponse;

			// Check if user can edit the order
			if (this.order.OrderDetail.StatusID == this.constants.ORDER_STATUS.ACCEPTED || this.order.OrderDetail.StatusID == this.constants.ORDER_STATUS.CANCELLED_BY_REST) {
				this.goBack();
				return;
			}

			var couponsResponse: any = response[i++];
			this.coupons = couponsResponse.Data;

			var masterHeadsResponse: any = response[i++];
			this.masterHeads = masterHeadsResponse.Data;

			this.initCart();

			// Select first master heading, and load its headings
			if (this.masterHeads.length > 0) {
				this.chooseMasterHead(this.masterHeads[0]);
			}
			else {
				this.busy = false;
			}

			// Sets the rest name and order number in breadcrumbs
			this.breadcrumbService.addFriendlyNameForRoute(`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}/${this.fireFlyID}`, this.restInfo.Name);
			this.breadcrumbService.addFriendlyNameForRoute(`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}/${this.fireFlyID}/${Path.RO.ORDER_DETAILS}/${this.orderID}`, this.order.OrderDetail.OrderNumber);

			Util.log(this.LOG_TAG, 'forkJoin', response);
		});
	}

	searchItemClicked = (data) => {
		Util.log(this.LOG_TAG, 'searchItemClicked', data);

		if (data.type == 'menuItem') {
			this.busySearch = true;

			var requestData = new MenuItemAPIRequestData();

			MenuItemAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
			MenuItemAPIRequestData.fillID(requestData, data.menuItem.MenuItemID);

			this.ROService.getMenuItemInfo(requestData).subscribe(response => {
				Util.log(this.LOG_TAG, 'getMenuItemInfo', response);

				this.busySearch = false;

				this.chooseMenuItem(response.Data, 'add');
			});
		}
	}

	chooseMasterHead = (masterHead) => {
		Util.log(this.LOG_TAG, 'chooseMasterHead()');

		this.selectedMasterHead = masterHead;

		var headPromise = this.loadHeadList(this.selectedMasterHead.ID);

		headPromise.subscribe((response: any) => {
			this.heads = response.Data;

			if (this.heads.length > 0) {
				this.chooseHead(this.heads[0]);
			}

			this.busy = false;

			Util.log(this.LOG_TAG, 'forkJoin', response);
		});
	}

	chooseHead = (head) => {
		Util.log(this.LOG_TAG, 'chooseHead()');

		this.selectedHead = head;

		var menuItemsPromise = this.loadMenuItemList(this.selectedHead.ID);

		menuItemsPromise.subscribe((response: any) => {
			this.menuItems = response.Data;

			// this.chooseMenuItem(this.menuItems[12]);

			this.busyMenuItems = false;

			Util.log(this.LOG_TAG, 'forkJoin', response);
		});
	}

	/**
	 * Selected Menu Item Rightside bar
	 */
	chooseMenuItem = (menuItem: ROMenuItem, action: string) => {
		this.selectedMenuItemData = {
			menuItem: menuItem,
			action: action
		}

		this.isOpenSelectedMenuItem = true;

		Util.enableBodyScroll(!this.isOpenSelectedMenuItem);
	}

	closeMenuItem = () => {
		this.selectedMenuItemData = null;

		this.isOpenSelectedMenuItem = false;

		this.shoppingCart.refresh();

		Util.enableBodyScroll(!this.isOpenSelectedMenuItem);
	}

	onMenuItemOptionsClosed = async (data) => {
		var menuItem: ROMenuItem = data.item;

		if (menuItem) {
			if (data.action == 'add') {
				menuItem.busy = true;
				await this.addROMenuItemToCart(menuItem);
				menuItem.busy = false;
			}

			if (data.action == 'update') {
				this.updateROMenuItemToCart(menuItem);
			}
		}

		this.closeMenuItem();

		Util.log('onMenuItemOptionsClosed', data);
	}

	/**
	 * Shopping Cart
	 */
	loadCartMenuItems = () => {
		var promiseList = [];

		for (var i in this.order.MenuDetail) {
			var menuDetail = this.order.MenuDetail[i];

			var requestData = new ROAPIRequestData();

			ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
			ROAPIRequestData.fillID(requestData, menuDetail.ItemID);

			promiseList.push(this.ROService.getMenuItemInfo(requestData));
		}

		return Observable.forkJoin(promiseList);
	}

	initCart = () => {
		// this.busyCart = true;

		this.loadCartMenuItems().subscribe((responseList: Array<ROResponse>) => {

			// Setting `sharedDataService` variables
			this.sharedDataService.serviceType = this.constants.SERVICE_TYPE_TITLE[this.order.OrderDetail.ServiceTypeID];
			this.sharedDataService.driverTipPercent = this.order.OrderDetail.Driver_Tip_Percent;
			// this.sharedDataService.taxPercent = this.order.OrderDetail.Tax_Rate;

			// Setting `menuItem` from `menuDetail`
			for (var menuDetailIndex in this.order.MenuDetail) {
				var menuDetail = this.order.MenuDetail[menuDetailIndex];

				var response = responseList[menuDetailIndex];

				if (response.Status == this.constants.STATUS_SUCCESS) {
					var menuItem: ROMenuItem = response.Data;
					menuItem.quantity = menuDetail.Qty;

					menuDetail.menuItem = menuItem;

					((menuDetail) => {
						this.helperService.loadMenuItemSizes(this.fireFlyID, menuDetail.menuItem, menuDetail.SizeID)
							.then(async () => {
								var menuItem = menuDetail.menuItem;

								if (Util.isDefined(menuDetail.OptionDetails) && menuDetail.OptionDetails.length > 0) {
									for (var i in menuDetail.OptionDetails) {
										var optionDetail = menuDetail.OptionDetails[i];

										var temp = menuItem.menuItemOptions.filter(m => m.OptionID == optionDetail.OptionID);

										if (temp.length > 0) {
											var menuItemOption = temp[0];

											if (Util.isDefined(optionDetail.OptionItem) && optionDetail.OptionItem.length > 0) {
												for (var j = 0; j < optionDetail.OptionItem.length; j++) {
													var optionItem = optionDetail.OptionItem[j];

													var temp2 = menuItemOption.OptionItems.filter(o => o.ID == optionItem.OptionItemID);

													if (temp2.length > 0) {
														var item = temp2[0];

														if (menuItemOption.Is_Single_Select) {
															menuItemOption.selectedOptionItem = item;
														}
														else {
															item.isSelected = true;
														}
													}
												}
											}
										}

										// for (var j = 0; j < menuItem.menuItemOptions.length; j++) {
										// 	var menuItemOption = menuItem.menuItemOptions[j];

										// 	if(menuItemOption.Is_Single_Size) {
										// 		var temp = menuItemOption.
										// 	}
										// }
										// optionDetail.
									}

									// var aa = menuDetail.OptionDetails.map(o => {
									// 	OptionID: o.OptionID,
									// })
								}

								if (menuItem.Is_Single_Size) {
									// menuItem.menuItemSizes.
								}
								else {

								}

								menuDetail.crMenuItem = await this.addROMenuItemToCart(menuDetail.menuItem);

								// this.busyCart = false;

								Util.log('menuDetail', menuDetail);
							}).catch(() => {

							});
					})(menuDetail);
				}
			}

			if (this.shoppingCart.cartItems.length > 0) {
				var cartItem = this.shoppingCart.cartItems[0];

				for (var i = 0; i < this.order.OrderDetail.CouponDetail.length; i++) {
					var couponDetail = this.order.OrderDetail.CouponDetail[i];

					this._addCouponCodeToCartItem(cartItem, couponDetail.CouponCode);
				}
			}

			this.shoppingCart.refresh();


			Util.log(this.LOG_TAG, 'initShoppingCart()', this.order, this.shoppingCart.cartItems);
		});
	}

	addROMenuItemToCart = async (menuItem: ROMenuItem) => {
		var crMenuItem = new CRMenuItem();

		crMenuItem.RestaurantID = this.order.OrderDetail.RestaurantID;
		crMenuItem.RestaurantName = this.order.OrderDetail.Restaurant;
		crMenuItem.Address = this.order.OrderDetail.RestaurantAddress;
		crMenuItem.DeliveryModeID = this.order.OrderDetail.DeliveryModeID;
		// crMenuItem.MenusServiceFee = 0.13;
		crMenuItem.DeliveryCharge = this.order.OrderDetail.DeliveryCharge;

		crMenuItem.MenuItemID = menuItem.ID;
		crMenuItem.MenuItemName = menuItem.Name;
		crMenuItem.MenuItemDescription = menuItem.Description;
		crMenuItem.Price = menuItem.Price;
		crMenuItem.quantity = menuItem.quantity;
		crMenuItem.ZipCode = this.restInfo.ZipCode;

		crMenuItem.selectedMenuItemSize = menuItem.selectedMenuItemSize;
		crMenuItem.menuItemSizes = menuItem.menuItemSizes;
		crMenuItem.menuItemOptions = menuItem.menuItemOptions;

		await this.shoppingCart.addMenuItem(crMenuItem, null);

		Util.log(this.LOG_TAG, 'addMenuItemToCart()', crMenuItem);

		return crMenuItem;
	}

	editCartCRMenuItem = (crMenuItem: CRMenuItem) => {
		this.selectedCRMenuItem = crMenuItem;

		var menuItem = <ROMenuItem>{};

		menuItem.ID = crMenuItem.MenuItemID;
		menuItem.Name = crMenuItem.MenuItemName;
		menuItem.Description = crMenuItem.MenuItemDescription;
		menuItem.Price = crMenuItem.Price;
		menuItem.quantity = crMenuItem.quantity;
		menuItem.selectedMenuItemSize = crMenuItem.selectedMenuItemSize;
		menuItem.menuItemSizes = crMenuItem.menuItemSizes;
		menuItem.menuItemOptions = crMenuItem.menuItemOptions;

		this.chooseMenuItem(menuItem, 'update');
	}

	updateROMenuItemToCart = (menuItem: ROMenuItem) => {
		this.selectedCRMenuItem.MenuItemID = menuItem.ID;
		this.selectedCRMenuItem.MenuItemName = menuItem.Name;
		this.selectedCRMenuItem.MenuItemDescription = menuItem.Description;
		this.selectedCRMenuItem.quantity = menuItem.quantity;
		this.selectedCRMenuItem.selectedMenuItemSize = menuItem.selectedMenuItemSize;
		this.selectedCRMenuItem.menuItemSizes = menuItem.menuItemSizes;
		this.selectedCRMenuItem.menuItemOptions = menuItem.menuItemOptions;
	}

	updateMenuItemQty = (cartItem: CartItem, crMenuItem: CRMenuItem, value: number) => {
		var resultStatus = this.shoppingCart.updateMenuItemQty(crMenuItem, value);

		if (resultStatus == this.constants.CART_MENU_ITEM_QTY_MAX_LIMIT) {

			this.toastr.error(`You cant add more then ${this.constants.CART_ITEM_MAX_LIMIT} items.`, 'Error!');

		} else if (resultStatus == this.constants.CART_MENU_ITEM_QTY_ZERO_LIMIT) {

			this.confirmModal.open({ message: `Are you sure you want to delete ${crMenuItem.MenuItemName}?` })
				.then((confirm) => {
					if (confirm) {
						var temp = this.order.MenuDetail.filter(m => m.crMenuItem == crMenuItem);

						// If found menu detail
						if (temp.length > 0) {
							temp[0].shouldDelete = true;
						}

						this.shoppingCart.removeMenuItem(crMenuItem, cartItem);
					}
				});
		}
	}

	private _addCouponCodeToCartItem = (cartItem: CartItem, couponCode: string) => {
		var added = false;

		var temp = this.coupons.filter(c => c.CouponCode == couponCode);

		if (temp.length > 0) {
			added = true;
			cartItem.appliedCoupons.push(this.shoppingCart.createICartCouponByICoupon(temp[0]));
		}

		return added;
	}

	public addCouponCode = (cartItem: CartItem) => {
		var selectedCoupon = this.coupons.filter(c => c.isSelected);

		if (selectedCoupon.length > 0) {
			cartItem.couponCode = selectedCoupon[0].CouponCode;

			var temp = cartItem.appliedCoupons.filter(c => c.CouponCode == cartItem.couponCode);

			var found = false;

			if (temp.length > 0) {
				found = true;

				this.toastr.error('Coupon Code already exists.', 'Error!');
			}
			else {
				var added = this._addCouponCodeToCartItem(cartItem, cartItem.couponCode);

				if (!added) {
					this.toastr.error('Invalid Coupon Code.', 'Error!');
				}
				else {
					cartItem.couponCode = '';
				}

				this.shoppingCart.refresh();
			}
		}
		else {
			this.toastr.error('Please select a Coupon Code.', 'Error!');
		}
	}

	public removeCouponCode = (cartItem: CartItem, couponIndex: number) => {
		cartItem.appliedCoupons.splice(couponIndex, 1);

		this.shoppingCart.refresh();
	}

	onDriverTipChanged = () => {
		this.shoppingCart.refresh();
	}

	saveOrder = (acceptOrder) => {

		if (acceptOrder) {
			this.busySaveAndAcceptOrder = true;
		}
		else {
			this.busySaveOrder = true;
		}

		var requestData = new ROAPIRequestData();

		ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
		ROAPIRequestData.fillOrderID(requestData, this.orderID);

		var cartItem = this.shoppingCart.cartItems[0];

		var menuDetailList = new Array<MenuDetail>();

		for (var i = 0; i < cartItem.menuItems.length; i++) {
			var crMenuItem = cartItem.menuItems[i];

			var menuDetail = new MenuDetail();

			var temp = this.order.MenuDetail.filter(m => m.crMenuItem == crMenuItem);

			// If found menu detail
			if (temp.length > 0) {
				menuDetail.ID = temp[0].ID;
			}

			menuDetail.ItemID = crMenuItem.MenuItemID;
			menuDetail.ItemName = crMenuItem.MenuItemName;
			menuDetail.Qty = crMenuItem.quantity;
			menuDetail.OptionDetails = [];

			if (Util.isDefined(crMenuItem.selectedMenuItemSize)) {
				menuDetail.SizeID = crMenuItem.selectedMenuItemSize.id;
			}

			if (Util.isDefined(crMenuItem.menuItemOptions) && crMenuItem.menuItemOptions.length > 0) {

				for (var j = 0; j < crMenuItem.menuItemOptions.length; j++) {
					var menuItemOption = crMenuItem.menuItemOptions[j];

					var optionDetailItem = new OrderMenuOptionDetail();
					optionDetailItem.OptionID = menuItemOption.OptionID;
					optionDetailItem.OptionItemName = menuItemOption.OptionHeader;
					optionDetailItem.Qty = 0;
					optionDetailItem.Amount = 0;
					optionDetailItem.Total = 0;
					optionDetailItem.OptionItem = [];

					if (menuItemOption.Is_Single_Select) {
						if (Util.isDefined(menuItemOption.selectedOptionItem)) {
							var optionItem = new OrderMenuOptionDetail();
							optionItem.OptionItemID = menuItemOption.selectedOptionItem.ID;
							optionItem.OptionItemName = menuItemOption.selectedOptionItem.Name;
							optionItem.Qty = 0;
							optionItem.Amount = 0;
							optionItem.Total = 0;
							optionDetailItem.OptionItem.push(optionItem);
						}
					}
					else {
						for (var k = 0; k < menuItemOption.OptionItems.length; k++) {
							var item = menuItemOption.OptionItems[k];

							if (item.isSelected) {
								var optionItem = new OrderMenuOptionDetail();
								optionItem.OptionItemID = item.ID;
								optionItem.OptionItemName = item.Name;
								optionItem.Qty = 0;
								optionItem.Amount = 0;
								optionItem.Total = 0;
								optionDetailItem.OptionItem.push(optionItem);
							}
						}
					}

					if (optionDetailItem.OptionItem.length > 0) {
						menuDetail.OptionDetails.push(optionDetailItem);
					}
				}
			}

			menuDetailList.push(menuDetail);
		}

		// Add deleted items
		menuDetailList = menuDetailList.concat(this.order.MenuDetail.filter(m => m.shouldDelete));

		var body = {
			MenuDetail: menuDetailList
		};

		var promiseList = [];

		promiseList.push(this.ROService.saveOrder(requestData, body));

		// Accpet Order
		if (acceptOrder) {
			requestData = new ROAPIRequestData();
			requestData.ff = this.fireFlyID;
			requestData.oid = this.orderID;

			promiseList.push(this.ROService.acceptOrder(requestData));
		}

		// apiCall.subscribe(response => {

		// 	if (response.Status == this.constants.STATUS_SUCCESS) {

		// 		this.order.OrderDetail.Status = response.Data.Status;
		// 		this.order.OrderDetail.StatusID = response.Data.StatusID;

		// 		this.busyAcceptOrder = false;
		// 		this.busyRejectOrder = false;

		// 		this.toastr.success(`Order ${accept ? 'accepted' : 'rejected'} successfully.`, 'Success!');
		// 	}
		// 	else {
		// 		this.toastr.error('Unable to update item, Please try later.', 'Error!');
		// 	}

		// 	Util.log(this.LOG_TAG, 'acceptOrder', response);
		// });

		Observable.forkJoin(promiseList).subscribe((responseList: any) => {
			var i = 0;

			var saveOrderResponse = responseList[i++];

			if (acceptOrder) {
				var acceptOrderResponse = responseList[i++];

				if (acceptOrderResponse.Status == this.constants.STATUS_SUCCESS) {
					this.order.OrderDetail.Status = acceptOrderResponse.Data.Status;
					this.order.OrderDetail.StatusID = acceptOrderResponse.Data.StatusID;
				}

				this.busySaveAndAcceptOrder = false;

				this.toastr.success('Order saved and accepted successfully.', 'Success!');
			}
			else {
				this.busySaveOrder = false;

				this.toastr.success('Order saved successfully.', 'Success!');
			}

			this.goBack();

			Util.log(this.LOG_TAG, 'saveOrder', responseList);
		});

		Util.log(this.LOG_TAG, 'saveOrder');
	}

	undoChanges = () => {
		window.location.reload();
	}

	goBack = () => {
		// this.location.back();
		this.router.navigate([`${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`, this.fireFlyID, `${Path.RO.ORDER_DETAILS}`, this.orderID]);

		Util.log(this.LOG_TAG, 'goBack');
	}
}
