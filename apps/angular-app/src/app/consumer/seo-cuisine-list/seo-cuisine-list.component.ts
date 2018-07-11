import { Component, ChangeDetectionStrategy, ViewEncapsulation, PLATFORM_ID, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

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

declare var google;

@Component({
    selector: 'cr-seo-cuisine-list',
    templateUrl: './seo-cuisine-list.component.html'
})
export class SEOCuisineListComponent {
    LOG_TAG = 'SEOCuisineListComponent';

    autocomplete: any;
    queryParams = new QueryParams();
    yourAdressText = '';

    params: any = {};

    city: any;
    zipcode: any;

    busyZip = false;

    busyCuisineDish = false;

    cuisines: Array<any>;
    cuisineUrl = '';

    page: number;
    pageSize: number;
    totalPages: number;
    totalRows: number;

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

                            this.loadData();
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
            });
        }
    }

    ngOnInit() {
        Util.log('ngOnInit', this.platformId);

        if (isPlatformBrowser(this.platformId)) {
        }
    }

    loadCuisines = () => {
        var requestData = new SearchMenuAPIRequestData();
        requestData.menuType = this.constants.SERVICE_TYPE_DINEIN;
        requestData.coordinate = QueryParams.getStringCoordinate(this.zipcode.Latitude, this.zipcode.Longitude);
        requestData.proximity = 10;

        return this.appService.searchCuisine(requestData);
    }

    loadDishes = () => {
        var requestData = new SearchMenuAPIRequestData();
        requestData.page = this.page;
        requestData.pageSize = this.pageSize;
        requestData.menuType = this.constants.SERVICE_TYPE_DINEIN;
        requestData.coordinate = QueryParams.getStringCoordinate(this.zipcode.Latitude, this.zipcode.Longitude);

        if (Util.isDefined(this.params.cuisine) && this.params.cuisine != 'menu') {
            requestData.keywords = Util.replaceDashWithSpace(this.params.cuisine);
        }

        requestData.proximity = 10;

        return this.appService.searchDish(requestData);
    }

    loadData = () => {
        this.busyCuisineDish = true;
        var cuisinePromise = this.loadCuisines();
        var dishPromise = this.loadDishes();

        Observable.forkJoin([cuisinePromise, dishPromise])
            .subscribe((responseList: any) => {

                // Cuisines
                var cuisinesResponse = responseList[0];
                this.cuisines = cuisinesResponse.Data

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

                // Dishes
                var dishesResponse = responseList[1];

                this.totalPages = dishesResponse.Pagination.TotalPages;
                this.totalRows = dishesResponse.Pagination.TotalRow;
                this.dishes = dishesResponse.Data;

                this.busyCuisineDish = false;
            });
    }

    replaceSpaceWithDash = (value: string): string => {
        return Util.replaceSpaceWithDash(value);
    }

    replaceDashWithSpace = (value: string): string => {
        return Util.replaceDashWithSpace(value);
    }
}
