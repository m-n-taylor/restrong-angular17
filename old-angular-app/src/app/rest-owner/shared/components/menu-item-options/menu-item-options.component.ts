import { Component, ViewChild, NgZone, EventEmitter, Input, Output, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../../../shared/util';
import { Constants } from '../../../../shared/constants';

// RO Models
import { MenuItem } from '../../models/menu-item';
import { ROAPIRequestData } from '../../models/ro-api-request-data';

// CR Models
import { SearchMenuAPIRequestData } from '../../../../shared/models/search-menu-api-request-data';

// Shared Services
import { AppService as CRService } from '../../../../shared/services/app.service';
import { EventsService } from '../../../../shared/services/events.service';
import { BaseModal } from '../../../../shared/services/base-modal.service';
import { ShoppingCart } from '../../../../shared/services/shopping-cart.service';

// RO Services
import { ROService } from '../../services/ro.service';

declare var document, google;

@Component({
	selector: 'menu-item-options',
	templateUrl: './menu-item-options.component.html',
	providers: []
})
export class MenuItemOptionsComponent extends BaseModal {

	/**
	 * Properties
	 */
	LOG_TAG = 'MenuItemOptionsComponent';

	@Input() fireFlyID: string;
	@Input() menuItem: MenuItem;

	totalPrice = 0;

	// selectedMenuItemSize: any;

	// menuItemDetails = {
	// 	menuItemSizes: <any>[],
	// 	menuOptions: <any>[],
	// };

	busy = false;

	@Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();

	constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public eventsService: EventsService, private ROService: ROService, private zone: NgZone, public CRService: CRService) {
		super(eventsService);
	}

	ngOnInit() {
		Util.log(this.LOG_TAG, 'init()', this.fireFlyID, this.menuItem);

		this.menuItem.quantity = 1;

		// this.menuItemDetails = {
		// 	menuItemSizes: <any>[],
		// 	menuOptions: <any>[],
		// };

		this.loadData();
	}

	loadData = () => {
		Util.log(this.LOG_TAG, 'loadData()');

		this.busy = true;

		if (!this.menuItem.Is_Single_Size) {
			var requestData = new ROAPIRequestData();

			requestData.ff = this.fireFlyID;
			requestData.mid = this.menuItem.ID;

			this.ROService.getMenuOptionSizePreview(requestData)
				.subscribe(response => {
					this.menuItem.menuItemSizes = response.Data;

					var isDefaultFound = false;
					for (var i in this.menuItem.menuItemSizes) {
						var item = this.menuItem.menuItemSizes[i];

						if (item.Is_Default) {
							isDefaultFound = true;
							this.chooseSize(item);
							break;
						}
					}

					if (!isDefaultFound) {
						this.busy = false;
					}

					Util.log(this.LOG_TAG, 'getMenuItemSizes', response);
				});
		}
		else {
			this.chooseSize();
		}
	}

	chooseSize = (menuItemSize?) => {
		this.busy = true;

		this.menuItem.menuItemOptions = [];

		var zid = null;

		if (menuItemSize) {
			this.menuItem.selectedMenuItemSize = menuItemSize;
			zid = this.menuItem.selectedMenuItemSize.id;
		}

		var requestData = new ROAPIRequestData();

		requestData.ff = this.fireFlyID;
		requestData.mid = this.menuItem.ID;
		requestData.zid = zid;

		this.ROService.getMenuOptionsPreview(requestData)
			.subscribe(response => {
				this.menuItem.menuItemOptions = response.MenuOptions;
				this.busy = false;
			});

		this.updateTotalPrice();
	}

	chooseOptionItem = (optionItem) => {

	}

	// chooseOptionItem = () => {
	// 	if (menuItemOption.Is_Single_Select) {
	// 		// Single select
	// 		menuItemOption.selectedOptionItem = optionItem;
	// 	}
	// 	else if (!menuItemOption.Is_Single_Select) {
	// 		// Multiple select
	// 		optionItem.isSelected = !optionItem.isSelected;

	// 		if (optionItem.isSelected) {
	// 			if (typeof menuItemOption.totalSelectedOptionItems === 'undefined' || !menuItemOption.totalSelectedOptionItems)
	// 				menuItemOption.totalSelectedOptionItems = 0;

	// 			// Maximum limit
	// 			if (menuItemOption.Maximum_Select > 1 && menuItemOption.totalSelectedOptionItems == menuItemOption.Maximum_Select) {
	// 				optionItem.isSelected = false;
	// 				alert('Maximum limit reached. You cant add more.');
	// 				return;
	// 			}
	// 			menuItemOption.totalSelectedOptionItems++;
	// 		}
	// 		else {
	// 			menuItemOption.totalSelectedOptionItems--;
	// 		}
	// 	}

	// 	this.updateTotalPrice();
	// }

	updateTotalPrice = () => {
		this.totalPrice = ShoppingCart.calculateMenuItemTotalPrice(<any>this.menuItem);
	}
}