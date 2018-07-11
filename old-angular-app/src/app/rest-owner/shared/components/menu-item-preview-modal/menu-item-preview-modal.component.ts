import { Component, ViewChild, NgZone, EventEmitter, Output, Inject, PLATFORM_ID } from '@angular/core';
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

// RO Services
import { ROService } from '../../services/ro.service';

declare var document, google;

@Component({
	selector: 'menu-item-preview-modal',
	templateUrl: './menu-item-preview-modal.component.html',
	providers: []
})
export class MenuItemPreviewModalComponent extends BaseModal {

	/**
	 * Properties
	 */
	LOG_TAG = 'MenuItemPreviewModalComponent';

	fireFlyID: string;
	menuItem: any;

	selectedMenuItemSize: any;

	menuItemDetails = {
		menuItemSizes: <any>[],
		menuOptions: <any>[],
	};

	busy = false;

	@Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();

	constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public eventsService: EventsService, private ROService: ROService, private zone: NgZone, public CRService: CRService) {
		super(eventsService);
	}

	/**
	 * Methods
	 */
	open = (data) => {
		this.openModal();

		this.init(data);
	}

	init = (data) => {
		Util.log(this.LOG_TAG, 'init()', data);

		this.fireFlyID = data.fireFlyID;
		this.menuItem = data.menuItem;

		this.menuItemDetails = {
			menuItemSizes: <any>[],
			menuOptions: <any>[],
		};

		this.loadData();
	}

	loadData = () => {
		Util.log(this.LOG_TAG, 'loadData()');

		this.busy = true;

		if (!this.menuItem.IsSingleSize) {
			var requestData = new ROAPIRequestData();

			requestData.ff = this.fireFlyID;
			requestData.mid = this.menuItem.MenuItemID;

			this.ROService.getMenuOptionSizePreview(requestData)
				.subscribe(response => {
					this.menuItemDetails.menuItemSizes = response.Data;

					var isDefaultFound = false;
					for (var i in this.menuItemDetails.menuItemSizes) {
						var item = this.menuItemDetails.menuItemSizes[i];

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
		this.selectedMenuItemSize = menuItemSize;

		this.busy = true;

		var zid = null;

		if (menuItemSize) {
			zid = menuItemSize.id;
		}

		var requestData = new ROAPIRequestData();

		requestData.ff = this.fireFlyID;
		requestData.mid = this.menuItem.MenuItemID;
		requestData.zid = zid;

		this.ROService.getMenuOptionsPreview(requestData)
			.subscribe(response => {
				this.menuItemDetails.menuOptions = response.MenuOptions;
				this.busy = false;
			});
	}

	close = () => {
		this.modalEvents.emit({
			action: 'close',
			data: {}
		});

		this.closeModal();
	}
}