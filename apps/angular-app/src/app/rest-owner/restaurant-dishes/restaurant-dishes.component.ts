import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/combineLatest';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// Shared Components
import { BreadcrumbService } from '../../libs/breadcrumb/breadcrumb.module';

// RO Models
import { Restaurant } from '../shared/models/restaurant';
import { ROAPIRequestData } from '../shared/models/ro-api-request-data';

// Shared Services
import { PathService as Path } from '../../shared/services/path.service';
import { AppService } from '../../shared/services/app.service';
import { SearchMenuAPIRequestData } from '../../shared/models/search-menu-api-request-data';

// RO Services
import { ROService } from '../shared/services/ro.service';
import { MenuItem } from '../../shared/models/menu-item';

@Component({
	selector: 'ro-restaurant-dishes',
	templateUrl: './restaurant-dishes.component.html'
})
export class RestaurantDishesComponent implements OnInit {
	LOG_TAG = 'RestaurantDishesComponent => ';

	busy = false;

	pageTitle: string;

	restFireFlyID: string;
	keywords = new Array<string>();
	cuisineID: string;
	cuisineName: string;
	fireFlyID: string;
	lat: string;
	lng: string;
	proximity: number;

	rest: Restaurant;

	dishes = new Array<any>();
	pageDish: number;
	busyLoadMoreDish: boolean;
	canLoadMoreDish: boolean;

	constructor(public constants: Constants, private ROService: ROService, private appService: AppService, private router: Router, private activatedRoute: ActivatedRoute, private breadcrumbService: BreadcrumbService, private ngZone: NgZone, private location: Location) {
		this.initDishes();
	}

	ngOnInit() {
		Util.log(this.LOG_TAG, 'Init()');

		Observable.combineLatest([this.activatedRoute.queryParams, this.activatedRoute.params]).subscribe(data => {
			Util.log(this.LOG_TAG, 'combineLatest', data);

			// Query Params
			var queryParams = data[0];
			this.keywords = Util.isDefined(queryParams.keywords) ? queryParams.keywords.split(',') : [];
			this.cuisineID = Util.isDefined(queryParams.cuisineID) ? queryParams.cuisineID : null;
			this.cuisineName = Util.isDefined(queryParams.cuisineName) ? queryParams.cuisineName : null;
			this.fireFlyID = Util.isDefined(queryParams.fireFlyID) ? queryParams.fireFlyID : null;
			this.lat = Util.isDefined(queryParams.lat) ? queryParams.lat : null;
			this.lng = Util.isDefined(queryParams.lng) ? queryParams.lng : null;
			this.proximity = Util.isDefined(queryParams.proximity) ? queryParams.proximity : null;

			if (this.cuisineName) {
				this.pageTitle = this.cuisineName;
			}
			else if (this.keywords.length > 0) {
				this.pageTitle = '';

				for (var i = 0; i < this.keywords.length; i++) {
					var keyword = this.keywords[i];

					this.pageTitle += keyword;

					if (i < this.keywords.length - 1) {
						this.pageTitle += ' - ';
					}
				}
			}

			this.breadcrumbService.addFriendlyNameForRouteRegex(`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}/[A-Z0-9]+/${Path.RO.DISHES}`, this.pageTitle);
			this.breadcrumbService.addFriendlyNameForRouteRegex(`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}/[A-Z0-9]+/${Path.RO.DISHES}[A-Za-z0-9\?=&]+$`, this.pageTitle);

			// Params
			var params = data[1];
			this.restFireFlyID = params.fireFlyID;

			this.loadData();
		});
	}

	loadRestInfo = (fireFlyID) => {
		var requestData = new ROAPIRequestData();

		ROAPIRequestData.fillFireFlyID(requestData, fireFlyID);

		return this.ROService.getRestInfo(requestData);
	}

	initDishes = () => {
		this.dishes = new Array<any>();
		this.pageDish = 1;
		this.busyLoadMoreDish = false;
		this.canLoadMoreDish = true;
	}

	loadDishes = (loadMore: boolean) => {
		if (loadMore) {
			this.pageDish++;
		}
		else {
			this.initDishes();
		}

		var requestData = new SearchMenuAPIRequestData();
		requestData.menuType = this.constants.SERVICE_TYPE_DINEIN;

		if (Util.isDefined(this.keywords) && this.keywords.length > 0) {
			requestData.keywords = this.keywords.join(this.constants.KEYWORD_SEPRATOR);
		}
		
		if (this.cuisineID) {
			requestData.cuisineID = this.cuisineID;
		}

		if (this.fireFlyID) {
			requestData.ff = this.fireFlyID;
		}

		if (this.proximity) {
			requestData.proximity = this.proximity;
		}

		if (this.lat && this.lng) {
			requestData.coordinate = `${this.lng},${this.lat}`;
		}
		
		requestData.page = this.pageDish;
		requestData.pageSize = 30;

		return this.appService.searchDish(requestData);
	}

	loadData = () => {
		Util.log(this.LOG_TAG, 'loadData()');

		this.busy = true;

		Observable.forkJoin([

			this.loadRestInfo(this.restFireFlyID),
			this.loadDishes(false),

		]).subscribe((response: any) => {

			// Rest Info
			var restInfoResponse: any = response[0];
			this.rest = restInfoResponse.Data;

			this.breadcrumbService.addFriendlyNameForRoute(`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}/${this.restFireFlyID}`, this.rest.Name);

			// Dish Items
			var dishesResponse: any = response[1];
			this.dishes = dishesResponse.Data;

			this.ngZone.run(() => {
				this.busy = false;
			});

			Util.log(this.LOG_TAG, 'loadData()', response, this.busy);
		});
	}

	loadMoreDishes = () => {
		if (!this.busyLoadMoreDish && this.canLoadMoreDish) {
			this.busyLoadMoreDish = true;

			this.loadDishes(true)
				.subscribe((response: any) => {
					var dishes = response.Data;

					if (dishes.length > 0) {
						this.dishes = this.dishes.concat(dishes);
					}
					else {
						this.canLoadMoreDish = false;
					}

					this.busyLoadMoreDish = false;

					Util.log(this.LOG_TAG, 'loadMoreDishes => response', response);
				});
		}

		Util.log(this.LOG_TAG, 'loadMoreDishes()', this.canLoadMoreDish);
	}

	selectDish = (dish) => {
		var queryParams: any = {};
		queryParams.keywords = dish.DishName;
		queryParams.lat = this.lat;
		queryParams.lng = this.lng;
		queryParams.proximity = this.proximity;

		this.router.navigate([`${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`, this.restFireFlyID, Path.RO.MENU_ITEMS], { queryParams: queryParams });
	}

	replaceSpaceWithDash = (value) => {
		return Util.replaceSpaceWithDash(value);
	}

	goBack = () => {
		this.location.back();

		Util.log(this.LOG_TAG, 'goBack');
	}
}