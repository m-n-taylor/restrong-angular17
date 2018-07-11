import { Component, ChangeDetectionStrategy, ViewEncapsulation, ViewChild, PLATFORM_ID, Inject, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// Shared Models
import { MenuItem } from '../../shared/models/menu-item';
import { QueryParams } from '../../shared/models/query-params';

// Shared Services
import { AppService } from '../../shared/services/app.service';
import { SearchMenuAPIRequestData } from '../../shared/models/search-menu-api-request-data';

declare var google;

@Component({
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.Emulated,
    selector: 'restaurant-details',
    templateUrl: './restaurant-details.component.html',
    providers: []
})
export class RestaurantDetailsComponent {
    LOG_TAG = 'RestaurantDetailsComponent =>';

    routeSubscription: any;
    // queryParams = new QueryParams();
    busy: boolean;

    selectedMasterHead: any = {};
    selectedMenuItem: any = {};
    currentRestaurant = new MenuItem();

    masterHeads: any = [];

    restMap: any;

    searchText = '';

    id: string;

    params: any = {};

    @ViewChild('menuItemOptionsModal') public menuItemOptionsModal: any;

    constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public appService: AppService, private route: ActivatedRoute, private router: Router, private zone: NgZone) {
        Util.log(this.LOG_TAG, 'constructor()');

        this.routeSubscription = this.route.params
            .subscribe((params: any) => {
                this.params = params;
                this.id = params.id;

                Util.log('params()', params);

                this.universalInit();
            });
    }

    ngOnInit() {
        Util.log(this.LOG_TAG, 'ngOnInit()');
    }

    universalInit() {
        Util.log('search universalInit()');

        this.loadData();
    }

    loadData = () => {
        this.busy = true;

        this.loadMasterHeads()
            .subscribe(response => {
                this.masterHeads = response;
                Util.log('masterHeads', this.masterHeads);

                var headsPromises = [];
                var menuItemsPromises = [];
                for (var i in this.masterHeads) {
                    var masterHead = this.masterHeads[i];
                    headsPromises.push(this.loadHeads(masterHead));
                    menuItemsPromises.push(this.loadRestMenuItems(masterHead));
                }

                Observable.forkJoin(headsPromises)
                    .subscribe(headsData => {

                        Observable.forkJoin(menuItemsPromises)
                            .subscribe(menuItemsData => {
                                for (var i in this.masterHeads) {
                                    var masterHead: any = this.masterHeads[i];
                                    masterHead.heads = [];

                                    for (var headIndex in headsData[i]) {
                                        var head: any = headsData[i][headIndex];
                                        head.menuItems = [];

                                        if (head.Mhid == masterHead.Mhid) {
                                            masterHead.heads.push(head);
                                        }

                                        for (var menuItemIndex in menuItemsData[i].Data) {
                                            var menuItem: any = menuItemsData[i].Data[menuItemIndex];

                                            if (menuItemIndex == '0') this.currentRestaurant = menuItem;

                                            if (menuItem.HeadingID == head.Hid) {
                                                head.menuItems.push(menuItem);
                                            }

                                        }
                                    }
                                }
                                Util.log('menuItemsData', menuItemsData);

                                if (this.masterHeads.length > 0) {
                                    this.chooseMasterHead(this.masterHeads[0], true);
                                }

                                this.busy = false;
                            });

                        Util.log('heads', headsData);
                    });

            });
        //this.loadMenuItem();
    }

    loadMasterHeads = () => {
        var requestData = new SearchMenuAPIRequestData();
        requestData.restaurantid = 0;
        requestData.ff = this.id;
        requestData.menuType = this.constants.SERVICE_TYPE_DINEIN;
        // SearchMenuAPIRequestData.fillQueryParams(requestData, this.queryParams);

        return this.appService.searchHeadings(requestData);
    }

    loadHeads = (masterHead) => {
        var requestData = new SearchMenuAPIRequestData();
        requestData.restaurantid = 0;
        requestData.ff = this.id;
        requestData.mhid = masterHead.Mhid;
        requestData.menuType = this.constants.SERVICE_TYPE_DINEIN;

        // SearchMenuAPIRequestData.fillQueryParams(requestData, this.queryParams);

        return this.appService.searchHeadings(requestData);
    }

    loadRestMenuItems = (masterHead) => {
        Util.log('loadRestMenuItems()');

        var requestData = new SearchMenuAPIRequestData();
        requestData.restaurantid = 0;
        requestData.ff = this.id;
        requestData.mhid = masterHead.Mhid;
        requestData.menuType = this.constants.SERVICE_TYPE_DINEIN;
        //requestData.page = 1;
        //requestData.pageSize = 20;

        // SearchMenuAPIRequestData.fillQueryParams(requestData, this.queryParams);

        return this.appService.searchMenuItems(requestData);
    }

    loadRestMap = () => {
        // debugger;
        Util.log('loadRestMap() =>', this.currentRestaurant);

        var latLng = { lat: parseFloat(this.currentRestaurant.Latitude), lng: parseFloat(this.currentRestaurant.Longitude) };

        var mapOptions = Util.clone(this.constants.DEFAULT_MAP_OPTIONS);
        mapOptions.center = latLng;

        // this.zone.run(() => {
        this.restMap = new google.maps.Map(document.getElementById('rest-details-map'), mapOptions);
        // });

        this.restMap.addListener('center_changed', () => {
            // this.queryParams.lat = this.menuMap.center.lat();
            // this.queryParams.lng = this.menuMap.center.lng();

            // this.router.navigate(['rest-map-view'], { queryParams: this.queryParams });

            // Util.log('center changed', this.queryParams);
        });
    }

    chooseMasterHead = (masterHead, firstTime?: boolean) => {
        if (firstTime) {
            var matched = true;

            var cuisine = Util.replaceSpaceWithDash(this.currentRestaurant.CuisineName);
            var restName = Util.replaceSpaceWithDash(this.currentRestaurant.RestaurantName);
            var address = Util.replaceSpaceWithDash(this.currentRestaurant.Address);
            var fireFlyID = Util.replaceSpaceWithDash(this.currentRestaurant.FFID);

            if (cuisine != this.params.cuisine) {
                matched = false;
            }
            if (`${restName}-${address}` != this.params.name) {
                matched = false;
            }

            if (!matched) {
                this.router.navigate([`/restaurant/${cuisine}/${restName}-${address}/${fireFlyID}`]);
            }
        }

        this.selectedMasterHead = masterHead;

        this.searchTextChanged();

        if (isPlatformBrowser(this.platformId) && !Util.isDefined(this.restMap)) {
            setTimeout(() => {
                this.loadRestMap();
            }, 100);
        }

        Util.log('selectedMasterHead', this.selectedMasterHead);
    }

    chooseMenuItem = (menuItem) => {
        this.selectedMenuItem = menuItem;

        this.menuItemOptionsModal.open(this.selectedMenuItem);
    }

    searchTextChanged = () => {
        if (!Util.isDefined(this.searchText) || this.searchText == '') {
            this.selectedMasterHead.filteredHeads = this.selectedMasterHead.heads;
        }
        else {
            this.selectedMasterHead.filteredHeads = [];

            for (var i in this.selectedMasterHead.heads) {
                var head = this.selectedMasterHead.heads[i];
                var newHead: any = {};

                newHead.Heading = head.Heading;
                newHead.menuItems = [];

                for (var j in head.menuItems) {
                    var item: MenuItem = head.menuItems[j];

                    if (item.MenuItemName.toLowerCase().indexOf(this.searchText.toLowerCase()) > -1) {
                        newHead.menuItems.push(item);
                    }
                }

                this.selectedMasterHead.filteredHeads.push(newHead);
            }
        }

        Util.log('searchTextChanged', this.searchText);

    }

    menuItemOptionsModalEvents = (event) => {

        Util.log('event data', event);
    }
}
