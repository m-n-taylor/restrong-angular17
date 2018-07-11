/**
 * SharedData
 */
import { PLATFORM_ID, Inject, Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

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
import { BaseSharedDataService } from './base-shared-data.service';
import { EventsService } from './events.service';
import { AppService } from './app.service';

@Injectable()
export class SharedDataService extends BaseSharedDataService {
    busyCuisines = false;

    private get data() : SharedData {
        return (<SharedData>this._data);
    }

    private set data(sharedData: SharedData) {
        this._data = sharedData;
    }

    constructor( @Inject(PLATFORM_ID) public platformId: Object, protected eventsService: EventsService, protected appService: AppService, protected route: ActivatedRoute, protected constants: Constants) {
        super(platformId, eventsService, appService, route, constants, 'CR_SHARED_DATA_KEY', 'sessionStorage');
        
        this.data = new SharedData();
        
        this.data.serviceType = constants.SERVICE_TYPE_DELIVERY;
        this.data.taxPercent = 0;
        this.data.driverTipPercent = 11;
        this.data.deliveryNotes = '';
        this.data.aptSuiteNo = '';

        // Filters
        this.data.isFiltersOpened = false;
        this.data.proximity = 3;
        this.data.deliveryFee = '';
        this.data.deliveryFeeStep = 3;
        this.data.minOrder = '';
        this.data.minOrderStep = 3;
        this.data.minPrice = 0;
        this.data.maxPrice = 100;

        this.data.viewMode = this.constants.VIEW_MODE_DISH;

        this.data.isShoppingCartOpened = false;

        if (isPlatformBrowser(this.platformId)) {

            Util.merge(this.data, this.loadSharedData());

            // Restore fields from query params 
            this.eventsService.onFiltersChanged.subscribe((filtersData: any) => {

                this.loadCuisines();

            });

            // Listen to `user location changed` event
            this.eventsService.onUserLocationChanged.subscribe((googlePlace) => {

                // Init user location
                this.data.userAddress = UserAddress.initFromGooglePlace(googlePlace);

                if (Util.isDefined(this.data.userAddress) && UserAddress.isValid(this.data.userAddress)) {

                    this.loadCuisines();

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

        Util.log('SharedData constructor()');
    }

    loadCuisines = () => {
        // (<SharedData>this.data).serviceType = params.serviceType;

        // Gets `cusines` from server
        this.busyCuisines = true;
        var requestData = new SearchMenuAPIRequestData();
        requestData.page = 1;
        //requestData.pageSize = 100;

        var queryParams = new QueryParams();

        // QueryParams.fillParams(queryParams, params);

        // SearchMenuAPIRequestData.fillQueryParams(requestData, queryParams);
        SearchMenuAPIRequestData.fillSharedData(requestData, this);

        this.data.cuisines = new Array<any>();

        this.appService.searchCuisine(requestData).subscribe(response => {
            this.data.cuisines = response.Data;

            for (var i in this.data.cuisines) {
                var cuisine = this.data.cuisines[i];

                for (var j in this.data.selectedCuisines) {
                    var selectedCuisine = this.data.selectedCuisines[j];

                    if (cuisine.id == selectedCuisine.id) {
                        cuisine.isSelected = true;
                        break;
                    }

                }
            }

            this.busyCuisines = false;
            this.save();

            Util.log('cuisines', this.data.cuisines);
        });
    }

    /**
     * View Mode
     */
    public get viewMode(): string {
        return this.data.viewMode;
    }
    public set viewMode(v: string) {
        this.data.viewMode = v;
        this.save();
    }

    /**
     * Filter Component
     */
    public get isFiltersOpened(): boolean {
        return this.data.isFiltersOpened;
    }
    public set isFiltersOpened(v: boolean) {
        this.data.isFiltersOpened = v;
        this.save();
    }

    public get proximity(): number {
        return this.data.proximity;
    }
    public set proximity(v: number) {
        this.data.proximity = v;
    }

    public get minPrice(): number {
        return this.data.minPrice;
    }
    public set minPrice(v: number) {
        this.data.minPrice = v;
    }

    public get maxPrice(): number {
        return this.data.maxPrice;
    }
    public set maxPrice(v: number) {
        this.data.maxPrice = v;
    }

    public get deliveryFeeStep(): number {
        return this.data.deliveryFeeStep;
    }
    public set deliveryFeeStep(v: number) {
        this.data.deliveryFeeStep = v;
    }

    public get deliveryFee(): any {
        return this.data.deliveryFee;
    }
    public set deliveryFee(v: any) {
        this.data.deliveryFee = v;
    }

    public get minOrderStep(): number {
        return this.data.minOrderStep;
    }
    public set minOrderStep(v: number) {
        this.data.minOrderStep = v;
    }

    public get minOrder(): any {
        return this.data.minOrder;
    }
    public set minOrder(v: any) {
        this.data.minOrder = v;
    }

    public get driverTipPercent(): number {
        return this.data.driverTipPercent;
    }
    public set driverTipPercent(v: number) {
        this.data.driverTipPercent = v;
    }

    public get serviceFee(): ServiceFee {
        return this.data.serviceFee;
    }
    public set serviceFee(v: ServiceFee) {
        this.data.serviceFee = v;
    }

    public get taxPercent(): number {
        return this.data.taxPercent;
    }
    public set taxPercent(v: number) {
        this.data.taxPercent = v;
    }

    public get serviceType(): string {
        return this.data.serviceType;
    }
    public set serviceType(v: string) {
        this.data.serviceType = v;
    }

    public get aptSuiteNo(): string {
        return this.data.aptSuiteNo;
    }
    public set aptSuiteNo(v: string) {
        this.data.aptSuiteNo = v;
    }

    public get deliveryNotes(): string {
        return this.data.deliveryNotes;
    }
    public set deliveryNotes(v: string) {
        this.data.deliveryNotes = v;
    }

    public get autoSuggestList(): any {
        return this.data.autoSuggestList;
    }

    /**
     * Shopping Cart Component
     */
    public get isShoppingCartOpened(): boolean {
        return this.data.isShoppingCartOpened;
    }
    public set isShoppingCartOpened(v: boolean) {
        this.data.isShoppingCartOpened = v;
        this.save();
    }
    public toggleShoppingCart = () => {
        this.data.isShoppingCartOpened = !this.data.isShoppingCartOpened;
        this.save();
    }

    /**
     * User Address
     */
    public hasUserAddress = () => {
        return Util.isDefined(this.data.userAddress);
    }

    public get userAddress(): UserAddress {
        return this.data.userAddress;
    }
    public set userAddress(v: UserAddress) {
        this.data.userAddress = v;
    }

    /**
     * Cuisines
     */

    public get cuisines(): Array<Cuisine> {
        return this.data.cuisines;
    }

    public get selectedCuisines(): Array<Cuisine> {
        return this.data.selectedCuisines;
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
}