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
	selector: 'thank-you-points-modal',
	templateUrl: './thank-you-points-modal.component.html',
})
export class ThankYouPointsModalComponent extends BaseModal {

	/**
	 * Properties
	 */
	LOG_TAG = 'ThankYouPointsModalComponent';

	totalPoints = 0;
	pastOrder: any = {};

	busy = false;

	constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public eventsService: EventsService, private zone: NgZone, private sharedDataService: SharedDataService, private helperService: HelperService) {
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
		this.totalPoints = data.totalPoints;
		this.pastOrder = data.pastOrder;
	}

	close = () => {
		this.closeModal();
	}
}