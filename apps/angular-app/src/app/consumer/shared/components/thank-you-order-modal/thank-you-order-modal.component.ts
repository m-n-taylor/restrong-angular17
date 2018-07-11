import { Component, ViewChild, NgZone, EventEmitter, Output, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../../../shared/util';
import { Constants } from '../../../../shared/constants';

import { EventsService } from '../../../../shared/services/events.service';
import { BaseModal } from '../../../../shared/services/base-modal.service';
import { MenuItem } from '../../../../shared/models/menu-item';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { UserAddress } from '../../../../shared/models/user-address';
import { GMapOverlayView } from '../../../../shared/models/gmap-overlay';
import { HelperService } from '../../../../shared/services/helper.service';

declare var document, google;

@Component({
	selector: 'thank-you-order-modal',
	templateUrl: './thank-you-order-modal.component.html',
})
export class ThankYouOrderModalComponent extends BaseModal {

	/**
	 * Properties
	 */
	LOG_TAG = 'ThankYouOrderModalComponent';

	busy = false;

	resolve: any;

	totalOrderPaySuccess = [];
	totalOrderError = [];
	totalOrderPayError = [];

	constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public eventsService: EventsService, private zone: NgZone, private sharedDataService: SharedDataService, private helperService: HelperService) {
		super(eventsService);
	}

	/**
	 * Methods
	 */
	open = (data) => {
		this.openModal();

		this.init(data);

		return new Promise<boolean>((resolve, reject) => {
			this.resolve = resolve;
		});
	}

	init = (data) => {
		Util.log(this.LOG_TAG, 'data', data);

		this.totalOrderPaySuccess = data.totalOrderPaySuccess;
		this.totalOrderError = data.totalOrderError;
		this.totalOrderPayError = data.totalOrderPayError;
	}

	close = () => {
		this.resolve();

		this.closeModal();
	}
}