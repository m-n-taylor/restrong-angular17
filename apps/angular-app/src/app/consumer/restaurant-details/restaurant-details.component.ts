import { Component, ChangeDetectionStrategy, ViewEncapsulation, ViewChild, PLATFORM_ID, Inject, NgZone, HostListener, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
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
import { SharedDataService } from "../../shared/services/shared-data.service";
import { ChangeAddressModalComponent } from "../shared/components/change-address-modal/change-address-modal.component";
import { EventsService } from "../../shared/services/events.service";
import { ToastsManager } from "ng2-toastr/ng2-toastr";
import { ShoppingCart } from "../shared/services/shopping-cart.service";
import { MasterHead } from "../shared/models/master-head";
import { Head } from "../shared/models/head";
import { UserAddress } from '../../shared/models/user-address';
import { MapCustomerRouteModalComponent } from '../shared/components/map-customer-route-modal/map-customer-route-modal.component';
import { HelperService } from '../../shared/services/helper.service';
import { DomSanitizer } from '@angular/platform-browser';

declare var google;

@Component({
    selector: 'restaurant-details',
    templateUrl: './restaurant-details.component.html',
})
export class RestaurantDetailsComponent {
    LOG_TAG = 'RestaurantDetailsComponent =>';

    // Sum of Top nav + Master Heads Height (146 is height on >= )
    HEAD_OFFSET = 160;

    isBrowser = false;

    routeSubscription: any;
    filtersChangedSubscription: any;
    shoppingCartChangedSubscription: any;

    busy: boolean;
    noResult: boolean;

    // selectedServiceType: string;
    selectedMasterHead: MasterHead;
    selectedHead: Head;
    selectedMenuItem: any;

    masterHeads: Array<MasterHead>;
    galleryMenuItems: Array<MenuItem>;

    currentRestaurant: MenuItem;
    isRestHeadsMenuFixed: boolean;
    isMasterHeadsTabSectionFixed: boolean;
    isMasterHeadsMobileTabSectionFixed: boolean;
    showRestHeadsMenu: boolean;
    listViewIcon: any;

    searchText = '';
    id: string;
    params: any = {};

    swiperConfig = {
        slidesPerView: 'auto',
        spaceBetween: 24,
        nextButton: '.swiper-button-next',
        prevButton: '.swiper-button-prev',
    };

    DEFAULT_NO_RESULT_CONFIG = {
        icon: 'burger-search-fail-icon',
        title: "We can't find menu items",
        subtitle: 'Try to change your filters or search for something else.'
    };
    noResultConfig: any = {};

    appDownloadLink = null;

    public get isRestOpen(): boolean {
        return this.isBrowser && this.currentRestaurant && this.helperService.isBetweenUTCTime(this.currentRestaurant.UTC_OpeningTime, this.currentRestaurant.UTC_ClosingTime);
    }

    @ViewChild('masterHeadsTabSection') masterHeadsTabSection: any;
    @ViewChild('restHeadsMenu') restHeadsMenu: any;
    @ViewChild('mapCustomerRouterModal') public mapCustomerRouterModal: MapCustomerRouteModalComponent;
    @ViewChild('changeAddressModal') public changeAddressModal: ChangeAddressModalComponent;
    @ViewChild('menuItemOptionsModal') public menuItemOptionsModal: any;

    constructor(@Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public appService: AppService, private route: ActivatedRoute, private router: Router, private zone: NgZone, public sharedDataService: SharedDataService, private eventsService: EventsService, private toastr: ToastsManager, private shoppingCart: ShoppingCart, private changeDetectorRef: ChangeDetectorRef, private helperService: HelperService, private sanitizer: DomSanitizer, private renderer: Renderer2) {
        this.isBrowser = isPlatformBrowser(this.platformId);

        this.listViewIcon = this.sanitizer.bypassSecurityTrustUrl(this.helperService.getListViewIcon(this.sharedDataService.platformSettings.Color_Text1));

        this.noResultConfig = this.DEFAULT_NO_RESULT_CONFIG;

        this.appDownloadLink = this.helperService.getAppDownloadLink();

        // this.renderer.selectRootElement('body');

        // Util.log(this.LOG_TAG, 'headTAG', );
    }

    @HostListener("window:scroll", [])
    onWindowScroll() {
        if (isPlatformBrowser(this.platformId) && !this.busy) {
            if (Util.isDefined(this.restHeadsMenu) && Util.isDefined(this.restHeadsMenu.nativeElement)) {
                // restHeadsMenuElement
                var restHeadsMenuElement: HTMLElement = this.restHeadsMenu.nativeElement;
                var topMasterHeadsTabSection = restHeadsMenuElement.getBoundingClientRect().top;
                this.isRestHeadsMenuFixed = topMasterHeadsTabSection < 152; // `152` is the top position of `restHeadsMenu`

                // masterHeadsTabSection
                var masterHeadsTabSection: HTMLElement = this.masterHeadsTabSection.nativeElement;
                var topMasterHeadsTabSection = masterHeadsTabSection.getBoundingClientRect().top;
                this.isMasterHeadsTabSectionFixed = topMasterHeadsTabSection < 80; // `80` is the top position of `masterHeadsTabSection`
                this.isMasterHeadsMobileTabSectionFixed = topMasterHeadsTabSection < 54; // `54` is the top position of `masterHeadsTabSection`

                // Active Head
                var length = this.selectedMasterHead.heads.length;
                for (var i = 0; i < length; i++) {
                    var head = this.selectedMasterHead.heads[i];

                    if (!head.element) {
                        head.element = document.getElementById(`head_element_${head.Hid}`);
                    }

                    if (head.element) {
                        if (!this.selectedHead && i == 0) {
                            this.selectedHead = head;
                        }

                        var top = head.element.getBoundingClientRect().top;

                        var offset = 10;

                        if (top <= this.HEAD_OFFSET + offset) {
                            this.selectedHead = head;
                        }
                        // Util.log(this.LOG_TAG, 'onWindowScroll', head.Heading, top);
                    }
                }

            }

            // var scrollTop = document.documentElement.scrollTop;

            // this.restInfoTab.isNavFixed = scrollTop > 330;

            // Util.log(this.LOG_TAG, 'onWindowScroll', scrollTop);
        }
    }

    async ngOnInit() {
        
        Util.log(this.LOG_TAG, 'ngOnInit()');

        this.initOnce();

        this.routeSubscription = this.route.params
            .subscribe((params: any) => {
                this.params = params;
                this.id = params.id;

                var selectedServiceType = params.serviceType;
                this.changeServiceType(true, selectedServiceType);

                Util.log(this.LOG_TAG, 'params()', params);

                this.initPage(true);
            });

        this.filtersChangedSubscription = this.eventsService.onFiltersChanged.subscribe(this.onFiltersChanged);
        this.shoppingCartChangedSubscription = this.eventsService.onShoppingCartChanged.subscribe(this.onShoppingCartChanged);
    }

    initOnce = () => {
        this.currentRestaurant = null;
    }

    initVariables = () => {
        this.noResult = false;
        this.selectedMenuItem = {};
        this.selectedMasterHead = new MasterHead();
        this.masterHeads = new Array<MasterHead>();
        this.galleryMenuItems = new Array<MenuItem>();
        this.isMasterHeadsTabSectionFixed = false;
        this.isRestHeadsMenuFixed = false;
    }

    initPage = (isFirstLoad) => {
        Util.log(this.LOG_TAG, 'initPage()');

        this.initVariables();
        this.loadData(isFirstLoad);
    }

    loadData = async (isFirstLoad) => {
        this.busy = true;

        var promiseList = [];

        if (isFirstLoad) {
            // promiseList.push(this.loadRestInfo());
            var restInfoResponse = await this.loadRestInfo().toPromise();
            this.currentRestaurant = restInfoResponse.Data[0];

            // this.ensureServiceTypeAvailableSelected();
        }
        promiseList.push(this.loadMasterHeads());
        promiseList.push(this.loadHeads());
        promiseList.push(this.loadRestMenuItems());

        Observable.forkJoin(promiseList)
            .subscribe((responseList: any) => {

                var i = 0;

                if (isFirstLoad) {
                    // Rest Info
                    // var restInfoResponse = responseList[i++];
                    // this.currentRestaurant = restInfoResponse.Data[0];

                    // if(Util.isDefined())
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
                        this.router.navigate([`/restaurant/${this.helperService.getFirstAvailableServiceType(this.currentRestaurant)}/${cuisine}/${restName}-${address}/${fireFlyID}`]);

                        return null;
                    }
                }

                this.loadRestMap();

                // Master Heads
                var masterHeadsResponse = responseList[i++];
                this.masterHeads = masterHeadsResponse;

                // Heads
                var headsResponse = responseList[i++];
                var headsData: Array<any> = headsResponse;

                // Menu Items
                var restMenuItemsResponse = responseList[i++];
                var menuItemsData: Array<MenuItem> = restMenuItemsResponse.Data;

                // Nesting Data
                if (this.masterHeads.length > 0 && headsData.length > 0 && menuItemsData.length > 0) {
                    this.galleryMenuItems = menuItemsData.filter(m => m.ShowImageInGallery && m.MenuImageExist);

                    for (var masterHeadIndex in this.masterHeads) {
                        var masterHead: any = this.masterHeads[masterHeadIndex];
                        masterHead.heads = [];

                        for (var headIndex in headsData) {
                            var head: any = headsData[headIndex];
                            head.menuItems = [];

                            if (head.Mhid == masterHead.Mhid) {
                                masterHead.heads.push(head);
                            }

                            for (var menuItemIndex in menuItemsData) {
                                var menuItem: any = menuItemsData[menuItemIndex];

                                if (menuItemIndex == '0') {
                                    this.currentRestaurant = menuItem;
                                    // window['currentRestaurant'] = this.currentRestaurant;
                                }

                                if (menuItem.HeadingID == head.Hid) {
                                    head.menuItems.push(menuItem);
                                }
                            }
                        }
                    }

                    this.calcMenuItemCartCount();
                    this.chooseMasterHead(this.masterHeads[0]);
                }
                else {
                    this.noResult = true;
                    this.noResultConfig.subtitle = 'Try to change your address.';

                    this.masterHeads = [];
                }


                //Util.isDefined(this.currentRestaurant) && 
                // else {
                //     this.toastr.error('Sorry, Restaurant is not available in your area. Try a different address.', 'Error!');
                //     this.openChangeAddressModal();
                // }

                this.busy = false;
            });
    }

    loadRestInfo = () => {
        Util.log(this.LOG_TAG, 'loadRestInfo()');

        var requestData = new SearchMenuAPIRequestData();
        requestData.restaurantid = 0;
        requestData.ff = this.id;
        requestData.menuType = this.sharedDataService.serviceType;
        requestData.page = 1;
        requestData.pageSize = 1;

        return this.appService.searchMenuItems(requestData);
    }

    loadMasterHeads = () => {
        var requestData = new SearchMenuAPIRequestData();
        requestData.restaurantid = 0;
        requestData.ff = this.id;
        requestData.menuType = this.sharedDataService.serviceType; //this.constants.SERVICE_TYPE_DINEIN;

        // SearchMenuAPIRequestData.fillSharedData(requestData, this.sharedDataService);

        return this.appService.searchMasterHeadings(requestData);
    }

    loadHeads = () => {
        var requestData = new SearchMenuAPIRequestData();
        requestData.restaurantid = 0;
        requestData.ff = this.id;
        requestData.menuType = this.sharedDataService.serviceType; //this.constants.SERVICE_TYPE_DINEIN;

        // SearchMenuAPIRequestData.fillSharedData(requestData, this.sharedDataService);
        // SearchMenuAPIRequestData.fillQueryParams(requestData, this.queryParams);

        return this.appService.searchHeadings(requestData);
    }

    loadRestMenuItems = () => {
        Util.log(this.LOG_TAG, 'loadRestMenuItems()');

        var requestData = new SearchMenuAPIRequestData();
        requestData.restaurantid = 0;
        requestData.ff = this.id;
        requestData.menuType = this.sharedDataService.serviceType; //this.constants.SERVICE_TYPE_DINEIN;

        if (this.sharedDataService.hasUserAddress()) {
            requestData.coordinate = UserAddress.getStringCoordinate(this.sharedDataService.userAddress.LatLng);
        }

        return this.appService.searchMenuItems(requestData);
    }

    loadRestMap = () => {
        Util.log(this.LOG_TAG, 'loadRestMap() =>', this.currentRestaurant);

        if (this.isBrowser) {
            setTimeout(() => {
                for (var i = 1; i < 3; i++) {

                    var latLng = { lat: parseFloat(this.currentRestaurant.Latitude), lng: parseFloat(this.currentRestaurant.Longitude) };

                    var mapOptions = Util.clone(this.constants.DEFAULT_MAP_OPTIONS);
                    mapOptions.center = latLng;
                    mapOptions.draggable = false;
                    mapOptions.scrollwheel = false;
                    mapOptions.disableDoubleClickZoom = true;

                    var restMap = new google.maps.Map(document.getElementById(`rest-details-map-${i}`), mapOptions);

                    // Rest Marker
                    var restMarker = new google.maps.Marker({
                        position: latLng,
                        map: restMap,
                        icon: {
                            url: this.helperService.getForkMapIcon(this.sharedDataService.platformSettings.Color_RestMapIcon),
                        },
                        animation: google.maps.Animation.DROP,
                    });

                }
            }, 100);
        }
    }

    selectServiceTypeTab = (enabledServiceType, serviceType) => {
        Util.log(this.LOG_TAG, 'changeServiceType', serviceType);

        if (enabledServiceType) {
            var cuisine = Util.replaceSpaceWithDash(this.currentRestaurant.CuisineName);
            var restName = Util.replaceSpaceWithDash(this.currentRestaurant.RestaurantName);
            var address = Util.replaceSpaceWithDash(this.currentRestaurant.Address);
            var fireFlyID = Util.replaceSpaceWithDash(this.currentRestaurant.FFID);

            this.router.navigate([`/restaurant/${serviceType}/${cuisine}/${restName}-${address}/${fireFlyID}`]);
        }
        else {
            this.toastr.error(`${this.currentRestaurant.RestaurantName} doesn't supports ${serviceType} service type.`, 'Error!');
        }
    }

    changeServiceType = (enabledServiceType, serviceType) => {
        Util.log(this.LOG_TAG, 'changeServiceType', serviceType);

        if (enabledServiceType) {
            this.eventsService.requestServiceTypeChange.emit({ value: serviceType });
        }
        else {
            this.toastr.error(`${this.currentRestaurant.RestaurantName} doesn't supports ${serviceType} service type.`, 'Error!');
        }
    }

    openChangeAddressModal = () => {
        var userAddress = this.sharedDataService.hasUserAddress() ? this.sharedDataService.userAddress : null;

        this.changeAddressModal.open({ userAddress: userAddress }).then((data) => {

            // If data is passed
            if (Util.isDefined(data)) {

                // if user address is passed
                if (Util.isDefined(data.userAddress)) {
                    this.sharedDataService.userAddress = data.userAddress;
                }
            }
            else {
                // user cancelled
            }

            Util.log(this.LOG_TAG, 'openChangeAddressModal', data);
        });
    }

    openMapCustomerRouterModal = () => {
        Util.log(this.LOG_TAG, 'openMapCustomerRouterModal');

        if (this.sharedDataService.hasUserAddress()) {
            this.mapCustomerRouterModal.open({
                restaurant: this.currentRestaurant
            });
        }
        else {
            this.toastr.error('Please choose your address first', 'Error!');
        }
    }

    chooseMasterHead = (masterHead) => {
        this.selectedMasterHead = masterHead;

        this.searchTextChanged();

        Util.log(this.LOG_TAG, 'selectedMasterHead', this.selectedMasterHead);
    }

    chooseMenuItem = (menuItem) => {
        this.selectedMenuItem = menuItem;

        this.menuItemOptionsModal.open(this.selectedMenuItem);
    }

    selectHead = (head: Head) => {
        var offset = this.HEAD_OFFSET;
        Util.scrollTo(document.documentElement, head.element.offsetTop - offset, 100);
    }

    ensureServiceTypeAvailableSelected = () => {
        var selectedServiceType = this.sharedDataService.serviceType;
        var availableServiceType = this.helperService.getFirstAvailableServiceType(this.currentRestaurant);

        if (selectedServiceType == this.constants.SERVICE_TYPE_DELIVERY) {
            if (!this.currentRestaurant.isDelivery && availableServiceType) {
                this.changeServiceType(true, availableServiceType);
            }
        }
        else if (selectedServiceType == this.constants.SERVICE_TYPE_PICKUP) {
            if (!this.currentRestaurant.isPickup && availableServiceType) {
                this.changeServiceType(true, availableServiceType);
            }
        }
        else if (selectedServiceType == this.constants.SERVICE_TYPE_CATERING) {
            if (!this.currentRestaurant.isCatering && availableServiceType) {
                this.changeServiceType(true, availableServiceType);
            }
        }
        else if (selectedServiceType == this.constants.SERVICE_TYPE_DINEIN) {
            if (!this.currentRestaurant.isDiningIn && availableServiceType) {
                this.changeServiceType(true, availableServiceType);
            }
        }
    }

    calcMenuItemCartCount = () => {
        var cartItems = this.shoppingCart.cartItems.filter(i => i.RestaurantID == this.currentRestaurant.RestaurantID);
        var cartItem = null;

        if (cartItems.length > 0) {
            cartItem = cartItems[0];
        }

        for (var masterHeadIndex in this.masterHeads) {
            var masterHead: any = this.masterHeads[masterHeadIndex];

            for (var headIndex in masterHead.heads) {
                var head: any = masterHead.heads[headIndex];

                for (var menuItemIndex in head.menuItems) {
                    var menuItem: MenuItem = head.menuItems[menuItemIndex];
                    menuItem.cartCount = 0;

                    if (cartItem) {
                        var temp = cartItem.menuItems.filter(m => m.MenuItemID == menuItem.MenuItemID);

                        if (temp.length > 0) {
                            menuItem.cartCount = temp.reduce((total, item) => {
                                return total + item.quantity;
                            }, 0);
                        }
                    }
                }
            }
        }
    }

    searchTextChanged = () => {
        var heads = this.selectedMasterHead.heads || [];

        if (!Util.isDefined(this.searchText) || this.searchText == '') {
            this.selectedMasterHead.filteredHeads = heads;
        }
        else {
            this.selectedMasterHead.filteredHeads = [];

            for (var i in heads) {
                var head = heads[i];
                var newHead: any = {};

                newHead.Heading = head.Heading;
                newHead.menuItems = [];

                for (var j in head.menuItems) {
                    var item: MenuItem = head.menuItems[j];

                    if (item.MenuItemName.toLowerCase().indexOf(this.searchText.toLowerCase()) > -1) {
                        newHead.menuItems.push(item);
                    }
                }

                if (newHead.menuItems.length > 0) {
                    this.selectedMasterHead.filteredHeads.push(newHead);
                }
            }
        }

        if (this.selectedMasterHead.filteredHeads.length == 0) {
            this.noResult = true;
            this.noResultConfig = this.DEFAULT_NO_RESULT_CONFIG;
        }
        else {
            this.noResult = false;
        }

        Util.log(this.LOG_TAG, 'searchTextChanged', this.searchText);

    }

    onFiltersChanged = () => {
        Util.log(this.LOG_TAG, 'onFiltersChanged');

        this.initPage(false);
    }

    onShoppingCartChanged = () => {
        Util.log(this.LOG_TAG, 'onShoppingCartChanged');

        this.calcMenuItemCartCount();
        this.changeDetectorRef.detectChanges();
    }

    menuItemOptionsModalEvents = (event) => {
        Util.log(this.LOG_TAG, 'event data', event);
    }

    ngOnDestroy() {
        Util.log(this.LOG_TAG, 'ngOnDestroy');

        if (this.filtersChangedSubscription) {
            this.filtersChangedSubscription.unsubscribe();
        }

        if (this.shoppingCartChangedSubscription) {
            this.shoppingCartChangedSubscription.unsubscribe();
        }

        if (this.routeSubscription) {
            this.routeSubscription.unsubscribe();
        }
    }
}
