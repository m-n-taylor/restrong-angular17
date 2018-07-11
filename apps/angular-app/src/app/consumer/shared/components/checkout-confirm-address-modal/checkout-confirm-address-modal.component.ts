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
	selector: 'checkout-confirm-address-modal',
	templateUrl: './checkout-confirm-address-modal.component.html',
})
export class CheckoutConfirmAddressModalComponent extends BaseModal {

	/**
	 * Properties
	 */
	LOG_TAG = 'CheckoutConfirmAddressModalComponent';

	restaurant: MenuItem;

	customerLatLng = null;
	restLatLng = null;
	map = null;

	busy = false;
	resolve: any;

	constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public eventsService: EventsService, private zone: NgZone, public sharedDataService: SharedDataService, private helperService: HelperService) {
		super(eventsService);
	}

	/**
	 * Methods
	 */
	open = () => {
		this.openModal();

		this.init();

		return new Promise<boolean>((resolve, reject) => {
			this.resolve = resolve;
		});
	}

	init = () => {
		Util.log(this.LOG_TAG, 'init()');

		this.initMap();
	}

	initMap = () => {

		setTimeout(() => {

			Util.log(this.LOG_TAG, 'initMap()');

			this.customerLatLng = UserAddress.getLatLng(this.sharedDataService.userAddress);

			var mapOptions = Util.clone(this.constants.DEFAULT_MAP_OPTIONS);
			mapOptions.center = this.customerLatLng;
			mapOptions.draggable = false;
			mapOptions.scrollwheel = false;
			mapOptions.disableDoubleClickZoom = true;

			this.map = new google.maps.Map(document.getElementById('checkout-confirm-address-map'), mapOptions);

			// Customer Marker
			var customerMarker = new google.maps.Marker({
				position: this.customerLatLng,
				map: this.map,
				icon: {
					url: this.helperService.getSimpleMapIcon(this.constants.colors.brandPrimary),
				},
			});

		}, 500);

	}

	close = (confirm) => {
		this.resolve(confirm);

		this.closeModal();
	}
}