/**
 * SharedData
 */
import { PLATFORM_ID, Inject, Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

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
import { CartItem } from "../models/cart-item";
import { ShoppingCart } from "../../consumer/shared/services/shopping-cart.service";
import { FiltersChangedEvent } from "../models/filters-changed-event";
import { PlatformSettings } from '../models/platform-settings';
import { StartupService } from './startup.service';

@Injectable()
export class SharedDataService extends BaseSharedDataService {
    LOGTAG = 'CRSharedDataService';

    isBrowser = false;
    busyCuisines = false;

    private get data(): SharedData {
        return (<SharedData>this._data);
    }

    private set data(sharedData: SharedData) {
        this._data = sharedData;
    }

    constructor(@Inject(PLATFORM_ID) public platformId: Object, protected eventsService: EventsService, protected appService: AppService, protected route: ActivatedRoute, protected constants: Constants, private startupService: StartupService, private sanitizer: DomSanitizer) {
        super(platformId, eventsService, appService, route, constants, 'csdk', 'localStorage');

        Util.log(this.LOGTAG, 'constructor()');

        this.isBrowser = isPlatformBrowser(this.platformId);

        this.data = new SharedData();

        // this.data.serviceType = constants.SERVICE_TYPE_DINEIN;
        // this.data.taxPercent = 0;
        this.data.driverTipPercent = 10;
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

        if (this.isBrowser) {

            if (Constants.DEBUG) {
                window['sharedData'] = this;
            }

            Util.merge(this.data, this.loadSharedData());

            // Prevent `Filters` to open on page reload
            this.data.isFiltersOpened = false;

            // Prevent `Shopping cart` to open on page reload
            this.data.isShoppingCartOpened = false;

            // Subscribe to `onFiltersChanged` Event
            this.eventsService.onFiltersChanged.subscribe(this.onFiltersChanged);

            // Listen to `user location changed` event
            // this.eventsService.onUserLocationChanged.subscribe((event) => {
            //     this._onUserAddressChange();

            //     //var userLatLng = UserAddress.getLatLng(this.userAddress);
            //     /** 
            //      *  TODO: Google place sometimes doesn't gives Zip of location, 
            //      *  so need to use may be `geocoder` but it returns multiple addresses
            //      *  and it also changed the adress a little bit, needs a proper solution.
            //      */
            //     // var geocoder = new google.maps.Geocoder();
            //     // var googleMapsLatLng = new google.maps.LatLng(userLatLng.lat, userLatLng.lng);

            //     // geocoder.geocode(<any>{ latLng: googleMapsLatLng }, function (data, status) {

            //     //     if (status == google.maps.GeocoderStatus.OK) {

            //     //     }
            //     //     else {

            //     //     }

            //     //     Util.log('geocoder.geocode...', data, status);

            //     // });
            // });

            this.save();

            // For platform
            if (this.constants.INTERNAL_DEBUG) {

                window.onmessage = (e) => {
                    var message = e.data;

                    if (message.type == 'iframe-platform-settings') {

                        setTimeout(() => {
                            if (message.action == 'reload') {
                                window.location.hash = '';
                                window.location.reload();
                            } else {
                                this.setPlatformSettings(message.platformSettings);

                                // if (message.action == 'change-address') {
                                //     local.setAddress(message.address);
                                //     window.location.hash = '';
                                //     $rootScope.state.reload();
                                // }
                            }
                        }, 100);
                    }
                }

            }

            if (this.startupService.data.Status == this.constants.STATUS_SUCCESS) {
                this.setPlatformSettings(this.startupService.data.Data);
            }
            else {
                // window.document.body.innerHTML = '';
                // alert('App is not enabled by Admin. Please contact support.');
                // window.location.reload();
            }
        }

        Util.log('SharedData constructor()');
    }

    setPlatformSettings = (platformSettings: PlatformSettings) => {
        Util.log(this.LOGTAG, 'setPlatformSettings()', platformSettings);

        // App Title
        document.title = platformSettings.App_Name;

        // View Mode
        this.viewMode = platformSettings.Default_View_Mode;

        // Service Type
        var serviceTypeID = platformSettings.Default_ServiceType || this.constants.SERVICE_TYPE_ID[this.constants.SERVICE_TYPE_DELIVERY];
        var newServiceType = this.serviceType || this.constants.SERVICE_TYPE_TITLE[serviceTypeID];
        this.serviceType = newServiceType;

        // Platform Settings
        this.platformSettings = platformSettings;

        // Init Colors
        this.initPlatformColors();
    }

    initPlatformColors = () => {
        var platformSettings = this.platformSettings;

        this.constants.initPlatformConstants(this.sanitizer, platformSettings);

        var style: HTMLElement = document.getElementById('platform-styles');

        if (!style) {
            style = document.createElement('style');
            style.setAttribute('id', 'platform-styles');
            style.setAttribute('type', 'text/css');
            document.getElementsByTagName('head')[0].appendChild(style);
        }

        var classPrefix = '.cr-app '; //body.menus-app

        var rules = [];

        var colorBalanced = platformSettings.Color_Balanced; //#39CE7B
        var colorPositive = platformSettings.Color_Positive; //#39CE7B
        var colorAssertive = platformSettings.Color_Assertive; //#39CE7B
        var colorGray = platformSettings.Color_Gray; //#39CE7B
        var colorCalm = platformSettings.Color_Calm; //#39CE7B

        var colorText1 = platformSettings.Color_Text1;
        var colorText2 = platformSettings.Color_Text2;
        var colorText3 = platformSettings.Color_Text3;

        var colorList = [{
            value: colorPositive,
            name: 'primary'
        }, {
            value: colorCalm,
            name: 'calm'
        }, {
            value: colorBalanced,
            name: 'success'
        }, {
            value: colorAssertive,
            name: 'danger'
        }, {
            value: colorGray,
            name: 'gray'
        }, {
            value: colorText1,
            name: 'text1'
        }, {
            value: colorText2,
            name: 'text2'
        }, {
            value: colorText3,
            name: 'text3'
        }];

        for (var colorIndex in colorList) {
            var color = colorList[colorIndex];

            // General
            rules.push(classPrefix + '.c-' + color.name + ' { color: ' + color.value + '!important; }');

            // :hover, :active, .active //.c-${color.name}-h.active,.c-${color.name}-ha:active,
            rules.push(`${classPrefix} .c-${color.name}-h:hover { color: ${color.value} !important; }`);

            rules.push(classPrefix + '.b-' + color.name + ' { border-color: ' + color.value + '!important; }');
            rules.push(`${classPrefix} .b-${color.name}-h:hover { border-color: ${color.value} !important; }`);

            rules.push(classPrefix + '.bg-' + color.name + ' { background-color: ' + color.value + '!important; }');
            rules.push(`${classPrefix} .bg-${color.name}-h:hover { background-color: ${color.value} !important; }`);

            // Buttons
            var btnStyle1 = '{ background-color: ' + color.value + '!important; border-color: ' + color.value + '!important; color: white!important; }';
            var btnStyle2 = '{ color: ' + color.value + '!important; background-color: white!important; }';

            rules.push(classPrefix + '.btn-' + color.name + ` ${btnStyle1}`);
            // rules.push(classPrefix + '.btn-' + color.name + `.active ${btnStyle2}`);
            // rules.push(classPrefix + '.btn-' + color.name + `:active ${btnStyle2}`);
            // rules.push(classPrefix + '.btn-' + color.name + `:hover ${btnStyle2}`);

            rules.push(classPrefix + '.btn-' + color.name + `.btn-inverse ${btnStyle2}`);
            rules.push(classPrefix + '.btn-' + color.name + `.btn-inverse.active:not(.btn-no-hover) ${btnStyle1}`);
            rules.push(classPrefix + '.btn-' + color.name + `.btn-inverse:active:not(.btn-no-hover) ${btnStyle1}`);
            rules.push(classPrefix + '.btn-' + color.name + `.btn-inverse:hover:not(.btn-no-hover) ${btnStyle1}`);

            // rules.push(classPrefix + '.btn-' + color.name + ' ');


            // rules.push(classPrefix + '.btn-' + color.name + ' { background-color: ' + color.value + '!important; }');
            // rules.push(classPrefix + '.btn-' + color.name + ':active { color: ' + color.value + '!important; }');
            // rules.push(classPrefix + '.btn-' + color.name + ' { border-color: ' + color.value + '!important; }');
            // rules.push(classPrefix + '.btn-' + color.name + '.btn-inverse { color: ' + color.value + '!important; }');
            // rules.push(classPrefix + '.btn-' + color.name + '.btn-inverse:active { background-color: ' + color.value + '!important; }');
            // rules.push(classPrefix + '.btn-' + color.name + '.btn-inverse { border-color: ' + color.value + '!important; }');

            // Chat
            // rules.push(classPrefix + '.chat-r-arrow-' + color.name + ':after { border-color: transparent ' + color.value + '!important; }');
        }

        // Slider
        var sliderStyles = `{ background: ${colorBalanced}!important; border-color: ${colorBalanced}!important; }`;
        rules.push(`input[type=range].custom-range-slider::-webkit-slider-thumb ${sliderStyles}`);
        // rules.push(`input[type=range].custom-range-slider:focus::-webkit-slider-runnable-track ${sliderStyles}`);
        rules.push(`input[type=range].custom-range-slider::-moz-range-track ${sliderStyles}`);
        rules.push(`input[type=range].custom-range-slider::-moz-range-thumb ${sliderStyles}`);
        rules.push(`input[type=range].custom-range-slider::-ms-fill-lower ${sliderStyles}`);
        rules.push(`input[type=range].custom-range-slider::-ms-fill-upper ${sliderStyles}`);
        rules.push(`input[type=range].custom-range-slider::-ms-thumb ${sliderStyles}`);
        // rules.push(`input[type=range].custom-range-slider:focus::-ms-fill-lower ${sliderStyles}`);
        // rules.push(`input[type=range].custom-range-slider:focus::-ms-fill-upper ${sliderStyles}`);

        rules.push('.range-fill.range-fill-active { background: ' + colorBalanced + '!important; }');

        // Chips
        // rules.push(classPrefix + '.chips.style-2 .chip-item.active { background-color: ' + colorBalanced + '!important; }');
        rules.push(classPrefix + '.chip-label.chip-label-primary { background-color: ' + colorPositive + '!important; }');
        rules.push(classPrefix + '.chip-label.chip-label-gray { background-color: ' + colorText1 + '!important; }');

        // Popup
        // rules.push(classPrefix + '.popup-info .popup .popup-body .title { background-color: ' + colorPositive + '!important; }');
        // rules.push(classPrefix + '.popup-info .popup .popup-buttons .button-right { color: ' + colorPositive + '!important; }');

        // rules.push(classPrefix + '.popup-info.popup-success .popup .popup-body .title { background-color: ' + colorBalanced + '!important; }');
        // rules.push(classPrefix + '.popup-info.popup-success .popup .popup-buttons .button-right { color: ' + colorBalanced + '!important; }');

        // rules.push(classPrefix + '.popup-action-sheet .popup .popup-body .title { background-color: ' + colorBalanced + '!important; }');

        // rules.push(classPrefix + '.popup-action-sheet .popup .popup-buttons .button { color: ' + colorText1 + '!important; }');
        // rules.push(classPrefix + '.popup-action-sheet .popup .popup-buttons .button.action-assertive { color: ' + colorAssertive + '!important; }');

        // Ribbon
        // rules.push(classPrefix + '.ribbon span { background: ' + colorPositive + '!important; }');
        // rules.push(classPrefix + '.ribbon span { background: linear-gradient(' + colorPositive + ' 0%, ' + colorPositive + ' 100%)!important; }');
        // rules.push(classPrefix + '.ribbon span::before { border-left-color: ' + colorPositive + '!important; }');
        // rules.push(classPrefix + '.ribbon span::before { border-top-color: ' + colorPositive + '!important; }');
        // rules.push(classPrefix + '.ribbon span::after { border-right-color: ' + colorPositive + '!important; }');
        // rules.push(classPrefix + '.ribbon span::after { border-top-color: ' + colorPositive + '!important; }');

        // List
        rules.push(classPrefix + '.list-item { color: ' + colorText1 + '!important; }');
        rules.push(classPrefix + '.list-item:hover { color: white!important; background-color: ' + colorBalanced + '!important; }');
        // rules.push(classPrefix + '.list .item { color: ' + colorText1 + '!important; }');
        // rules.push(classPrefix + '.list .item .item-note { color: ' + colorText1 + '!important; }');

        // Links
        rules.push(classPrefix + ' a { color: ' + colorText1 + '!important; }');

        // Tabs
        var tabsStyles1 = 'a { color: ' + colorBalanced + '!important; border-color: ' + colorBalanced + '!important; }';
        rules.push(classPrefix + ' .nav.nav-pills li.active ' + tabsStyles1);
        rules.push(classPrefix + ' .nav.nav-pills li:hover ' + tabsStyles1);
        var tabsStyles2 = 'a { color: ' + colorPositive + '!important; border-color: ' + colorPositive + '!important; }';
        rules.push(classPrefix + ' .nav.nav-pills.nav-primary li.active ' + tabsStyles2);
        rules.push(classPrefix + ' .nav.nav-pills.nav-primary li:hover ' + tabsStyles2);

        // Form Control
        // rules.push(classPrefix + ' .form-control { color: ' + colorText1 + '!important; }');
        rules.push(classPrefix + ' .form-control:focus { border-color: ' + colorBalanced + '!important; }');

        // Color Text 1
        rules.push(classPrefix + ' { color: ' + colorText1 + '!important; }');
        rules.push('.m-gmaps-ui-view { color: ' + colorText1 + '!important; }');

        // Color Text 2 (Input)
        // rules.push(classPrefix + ' .item.item-input span { color: ' + colorText2 + '!important; }');

        // Color Assertive (Input)
        // rules.push(classPrefix + ' .item.item-input span.c-red { color: ' + colorAssertive + '!important; }');

        style.innerHTML = rules.join('\n');
    }

    loadCuisines = () => {
        Util.log(this.LOGTAG, 'loadCuisines()');

        // Gets `cusines` from server
        this.busyCuisines = true;

        var requestData = new SearchMenuAPIRequestData();
        requestData.page = 1;

        // if (isPlatformBrowser(this.platformId)) {

        // }
        // else {
        //     requestData.coordinate = '-118.29276237406617,34.07736310823318'; //TODO: needs to discuss this
        // }

        if (this.hasUserAddress()) {
            requestData.coordinate = UserAddress.getStringCoordinate(this.userAddress.LatLng);
        }

        requestData.min_price = this.minPrice;
        requestData.max_price = this.maxPrice;
        requestData.menuType = this.serviceType;
        requestData.deliveryfee = this.deliveryFee;
        requestData.minimumorder = this.minOrder;
        requestData.proximity = this.proximity;

        // var queryParams = new QueryParams();

        // QueryParams.fillParams(queryParams, params);

        // SearchMenuAPIRequestData.fillQueryParams(requestData, queryParams);
        // SearchMenuAPIRequestData.fillSharedData(requestData, this);

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

    onFiltersChanged = (filtersData: FiltersChangedEvent) => {
        Util.log(this.LOGTAG, 'onFiltersChanged', filtersData);

        if (
            filtersData.filtersType.indexOf(this.constants.FILTER_USER_ADDRESS) > -1 ||
            filtersData.filtersType.indexOf(this.constants.FILTER_MIN_PRICE) > -1 ||
            filtersData.filtersType.indexOf(this.constants.FILTER_MAX_PRICE) > -1 ||
            filtersData.filtersType.indexOf(this.constants.FILTER_DELIVERY_FEE) > -1 ||
            filtersData.filtersType.indexOf(this.constants.FILTER_MIN_ORDER) > -1 ||
            filtersData.filtersType.indexOf(this.constants.FILTER_PROXIMITY) > -1 ||
            filtersData.filtersType.indexOf(this.constants.FILTER_SERVICE_TYPE) > -1
        ) {
            this.loadCuisines();
        }

        if (filtersData.filtersType.indexOf(this.constants.FILTER_USER_ADDRESS) > -1 && Util.isDefined(this.userAddress) && UserAddress.isValid(this.userAddress)) {

            var promiseList = [];

            // Gets `auto complete` from server
            var searchMenuRequestData = new SearchMenuAPIRequestData();
            searchMenuRequestData.coordinate = UserAddress.getStringCoordinate(this.userAddress.LatLng);
            searchMenuRequestData.option = 1;

            promiseList.push(this.appService.getAutoSuggestList(searchMenuRequestData));

            // // Gets tax rate according to new `user address`
            // var requestData = new TaxRateAPIRequestData();
            // TaxRateAPIRequestData.fillUserAddress(requestData, this.data.userAddress);

            // promiseList.push(this.appService.getTaxRate(requestData));

            Observable.forkJoin(promiseList).subscribe((responseList) => {
                var i = 0;

                var autoSuggestListResponse = responseList[i++];
                this.data.autoSuggestList = autoSuggestListResponse;

                // var taxRateResponse = responseList[i++];
                // if (Util.isDefined(taxRateResponse) && Util.isDefined(taxRateResponse[0])) {
                //     this.data.taxPercent = taxRateResponse[0].Value;
                // }

                this.save();
            });

            // this.shop


            // Gets `service fee` from server (not using service fee any more)
            // this.appService.getServiceFee().subscribe(response => {
            //     this.data.serviceFee = response;

            //     this.save();

            //     Util.log('getServiceFee response', response);
            // });

        }
    }

    /**
     * Platform Settings
     */
    public get platformSettings(): PlatformSettings {
        return this.data.platformSettings;
    }
    public set platformSettings(v: PlatformSettings) {
        this.data.platformSettings = v;
    }

    /**
     * View Mode
     */
    public get viewMode(): number {
        return this.data.viewMode;
    }
    public set viewMode(v: number) {
        this.data.viewMode = v;
        this.save();
    }

    /**
     * Filter Component
     */
    public get isFiltersOpened(): boolean {
        return this.data.isFiltersOpened;
    }

    public toggleFiltersOpened = () => {
        this.data.isFiltersOpened = !this.data.isFiltersOpened;
        this.save();

        Util.enableBodyScroll(!this.data.isFiltersOpened);
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

    public get isPlatform(): boolean {
        return Util.isDefined(this.platformSettings) && Util.isDefined(this.platformSettings.PublicKey) && this.platformSettings.PublicKey.length > 0;
    }

    /**
     * Shopping Cart Component
     */
    public get isShoppingCartOpened(): boolean {
        return this.data.isShoppingCartOpened;
    }

    public toggleShoppingCart = () => {
        this.data.isShoppingCartOpened = !this.data.isShoppingCartOpened;
        this.save();

        Util.enableBodyScroll(!this.data.isShoppingCartOpened, { mode: 'hide-scroll' });
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

        this.save();

        this.eventsService.onFiltersChanged.emit({
            filtersType: [
                this.constants.FILTER_USER_ADDRESS
            ]
        });
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