import { Component, ViewChild, NgZone, EventEmitter, Output, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../../../shared/util';
import { Constants } from '../../../../shared/constants';

// Shared Models
import { UserAddress } from '../../../../shared/models/user-address';

// Shared Services
import { EventsService } from '../../../../shared/services/events.service';
import { BaseModal } from '../../../../shared/services/base-modal.service';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { ToastsManager } from "ng2-toastr/ng2-toastr";

declare var document, google;

@Component({
	selector: 'change-address-modal',
	templateUrl: './change-address-modal.component.html',
})
export class ChangeAddressModalComponent extends BaseModal {
	LOG_TAG = 'ChangeAddressModalComponent';

	map: any;
	autocomplete: any;
	selectedPlace: any;
	yourAddressText: string;
	userAddress = new UserAddress();
	resolve: any;
	busy = false;

	@Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();

	constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public eventsService: EventsService, public sharedDataService: SharedDataService, private zone: NgZone, private toastr: ToastsManager) {
		super(eventsService);
	}

	/**
	 * Methods
	 */
	open = (data) => {
		this.openModal();

		this.initVariables();
		this.init(data);

		return new Promise<any>((resolve, reject) => {
			this.resolve = resolve;
		});
	}

	initVariables = () => {
		this.yourAddressText = '';
	}

	init = (data) => {
		if (!Util.isDefined(data.userAddress)) {
			this.userAddress = new UserAddress();

			this.userAddress.LatLng = `${this.constants.DEFAULT_LAT},${this.constants.DEFAULT_LNG}`;
		}
		else {
			this.userAddress = data.userAddress;
		}

		this.yourAddressText = this.userAddress.Address;

		setTimeout(() => {
			this.initMap();
			this.initAutoCompleteLocation();
		}, 100);
	}

	initMap = () => {
		var latLng = UserAddress.getLatLng(this.userAddress);

		var mapOptions = Util.clone(this.constants.DEFAULT_MAP_OPTIONS);
		mapOptions.center = latLng;

		this.map = new google.maps.Map(document.getElementById('change-address-map'), mapOptions);

		google.maps.event.addListenerOnce(this.map, 'idle', () => {
			Util.log(this.LOG_TAG, 'idle');

			google.maps.event.addListener(this.map, 'center_changed', (r) => {
				Util.log(this.LOG_TAG, 'center_changed');

				var center = this.map.getCenter();

				this.decodeLocation({ 'lat': center.lat(), 'lng': center.lng() });
			});

		});
	}

	initAutoCompleteLocation = () => {
		this.autocomplete = new google.maps.places.Autocomplete(
            /** @type {!HTMLInputElement} */(document.getElementById('change-address-ac')),
			{ types: ['geocode'] });

		this.autocomplete.addListener('place_changed', () => {
			this.selectedPlace = this.autocomplete.getPlace();

			var userAddress = UserAddress.initFromGooglePlace(this.selectedPlace);

			this.setUserAddress(userAddress);

			var latLng = UserAddress.getLatLng(userAddress);
			this.map.setCenter(latLng);

			Util.log(this.LOG_TAG, 'place changed', this.selectedPlace, userAddress);
		});

		Util.log(this.LOG_TAG, 'initAutoCompleteLocation()');
	}

	initUserLocation = (userClicked) => {
		Util.log(this.LOG_TAG, 'initUserLocation', this.platformId);

		this.busy = true;

		if (navigator.geolocation) {

			navigator.geolocation.getCurrentPosition((position) => {
				Util.log(this.LOG_TAG, 'getCurrentPosition', position);

				var latitude = position.coords.latitude;
				var longitude = position.coords.longitude;

				var geocoder = new google.maps.Geocoder;

				var latlng = { lat: latitude, lng: longitude };
				geocoder.geocode({ 'location': latlng }, (results, status) => {
					if (status === 'OK') {
						if (results[0]) {
							var userAddress = UserAddress.initFromGooglePlace(results[0]);
							this.setUserAddress(userAddress);

							var latLng = UserAddress.getLatLng(userAddress);
							this.map.setCenter(latLng);

							Util.log(this.LOG_TAG, 'address', results);
						} else {
							Util.log(this.LOG_TAG, 'No results found');
						}
					} else {
						Util.log(this.LOG_TAG, 'Geocoder failed due to: ', status);
					}

					this.busy = false;
				});
			}, (err) => {
				if (userClicked) {
					this.toastr.error('You need to allow access to your location.', 'Error!');
				}

				this.busy = false;

				Util.log(this.LOG_TAG, 'Not available err', err);
			});
		}
		else {
			if (userClicked) {
				this.toastr.error('GPS is not available on your device.', 'Error!');
			}

			this.busy = false;

			Util.log(this.LOG_TAG, 'Not available');
		}
	}

	setUserAddress = (userAddress: UserAddress) => {
		this.userAddress = userAddress;
		this.zone.run(() => {
			this.yourAddressText = this.userAddress.Address;
		});
	}

	decodeLocation = (latLng) => {
		Util.log(this.LOG_TAG, 'decodeLocation()');

		var geocoder = new google.maps.Geocoder();

		geocoder.geocode({ latLng: new google.maps.LatLng(latLng.lat, latLng.lng) }, (data, status) => {
			if (status == google.maps.GeocoderStatus.OK) {
				this.selectedPlace = data[0];

				var userAddress = UserAddress.initFromGooglePlace(this.selectedPlace);

				this.setUserAddress(userAddress);

				Util.log(this.LOG_TAG, 'decodeLocation() =>', this.selectedPlace);
			}
		});
	};

	saveAddress = () => {
		// this.eventsService.onUserLocationChanged.emit(this.selectedPlace);
		Util.log(this.LOG_TAG, 'saveAddress', this.userAddress);

		if (!UserAddress.isValid(this.userAddress)) {
			this.toastr.error('Please enter your exact address', 'Error!');
		}
		else {
			this.close({ userAddress: this.userAddress });
		}
	}

	close = (data?) => {
		this.resolve(data);

		this.closeModal();
	}
}