import { Component, ChangeDetectionStrategy, ViewEncapsulation, PLATFORM_ID, Inject, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// Shared Components
import { BreadcrumbService } from '../../libs/breadcrumb/breadcrumb.module';

// Shared Models
import { UserAddress } from '../../shared/models/user-address';
import { QueryParams } from '../../shared/models/query-params';
import { SearchMenuAPIRequestData } from '../../shared/models/search-menu-api-request-data';

// Shared Services
import { EventsService } from '../../shared/services/events.service';
import { SharedDataService } from '../../shared/services/shared-data.service';
import { AppService } from '../../shared/services/app.service';
import { Observable } from 'rxjs/Observable';

declare var google;

@Component({
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.Emulated,
    selector: 'cr-seo-menu-item-list',
    templateUrl: './seo-menu-item-list.component.html'
})
export class SEOMenuItemListComponent {
    LOG_TAG = 'SEOMenuItemListComponent';

    autocomplete: any;
    queryParams = new QueryParams();
    yourAdressText = '';

    params: any = {};

    city = null;
    zipcode = null;

    page = 1;
    pageSize = 100;
    totalPages = 0;
    totalRows = 0;

    busy = false;
    menuItems = [];

    dishTypes = [];

    menuItemConfig = {
        mode: 'viewOnly'
    }

    breadcrumbList: Array<any>;

    isOverflowDishChips: boolean;
    showMore = false;

    @ViewChild('dishChipsContainer') public dishChipsContainer: any;

    constructor( @Inject(PLATFORM_ID) private platformId: Object, private router: Router, private route: ActivatedRoute, public constants: Constants, private sharedDataService: SharedDataService, private eventsService: EventsService, private appService: AppService, private breadcrumbService: BreadcrumbService) {
        this._init();

        this.route.params.subscribe((params: any) => {
            Util.log(this.LOG_TAG, 'QueryParams', params);

            this.params = params;

            this._init();
            this._initBreadcrumbs();

            this.busy = true;

            this.page = this.params.page || 1;

            var city = Util.replaceDashWithSpace(params.city);

            this.appService.getCities({ city: city, zip: params.zipcode }).subscribe((response: any) => {
                this.busy = false;

                var cities: Array<any> = response.City;

                if (cities.length > 0) {
                    this.city = cities[0];

                    if (this.city.ZipInfo.length > 0) {
                        this.zipcode = this.city.ZipInfo[0];

                        this.loadData();
                    }
                }

                Util.log(this.LOG_TAG, 'getCities()', response);
            });
        });
    }

    private _init = () => {
        this.breadcrumbList = new Array<any>();
    }

    private _initBreadcrumbs = () => {
        Util.log(this.LOG_TAG, '_initBreadcrumbs');

        this.breadcrumbList = new Array<any>();

        if (Util.isDefined(this.params.city)) {
            this.breadcrumbList.push({
                name: `${Util.replaceDashWithSpace(this.params.city)}`,
                url: `/city/${this.params.city}`,
            });
        }

        if (Util.isDefined(this.params.zipcode)) {
            this.breadcrumbList.push({
                name: `${this.params.zipcode}`,
                url: `/city/${this.params.city}/${this.params.zipcode}/menu/page/1`,
            });
        }

        if (Util.isDefined(this.params.cuisine)) {
            this.breadcrumbList.push({
                name: `${Util.replaceDashWithSpace(this.params.cuisine)}`,
                url: `/city/${this.params.city}/${this.params.zipcode}/${this.params.cuisine}/page/1`,
            });
        }

        if (Util.isDefined(this.params.dish)) {
            this.breadcrumbList.push({
                name: `${Util.replaceDashWithSpace(this.params.dish)}`,
                url: `/city/${this.params.city}/${this.params.zipcode}/${this.params.cuisine}/${this.params.dish}/page/1`,
            });
        }

        if (Util.isDefined(this.params.dishType)) {
            this.breadcrumbList.push({
                name: `${Util.replaceDashWithSpace(this.params.dishType)}`,
            });
        }
    }

    ngOnInit() {
        Util.log('ngOnInit', this.platformId);

        if (isPlatformBrowser(this.platformId)) {
        }
    }

    loadData = () => {
        Util.log('loadData');

        this.busy = true;

        var dishTypePromise = this.loadDishTypes();

        var menuItemsPromise = this.loadMenuItems();

        Observable.forkJoin([dishTypePromise, menuItemsPromise]).subscribe((response: any) => {
            Util.log(this.LOG_TAG, 'searchMenuItems()', response);

            // Dish Types
            var dishTypesResponse = response[0];
            this.dishTypes = dishTypesResponse.Table;

            // Menu items
            var menuItemsResponse = response[1];

            this.totalPages = menuItemsResponse.Pagination.TotalPages;
            this.totalRows = menuItemsResponse.Pagination.TotalRow;
            this.menuItems = menuItemsResponse.Data;

            this.busy = false;

            setTimeout(() => {
				this.checkOverflowDishChips();
			}, 100);
        });
    }

    loadDishTypes = () => {
        Util.log('loadDishTypes', this.platformId);

        var requestData = new SearchMenuAPIRequestData();
        requestData.page = this.page;
        requestData.pageSize = this.pageSize;
        requestData.menuType = this.constants.SERVICE_TYPE_DINEIN;
        requestData.coordinate = QueryParams.getStringCoordinate(this.zipcode.Latitude, this.zipcode.Longitude);
        requestData.proximity = 10;
        requestData.keywords = '';

        if (Util.isDefined(this.params.cuisine) && this.params.cuisine != 'menu') {
            requestData.keywords += Util.replaceDashWithSpace(this.params.cuisine);
        }

        if (Util.isDefined(this.params.dish)) {
            requestData.keywords += '|' + Util.replaceDashWithSpace(this.params.dish);
        }

        return this.appService.getDishTypes(requestData);
    }

    loadMenuItems = () => {
        Util.log('loadMenuItems', this.platformId);

        var requestData = new SearchMenuAPIRequestData();
        requestData.page = this.page;
        requestData.pageSize = this.pageSize;
        requestData.menuType = this.constants.SERVICE_TYPE_DINEIN;
        requestData.coordinate = QueryParams.getStringCoordinate(this.zipcode.Latitude, this.zipcode.Longitude);
        requestData.proximity = 10;
        requestData.keywords = '';

        if (this.params.dishType) {
            requestData.termsinclude = this.params.dishType;
        }

        if (Util.isDefined(this.params.cuisine) && this.params.cuisine != 'menu') {
            requestData.keywords += Util.replaceDashWithSpace(this.params.cuisine);
        }

        if (Util.isDefined(this.params.dish)) {
            requestData.keywords += '|' + Util.replaceDashWithSpace(this.params.dish);
        }

        return this.appService.searchRestaurant(requestData);
    }

    checkOverflowDishChips = () => {
        if (Util.isDefined(this.dishChipsContainer)) {
            var element: HTMLElement = this.dishChipsContainer.nativeElement;

            this.isOverflowDishChips = element.scrollHeight > element.clientHeight;
        }
    }

    replaceSpaceWithDash = (value: string): string => {
        return Util.replaceSpaceWithDash(value);
    }
}
