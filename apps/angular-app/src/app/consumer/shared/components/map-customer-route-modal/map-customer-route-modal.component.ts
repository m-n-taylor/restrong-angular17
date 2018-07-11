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
	selector: 'map-customer-route-modal',
	templateUrl: './map-customer-route-modal.component.html',
})
export class MapCustomerRouteModalComponent extends BaseModal {

	/**
	 * Properties
	 */
	LOG_TAG = 'MapCustomerRouteModalComponent';

	restaurant: MenuItem;

	route: any = {
		details: <any>{},
		distance: 0,
		duration: 0,
	};

	customerLatLng = null;
	restLatLng = null;
	map = null;

	busy = false;

	@Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();

	@ViewChild('customerOverlayView') customerOverlayView: any;
	@ViewChild('restOverlayView') restOverlayView: any;

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
		this.restaurant = data.restaurant;

		this.loadData();
	}

	loadData = () => {
		Util.log(this.LOG_TAG, 'loadData()');

		this.busy = true;

		this.initMap();
	}

	initMap = () => {

		setTimeout(() => {

			Util.log(this.LOG_TAG, 'initMap()');

			this.customerLatLng = UserAddress.getLatLng(this.sharedDataService.userAddress);
			this.restLatLng = { lat: parseFloat(this.restaurant.Latitude), lng: parseFloat(this.restaurant.Longitude) };

			var mapOptions = Util.clone(this.constants.DEFAULT_MAP_OPTIONS);
			mapOptions.center = this.customerLatLng;
			mapOptions.zoomControl = true;

			this.map = new google.maps.Map(document.getElementById('customer-route-map'), mapOptions);

			// Customer Marker
			var customerMarker = new google.maps.Marker({
				position: this.customerLatLng,
				map: this.map,
				icon: {
					url: this.helperService.getSimpleMapIcon(this.sharedDataService.platformSettings.Color_UserMapIcon),
				},
			});

			var customerOverlay = new GMapOverlayView(this.customerOverlayView.nativeElement, this.map, null, {
				marginBottom: 41
			});
			customerOverlay.open(customerMarker.position, null);

			// Rest Marker
			var restMarker = new google.maps.Marker({
				position: this.restLatLng,
				map: this.map,
				icon: {
					url: this.helperService.getForkMapIcon(this.sharedDataService.platformSettings.Color_RestMapIcon),
				},
			});

			var restOverlay = new GMapOverlayView(this.restOverlayView.nativeElement, this.map, null, {
				marginBottom: 45
			});
			restOverlay.open(restMarker.position, null);

			Util.log(this.LOG_TAG, 'InfoWindow');

			google.maps.event.addListenerOnce(this.map, 'idle', () => {

				var directionsService = new google.maps.DirectionsService();
				var directionsDisplay = new google.maps.DirectionsRenderer({
					suppressMarkers: true, polylineOptions: {
						strokeColor: '#39CE7B'
					}
				});

				var request = {
					origin: this.customerLatLng,
					destination: this.restLatLng,
					travelMode: google.maps.TravelMode.DRIVING
				};

				directionsService.route(request, (response, status) => {
					this.zone.run(() => {

						if (status == google.maps.DirectionsStatus.OK) {
							directionsDisplay.setDirections(response);

							var point = response.routes[0].legs[0];

							this.route.distance = point.distance.text;
							this.route.duration = point.duration.text;

							this.busy = false;

							Util.log(this.LOG_TAG, 'directionsDisplay() => route', response);
						}

					});
				});

				directionsDisplay.setMap(this.map);
			});

		}, 500);

	}

	close = () => {
		this.modalEvents.emit({
			action: 'close',
			data: {}
		});

		this.closeModal();
	}
}