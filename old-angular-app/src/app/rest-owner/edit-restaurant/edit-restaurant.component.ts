import { Component, OnInit, HostListener, Inject, PLATFORM_ID, ViewChild, ElementRef, ViewContainerRef, ComponentFactoryResolver, ApplicationRef, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser, DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/combineLatest';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// Shared Components
import { BreadcrumbService } from '../../shared/components/breadcrumb/breadcrumb.module';

// RO Models
import { Restaurant } from '../shared/models/restaurant';
import { MasterHead } from '../shared/models/master-head';
import { MenuItem } from '../shared/models/menu-item';
import { Coupon } from '../shared/models/coupon';
import { DeliveryZone } from '../shared/models/delivery-zone';
import { ROAPIRequestData } from '../shared/models/ro-api-request-data';
import { MasterHeadAPIRequestData } from '../shared/models/masterhead-api-request-data';

// Shared Services
import { InputService } from '../../shared/services/input.service';
import { EventsService } from '../../shared/services/events.service';
import { PathService as Path } from '../../shared/services/path.service';

// RO Services
import { ROService } from '../shared/services/ro.service';
import { SharedDataService } from '../shared/services/shared-data.service';
import { HelperService } from '../shared/services/helper.service';
import { UserService } from '../shared/services/user.service';

// Shared Components
import { DateTimeOptions, DateTimeComponent } from '../../shared/components/datetime/datetime.component';

// RO Shared Components
import { OrderStatusHistoryModalComponent } from '../shared/components/order-status-history-modal/order-status-history-modal.component';
import { RestContractModalComponent } from '../shared/components/rest-contract-modal/rest-contract-modal.component';
import { SaveMasterHeadModalComponent } from '../shared/components/save-masterhead-modal/save-masterhead-modal.component';
import { SaveDeliveryZoneModalComponent } from '../shared/components/save-delivery-zone-modal/save-delivery-zone-modal.component';
import { SaveScheduleModalComponent } from '../shared/components/save-schedule-modal/save-schedule-modal.component';
import { ConfirmModalComponent } from '../shared/components/confirm-modal/confirm-modal.component';

// 3rd Party Libs
import { IMyDpOptions } from 'mydatepicker';
import * as moment from 'moment';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

declare var Chart, google, document, pdfMake;

@Component({
    selector: 'ro-edit-restaurant',
    templateUrl: './edit-restaurant.component.html'
})
export class EditRestaurantComponent implements OnInit {
    TAB_REST_INFO = 'restinfo';
    TAB_MENUS = 'menus';
    TAB_ORDERS = 'orders';
    TAB_COUPONS = 'coupons';
    TAB_PREVIEW = 'preview';
    TAB_CHARTS = 'charts';
    TAB_FIN_REPORT = 'finreport';
    TAB_FIN_STATEMENT = 'finstatement';
    TAB_CUSTOMER_REVIEW = 'customerreview';

    LOG_TAG = 'EditRestaurantComponent => ';

    isBrowser: boolean;

    restInfoTab = {
        busy: false,
        busyRestInfo: false,
        isNavFixed: false,
        activeNavItemID: '',
        navItemList: <any>[{
            heading: 'Restaurant Info',
        }, {
            label: 'Restaurant Details',
            scrollSectionID: 'restaurant-details-section',
        }, {
            label: 'Restaurant Address',
            scrollSectionID: 'restaurant-address-section',
        }, {
            label: 'Restaurant Contacts',
            scrollSectionID: 'restaurant-contacts-section',
        }, {
            label: 'Contact Details',
            scrollSectionID: 'contact-details-section',
        }, {
            label: 'Account Information',
            scrollSectionID: 'account-information-section',
        }, {
            label: 'Tax Settings',
            scrollSectionID: 'tax-settings-section',
        }, {
            label: 'Order Settings',
            scrollSectionID: 'settings-section',
        }, {
            label: 'Delivery Zone',
            scrollSectionID: 'delivery-zone-section',
        }, {
            heading: 'Working Hours',
            class: 'second-nav-heading',
        }, {
            label: 'Working Hours',
            scrollSectionID: 'working-hours-section',
        }, {
            label: 'Delivery Hours',
            scrollSectionID: 'delivery-hours-section',
        }, {
            label: 'Holidays',
            scrollSectionID: 'holidays-section',
        }],
        rest: new Restaurant(),
        restCopy: new Restaurant(),
        subscription: <any>{},
        DeliveryHours: <any>[],
        DeliveryHoursCopy: <any>[],
        deliveryHoursDTOptions: <DateTimeOptions>{
            enableTime: true,
            noCalendar: true,
        },
        WorkingHours: <any>[],
        WorkingHoursCopy: <any>[],
        workingHoursDTOptions: <DateTimeOptions>{
            enableTime: true,
            noCalendar: true,
        },
        Holidays: <any>[],
        HolidaysCopy: <any>[],
        holidaysDTOptions: <DateTimeOptions>{
            enableTime: true,
        },
        deliveryZoneList: new Array<DeliveryZone>(),
        deliveryZoneListCopy: new Array<DeliveryZone>(),
    }

    menusTab = {
        busy: false,
        searchText: '',
        autoCompleteList: <any>[],
        masterHeads: new Array<MasterHead>()
    }

    ordersTab = {
        PAGINATION_ID: 'ORDERS_PAGINATION_ID',
        busy: false,
        page: 1,
        pageSize: 50,
        pageSizeList: [50, 75, 100],
        totalPages: 0,
        totalRows: 0,
        data: <any>[],
        exportURL: null,
        showFilters: false,
        searchText: '',
        serviceType: -1,
        orderStatus: -1,
        lastRequestData: new ROAPIRequestData(),
        refreshInterval: null,
        DTOptions: <DateTimeOptions>{
            mode: 'range'
        },
        rangeDate: null,
        newOrdersToastr: null,
        latestTopOrder: null,
        latestOrder: null,
        unReadCount: 0,
        notificationAudio: null,
    }

    finReportTab = {
        busy: false,
        GraphData: <any>[],
        Details: <any>[],
        total: 0,
        finReportRangeDate: null,
        finSalesOrdersChart: null,
        DTOptions: <DateTimeOptions>{
            mode: 'range'
        },
    };

    private myDatePickerOptions: IMyDpOptions = {
        // other options...
        dateFormat: 'yyyy/mm/dd',
    };

    finStatementTab = {
        PAGINATION_ID: 'FIN_STATEMENT_PAGINATION_ID',
        busy: false,
        page: 1,
        pageSize: 25,
        totalPages: 0,
        totalRows: 0,
        Summary: <any>{},
        Details: <any>[],
        finStatementRangeDate: null,
        exportURL: null,
        DTOptions: <DateTimeOptions>{
            mode: 'range'
        },
    };

    customerReviewTab = {
        PAGINATION_ID: 'CUSTOMER_REVIEW_PAGINATION_ID',
        busy: false,
        page: 1,
        pageSize: 25,
        totalPages: 0,
        totalRows: 0,
        searchText: '',
        data: <any>[],
        exportURL: ''
    }

    authCodeExpired = false;
    subscriptionAuthCodeExpiration = null;

    fireFlyID: string;
    // restStatus: any = {};
    busyEnableOrdering = false;
    busy = true;

    activeTab = '';

    tab = null;

    @ViewChild('restImageInput') restImageInput: ElementRef;
    @ViewChild('orderStatusHistoryModal') public orderStatusHistoryModal: OrderStatusHistoryModalComponent;
    @ViewChild('restContractModal') public restContractModal: RestContractModalComponent;
    @ViewChild('saveMasterHeadModal') public saveMenuItemModal: SaveMasterHeadModalComponent;
    @ViewChild('saveDeliveryZoneModal') public saveDeliveryZoneModal: SaveDeliveryZoneModalComponent;
    @ViewChild('saveScheduleModal') public saveScheduleModal: SaveScheduleModalComponent;
    @ViewChild('confirmModal') public confirmModal: ConfirmModalComponent;
    @ViewChild('ordersDateRange') public ordersDateRange: DateTimeComponent;

    constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, private ROService: ROService, private router: Router, private route: ActivatedRoute, public input: InputService, public sharedDataService: SharedDataService, public helperService: HelperService, private breadcrumbService: BreadcrumbService, private toastr: ToastsManager, private eventsService: EventsService, private datePipe: DatePipe, private currencyPipe: CurrencyPipe, private decimalPipe: DecimalPipe, private app: ApplicationRef, private componentFactoryResolver: ComponentFactoryResolver, private vcr: ViewContainerRef, private zone: NgZone, public userService: UserService) {

        // Orders Tab
        this.ordersTab.pageSize = this.sharedDataService.pageSizeList[this.ordersTab.PAGINATION_ID] || this.ordersTab.pageSizeList[0];

        // Financial Statement Tab
        this.finStatementTab.pageSize = this.sharedDataService.pageSizeList[this.finStatementTab.PAGINATION_ID] || 25;

        // Customer Review Tab
        this.customerReviewTab.pageSize = this.sharedDataService.pageSizeList[this.customerReviewTab.PAGINATION_ID] || 25;

        Util.log(this.LOG_TAG, 'constructor()');
    }

    ngOnInit() {
        Util.log(this.LOG_TAG, 'Init()');

        this.isBrowser = isPlatformBrowser(this.platformId);

        if (isPlatformBrowser(this.platformId)) {

            Observable.combineLatest([this.route.queryParams, this.route.params]).subscribe(data => {
                Util.log(this.LOG_TAG, 'forkJoin()', data);

                /**
                 * Query Params
                 */

                var queryParams = data[0];

                // Orders Tab
                this.ordersTab.page = Util.isDefined(queryParams.ordersPage) ? queryParams.ordersPage : 1;
                this.ordersTab.pageSize = Util.isDefined(queryParams.ordersPageSize) ? queryParams.ordersPageSize : 50;
                this.ordersTab.searchText = Util.isDefined(queryParams.ordersSearch) ? queryParams.ordersSearch : '';

                // Fin Statement Tab
                this.finStatementTab.page = Util.isDefined(queryParams.fsPage) ? queryParams.fsPage : 1;
                this.finStatementTab.pageSize = Util.isDefined(queryParams.fsPageSize) ? queryParams.fsPageSize : 25;

                this.tab = queryParams.tab || this.TAB_REST_INFO;

                /**
                 * Params
                 */

                var params = data[1];

                if (this.fireFlyID != params.fireFlyID) {

                    this.fireFlyID = params.fireFlyID;
                    this.busy = true;

                    var requestData = new ROAPIRequestData();
                    ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);

                    this.ROService.getRestInfo(requestData).subscribe(response => {
                        this.restInfoTab.rest = response.Data;
                        this.restInfoTab.restCopy = Util.clone(this.restInfoTab.rest);

                        this.restInfoTab.WorkingHours = response.WorkingHours;
                        this.helperService.initEmptyDayHours(this.restInfoTab.WorkingHours);
                        this.restInfoTab.WorkingHoursCopy = Util.clone(this.restInfoTab.WorkingHours);

                        this.restInfoTab.DeliveryHours = response.DeliveryHours;
                        this.helperService.initEmptyDayHours(this.restInfoTab.DeliveryHours);
                        this.restInfoTab.DeliveryHoursCopy = Util.clone(this.restInfoTab.DeliveryHours);

                        this.restInfoTab.Holidays = response.Holidays || [];
                        this.restInfoTab.HolidaysCopy = Util.clone(this.restInfoTab.Holidays);

                        this.restInfoTab.deliveryZoneList = response.DeliveryZone || [];
                        this.restInfoTab.deliveryZoneListCopy = Util.clone(this.restInfoTab.deliveryZoneList);

                        this.busy = false;

                        this.initPage();

                        Util.log(this.LOG_TAG, 'getRestInfo', response);
                    });
                }
                else {
                    this._selectTab(this.tab);
                }
            });

            // this.route.params.subscribe(params => {
            //     Util.log(this.LOG_TAG, 'params', params);


            // });

            // this.route.queryParams.subscribe(queryParams => {


            //     // this.tab = queryParams.tab;

            //     // this.initPage();

            //     this.activeTab = queryParams.tab || this.activeTab;

            //     // if (this.tab != queryParams.tab) {
            //     //     this.tab = queryParams.tab;
            //     //     this.selectTab(this.tab);
            //     // }
            //     // else {
            //     this.selectTab(this.activeTab);
            //     // }

            //     Util.log(this.LOG_TAG, 'queryParams', queryParams);
            // });
        }
    }

    errorOnlineOrderingNotEnabled = () => {
        this.toastr.error('Online ordering is not enabled. You need to enable it first...', 'Error!');
    }

    initPage = () => {
        Util.log(this.LOG_TAG, 'initPage()', new Date().getTime());

        this.onSubscriptionChange();

        this.breadcrumbService.addFriendlyNameForRoute(`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}/${this.fireFlyID}`, this.restInfoTab.rest.Name);
        this.breadcrumbService.addFriendlyNameForRouteRegex(`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}/${this.fireFlyID}[A-Za-z0-9\?=&]+$`, this.restInfoTab.rest.Name);

        // this.busy = false;

        // Check New Order Arrived
        this.checkNewOrderArrived(true);

        this.ordersTab.refreshInterval = setInterval(() => {
            this.checkNewOrderArrived();
        }, this.sharedDataService.globalSettings.OrdersRefreshRate * 1000);

        //TODO: needs to put in `shareddataservice` of RO
        // if (this.tab) {
        this._selectTab(this.tab);
        // }
        // else if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('RO_MR_ACT_TAB')) {
        //     this.selectTab(sessionStorage.getItem('RO_MR_ACT_TAB'));
        // }
        // else {
        //     if (this.userService.isAdmin) {
        //         this.selectTab(this.TAB_REST_INFO);
        //     }
        //     else {
        //         this.selectTab(this.TAB_CHARTS);
        //     }
        // }

        this.subscriptionAuthCodeExpiration = this.eventsService.onAuthCodeExpired.subscribe((data) => {
            if (data.type == 'RO') {
                this.authCodeExpired = true;
            }

            Util.log(this.LOG_TAG, 'onAuthCodeExpired', data);
        });
    }

    selectTab = (tab, verifyEnableOrdering?) => {
        if (verifyEnableOrdering && !Util.isDefined(this.restInfoTab.rest.EnableOnlineOrdering)) {
            this.errorOnlineOrderingNotEnabled();
        }
        else {
            // If user leaves `TAB_REST_INFO`
            if (this.activeTab == this.TAB_REST_INFO && tab != this.TAB_REST_INFO && this.hasRestInfoChanges()) {
                this.unloadRestInfoTab().then((confirm) => {
                    if (confirm) {
                        // if user leaves, re-load old data
                        this.restInfoTab.rest = Util.clone(this.restInfoTab.restCopy);
                        this.restInfoTab.WorkingHours = Util.clone(this.restInfoTab.WorkingHoursCopy);
                        this.restInfoTab.DeliveryHours = Util.clone(this.restInfoTab.DeliveryHoursCopy);
                        this.restInfoTab.Holidays = Util.clone(this.restInfoTab.HolidaysCopy);

                        // this._selectTab(tab, verifyEnableOrdering);
                    }
                });
            }
            // else if (tab == this.TAB_COUPONS) {
            //     this.toastr.success('Coupon is coming soon.', 'Coming Soon!');
            // }
            else {
                this.router.navigate([`${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`, this.fireFlyID], { queryParams: { tab: tab } });

                // this._selectTab(tab, verifyEnableOrdering);
            }
        }
    }

    private _selectTab = (tab) => {
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('RO_MR_ACT_TAB', tab); //TODO: needs to put in `shareddataservice` of RO
        }

        this.activeTab = tab;

        if (this.activeTab == this.TAB_REST_INFO) {
            this.loadRestInfoTab();
        }
        else if (this.activeTab == this.TAB_MENUS) {
            this.loadMenusTab();
        }
        else if (this.activeTab == this.TAB_ORDERS) {
            this.loadOrdersTab();
        }
        else if (this.activeTab == this.TAB_COUPONS) {
            this.loadCouponsTab();
        }
        else if (this.activeTab == this.TAB_PREVIEW) {
            this.loadPreviewTab();
        }
        else if (this.activeTab == this.TAB_CHARTS) {
            this.loadChartsTab();
        }
        else if (this.activeTab == this.TAB_FIN_REPORT) {
            this.loadFinReportTab();
        }
        else if (this.activeTab == this.TAB_FIN_STATEMENT) {
            this.loadFinStatementTab();
        }
        else if (this.activeTab == this.TAB_CUSTOMER_REVIEW) {
            this.loadCustomerReviewTab();
        }
    }

    /**
     * Rest Info Tab
     */

    @HostListener("window:scroll", [])
    onWindowScroll() {
        if (isPlatformBrowser(this.platformId)) {
            var scrollTop = window.document.body.scrollTop;

            this.restInfoTab.isNavFixed = scrollTop > 330;

            for (var index in this.restInfoTab.navItemList) {
                var navItem: any = this.restInfoTab.navItemList[index];

                if (Util.isDefined(navItem.scrollSectionID)) {

                    var elementID = navItem.scrollSectionID;
                    var element = document.getElementById(elementID);
                    if (element) {
                        var topDistance = element.offsetTop;

                        if ((topDistance - 100) < scrollTop) {
                            this.restInfoTab.activeNavItemID = element.getAttribute('id');
                        }
                    }

                }
            }
        }
    }

    scrollTo = (elementID) => {
        var element = document.getElementById(elementID);

        var offset = 24;
        Util.scrollTo(window.document.body, element.offsetTop - offset, 100);
    }

    hasRestInfoChanges = () => {
        var restInfo = JSON.stringify(this.restInfoTab.rest) != JSON.stringify(this.restInfoTab.restCopy);
        var WorkingHours = JSON.stringify(this.restInfoTab.WorkingHours) != JSON.stringify(this.restInfoTab.WorkingHoursCopy);
        var DeliveryHours = JSON.stringify(this.restInfoTab.DeliveryHours) != JSON.stringify(this.restInfoTab.DeliveryHoursCopy);
        var Holidays = JSON.stringify(this.restInfoTab.Holidays) != JSON.stringify(this.restInfoTab.HolidaysCopy);
        var DeliveryZone = JSON.stringify(this.restInfoTab.deliveryZoneList) != JSON.stringify(this.restInfoTab.deliveryZoneListCopy);

        return restInfo || WorkingHours || DeliveryHours || Holidays || DeliveryZone;
    }

    loadRestInfoTab = () => {
        Util.log(this.LOG_TAG, 'loadRestInfoTab()', this.sharedDataService.globalSettings);
    }

    unloadRestInfoTab = () => {
        Util.log(this.LOG_TAG, 'unloadRestInfoTab()');

        return this.confirmModal.open({ message: `You have un-saved changes. Are you sure you want to leave this page?` });
    }

    uploadRestImage = () => {
        Util.log(this.LOG_TAG, 'uploadRestImage');

        let inputElement: HTMLInputElement = this.restImageInput.nativeElement;

        let fileCount: number = inputElement.files.length;

        let formData = new FormData();

        // a file was selected
        if (fileCount > 0) {
            var file = inputElement.files.item(0);

            if (this.constants.RO_ALLOWED_IMG_TYPES.indexOf(file.type) == -1) {
                inputElement.value = '';

                this.toastr.error('Invalid file format. Only PNG and JPG are allowed.', 'Sorry!');
            }
            else if (file.size > Util.getBytesByMb(this.constants.RO_MAX_IMG_SIZE)) {
                inputElement.value = '';

                this.toastr.error(`File size can't be greater then ${this.constants.RO_MAX_IMG_SIZE}MB.`, 'Sorry!');
            }
            else {
                formData.append('file[]', file);

                var requestData = new ROAPIRequestData();

                ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);

                this.ROService.uploadRestImage(requestData, formData).subscribe((response) => {

                    if (response.Status == this.constants.STATUS_SUCCESS) {
                        this.restInfoTab.rest.FileName = response.FileName + '&r=' + new Date().getTime();
                        this.restInfoTab.rest.RestImageExist = true;
                    }

                    Util.log(this.LOG_TAG, 'uploadRestImage', response);

                });

                Util.log(this.LOG_TAG, 'formData', formData);
            }
        }
    }

    deleteRestImage = () => {
        Util.log(this.LOG_TAG, 'deleteRestImage');

        let inputElement: HTMLInputElement = this.restImageInput.nativeElement;

        inputElement.value = '';

        this.busy = true;

        var requestData = new ROAPIRequestData();

        ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);

        this.ROService.deleteRestImage(requestData).subscribe(response => {
            if (response.Status == this.constants.STATUS_SUCCESS) {
                this.restInfoTab.rest.FileName = null;
                this.restInfoTab.rest.RestImageExist = false;
            }

            this.busy = false;

            Util.log(this.LOG_TAG, 'deleteRestImage', response);
        });
    }

    enableOrdering = () => {
        Util.log(this.LOG_TAG, 'enableOrdering');

        this.busyEnableOrdering = true;

        var requestData = new ROAPIRequestData();

        ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);

        this.ROService.enableRestOrdering(requestData).subscribe(response => {
            this.restInfoTab.rest.EnableOnlineOrdering = true;

            this.busyEnableOrdering = false;

            this.toastr.success('Ordering has been enabled.', 'Success!');

            Util.log(this.LOG_TAG, 'enableRestOrdering', response);
        });
    }

    enableRestaurant = (form) => {
        form.onSubmit({
            enableRestaurant: true,
        });
    }

    onSubscriptionChange = () => {
        var subID = this.restInfoTab.rest.SubscriptionID;

        for (var subscriptionIndex in this.sharedDataService.globalSettings.Subscription) {
            var subscription = this.sharedDataService.globalSettings.Subscription[subscriptionIndex];

            if (subscription.ID == subID) {
                this.restInfoTab.subscription = subscription;

                break;
            }
        }

        Util.log(this.LOG_TAG, 'onSubscriptionChange', this.restInfoTab.subscription);
    }

    /**
     * Delivery Zone
     */

    openSaveDeliveryZoneModal = (deliveryZone?: DeliveryZone) => {
        this.saveDeliveryZoneModal.open({
            fireFlyID: this.fireFlyID,
            restInfo: this.restInfoTab.rest,
            deliveryZone: deliveryZone,
            deliveryZoneList: this.restInfoTab.deliveryZoneList,
        });
    }

    saveDeliveryZoneModalEvents = (event) => {
        if (event.action == SaveDeliveryZoneModalComponent.EVENT_ADD_ITEM) {

        }

        Util.log(this.LOG_TAG, 'saveDeliveryZoneModalEvents', event);
    }

    deleteDeliveryZone = (index, deliveryZone: DeliveryZone) => {
        Util.log(this.LOG_TAG, 'deleteDeliveryZone()', deliveryZone);

        this.confirmModal.open({ message: `Are you sure you want to delete ${deliveryZone.Name}?` })
            .then((confirm) => {
                if (confirm) {
                    this.restInfoTab.deliveryZoneList.splice(index, 1);
                }
            });
    }

    onDeliveryZoneDragSuccess = (event) => {
        Util.log(this.LOG_TAG, 'onDeliveryZoneDragSuccess', event, this.restInfoTab.deliveryZoneList);

        this.helperService.calculateSortID(this.restInfoTab.deliveryZoneList);

        this.saveDeliveryZoneSortOrder();
    }

    saveDeliveryZoneSortOrder = () => {
        this.busy = true;

        var requestData = new ROAPIRequestData();

        ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);

        var body = {
            SortDetails: []
        };

        for (var index in this.restInfoTab.deliveryZoneList) {
            var deliveryZone = this.restInfoTab.deliveryZoneList[index];

            body.SortDetails.push({
                ID: deliveryZone.ID,
                SortID: deliveryZone.SortID,
            });
        }

        this.ROService.updateDeliveryZoneSortOrder(requestData, body).subscribe(response => {
            this.busy = false;

            Util.log(this.LOG_TAG, 'updateDeliveryZoneSortOrder', response);
        });
    }


    saveRestInfo = (event, form) => {
        Util.log(this.LOG_TAG, 'saveRestInfo', event, this.restInfoTab);

        var enableRestaurant = event.enableRestaurant || false;

        var validTime = true;

        if (this.restInfoTab.rest.DeliveryTime_Max < this.restInfoTab.rest.DeliveryTime_Min) {
            validTime = false;

            form.controls.DeliveryTime_Max.setErrors({ asyncInvalid: true, asyncInvalidMsg: ` must be greater then or equal to Delivery Time (Min)` });
        }
        else if (this.restInfoTab.rest.DeliveryTime_Max > this.restInfoTab.rest.DeliveryTime_Min) {
            form.controls.DeliveryTime_Max.setErrors(null);
        }

        if (this.restInfoTab.rest.PickupTime_Max < this.restInfoTab.rest.PickupTime_Min) {
            validTime = false;

            form.controls.PickupTime_Max.setErrors({ asyncInvalid: true, asyncInvalidMsg: ` must be greater then or equal to Pickup Time (Min)` });
        }
        else if (this.restInfoTab.rest.PickupTime_Max < this.restInfoTab.rest.PickupTime_Min) {
            form.controls.PickupTime_Max.setErrors(null);
        }

        var validWorkingHours = this.updateWorkingHoursValidation();
        var validDeliveryHours = this.updateDeliveryHoursValidation();
        var validHolidays = this.updateHolidaysValidation();

        if (form.valid && validTime && validWorkingHours && validDeliveryHours && validHolidays) {

            // If restaurant has not accepted terms/contract yet
            if (!this.restInfoTab.rest.Terms) {
                this.restContractModal.open({ rest: this.restInfoTab.rest, subscription: this.restInfoTab.subscription }).then((acceptedTerms) => {
                    if (acceptedTerms) {
                        this._saveRestInfo(enableRestaurant, true);
                    }
                });
            }
            else {
                this._saveRestInfo(enableRestaurant);
            }
        }
        else {
            this.toastr.error('Form contains some errors.', 'Sorry!');

            if (enableRestaurant) {
                setTimeout(() => {
                    this.restInfoTab.rest.Enabled = !this.restInfoTab.rest.Enabled;
                }, 100);
            }
        }
    }

    private _saveRestInfo = (enableRestaurant, acceptTerms?: boolean) => {
        this.restInfoTab.busyRestInfo = true;

        var promiseList = [];

        // Rest Info
        var requestData = new ROAPIRequestData();
        ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
        Util.merge(requestData, this.restInfoTab.rest);

        promiseList.push(this.ROService.saveRestInfo(requestData));

        // Rest Hours
        requestData = new ROAPIRequestData();
        ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
        requestData.DeliveryHours = this.restInfoTab.DeliveryHours;
        requestData.WorkingHours = this.restInfoTab.WorkingHours;
        requestData.Holidays = this.restInfoTab.Holidays;
        requestData.DeliveryZone = this.restInfoTab.deliveryZoneList;

        promiseList.push(this.ROService.saveRestInfoHours(requestData));

        // Rest Enabled
        if (enableRestaurant) {
            var requestData = new ROAPIRequestData();
            requestData.enabled = this.restInfoTab.rest.Enabled;
            ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);

            promiseList.push(this.ROService.enableRest(requestData));
        }

        Observable.forkJoin(promiseList).subscribe((response: any) => {

            this.restInfoTab.restCopy = Util.clone(this.restInfoTab.rest);

            // Rest Hours
            var restHoursResponse = response[1];

            this.restInfoTab.WorkingHours = restHoursResponse.WorkingHours;
            this.helperService.initEmptyDayHours(this.restInfoTab.WorkingHours);
            this.restInfoTab.WorkingHoursCopy = Util.clone(this.restInfoTab.WorkingHours);

            this.restInfoTab.DeliveryHours = restHoursResponse.DeliveryHours;
            this.helperService.initEmptyDayHours(this.restInfoTab.DeliveryHours);
            this.restInfoTab.DeliveryHoursCopy = Util.clone(this.restInfoTab.DeliveryHours);

            this.restInfoTab.Holidays = restHoursResponse.Holidays || [];
            this.restInfoTab.HolidaysCopy = Util.clone(this.restInfoTab.Holidays);

            this.restInfoTab.deliveryZoneList = restHoursResponse.DeliveryZone || [];
            this.restInfoTab.deliveryZoneListCopy = Util.clone(this.restInfoTab.deliveryZoneList);

            // Rest Enabled
            if (enableRestaurant) {
                this.toastr.success(`${this.restInfoTab.rest.Name} has been ${this.restInfoTab.rest.Enabled ? 'enabled' : 'disabled'}.`, 'Success!');
            }
            else {
                this.toastr.success(`${this.restInfoTab.rest.Name} has been updated.`, 'Success!');
            }

            // Accept Terms
            if (acceptTerms) {
                var requestData = new ROAPIRequestData();
                ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);

                this.ROService.acceptRestContract(requestData).subscribe((response: any) => {
                    if (response.Status == this.constants.STATUS_SUCCESS) {
                        this.restInfoTab.rest.Terms = true;
                    }
                });
            }

            this.restInfoTab.busyRestInfo = false;

            Util.log(this.LOG_TAG, 'saveRestInfoHours', response);
        });

    }

    addHour = (beforeIndex, item, editMode?: boolean) => {
        this.helperService.addHour(beforeIndex, item, editMode);
    }

    deleteHour = (index, item) => {
        item.DayDetails = item.DayDetails || [];
        item.DayDetails.splice(index, 1);
    }

    updateWorkingHoursValidation = () => {
        Util.log(this.LOG_TAG, 'updateWorkingHoursValidation');

        return this.helperService.validateHours(this.restInfoTab.WorkingHours);
    }

    deleteWorkingHour = (index, item) => {
        this.deleteHour(index, item);

        this.updateWorkingHoursValidation();
    }

    updateDeliveryHoursValidation = () => {
        Util.log(this.LOG_TAG, 'updateDeliveryHoursValidation');

        return this.helperService.validateHours(this.restInfoTab.DeliveryHours);
    }

    deleteDeliveryHour = (index, item) => {
        this.deleteHour(index, item);

        this.updateDeliveryHoursValidation();
    }

    addHolidayAtEnd = () => {
        this.addHoliday(this.restInfoTab.Holidays.length, true);
    }

    addHoliday = (beforeIndex, editMode?: boolean) => {
        var index = beforeIndex || 0;

        this.restInfoTab.Holidays.splice(index + 1, 0, {
            Name: '',
            Enabled: false,
            editMode: editMode || false,
        });
    }

    updateHolidaysValidation = () => {
        Util.log(this.LOG_TAG, 'updateHolidaysValidation');

        return this.helperService.validateDates(this.restInfoTab.Holidays);
    }

    deleteHoliday = (index) => {
        this.restInfoTab.Holidays.splice(index, 1);

        this.updateHolidaysValidation();
    }

    toggleItemEditMode = (item) => {
        if (this.restInfoTab.rest.EnableOnlineOrdering) {
            item.editMode = !item.editMode;
        }
    }

    /**
     * Menus Tab
     */

    loadMenusTab = () => {
        Util.log(this.LOG_TAG, 'loadMenusTab()');

        this.menusTab.busy = true;

        var requestData = new ROAPIRequestData();

        requestData.ff = this.fireFlyID;

        this.ROService.getMasterHeadList(requestData).subscribe(response => {
            this.menusTab.masterHeads = response.Data;

            this.menusTab.busy = false;

            Util.log(this.LOG_TAG, 'getMasterHeadList', response);
        });
    }

    private onMasterHeadDragSuccess(event) {
        Util.log(this.LOG_TAG, 'onMasterHeadDragSuccess', event, this.menusTab.masterHeads);

        this.helperService.calculateSortID(this.menusTab.masterHeads);

        this.saveMasterHeadsSortOrder();
    }

    saveMasterHeadsSortOrder = () => {
        this.menusTab.busy = true;

        var requestData = new ROAPIRequestData();

        ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);

        var body = {
            SortDetails: []
        };

        for (var index in this.menusTab.masterHeads) {
            var masterHead = this.menusTab.masterHeads[index];

            body.SortDetails.push({
                ID: masterHead.ID,
                SortID: masterHead.SortID,
            });
        }

        this.ROService.updateMasterHeadSortOrder(requestData, body).subscribe(response => {
            this.menusTab.busy = false;

            Util.log(this.LOG_TAG, 'updateMasterHeadSortOrder', response);
        });
    }

    viewMenuDetails = (menu) => {
        this.router.navigate([`${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`, this.fireFlyID, Path.RO.MENU_DETAILS, menu.ID]);
    }

    openSaveMasterHeadModal = (masterHead?: MasterHead) => {
        this.saveMenuItemModal.open({
            fireFlyID: this.fireFlyID,
            masterHead: masterHead
        });
    }

    saveMasterHeadModalEvents = (event) => {
        if (event.action == SaveMasterHeadModalComponent.EVENT_ADD_ITEM) {
            var masterHead: MasterHead = event.data;

            this.menusTab.masterHeads.push(masterHead);
        }

        Util.log(this.LOG_TAG, 'saveMasterHeadModalEvents', event);
    }

    toggleActiveMasterHead = (masterHead: MasterHead) => {
        Util.log(this.LOG_TAG, 'toggleActiveMasterHead', masterHead);

        this._saveMasterHead(masterHead);
    }

    private _saveMasterHead = (masterHead: MasterHead) => {
        Util.log(this.LOG_TAG, '_saveMasterHead()');

        this.menusTab.busy = true;

        var data = {
            fireFlyID: this.fireFlyID,
            masterHead: masterHead
        };

        this.ROService.saveMasterHead(data).subscribe((response: any) => {

            this.menusTab.busy = false;

            if (response.Status == this.constants.STATUS_SUCCESS) {
                this.toastr.success(`${masterHead.Name} updated successfully.`, 'Success!');
            }
            else {
                this.toastr.error('Unable to update item, Please try later.', 'Error!');
            }

            Util.log(this.LOG_TAG, 'updateMasterHead', response);
        });
    }

    deleteMasterHead = (masterHeadIndex, masterHead: MasterHead) => {
        this.confirmModal.open({ message: `Are you sure you want to delete ${masterHead.Name}?` })
            .then((confirm) => {
                if (confirm) {

                    Util.log(this.LOG_TAG, 'deleteMasterHead()');

                    this.menusTab.busy = true;

                    var requestData = new ROAPIRequestData();

                    ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
                    ROAPIRequestData.fillID(requestData, masterHead.ID);

                    this.ROService.deleteMasterHead(requestData).subscribe((response: any) => {

                        this.menusTab.busy = false;

                        if (response.Status == this.constants.STATUS_SUCCESS) {
                            this.menusTab.masterHeads.splice(masterHeadIndex, 1);
                        }
                        else {
                            this.toastr.error('Unable to delete item, Please try later.', 'Error!');
                        }

                        Util.log(this.LOG_TAG, 'deleteMasterHead', response);
                    });
                }

                Util.log(this.LOG_TAG, 'confirmModal', 'promise', confirm);
            });
    }

    openSaveScheduleModal = (masterHead: MasterHead) => {
        this.saveScheduleModal.open({
            fireFlyID: this.fireFlyID,
            masterHead: masterHead,
        });
    }

    saveScheduleModalEvents = (event) => {
        if (event.action == SaveScheduleModalComponent.EVENT_ADD_ITEM) {

        }

        Util.log(this.LOG_TAG, 'saveScheduleModalEvents', event);
    }

    /**
     * Orders Tab
     */

    loadOrdersTab = () => {
        Util.log(this.LOG_TAG, 'loadOrdersTab()');

        this.resetOrderFilters();

        this.loadOrdersTabData();
    }

    ordersSearchTextEnter = () => {
        Util.log(this.LOG_TAG, 'ordersSearchTextEnter()');

        this.ordersTab.page = 1;

        this.ordersTabPageChange();
    }

    checkNewOrderArrived = (firstTime?: boolean) => {
        Util.log(this.LOG_TAG, 'checkNewOrderArrived');

        var requestData = new ROAPIRequestData();

        ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);

        ROAPIRequestData.fillPage(requestData, 1);
        ROAPIRequestData.fillPageSize(requestData, 1);

        this.ROService.getOrderList(requestData).promise.subscribe(response => {
            var orders = response.OrderList;

            if (orders.length > 0) {
                this.ordersTab.latestOrder = orders[0];
            }

            var oldCount = this.ordersTab.unReadCount;
            this.ordersTab.unReadCount = response.UnRead;

            // If `count` changed
            if (!firstTime && oldCount != this.ordersTab.unReadCount) {

                if (this.ordersTab.notificationAudio) {
                    this.ordersTab.notificationAudio.pause();
                    this.ordersTab.notificationAudio.currentTime = 0;
                }

                if (Util.isDefined(this.userService.loginUser.NotificationTone)) {
                    this.ordersTab.notificationAudio = new Audio(`${this.constants.NOTIFICATION_TONE_DIR}/${this.userService.loginUser.NotificationTone}`);
                    this.ordersTab.notificationAudio.play();
                }

                Util.showDesktopNotification({
                    title: `${this.restInfoTab.rest.Name}`,
                    body: `${this.ordersTab.unReadCount} New Order`,
                });

            }

            if (this.activeTab == this.TAB_ORDERS && Util.isDefined(this.ordersTab.latestTopOrder) && Util.isDefined(this.ordersTab.latestOrder)) {

                if (this.ordersTab.latestTopOrder.ID != this.ordersTab.latestOrder.ID) {
                    Util.log(this.LOG_TAG, 'Orders NOT matches');

                    this.loadOrdersTabData(true);
                }
                else {
                    Util.log(this.LOG_TAG, 'Orders Up-to-Date');
                }

                Util.log(this.LOG_TAG, 'Orders', this.ordersTab.latestTopOrder.ID, this.ordersTab.latestOrder.ID);
            }
        });
    }

    loadOrdersTabData = (loadDataIfFirstPageWithoutFilters?: boolean) => {
        Util.log(this.LOG_TAG, 'loadOrdersTabData');

        var firstPageWithoutFilters = true;

        if (!loadDataIfFirstPageWithoutFilters) {
            this.ordersTab.busy = true;
        }

        var requestData = new ROAPIRequestData();

        ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);

        if (this.ordersTab.page > 1) {
            firstPageWithoutFilters = false;
        }

        ROAPIRequestData.fillPage(requestData, this.ordersTab.page);

        ROAPIRequestData.fillPageSize(requestData, this.ordersTab.pageSize);

        if (Util.isDefined(this.ordersTab.searchText) && this.ordersTab.searchText.length > 0) {
            firstPageWithoutFilters = false;

            ROAPIRequestData.fillSearch(requestData, this.ordersTab.searchText);
        }

        var rangeDate = this.ordersTab.rangeDate || [];

        if (rangeDate.length >= 2) {
            firstPageWithoutFilters = false;

            requestData.ds = rangeDate[0];
            requestData.de = rangeDate[1];
        }

        if (this.ordersTab.serviceType > -1) {
            firstPageWithoutFilters = false;

            requestData.mtype = this.ordersTab.serviceType;
        }

        if (this.ordersTab.orderStatus > -1) {
            firstPageWithoutFilters = false;

            requestData.sid = this.ordersTab.orderStatus;
        }

        if (loadDataIfFirstPageWithoutFilters && !firstPageWithoutFilters) {
            Util.log(this.LOG_TAG, 'Returning, Not firstPageWithoutFilters');
            return;
        }

        var promiseRequest = this.ROService.getOrderList(requestData);

        this.ordersTab.lastRequestData = <ROAPIRequestData>promiseRequest.request.data;

        this.ordersTab.exportURL = promiseRequest.request.url + '&export=1';

        promiseRequest.promise.subscribe(response => {
            this.ordersTab.data = response.OrderList;

            if (firstPageWithoutFilters && this.ordersTab.data.length > 0) {
                this.ordersTab.latestTopOrder = this.ordersTab.data[0];
            }

            this.ordersTab.totalPages = response.Pagination.TotalPages;
            this.ordersTab.totalRows = response.Pagination.TotalRow;

            this.ordersTab.unReadCount = response.UnRead;

            if (!loadDataIfFirstPageWithoutFilters) {
                this.ordersTab.busy = false;
            }

            Util.log(this.LOG_TAG, 'getOrderList', response);
        });
    }

    ordersTabPageChange = () => {
        this.ordersTab.busy = true;

        var queryParams: any = {};

        queryParams.tab = this.TAB_ORDERS;
        queryParams.ordersPage = this.ordersTab.page;
        queryParams.ordersPageSize = this.ordersTab.pageSize;

        if (Util.isDefined(this.ordersTab.searchText) && this.ordersTab.searchText.length > 0) {
            queryParams.ordersSearch = this.ordersTab.searchText;
        }

        this.router.navigate([`${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`, this.fireFlyID], { queryParams: queryParams });

        Util.log(this.LOG_TAG, 'ordersTabDataPageChange', queryParams, new Date().getTime());
    }

    openOrderStatusHistoryModal = (event: Event, order) => {
        event.stopPropagation();

        this.orderStatusHistoryModal.open({ order: order });
    }

    viewOrderDetails = (orderID) => {
        this.router.navigate([`${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`, this.fireFlyID, Path.RO.ORDER_DETAILS, orderID]);
    }

    applyOrderFilters = () => {
        this.loadOrdersTabData();

        this.toggleOrderFilters();
    }

    resetOrderFilters = () => {
        this.ordersTab.serviceType = -1;
        this.ordersTab.orderStatus = -1;
        if (Util.isDefined(this.ordersDateRange)) {
            this.ordersDateRange.clear();
        }
    }

    cancelOrderFilters = () => {
        this.ordersTab.serviceType = this.ordersTab.lastRequestData.mtype || -1;
        this.ordersTab.orderStatus = this.ordersTab.lastRequestData.sid || -1;

        if (Util.isDefined(this.ordersTab.lastRequestData.ds) && Util.isDefined(this.ordersTab.lastRequestData.de)) {
            var rangeDate = this.ordersTab.rangeDate || [];

            if (rangeDate.length >= 2) {
                rangeDate[0] = this.ordersTab.lastRequestData.ds;
                rangeDate[1] = this.ordersTab.lastRequestData.de;
            }
            else {
                this.ordersDateRange.clear();
            }
        }
        else {
            this.ordersDateRange.clear();
        }

        this.ordersTab.orderStatus = this.ordersTab.lastRequestData.sid || -1;

        this.toggleOrderFilters();
    }

    toggleOrderFilters = () => {
        this.ordersTab.showFilters = !this.ordersTab.showFilters;
    }

    /**
     * Coupons Tab
     */

    loadCouponsTab = () => {

    }

    /**
     * Preview Tab
     */

    loadPreviewTab = () => {
        Util.log(this.LOG_TAG, 'loadPreviewTab()');
    }

    /**
     * Charts and Graphs Tab
     */

    loadChartsTab = () => {
        Util.log(this.LOG_TAG, 'loadChartsTab()');
    }


    /**
     * Financial Report Tab
     */

    loadFinReportTab = () => {
        Util.log(this.LOG_TAG, 'loadFinReportTab()', this.finReportTab);

        this.finReportTab.busy = true;

        var requestData = new ROAPIRequestData();

        requestData.ff = this.fireFlyID;

        var finReportRangeDate = this.finReportTab.finReportRangeDate || [];

        if (finReportRangeDate.length >= 2) {
            requestData.ds = finReportRangeDate[0];
            requestData.de = finReportRangeDate[1];
        }

        this.ROService.getFinancialReport(requestData).subscribe(response => {
            this.finReportTab.GraphData = response.GraphData;
            this.finReportTab.Details = response.Data.Details;

            // Calculating total
            this.finReportTab.total = 0;

            for (var i in this.finReportTab.Details) {
                var item = this.finReportTab.Details[i];

                this.finReportTab.total += parseFloat(item.TotalSales);
            }

            this.finReportTab.busy = false;

            setTimeout(() => {
                this.initFinSalesOrdersChart();
            }, 1500);

            Util.log(this.LOG_TAG, 'getFinancialReport123', response);
        });
    }

    onFinReportDateChanged = (event) => {
        if (!Util.isDefined(event.beginJsDate)) {
            this.finReportTab.finReportRangeDate = null;
            this.loadFinReportTab();
        }

        Util.log(this.LOG_TAG, 'onReportDateChanged', event, this.finReportTab.finReportRangeDate);
    }

    initFinSalesOrdersChart = () => {
        var labels = [];
        var sales = [];
        var orders = [];

        var graphDataList = this.finReportTab.GraphData;
        for (var i in graphDataList) {
            var item = graphDataList[i];

            labels.push(item.Date);
            sales.push(item.Sales);
            orders.push(item.Orders);
        }

        var data = {
            labels: labels,
            datasets: [
                {
                    label: "Sales ($)",
                    backgroundColor: '#FF6384',
                    data: sales,
                },
                {
                    label: "Orders (#)",
                    backgroundColor: '#36A2EB',
                    data: orders,
                }
            ]
        };

        if (Util.isDefined(this.finReportTab.finSalesOrdersChart)) {
            this.finReportTab.finSalesOrdersChart.destroy();
        }

        var ctx = document.getElementById("fin-sales-orders-chart");

        this.finReportTab.finSalesOrdersChart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    animateScale: true
                },
                tooltips: {
                    callbacks: {
                        label: (tooltipItems, data) => {
                            if (tooltipItems.datasetIndex == 0) {
                                return ` $${tooltipItems.yLabel}`;
                            }
                            else {
                                return ` ${tooltipItems.yLabel}`;
                            }
                        }
                    }
                },
                scales: {
                    xAxes: [{
                        ticks: {
                            // Include a dollar sign in the ticks
                            callback: (value, index, values) => {
                                return this.datePipe.transform(value, 'shortDate');
                            }
                        }
                    }]
                }
            }
        });
    }

    /**
     * Financial Statement Tab
     */

    loadFinStatementTab = () => {
        Util.log(this.LOG_TAG, 'loadFinStatementTab()');

        this.finStatementTab.busy = true;

        var requestData = new ROAPIRequestData();

        requestData.ff = this.fireFlyID;

        ROAPIRequestData.fillPage(requestData, this.finStatementTab.page);
        ROAPIRequestData.fillPageSize(requestData, this.finStatementTab.pageSize);

        var finStatementRangeDate = this.finStatementTab.finStatementRangeDate || [];

        if (finStatementRangeDate.length >= 2) {
            requestData.ds = finStatementRangeDate[0];
            requestData.de = finStatementRangeDate[1];
        }

        var promiseRequest = this.ROService.getFinancialStatement(requestData);

        this.finStatementTab.exportURL = promiseRequest.request.url + '&export=1';

        promiseRequest.promise.subscribe(response => {
            this.finStatementTab.Summary = response.Summary;
            this.finStatementTab.Details = response.Data.Details;

            this.finStatementTab.totalPages = response.Data.Pagination.TotalPages;
            this.finStatementTab.totalRows = response.Data.Pagination.TotalRow;

            this.finStatementTab.busy = false;

            Util.log(this.LOG_TAG, 'getFinancialStatement', response);
        });
    }

    finStatementPageChange = () => {
        this.finStatementTab.busy = true;

        var queryParams: any = {};

        queryParams.tab = this.TAB_FIN_STATEMENT;
        queryParams.fsPage = this.finStatementTab.page;
        queryParams.fsPageSize = this.finStatementTab.pageSize;

        this.router.navigate([`${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`, this.fireFlyID], { queryParams: queryParams });

        Util.log(this.LOG_TAG, 'finStatementPageChange', queryParams);
    }

    onFinStatementRangeDateChanged = (event) => {
        if (!Util.isDefined(event.beginJsDate)) {
            this.finStatementTab.finStatementRangeDate = null;
            this.loadFinStatementTab();
        }

        Util.log(this.LOG_TAG, 'onFinStatementRangeDateChanged', event, this.finStatementTab.finStatementRangeDate);
    }

    printFinStatement = () => {
        var finStatementRangeDate = this.finStatementTab.finStatementRangeDate || [];

        var dateRangeText = '';

        if (finStatementRangeDate.length >= 2) {
            dateRangeText = `${this.datePipe.transform(finStatementRangeDate[0], 'shortDate')} - ${this.datePipe.transform(finStatementRangeDate[1], 'shortDate')}`;
        }

        var ordersTableBody: any = [[
            { text: 'Date', style: 'ordersTableHeader' },
            { text: 'Order Number', style: 'ordersTableHeader' },
            { text: 'Customer', style: 'ordersTableHeader' },
            { text: 'Payment Method', style: 'ordersTableHeader' },
            { text: 'Order Subtotal', style: 'ordersTableHeader' },
            { text: 'Delivery Charge', style: 'ordersTableHeader' },
            { text: 'Tax', style: 'ordersTableHeader' },
            { text: 'Driver Tip', style: 'ordersTableHeader' },
            { text: 'Total Customer Payment', style: 'ordersTableHeader' },
            { text: 'Menus Service Charge', style: 'ordersTableHeader' },
            { text: 'Net Account Credit', style: 'ordersTableHeader' },
        ]];

        for (var index in this.finStatementTab.Details) {
            var item = this.finStatementTab.Details[index];

            ordersTableBody.push([
                { text: this.datePipe.transform(item.OrderDate, 'short'), style: 'ordersTableRow' },
                { text: item.OrderNumber, style: 'ordersTableRow', bold: true },
                { text: item.Customer, style: 'ordersTableRow' },
                { text: item.PaymentMethod, style: 'ordersTableRow' },
                { text: item.SubTotal, style: 'ordersTableRow' },
                { text: this.currencyPipe.transform(item.DeliveryCharge, 'USD', true), style: 'ordersTableRow' },
                { text: this.currencyPipe.transform(item.Tax_Final, 'USD', true), style: 'ordersTableRow' },
                { text: this.currencyPipe.transform(item.Driver_Tip, 'USD', true), style: 'ordersTableRow' },
                { text: this.currencyPipe.transform(item.GrandTotal, 'USD', true), style: 'ordersTableRow' },
                { text: this.currencyPipe.transform(item.Owner_ServiceFee, 'USD', true), style: 'ordersTableRow' },
                { text: this.currencyPipe.transform(item.Owner_NetAccountCredit, 'USD', true), style: 'ordersTableRow' },
            ]);
        }

        var dd = {
            pageOrientation: 'landscape',
            content: [
                {
                    alignment: 'justify',
                    columns: [
                        {
                            image: this.constants.MENUS_LOGO_BASE64,
                            width: 142,
                            height: 29,
                        },
                        {
                            alignment: 'right',
                            fontSize: 14,
                            stack: [
                                {
                                    text: this.restInfoTab.rest.Name,
                                    bold: true,
                                },
                                `${this.restInfoTab.rest.Address_1} ${this.restInfoTab.rest.Address_2}`,
                                this.restInfoTab.rest.Phone,
                                this.restInfoTab.rest.Email,
                            ]
                        }
                    ]
                },
                {
                    margin: [0, 27, 0, 0],
                    text: 'Financial Statemant',
                    fontSize: 32,
                    bold: true,
                },
                {
                    margin: [0, 4, 0, 0],
                    text: dateRangeText,
                    fontSize: 18,
                    bold: true,
                },
                {
                    margin: [0, 24, 0, 24],
                    table: {
                        headerRows: 1,
                        widths: ['*', '*'],
                        body: [
                            [
                                { text: 'Number of Orders' },
                                { text: this.finStatementTab.Summary.Orders, bold: true, alignment: 'right' }
                            ],
                            [
                                { text: 'Total Sales' },
                                { text: this.currencyPipe.transform(this.finStatementTab.Summary.Sales, 'USD', true), bold: true, alignment: 'right' }
                            ],
                            [
                                { text: 'Cash On Delivery Count' },
                                { text: this.finStatementTab.Summary.COD_ItemsCount, bold: true, alignment: 'right' }
                            ],
                            [
                                { text: 'Cash On Delivery Sales' },
                                { text: this.currencyPipe.transform(this.finStatementTab.Summary.COD_ItemsSales, 'USD', true), bold: true, alignment: 'right' }
                            ],
                            [
                                { text: 'Credit Card Count' },
                                { text: this.finStatementTab.Summary.CreditCard_ItemsCount, bold: true, alignment: 'right' }
                            ],
                            [
                                { text: 'Credit Card Sales' },
                                { text: this.currencyPipe.transform(this.finStatementTab.Summary.CreditCard_ItemsSales, 'USD', true), bold: true, alignment: 'right' }
                            ],
                        ]
                    },
                    layout: {
                        defaultBorder: false,
                    }
                },
                {
                    margin: [0, 24, 0, 24],
                    table: {
                        headerRows: 1,
                        widths: ["auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto"],
                        body: ordersTableBody,
                    },
                    layout: {
                        hLineWidth: function (i, node) {
                            if (i == 0) return i;

                            return (i === 1 || i === node.table.body.length) ? 2 : 1;
                        },
                        vLineWidth: function (i, node) {
                            return 0;
                        },
                        hLineColor: function (i, node) {
                            return (i === 1 || i === node.table.body.length) ? 'black' : 'gray';
                        },
                        vLineColor: function (i, node) {
                            return (i === 0 || i === node.table.widths.length) ? 'black' : 'gray';
                        }
                    }
                },
                {
                    alignment: 'center',
                    margin: [0, 18, 0, 0],
                    text: 'If you need to reach Menus please feel free to call our restaurant customer service team at: ',
                },
                {
                    alignment: 'center',
                    text: this.sharedDataService.globalSettings.CustomerService.Email,
                    bold: true,
                }

            ], styles: {
                header: {
                    fontSize: 18,
                    bold: true
                },
                bigger: {
                    fontSize: 15,
                    italics: true,
                },
                ordersTableHeader: {
                    bold: true,
                    fontSize: 12,
                    margin: [0, 14, 0, 14]
                },
                ordersTableRow: {
                    margin: [0, 14, 0, 14]
                }
            },
            defaultStyle: {
                columnGap: 20,
            }
        }

        pdfMake.createPdf(dd).print();
    }

    /**
     * Customer Review Tab
     */

    loadCustomerReviewTab = () => {
        Util.log(this.LOG_TAG, 'loadCustomerReviewTab()');

        this.loadCustomerReviewTabData();
    }

    customerReviewSearchTextEnter = () => {
        Util.log(this.LOG_TAG, 'customerReviewSearchTextEnter()');

        this.customerReviewTab.page = 1;

        this.loadCustomerReviewTabData();
    }

    loadCustomerReviewTabData = () => {
        this.customerReviewTab.busy = true;

        var requestData = new ROAPIRequestData();

        ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
        ROAPIRequestData.fillSearch(requestData, this.customerReviewTab.searchText);

        ROAPIRequestData.fillPage(requestData, this.customerReviewTab.page);
        ROAPIRequestData.fillPageSize(requestData, this.customerReviewTab.pageSize);

        var promiseRequest = this.ROService.getReviewList(requestData);

        this.customerReviewTab.exportURL = promiseRequest.request.url + '&export=1';

        promiseRequest.promise.subscribe(response => {
            this.customerReviewTab.data = response.Data;

            this.customerReviewTab.totalPages = response.Pagination.TotalPages;
            this.customerReviewTab.totalRows = response.Pagination.TotalRow;

            this.customerReviewTab.busy = false;

            Util.log(this.LOG_TAG, 'getReviewList', response);
        });
    }

    canDeactivate() {
        Util.log(this.LOG_TAG, 'canDeactivate');

        if (!this.authCodeExpired && this.activeTab == this.TAB_REST_INFO && this.hasRestInfoChanges()) {
            return this.unloadRestInfoTab();
        }

        return true;
    }

    ngOnDestroy() {
        Util.log(this.LOG_TAG, 'ngOnDestroy');

        if (this.ordersTab.refreshInterval) {
            clearInterval(this.ordersTab.refreshInterval);
        }

        if (this.subscriptionAuthCodeExpiration) {
            this.subscriptionAuthCodeExpiration.unsubscribe();
        }
    }
}