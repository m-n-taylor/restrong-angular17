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
    selector: 'cr-seo-cuisine-list',
    templateUrl: './seo-cuisine-list.component.html'
})
export class SEOCuisineListComponent {
    LOG_TAG = 'SEOCuisineListComponent';

    serviceType: string;
    autocomplete: any;
    queryParams = new QueryParams();
    yourAdressText = '';

    params: any = {};

    city: any;
    zipcode: any;

    busyZip = false;

    busyCuisine = false;
    cuisines: Array<any>;

    cuisineUrl = '';

    page: number;
    pageSize: number;
    totalPages: number;
    totalRows: number;

    busyDish = false;
    dishes: Array<any>;

    breadcrumbList: Array<any>;

    constructor( @Inject(PLATFORM_ID) private platformId: Object, private router: Router, private route: ActivatedRoute, public constants: Constants, private sharedDataService: SharedDataService, private eventsService: EventsService, private appService: AppService, private breadcrumbService: BreadcrumbService) {
        this._initOnce();
        this._init();

        this.route.params.subscribe((params: any) => {
            Util.log(this.LOG_TAG, 'QueryParams', params);

            this.params = params;

            this._init();
            this._initBreadcrumbs();

            this.cuisineUrl = this.params.cuisine || 'menu';

            this.page = this.params.page || 1;

            this.busyZip = true;
            var city = Util.replaceDashWithSpace(params.city);

            this.appService.getCities({ city: city }).subscribe((response: any) => {
                var cities: Array<any> = response.City;

                if (cities.length > 0) {
                    this.city = cities[0];

                    if (Util.isDefined(params.zipcode)) {
                        var list = this.city.ZipInfo.filter(z => z.Zip == params.zipcode);

                        if (list.length > 0) {
                            this.zipcode = list[0];

                            this.loadCuisines();

                            this.loadDishes();
                        }
                    }
                }

                this.busyZip = false;

                Util.log(this.LOG_TAG, 'getCities()', response);
            });
        });
    }

    private _initOnce = () => {
        this.city = null;
        this.breadcrumbList = new Array<any>();
    }

    private _init = () => {
        var url = this.router.url || '';
        this.serviceType = Util.detectServiceTypeAtStart(url);

        this.cuisineUrl = '';

        this.page = 1;
        this.pageSize = 100;
        this.totalPages = 0;
        this.totalRows = 0;

        this.zipcode = null;
        this.cuisines = [];
        this.dishes = [];

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
            });
        }
    }

    ngOnInit() {
        Util.log('ngOnInit', this.platformId);

        if (isPlatformBrowser(this.platformId)) {
        }
    }

    loadCuisines = () => {
        this.busyCuisine = true;
        var requestData = new SearchMenuAPIRequestData();
        requestData.menuType = this.serviceType;
        requestData.coordinate = QueryParams.getStringCoordinate(this.zipcode.Latitude, this.zipcode.Longitude);
        requestData.proximity = 10;

        this.appService.searchCuisine(requestData).subscribe(response => {
            Util.log(this.LOG_TAG, 'searchCuisine()', response);

            this.cuisines = response.Data;

            if (Util.isDefined(this.params.cuisine)) {
                for (var i in this.cuisines) {
                    var cuisine = this.cuisines[i];

                    if (this.params.cuisine.toLowerCase() == Util.replaceSpaceWithDash(cuisine.Cuisine).toLowerCase()) {
                        cuisine.isSelected = true;
                    }
                    else {
                        cuisine.isSelected = false;
                    }
                }
            }

            this.busyCuisine = false;
        });
    }

    loadDishes = () => {
        this.busyDish = true;
        var requestData = new SearchMenuAPIRequestData();
        requestData.page = this.page;
        requestData.pageSize = this.pageSize;
        requestData.menuType = this.serviceType;
        requestData.coordinate = QueryParams.getStringCoordinate(this.zipcode.Latitude, this.zipcode.Longitude);

        if (Util.isDefined(this.params.cuisine) && this.params.cuisine != 'menu') {
            requestData.keywords = Util.replaceDashWithSpace(this.params.cuisine);
        }

        requestData.proximity = 10;

        this.appService.searchDish(requestData).subscribe(response => {
            Util.log(this.LOG_TAG, 'searchDish()', response);

            this.totalPages = response.Pagination.TotalPages;
            this.totalRows = response.Pagination.TotalRow;
            this.dishes = response.Data;
            this.busyDish = false;
        });
    }

    replaceSpaceWithDash = (value: string): string => {
        return Util.replaceSpaceWithDash(value);
    }

    replaceDashWithSpace = (value: string): string => {
        return Util.replaceDashWithSpace(value);
    }
}
