import { Component, ViewChild, NgZone, EventEmitter, Output, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../../../shared/util';
import { Constants } from '../../../../shared/constants';

// RO Models
import { User } from '../../models/user';
import { ROAPIRequestData } from '../../models/ro-api-request-data';

// Shared Services
import { EventsService } from '../../../../shared/services/events.service';
import { BaseModal } from '../../../../shared/services/base-modal.service';

// RO Services
import { ROService } from '../../services/ro.service';

declare var document, google;

@Component({
  selector: 'map-customer-route-modal',
  templateUrl: './map-customer-route-modal.component.html',
  providers: []
})
export class MapCustomerRouteModalComponent extends BaseModal {

  /**
   * Properties
   */
  LOG_TAG = 'MapCustomerRouteModalComponent';

  orderID: string;
  fireFlyID: string;

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

  constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public eventsService: EventsService, private ROService: ROService, private zone: NgZone) {
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
    this.orderID = data.orderID;
    this.fireFlyID = data.fireFlyID;

    this.loadData();
  }

  loadData = () => {
    Util.log(this.LOG_TAG, 'loadData()');

    this.busy = true;

    var requestData = new ROAPIRequestData();

    ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
    ROAPIRequestData.fillOrderID(requestData, this.orderID);

    this.ROService.getMapCustomerRoute(requestData).subscribe(response => {
      this.route.details = response;

      this.initMap();

      Util.log(this.LOG_TAG, 'getMapCustomerRoute', response);
    });
  }

  initMap = () => {

    setTimeout(() => {

      Util.log(this.LOG_TAG, 'initMap()');

      this.customerLatLng = { lat: parseFloat(this.route.details.Customer_Latitude), lng: parseFloat(this.route.details.Customer_Longitude) };
      this.restLatLng = { lat: parseFloat(this.route.details.Restaurant_Latitude), lng: parseFloat(this.route.details.Restaurant_Longitude) };

      var mapOptions = Util.clone(this.constants.DEFAULT_MAP_OPTIONS);
      mapOptions.center = this.customerLatLng;

      this.map = new google.maps.Map(document.getElementById('customer-route-map'), mapOptions);

      // Customer Marker
      var customerMarker = new google.maps.Marker({
        position: this.customerLatLng,
        map: this.map,
        icon: 'img/ro/customer-map.svg',
      });

      // Rest Marker
      var restMarker = new google.maps.Marker({
        position: this.restLatLng,
        map: this.map,
        icon: 'img/ro/restaurant-map.svg',
      });

      // var myInfo = new google.maps.InfoWindow({
      //   content: 'Restaurant'
      // });
      // myInfo.open($scope.map, restMarker);

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