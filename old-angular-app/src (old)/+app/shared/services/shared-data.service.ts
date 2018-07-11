/**
 * SharedData
 */
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { isBrowser } from 'angular2-universal';

// Shared Helpers
import { Util } from '../util';
import { Constants } from '../constants';

// Shared Models
import { Cuisine } from '../models/cuisine';
import { ServiceFee } from '../models/service-fee';
import { SharedData } from '../models/shared-data';
import { QueryParams } from '../models/query-params';
import { UserAddress } from '../models/user-address';
import { TaxRateAPIRequestData } from '../models/tax-rate-api-request-data';
import { SearchMenuAPIRequestData } from '../models/search-menu-api-request-data';

// Shared Services
import { EventsService } from './events.service';
import { AppService } from './app.service';

@Injectable()
export class SharedDataService {
    private static SHARED_DATA_KEY = 'SHARED_DATA_KEY';

    public data = new SharedData();

    constructor(private eventsService: EventsService, private appService: AppService, private route: ActivatedRoute, private constants: Constants) {

        this.data.serviceType = constants.SERVICE_TYPE_DELIVERY;
        this.data.taxPercent = 0;
        this.data.driverTipPercent = 11;
        this.data.deliveryNotes = '';
        this.data.aptSuiteNo = '';

        if (isBrowser) {

            // Restore fields from sessionStorage if exists
            var sharedDataStr = sessionStorage.getItem(SharedDataService.SHARED_DATA_KEY);

            if (Util.isDefined(sharedDataStr)) {
                var sharedData = <SharedData>JSON.parse(sharedDataStr);

                this.data = sharedData;
            }

            // Restore fields from query params 
            this.route.queryParams.subscribe((params: any) => {

                if (Util.isDefined(params) && Object.keys(params).length > 0) {

                    this.data.serviceType = params.serviceType;

                    // Gets `cusines` from server
                    var requestData = new SearchMenuAPIRequestData();
                    requestData.page = 1;
                    requestData.pageSize = 100;

                    var queryParams = new QueryParams();

                    QueryParams.fillParams(queryParams, params);

                    SearchMenuAPIRequestData.fillQueryParams(requestData, queryParams);

                    this.data.cuisines = new Array<any>();

                    this.appService.searchCuisine(requestData).subscribe(response => {
                        this.data.cuisines = response.Data;

                        for(var i in this.data.cuisines) {
                            var cuisine = this.data.cuisines[i];

                            for(var j in this.data.selectedCuisines) {
                                var selectedCuisine = this.data.selectedCuisines[j];

                                if(cuisine.id == selectedCuisine.id) {
                                    cuisine.isSelected = true;
                                    break;
                                }

                            }
                        }

                        this.save();

                        Util.log('cuisines', this.data.cuisines);
                    });

                }
                Util.log('QueryParams shared data', params);
            });

            // Listen to `user location changed` event
            this.eventsService.onUserLocationChanged.subscribe((googlePlace) => {

                // Init user location
                this.data.userAddress = UserAddress.initFromGooglePlace(googlePlace);

                if (Util.isDefined(this.data.userAddress) && UserAddress.isValid(this.data.userAddress)) {

                    Util.log('user location changed...', googlePlace, this.data.userAddress);

                    // Gets `auto complete` from server
                    var searchMenuRequestData = new SearchMenuAPIRequestData();
                    searchMenuRequestData.coordinate = UserAddress.getStringCoordinate(this.data.userAddress.LatLng);
                    searchMenuRequestData.option = 1;

                    this.appService.getAutoSuggestList(searchMenuRequestData).subscribe(response => {
                        this.data.autoSuggestList = response;

                        this.save();

                        Util.log('getAutoSuggestList()', response);
                    });

                    // Gets `service fee` from server
                    this.appService.getServiceFee().subscribe(response => {
                        this.data.serviceFee = response;

                        this.save();

                        Util.log('getServiceFee response', response);
                    });

                    // Gets tax rate according to new `user address`
                    var requestData = new TaxRateAPIRequestData();

                    TaxRateAPIRequestData.fillUserAddress(requestData, this.data.userAddress);

                    this.appService.getTaxRate(requestData).subscribe(response => {

                        if (Util.isDefined(response) && Util.isDefined(response[0])) {

                            this.data.taxPercent = response[0].Value;

                            this.save();
                        }

                        Util.log('getTaxRate response', response);

                    });

                }


                //var userLatLng = UserAddress.getLatLng(this.userAddress);
                /** 
                 *  TODO: Google place sometimes doesn't gives Zip of location, 
                 *  so need to use may be `geocoder` but it returns multiple addresses
                 *  and it also changed the adress a little bit, needs a proper solution.
                 */
                // var geocoder = new google.maps.Geocoder();
                // var googleMapsLatLng = new google.maps.LatLng(userLatLng.lat, userLatLng.lng);

                // geocoder.geocode(<any>{ latLng: googleMapsLatLng }, function (data, status) {

                //     if (status == google.maps.GeocoderStatus.OK) {

                //     }
                //     else {

                //     }

                //     Util.log('geocoder.geocode...', data, status);

                // });
            });

            this.save();

        }

        Util.log('SharedData constructor()', this);
    }

    cuisineExists = (cuisine: Cuisine) => {
        var index = null;

        for (var i in this.data.selectedCuisines) {
            var selectCuisine = this.data.selectedCuisines[i];

            if (selectCuisine.id == cuisine.id) {
                index = i;
                break;
            }
        }

        return index;
    }

    addCuisine = (cuisine: Cuisine) => {
        this.data.selectedCuisines.push(cuisine);
    }

    removeCuisine = (index) => {
        this.data.selectedCuisines.splice(index, 1);
    }

    selectCuisine = (cuisine: Cuisine) => {
        var cuisineIndex = this.cuisineExists(cuisine);

        if (cuisineIndex) {
            cuisine.isSelected = false;

            this.removeCuisine(cuisineIndex);
        }
        else {
            cuisine.isSelected = true;
            
            this.addCuisine(cuisine);
        }

        this.save();
    }

    private save = () => {

        if (isBrowser) {
            sessionStorage.setItem(SharedDataService.SHARED_DATA_KEY, JSON.stringify(this.data));

            Util.log('saving shared');
        }

    }
}