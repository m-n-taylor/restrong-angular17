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

declare var document, google;

@Component({
  selector: 'change-address-modal',
  templateUrl: './change-address-modal.component.html',
  providers: []
})
export class ChangeAddressModalComponent extends BaseModal {

  /**
   * Properties
   */
  map: any;
  autocomplete: any;
  selectedPlace: any;

  yourAddressText = '';

  busy = false;

  @Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();

  constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public eventsService: EventsService, public sharedDataService: SharedDataService, private zone: NgZone) {
    super(eventsService);
  }

  /**
   * Methods
   */

  // DECODE LOCATION
  decodeLocation = (latLng) => {
    Util.log('decodeLocation()');

    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ latLng: new google.maps.LatLng(latLng.lat, latLng.lng) }, (data, status) => {
      if (status == google.maps.GeocoderStatus.OK) {
        this.selectedPlace = data[0];

        this.zone.run(() => {
          this.yourAddressText = this.selectedPlace.formatted_address;
        });

        // $scope.foundLatLng = latLng;
        // $log.debug($scope.foundLatLng);

        // var address = {};
        // $scope.address_components = data[0].address_components;
        // Util.decodeAddressComponents(data[0].address_components, address);
        // address.Address = data[0].formatted_address;
        // $scope.foundAddressComponents = angular.extend($scope.foundAddressComponents || {}, address);
        // angular.extend($scope.data, address);
        // $scope.addressChanged = true;
        // $timeout(function () {
        //   $scope.vm.foundAddress = address.Address;
        // });

        Util.log('decodeLocation() =>', this.selectedPlace);
      }
    });
  };

  initMap = () => {

    var latLng = UserAddress.getLatLng(this.sharedDataService.userAddress);

    var mapOptions = Util.clone(this.constants.DEFAULT_MAP_OPTIONS);
    mapOptions.center = latLng;

    this.map = new google.maps.Map(document.getElementById('change-address-map'), mapOptions);

    this.map.addListener('center_changed', () => {
      // this.queryParams.lat = this.menuMap.center.lat();
      // this.queryParams.lng = this.menuMap.center.lng();

      // this.router.navigate(['rest-map-view'], { queryParams: this.queryParams });

      // Util.log('center changed', this.queryParams);
    });

    google.maps.event.addListenerOnce(this.map, 'idle', () => {

      google.maps.event.addListener(this.map, 'dragend', (r) => {

        var c = this.map.getCenter();
        this.decodeLocation({ 'lat': c.lat(), 'lng': c.lng() });

      });

    });

  }

  initAutoCompleteLocation = () => {
    // Create the autocomplete object, restricting the search to geographical
    // location types.
    this.autocomplete = new google.maps.places.Autocomplete(
            /** @type {!HTMLInputElement} */(document.getElementById('change-address-ac')),
      { types: ['geocode'] });

    // When the user selects an address from the dropdown, populate the address
    // fields in the form.
    this.autocomplete.addListener('place_changed', () => {
      this.selectedPlace = this.autocomplete.getPlace();

      //this.queryParams.lat = place.geometry.location.lat();
      //this.queryParams.lng = place.geometry.location.lng();



      Util.log('place changed', this.selectedPlace);
    });

    //this.geolocate();
    Util.log('initAutoCompleteLocation()');
  }

  init = () => {
    if (isPlatformBrowser(this.platformId)) {

      setTimeout(() => {

        this.initMap();
        this.initAutoCompleteLocation();

        this.yourAddressText = this.sharedDataService.userAddress.Address;

      }, 100);

    }
  }

  open = () => {
    this.openModal();

    this.init();
  }

  saveAddress = () => {
    this.eventsService.onUserLocationChanged.emit(this.selectedPlace);

    this.close();
  }

  close = () => {
    this.modalEvents.emit({
      action: 'close',
      data: {}
    });

    this.closeModal();
  }
}