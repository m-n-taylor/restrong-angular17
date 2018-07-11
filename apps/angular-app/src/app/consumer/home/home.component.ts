import { Component, ChangeDetectionStrategy, ViewEncapsulation, PLATFORM_ID, Inject, ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// Shared Models
import { UserAddress } from '../../shared/models/user-address';
import { QueryParams } from '../../shared/models/query-params';

// Shared Services
import { EventsService } from '../../shared/services/events.service';
import { SharedDataService } from '../../shared/services/shared-data.service';
import { AppService } from '../../shared/services/app.service';
import { SearchMenuAPIRequestData } from "../../shared/models/search-menu-api-request-data";
import { Restaurant } from "../../rest-owner/shared/models/restaurant";
import { ToastsManager } from 'ng2-toastr/src/toast-manager';
import { ShoppingCart } from '../shared/services/shopping-cart.service';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';

declare var google, Swiper;

@Component({
    selector: 'home',
    templateUrl: './home.component.html'
})
export class HomeComponent {
    LOG_TAG = 'HomeComponent';

    REST_ICON = 'img/ro/restaurant-map-gray.svg';

    isBrowser = false;
    userAddress: UserAddress;
    serviceType: string;
    autocomplete: any;
    queryParams = new QueryParams();
    yourAddressText = '';

    busyCities = false;
    cities = [];
    citiesViewList = {};

    alphabets = [];
    selectedAlphabet: string;
    selectedAlphabetCities = [];

    defaultAlphabet = 'L';

    hasBanner = true;
    currentBanner: number;
    maxBanners = 8;

    swiperConfig: any;

    restaurants = new Array<Restaurant>();

    @ViewChild('videoPlayer') videoPlayer: any;
    @ViewChild('confirmModal') confirmModal: ConfirmModalComponent;

    constructor( @Inject(PLATFORM_ID) private platformId: Object, private router: Router, public constants: Constants, public sharedDataService: SharedDataService, private eventsService: EventsService, private appService: AppService, private toastr: ToastsManager, private zone: NgZone, private changeDetectorRef: ChangeDetectorRef, private shoppingCart: ShoppingCart) {
        this.isBrowser = isPlatformBrowser(this.platformId);

        for (var i = 65; i <= 90; i++) {
            var value = String.fromCharCode(i);
            this.alphabets.push(value);
        }

        this.currentBanner = Util.getRandomInt(1, this.maxBanners);
    }

    ngOnInit() {
        Util.log(this.LOG_TAG, 'ngOnInit', this.platformId);

        this.busyCities = true;
        this.appService.getCities({}).subscribe((response: any) => {
            this.cities = response.City;

            var citiesViewList = {};

            for (var i in this.cities) {
                var item = this.cities[i];

                if (Util.isDefined(item.City[0])) {
                    var cityFirstChar = item.City[0].toUpperCase();

                    citiesViewList[cityFirstChar] = citiesViewList[cityFirstChar] || [];
                    citiesViewList[cityFirstChar].push(item);
                }
            }

            var tempList = citiesViewList;

            citiesViewList = {};

            for (var i in tempList) {
                citiesViewList[i] = Util.chunkArray(tempList[i], Math.ceil(tempList[i].length / 4));
            }

            this.citiesViewList = citiesViewList;

            this.busyCities = false;

            this.chooseAlphabet(this.defaultAlphabet);

            Util.log(this.LOG_TAG, 'getCities()', response, this.citiesViewList);
        });

        if (this.isBrowser) {
            this.serviceType = this.sharedDataService.serviceType;

            if (this.sharedDataService.hasUserAddress()) {
                this.setUserAddress(this.sharedDataService.userAddress);
            }
            else {
                this.initUserLocation(false);
            }

            setTimeout(() => {
                this.initAutoCompleteLocation();
            }, 1000);

            this.initMap();

            this.swiperConfig = {
                pagination: '.swiper-pagination',
                paginationClickable: true,
                nextButton: '.swiper-button-next',
                prevButton: '.swiper-button-prev',
                spaceBetween: 30,
                effect: 'fade',
                autoplay: 3000,
                fade: { crossFade: true },
                loop: true,
                autoHeight: true,
                // on: {
                //     init: function () {
                //         console.log('swiper init on', this); // Swiper
                //     },
                // },
                // slideChange: function () {
                //     console.log('slide changed');
                // },
                // slideChangeTransitionStart: function () {
                //     console.log('slideChangeTransitionStart');
                // },
                // slideChangeTransitionEnd: function () {
                //     console.log('slideChangeTransitionEnd');
                // }
                onInit: function (swiper) {
                },
                onSlideChangeStart: (swiper) => {
                    // this.changeDetectorRef.detectChanges();
                }
            };

            // var swiperInstance = new Swiper('.swiper-container', );

            // window['sw'] = swiperInstance;
        }
    }

    ngAfterViewInit() {
        Util.log(this.LOG_TAG, 'ngAfterViewInit');

        if (this.isBrowser) {
            var video = this.videoPlayer.nativeElement;

            var source = document.createElement('source');
            source.setAttribute('src', '/assets/videos/foodreel-v2.mp4');

            video.appendChild(source);
            video.play();
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

            var userAddress = UserAddress.initFromGooglePlace(place);
            this.setUserAddress(userAddress);

            Util.log(this.LOG_TAG, 'place changed', place);
        });

        Util.log(this.LOG_TAG, 'initAutoCompleteLocation()');
    }

    initUserLocation = (userClicked) => {
        Util.log(this.LOG_TAG, 'initUserLocation', this.platformId);

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

                            Util.log(this.LOG_TAG, 'address', results);
                        } else {
                            Util.log(this.LOG_TAG, 'No results found');
                        }
                    } else {
                        Util.log(this.LOG_TAG, 'Geocoder failed due to: ', status);
                    }
                });
            }, (err) => {
                if (userClicked) {
                    this.toastr.error('You need to allow access to your location.', 'Error!');
                }

                Util.log(this.LOG_TAG, 'Not available err', err);
            });
        }
        else {
            if (userClicked) {
                this.toastr.error('GPS is not available on your device.', 'Error!');
            }

            Util.log(this.LOG_TAG, 'Not available');
        }
    }

    // onUserLocationPermissionDenied = () => {
    //     this.toastr/
    // }

    initMap = () => {
        var mapOptions = Util.clone(this.constants.DEFAULT_MAP_OPTIONS);
        mapOptions.draggable = false;
        mapOptions.center = { lat: 34.052235, lng: -118.243683 };

        var map = new google.maps.Map(document.getElementById('home-page-map'), mapOptions);

        var request = new SearchMenuAPIRequestData();
        request.menuType = this.constants.SERVICE_TYPE_DELIVERY;
        // request.page = 1;
        // request.pageSize = 10;

        this.appService.searchRestaurant(request).subscribe((response: any) => {
            this.restaurants = response.Data;

            var markers = [];

            for (var i = 0; i < this.restaurants.length; i++) {
                var restaurant = this.restaurants[i];

                var marker = new google.maps.Marker({
                    position: { lat: parseFloat(restaurant.Latitude), lng: parseFloat(restaurant.Longitude) },
                    map: map,
                    icon: this.REST_ICON,
                    zIndex: this.constants.REST_MARKER_ZINDEX
                });
            }

            Util.log(this.LOG_TAG, 'searchRestaurant()', response);
        });
    }

    search = () => {
        if (!Util.isDefined(this.userAddress)) {
            this.toastr.error('You need to provide a location', 'Error!');
        }
        else if (!UserAddress.isValid(this.userAddress)) {
            this.toastr.error('You need to enter a valid specific address.', 'Error!');
        }
        else if (this.sharedDataService.hasUserAddress() && UserAddress.isDifferent(this.sharedDataService.userAddress, this.userAddress) && this.shoppingCart.cartItems.length > 0) {
            this.confirmModal.open({ message: this.constants.MSG_WARN_CHANGE_ADDRESS, okText: 'Continue', cancelText: 'Cancel' })
                .then((confirm) => {
                    if (confirm) {
                        this._search();
                    }
                });
        }
        else {
            this._search();
        }
    }

    private _search = () => {
        Util.log(this.LOG_TAG, 'search', this.userAddress);

        this.sharedDataService.userAddress = this.userAddress;
        this.sharedDataService.serviceType = this.serviceType;

        // Navigating to search component page with queryParams
        this.router.navigate(['search']);

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

    chooseAlphabet = (alphabet) => {
        Util.log(this.LOG_TAG, 'chooseAlphabet', alphabet);

        this.selectedAlphabet = alphabet;

        var selectedAlphabetCities = [];

        // for (var i in this.cities) {
        //     var item = this.cities[i];

        //     if (item.City.startsWith(this.selectedAlphabet)) {
        //         selectedAlphabetCities.push(item);
        //     }
        // }

        // this.selectedAlphabetCities = Util.chunkArray(this.cities, Math.ceil(this.cities.length / 4));

        // this.selectedAlphabetCities = this.cities;

        Util.log(this.LOG_TAG, 'chooseAlphabet', this.citiesViewList);
    }

    setUserAddress = (userAddress: UserAddress) => {
        this.userAddress = userAddress;
        this.yourAddressText = this.userAddress.Address;
        this.onUserAddressChange();
    }

    onUserAddressChange = () => {
        Util.log(this.LOG_TAG, 'setUserAddress()');

        var city = null;
        var state = null;

        if (Util.isDefined(this.userAddress.City)) {
            city = this.userAddress.City;
        }

        if (Util.isDefined(this.userAddress.State)) {
            state = this.userAddress.State;
        }

        if (city && state) {
            if (state.long_name == 'California') {
                var selectedAlphabet = city.long_name.toUpperCase().charAt(0);
                this.chooseAlphabet(selectedAlphabet);
            }
            else {
                this.chooseAlphabet(this.defaultAlphabet);
            }
        }
        else {
            this.chooseAlphabet(this.defaultAlphabet);
        }

        Util.log(this.LOG_TAG, city, state, this.selectedAlphabet);
    }

    replaceSpaceWithDash = (value: string): string => {
        return Util.replaceSpaceWithDash(value);
    }

    changeBanner = () => {
        if (this.currentBanner < this.maxBanners) {
            this.currentBanner++;
        }
        else {
            this.currentBanner = 1;
        }
    }

    closeBanner = () => {
        this.hasBanner = false;
    }
}
