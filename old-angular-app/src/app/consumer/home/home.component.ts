import { Component, ChangeDetectionStrategy, ViewEncapsulation, PLATFORM_ID, Inject, ViewChild } from '@angular/core';
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

declare var google, Swiper;

@Component({
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.Emulated,
    selector: 'home',
    templateUrl: './home.component.html'
})
export class HomeComponent {
    LOG_TAG = 'HomeComponent';

    serviceType: string;
    autocomplete: any;
    queryParams = new QueryParams();
    yourAdressText = '';

    busyCities = false;
    cities = [];

    alphabets = [];
    selectedAlphabet: string;

    @ViewChild('videoPlayer') videoPlayer: any;

    constructor( @Inject(PLATFORM_ID) private platformId: Object, private router: Router, public constants: Constants, private sharedDataService: SharedDataService, private eventsService: EventsService, private appService: AppService) {
        for (var i = 65; i <= 90; i++) {
            var value = String.fromCharCode(i);
            this.alphabets.push(value);
        }

        if (this.alphabets.length > 0) {
            this.chooseAlphabet(this.alphabets[0]);
        }
    }

    ngOnInit() {
        Util.log('ngOnInit', this.platformId);

        this.busyCities = true;
        this.appService.getCities({}).subscribe((response: any) => {
            this.cities = response.City;
            this.busyCities = false;

            Util.log(this.LOG_TAG, 'getCities()', response);
        });

        if (isPlatformBrowser(this.platformId)) {

            this.initUserLocation();

            this.initMap();

            var swiper = new Swiper('.swiper-container', {
                pagination: '.swiper-pagination',
                paginationClickable: true,
                nextButton: '.swiper-button-next',
                prevButton: '.swiper-button-prev',
                spaceBetween: 30,
                effect: 'fade',
                autoplay: 2500,
                loop: true,
                autoHeight: true,
            });
        }
    }

    ngAfterViewInit() {
        Util.log(this.LOG_TAG, 'ngAfterViewInit');

        if (isPlatformBrowser(this.platformId)) {
            var video = this.videoPlayer.nativeElement;

            var source = document.createElement('source');
            source.setAttribute('src', 'videos/foodreel-v2.mp4');

            video.appendChild(source);
            video.play();
        }
    }

    initUserLocation = () => {
        Util.log(this.LOG_TAG, 'ngOnInit', this.platformId);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                Util.log('getCurrentPosition', position);

                var latitude = position.coords.latitude;
                var longitude = position.coords.longitude;

                var geocoder = new google.maps.Geocoder;

                var latlng = { lat: latitude, lng: longitude };
                geocoder.geocode({ 'location': latlng }, (results, status) => {
                    if (status === 'OK') {
                        if (results[0]) {
                            this.setUserAddress(results[0]);

                            Util.log(this.LOG_TAG, 'address', results);
                        } else {
                            Util.log(this.LOG_TAG, 'No results found');
                        }
                    } else {
                        Util.log(this.LOG_TAG, 'Geocoder failed due to: ', status);
                    }
                });
            });
        }
    }

    initMap = () => {
        var mapOptions = Util.clone(this.constants.DEFAULT_MAP_OPTIONS);
        mapOptions.draggable = false;
        mapOptions.center = { lat: 34.052235, lng: -118.243683 };

        var map = new google.maps.Map(document.getElementById('home-page-map'), mapOptions);
    }

    chooseAlphabet = (alphabet) => {
        this.selectedAlphabet = alphabet;
    }

    setUserAddress = (address) => {
        Util.log(this.LOG_TAG, 'setUserAddress()', address);

        var localityList = address.address_components.filter(c => c.types.indexOf('locality') > -1);
        var administrativeList = address.address_components.filter(c => c.types.indexOf('administrative_area_level_1') > -1);

        var city = null;
        var state = null;

        if (localityList.length > 0) {
            city = localityList[0];
        }

        if (administrativeList.length > 0) {
            state = administrativeList[0];
        }

        var defaultAlphabet = 'L';

        if (city && state) {
            if (state.long_name == 'California') {
                this.selectedAlphabet = city.long_name.toUpperCase().charAt(0);
            }
            else {
                this.selectedAlphabet = defaultAlphabet;
            }
        }
        else {
            this.selectedAlphabet = defaultAlphabet;
        }

        Util.log(this.LOG_TAG, city, state, this.selectedAlphabet);
    }

    getCityUrl = (serviceType, city) => {
        var url = `/${serviceType}/${Util.replaceSpaceWithDash(city.City)}`;

        // if(city.ZipInfo.length > 0) {
        //     var zipcode = city.ZipInfo[0];

        //     url += `/${zipcode.Zip}/menu/page/1`;
        // }

        return url;
    }

    replaceSpaceWithDash = (value: string): string => {
        return Util.replaceSpaceWithDash(value);
    }
}
