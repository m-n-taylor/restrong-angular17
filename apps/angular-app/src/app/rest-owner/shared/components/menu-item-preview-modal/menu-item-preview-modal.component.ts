import { Component, ViewChild, NgZone, EventEmitter, Output, Inject, PLATFORM_ID } from '@angular/core';
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

// RO Services
import { ROService } from '../../services/ro.service';
import { ROHelperService } from "../../services/helper.service";
import { ROMenuItem } from "../../models/ro-menu-item";

declare var document, google;

@Component({
	selector: 'menu-item-preview-modal',
	templateUrl: './menu-item-preview-modal.component.html',
	
})
export class MenuItemPreviewModalComponent extends BaseModal {

	/**
	 * Properties
	 */
	LOG_TAG = 'MenuItemPreviewModalComponent';

	fireFlyID: string;
	menuItem: ROMenuItem;

	busy = false;

	@Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();

	constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public eventsService: EventsService, private ROService: ROService, private zone: NgZone, public CRService: CRService, private helperService: ROHelperService) {
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
		var item = data.menuItem;

		this.menuItem = <ROMenuItem>{};
		this.menuItem.ID = item.MenuItemID;
		this.menuItem.Name = item.MenuItemName;
		this.menuItem.Is_Single_Size = item.IsSingleSize;
		this.menuItem.Price = item.Price;

		this.loadData();
	}

	loadData = () => {
		Util.log(this.LOG_TAG, 'loadData()');

		this.helperService.loadMenuItemSizes(this.fireFlyID, this.menuItem, null)
			.then(response => {
				Util.log(this.LOG_TAG, 'loadMenuItemSizes()');
			}).catch(err => {

			});
	}

	chooseSize = (menuItemSize?) => {
		this.helperService.loadMenuItemOptionItems(this.fireFlyID, this.menuItem, menuItemSize)
			.then(response => {
				Util.log(this.LOG_TAG, 'loadMenuItemOptionItems()');
			}).catch(err => {

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