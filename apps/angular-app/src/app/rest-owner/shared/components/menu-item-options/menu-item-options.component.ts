import { Component, ViewChild, NgZone, EventEmitter, Input, Output, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../../../shared/util';
import { Constants } from '../../../../shared/constants';

// RO Models
import { ROAPIRequestData } from '../../models/ro-api-request-data';

// CR Models
import { SearchMenuAPIRequestData } from '../../../../shared/models/search-menu-api-request-data';

// Shared Services
import { AppService as CRService } from '../../../../shared/services/app.service';
import { EventsService } from '../../../../shared/services/events.service';
import { BaseModal } from '../../../../shared/services/base-modal.service';
import { MenuItem as CRMenuItem } from "../../../../shared/models/menu-item";

// RO Services
import { ROService } from '../../services/ro.service';
import { CartItem } from "../../../../shared/models/cart-item";
import { ROHelperService } from "../../services/helper.service";

// 3rd Party Libs
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { ROMenuItem } from "../../models/ro-menu-item";
import { ShoppingCart } from "../../services/shopping-cart.service";

declare var document, google;

@Component({
	selector: 'menu-item-options',
	templateUrl: './menu-item-options.component.html',
	
})
export class MenuItemOptionsComponent extends BaseModal {

	/**
	 * Properties
	 */
	LOG_TAG = 'MenuItemOptionsComponent';

	@Input() fireFlyID: string;

	// private _menuItem: IROMenuItem;
	// @Input() set menuItem(menuItem: IROMenuItem) {
	// 	this._menuItem = menuItem;

	// 	this.init();
	// }
	// get menuItem(): IROMenuItem {
	// 	return this._menuItem;
	// }

	// private _action: string;
	// @Input() set action(action: string) {
	// 	this._action = action;
	// }
	// get action(): string {
	// 	return this._action;
	// }

	action: string;
	menuItem: ROMenuItem;

	private _data: any;
	@Input() set data(value: any) {
		if (Util.isDefined(value)) {
			this.action = value.action;
			this.menuItem = value.menuItem;

			this.init();
		}
	}
	// get data(): any {
	// 	return this._data;
	// }

	@Output() onItemSelected = new EventEmitter<any>();

	selectedMenuItemTotalPrice: number;
	busySelectedMenuItem = false;

	@Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();

	constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public eventsService: EventsService, private ROService: ROService, private zone: NgZone, public shoppingCart: ShoppingCart, private helperService: ROHelperService, private toastr: ToastsManager) {
		super(eventsService);
	}

	ngOnInit() {
		Util.log(this.LOG_TAG, 'init()', this.fireFlyID, this.menuItem);
	}

	init = () => {
		this.selectedMenuItemTotalPrice = 0;
		this.loadSelectedMenuItemData();
	}

	loadSelectedMenuItemData = () => {
		Util.log(this.LOG_TAG, 'loadSelectedMenuItemData()', this.action);

		if (this.action == 'add') {
			this.menuItem.quantity = 1;
		}

		if (this.action == 'update' || Util.isDefined(this.menuItem.selectedMenuItemSize) || Util.isDefined(this.menuItem.menuItemOptions) || Util.isDefined(this.menuItem.menuItemSizes)) {
			this.updateSelectedMenuItemTotalPrice();
		}
		else {
			this.menuItem.quantity = 1;

			this.helperService.loadMenuItemSizes(this.fireFlyID, this.menuItem, null)
				.then(response => {
					this.updateSelectedMenuItemTotalPrice();

					Util.log(this.LOG_TAG, 'loadMenuItemSizes()');
				}).catch(err => {

				});
		}
	}

	chooseSize = (menuItemSize?) => {
		this.helperService.loadMenuItemOptionItems(this.fireFlyID, this.menuItem, menuItemSize)
			.then(response => {
				this.updateSelectedMenuItemTotalPrice();

				Util.log(this.LOG_TAG, 'loadMenuItemOptionItems()');
			}).catch(err => {

			});
	}

	selectMenuItemOptionItem = (optionItem, menuItemOption) => {
		if (menuItemOption.Is_Single_Select) {
			// Single select
			menuItemOption.selectedOptionItem = optionItem;
		}
		else if (!menuItemOption.Is_Single_Select) {
			// Multiple select
			optionItem.isSelected = !optionItem.isSelected;

			if (optionItem.isSelected) {
				if (typeof menuItemOption.totalSelectedOptionItems === 'undefined' || !menuItemOption.totalSelectedOptionItems)
					menuItemOption.totalSelectedOptionItems = 0;

				// Maximum limit
				if (menuItemOption.Maximum_Select > 1 && menuItemOption.totalSelectedOptionItems == menuItemOption.Maximum_Select) {
					optionItem.isSelected = false;
					alert('Maximum limit reached. You cant add more.');
					return;
				}
				menuItemOption.totalSelectedOptionItems++;
			}
			else {
				menuItemOption.totalSelectedOptionItems--;
			}
		}

		this.updateSelectedMenuItemTotalPrice();
	}

	updateSelectedMenuItemQty = (value: number) => {
		var resultStatus = this.shoppingCart.updateMenuItemQty(this.menuItem, value);

		if (resultStatus == this.constants.CART_MENU_ITEM_QTY_MAX_LIMIT) {
			alert('You cant add more then ' + this.constants.CART_ITEM_MAX_LIMIT + ' items.');
		} else if (resultStatus == this.constants.CART_MENU_ITEM_QTY_ZERO_LIMIT) {
			// $scope.remove(cartItem, item);
		}

		this.updateSelectedMenuItemTotalPrice();
	}

	updateSelectedMenuItemTotalPrice = () => {
		this.selectedMenuItemTotalPrice = ShoppingCart.calculateMenuItemTotalPrice(this.menuItem);

		Util.log('selectedMenuItemTotalPrice', this.selectedMenuItemTotalPrice);
	}

	addToCart = () => {
		var isValid = true;

		// Checks if menu item size is available and user has choosen atleast 1 size
		if (this.menuItem.menuItemSizes && this.menuItem.menuItemSizes.length > 0 && (!Util.isDefined(this.menuItem.selectedMenuItemSize) || !this.menuItem.selectedMenuItemSize)) {
			isValid = false;
			this.toastr.error('You need to choose atleast 1 option', 'Choose item size');
		} else {
			// Checks the validation rules on the option items of a particular menu item
			for (var i in this.menuItem.menuItemOptions) {
				var menuItemOption = this.menuItem.menuItemOptions[i];

				// For single select items
				if (menuItemOption.Is_Single_Select) {
					if (!Util.isDefined(menuItemOption.selectedOptionItem) || !menuItemOption.selectedOptionItem) {
						isValid = false;
						this.toastr.error('You need to choose atleast 1 option', menuItemOption.OptionHeader);
						break;
					}
				} else {
					// For multi select items
					var totalSelectedOptionItems = menuItemOption.totalSelectedOptionItems || 0;
					if (totalSelectedOptionItems < menuItemOption.Minimum_Select) {
						isValid = false;
						this.toastr.error('You need to choose atleast ' + menuItemOption.Minimum_Select + ' option', menuItemOption.OptionHeader);
						break;
					}
				}
			}
		}

		if (isValid) {
			this.onItemSelected.emit({
				item: this.menuItem,
				action: this.action
			});
		}
	}

	close = () => {
		this.onItemSelected.emit({
			item: null
		});
	}

}