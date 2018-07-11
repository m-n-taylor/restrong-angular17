import { Component, ChangeDetectionStrategy, ViewEncapsulation, PLATFORM_ID, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// Shared Components
import { BreadcrumbService } from '../../shared/components/breadcrumb/breadcrumb.module';

// Shared Models
import { UserAddress } from '../../shared/models/user-address';
import { QueryParams } from '../../shared/models/query-params';
import { SearchMenuAPIRequestData } from '../../shared/models/search-menu-api-request-data';

// Shared Services
import { EventsService } from '../../shared/services/events.service';
import { SharedDataService } from '../../shared/services/shared-data.service';
import { AppService } from '../../shared/services/app.service';

declare var google;

@Component({
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.Emulated,
    selector: 'cr-seo-menu-item-list',
    templateUrl: './seo-menu-item-list.component.html'
})
export class SEOMenuItemListComponent {
    LOG_TAG = 'SEOMenuItemListComponent';

    serviceType: string;
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

    menuItemConfig = {
        mode: 'viewOnly'
    }

    breadcrumbList: Array<any>;

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

                        this.loadMenuItems();
                    }
                }

                Util.log(this.LOG_TAG, 'getCities()', response);
            });
        });
    }

    private _init = () => {
        var url = this.router.url || '';
        this.serviceType = Util.detectServiceTypeAtStart(url);

        this.breadcrumbList = new Array<any>();
    }

    private _initBreadcrumbs = () => {
        Util.log(this.LOG_TAG, '_initBreadcrumbs');

        this.breadcrumbList = new Array<any>();

        if (Util.isDefined(this.params.city)) {
            this.breadcrumbList.push({
                name: `${Util.replaceDashWithSpace(this.params.city)}`,
                url: `/${this.serviceType}/${this.params.city}`,
            });
        }

        if (Util.isDefined(this.params.zipcode)) {
            this.breadcrumbList.push({
                name: `${this.params.zipcode}`,
                url: `/${this.serviceType}/${this.params.city}/${this.params.zipcode}/menu/page/1`,
            });
        }
        
        if (Util.isDefined(this.params.cuisine)) {
            this.breadcrumbList.push({
                name: `${Util.replaceDashWithSpace(this.params.cuisine)}`,
                url: `/${this.serviceType}/${this.params.city}/${this.params.zipcode}/${this.params.cuisine}/page/1`,
            });
        }

        if (Util.isDefined(this.params.dish)) {
            this.breadcrumbList.push({
                name: `${Util.replaceDashWithSpace(this.params.dish)}`,
            });
        }
    }

    ngOnInit() {
        Util.log('ngOnInit', this.platformId);

        if (isPlatformBrowser(this.platformId)) {
        }
    }

    loadMenuItems = () => {
        Util.log('loadMenuItems', this.platformId);

        this.busy = true;

        var requestData = new SearchMenuAPIRequestData();
        requestData.page = this.page;
        requestData.pageSize = this.pageSize;
        requestData.menuType = this.serviceType;
        requestData.coordinate = QueryParams.getStringCoordinate(this.zipcode.Latitude, this.zipcode.Longitude);
        requestData.proximity = 10;
        requestData.keywords = '';

        if (Util.isDefined(this.params.cuisine) && this.params.cuisine != 'menu') {
            requestData.keywords += Util.replaceDashWithSpace(this.params.cuisine);
        }

        if (Util.isDefined(this.params.dish)) {
            requestData.keywords += '|' + Util.replaceDashWithSpace(this.params.dish);
        }

        this.appService.searchRestaurant(requestData).subscribe(response => {
            Util.log(this.LOG_TAG, 'searchMenuItems()', response);

            this.totalPages = response.Pagination.TotalPages;
            this.totalRows = response.Pagination.TotalRow;
            this.menuItems = response.Data;

            this.busy = false;
        });
    }

    replaceSpaceWithDash = (value: string): string => {
        return Util.replaceSpaceWithDash(value);
    }
}
