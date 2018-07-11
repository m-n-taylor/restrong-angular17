import { Component, ChangeDetectionStrategy, ViewEncapsulation, ViewChild, Output, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isBrowser } from 'angular2-universal';

// Shared Helpers
import { Util } from '../shared/util';
import { Constants } from '../shared/constants';

// Shared Models
import { HttpClient } from '../shared/services/http.client';
import { QueryParams } from '../shared/models/query-params';
import { UserAddress } from '../shared/models/user-address';
import { UserAPIRequestData } from '../shared/models/user-api-request-data';
import { SearchMenuAPIRequestData } from '../shared/models/search-menu-api-request-data';
import { UserAddressAPIRequestData } from '../shared/models/user-address-api-request-data';

// Shared Services
import { AppService } from '../shared/services/app.service';
import { ShoppingCart } from '../shared/services/shopping-cart.service';

declare var document, google;

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.Emulated,
  selector: 'user-addresses',
  templateUrl: './user-addresses.component.html',
  providers: []
})
export class UserAddressesComponent {

  /**
   * Properties
   */
  busy = false;
  successMessage: string;
  errorMessage: string;

  userAddresses = new Array<UserAddress>();

  newUserAddress: UserAddress;
  newUserAddressText: string;

  constructor(private zone: NgZone, public constants: Constants, public appService: AppService, private route: ActivatedRoute, private router: Router, public shoppingCart: ShoppingCart) {
    this.universalInit();
  }

  universalInit() {
    Util.log('universalInit()');

    if (isBrowser) {

      setTimeout(() => {
        this.initAutoCompleteLocation();
      }, 100);

    }

    this.loadData();
  }

  /**
   * Methods
   */

  loadData = () => {
    this.busy = true;

    var requestData = new UserAPIRequestData();

    this.appService.getUserAddresses(requestData).subscribe(response => {
      this.userAddresses = response;
      this.busy = false;

      Util.log('manage user addresses ', response);
    });

    Util.log('loadData');
  }

  initAutoCompleteLocation = () => {
    // Create the autocomplete object, restricting the search to geographical
    // location types.
    var autocomplete = new google.maps.places.Autocomplete(
            /** @type {!HTMLInputElement} */(document.getElementById('autocomplete-new-user-address')),
      { types: ['geocode'] });

    // When the user selects an address from the dropdown, populate the address
    // fields in the form.
    autocomplete.addListener('place_changed', () => {
      var place = autocomplete.getPlace();

      this.zone.run(() => {
        this.newUserAddress = UserAddress.initFromGooglePlace(place);

        Util.log('place changed', autocomplete, place, this.newUserAddress);
      });

    });

    Util.log('initAutoCompleteLocation()');
  }

  newUserAddressInputListener = () => {
    this.newUserAddress = null;

    Util.log('user typed address');
  }

  addNewUserAddress = () => {
    if (!Util.isDefined(this.newUserAddress)) {
      alert('You need to provide a location')
    }
    else if (!UserAddress.isValid(this.newUserAddress)) {
      alert('You need to enter a valid specific address.')
    }
    else {
      this.busy = true;

      var requestData = new UserAddressAPIRequestData();

      UserAddressAPIRequestData.fillUserAddress(requestData, this.newUserAddress);

      this.appService.saveUserAddress(requestData).subscribe(response => {

        if (Util.isDefined(response) && Util.isDefined(response.Code) && response.Code == 'ADD_DELIVERY_ADDRESS') {
          this.newUserAddress.ID = response.NewID;
          this.userAddresses.push(this.newUserAddress);

          this.successMessage = response.Message;
        }
        else {
          this.errorMessage = Util.makeErrorMessage('add delivery address');
        }

        this.newUserAddress = null;
        this.newUserAddressText = '';

        this.busy = false;

        Util.log('saveUserAddress()', response);
      });
    }

    Util.log('addNewUserAddress()112', this.newUserAddress);
  }

  deleteUserAddress = (userAddress: UserAddress) => {
    this.busy = true;

    var requestData = new UserAddressAPIRequestData();

    requestData.a = userAddress.ID;

    this.appService.deleteUserAddress(requestData).subscribe(response => {

      if (Util.isDefined(response) && Util.isDefined(response.Code) && response.Code == 'DELETE_DELIVERY_ADDRESS') {

        var userAddressIndex = this.userAddresses.indexOf(userAddress);
        if (userAddressIndex > -1) {
          this.userAddresses.splice(userAddressIndex, 1);
        }

        this.successMessage = response.Message;
      }
      else {
        this.errorMessage = Util.makeErrorMessage('delete delivery address');
      }

      this.busy = false;

      Util.log('saveUserAddress()', response);
    });
  }

}
