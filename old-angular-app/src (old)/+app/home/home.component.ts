import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { isBrowser } from 'angular2-universal';

// Shared Helpers
import { Util } from '../shared/util';
import { Constants } from '../shared/constants';

// Shared Models
import { UserAddress } from '../shared/models/user-address';
import { QueryParams } from '../shared/models/query-params';

// Shared Services
import { ModelService } from '../shared/services/model.service';
import { EventsService } from '../shared/services/events.service';
import { SharedDataService } from '../shared/services/shared-data.service';

declare var google, window;

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.Emulated,
  selector: 'home',
  templateUrl: './home.component.html'
})
export class HomeComponent {
  autocomplete: any;
  queryParams = new QueryParams();

  constructor(public model: ModelService, private router: Router, public constants: Constants, private sharedData: SharedDataService, private eventsService: EventsService) {
    // we need the data synchronously for the client to set the server response
    // we create another method so we have more control for testing
    this.universalInit();
  }

  universalInit() {

  }

  ngOnInit() {
    Util.log('ngOnInit');

    if (isBrowser) {
      this.initAutoCompleteLocation();
    }
  }

  initAutoCompleteLocation = () => {
    // Create the autocomplete object, restricting the search to geographical
    // location types.
    this.autocomplete = new google.maps.places.Autocomplete(
            /** @type {!HTMLInputElement} */(document.getElementById('autocomplete-location')),
      { types: ['geocode'] });

    // When the user selects an address from the dropdown, populate the address
    // fields in the form.
    this.autocomplete.addListener('place_changed', () => {
      var place = this.autocomplete.getPlace();

      //this.queryParams.lat = place.geometry.location.lat();
      //this.queryParams.lng = place.geometry.location.lng();

      this.eventsService.onUserLocationChanged.emit(place);

      Util.log('place changed', place);
    });

    //this.geolocate();
    Util.log('initAutoCompleteLocation()');
  }

  // Bias the autocomplete object to the user's geographical location,
  // as supplied by the browser's 'navigator.geolocation' object.
  // geolocate = () => {
  //   if (navigator.geolocation) {
  //     Util.log('geolocate()');

  //     navigator.geolocation.getCurrentPosition((position) => {

  //       var geolocation = {
  //         lat: position.coords.latitude,
  //         lng: position.coords.longitude
  //       };

  //       var circle = new google.maps.Circle({
  //         center: geolocation,
  //         radius: position.coords.accuracy
  //       });

  //       Util.log('autocomplete.setBounds()', circle.getBounds());

  //       this.autocomplete.setBounds(circle.getBounds());
  //     });
  //   }
  // }

  search = (serviceType: string) => {
    var userAddress = this.sharedData.data.userAddress;

    if (!Util.isDefined(userAddress)) {
      alert('You need to provide a location')
    }
    else if (!UserAddress.isValid(userAddress)) {
      alert('You need to enter a valid specific address.')
    }
    else {
      var latLng = UserAddress.getLatLng(userAddress);

      this.queryParams.lat = latLng.lat;
      this.queryParams.lng = latLng.lng;
      this.queryParams.serviceType = serviceType;

      // Navigating to search component page with queryParams
      this.router.navigate(['search'], { queryParams: this.queryParams });
    }


    // TRY to get current location of user and put in queryParams.
    // var bounds = this.autocomplete.getBounds();
    // if (typeof bounds !== 'undefined' && bounds) {
    //   var center = bounds.getCenter();

    //   if (typeof center !== 'undefined' && center) {
    //     // queryParams.lat = center.lat();
    //     // queryParams.lng = center.lng();
    //   }
    // }

    // TODO: Convert query params to Slug params according to SEO requirments 
    // this.router.navigate(['search', 49], { queryParams: queryParams });
  }

}
