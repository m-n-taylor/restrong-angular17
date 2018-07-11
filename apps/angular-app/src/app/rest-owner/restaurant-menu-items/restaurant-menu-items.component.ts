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
	selector: 'ro-restaurant-menu-items',
	templateUrl: './restaurant-menu-items.component.html'
})
export class RestaurantMenuItemsComponent implements OnInit {
	LOG_TAG = 'RestaurantMenuItemsComponent => ';

	busy = false;

	restFireFlyID: string;
	keywordsLabel = '';
	keywords = new Array<string>();
	cuisineID: string;
	fireFlyID: string;
	lat: string;
	lng: string;
	proximity: number;

	rest: Restaurant;

	menuItemConfig = {
		mode: 'viewOnly'
	}
	menuItems = new Array<MenuItem>();
	pageMenuItem: number;
	busyMenuItems: boolean;
	busyLoadMoreMenuItem: boolean;
	canLoadMoreMenuItem: boolean;
	dishTypes = [];

	showMoreChips = false;
	isOverflowDishChips: boolean;

	@ViewChild('dishChipsContainer') public dishChipsContainer: any;
	constructor(public constants: Constants, private ROService: ROService, private appService: AppService, private router: Router, private activatedRoute: ActivatedRoute, private breadcrumbService: BreadcrumbService, private ngZone: NgZone, private location: Location) {
		this.initMenuItems();
	}

	ngOnInit() {
		Util.log(this.LOG_TAG, 'Init()');

		Observable.combineLatest([this.activatedRoute.queryParams, this.activatedRoute.params]).subscribe(data => {
			Util.log(this.LOG_TAG, 'combineLatest', data);

			// Query Params
			var queryParams = data[0];
			this.keywords = Util.isDefined(queryParams.keywords) ? queryParams.keywords.split(',') : [];
			this.cuisineID = Util.isDefined(queryParams.cuisineID) ? queryParams.cuisineID : null;
			this.fireFlyID = Util.isDefined(queryParams.fireFlyID) ? queryParams.fireFlyID : null;
			this.lat = Util.isDefined(queryParams.lat) ? queryParams.lat : null;
			this.lng = Util.isDefined(queryParams.lng) ? queryParams.lng : null;
			this.proximity = Util.isDefined(queryParams.proximity) ? queryParams.proximity : null;

			for (var i = 0; i < this.keywords.length; i++) {
				var keyword = this.keywords[i];

				this.keywordsLabel += keyword;

				if (i < this.keywords.length - 1) {
					this.keywordsLabel += ' - ';
				}
			}

			this.breadcrumbService.addFriendlyNameForRouteRegex(`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}/[A-Z0-9]+/${Path.RO.MENU_ITEMS}`, this.keywordsLabel);
			this.breadcrumbService.addFriendlyNameForRouteRegex(`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}/[A-Z0-9]+/${Path.RO.MENU_ITEMS}[A-Za-z0-9\?=&]+$`, this.keywordsLabel);

			// Params
			var params = data[1];
			this.restFireFlyID = params.fireFlyID;

			this.loadData();
		});
	}


	loadData = () => {
		Util.log(this.LOG_TAG, 'loadData()');

		this.busy = true;

		Observable.forkJoin([

			this.loadRestInfo(this.restFireFlyID),
			this.loadDishTypes(),
			this.loadMenuItems(false),

		]).subscribe((response: any) => {

			// Rest Info
			var restInfoResponse: any = response[0];
			this.rest = restInfoResponse.Data;

			this.breadcrumbService.addFriendlyNameForRoute(`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}/${this.restFireFlyID}`, this.rest.Name);

			// Dish Types
			var dishTypesResponse: any = response[1];
			this.dishTypes = dishTypesResponse.Table;

			setTimeout(() => {
				this.checkOverflowDishChips();
			}, 100);

			// Menu Items
			var menuItemsResponse: any = response[2];
			this.menuItems = menuItemsResponse.Data;

			this.ngZone.run(() => {
				this.busy = false;
			});

			Util.log(this.LOG_TAG, 'loadData()', response, this.busy);
		});
	}

	checkOverflowDishChips = () => {
		if (Util.isDefined(this.dishChipsContainer)) {
			var element: HTMLElement = this.dishChipsContainer.nativeElement;

			this.isOverflowDishChips = element.scrollHeight > element.clientHeight;
		}
	}

	loadRestInfo = (fireFlyID) => {
		var requestData = new ROAPIRequestData();

		ROAPIRequestData.fillFireFlyID(requestData, fireFlyID);

		return this.ROService.getRestInfo(requestData);
	}

	loadDishTypes = () => {
		Util.log('loadDishTypes');

		this.isOverflowDishChips = false;
		var requestData = new SearchMenuAPIRequestData();
		requestData.restaurantid = 0;

		if (Util.isDefined(this.keywords) && this.keywords.length > 0) {
			requestData.keywords = this.keywords.join(this.constants.KEYWORD_SEPRATOR);
		}

		requestData.menuType = this.constants.SERVICE_TYPE_DINEIN;

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

		return this.appService.getDishTypes(requestData);
	}

	initMenuItems = () => {
		this.menuItems = new Array<MenuItem>();
		this.pageMenuItem = 1;
		this.busyLoadMoreMenuItem = false;
		this.canLoadMoreMenuItem = true;
	}

	loadMenuItems = (loadMore: boolean) => {
		if (loadMore) {
			this.pageMenuItem++;
		}
		else {
			this.initMenuItems();
		}

		var requestData = new SearchMenuAPIRequestData();
		requestData.restaurantid = 0;

		if (Util.isDefined(this.keywords) && this.keywords.length > 0) {
			requestData.keywords = this.keywords.join(this.constants.KEYWORD_SEPRATOR);
		}

		requestData.menuType = this.constants.SERVICE_TYPE_DINEIN;

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

		requestData.termsinclude = this.dishTypes.filter(d => d.isActive).map(d => d.Name).join('|');

		requestData.page = this.pageMenuItem;
		requestData.pageSize = 30;

		return this.appService.searchMenuItems(requestData);
	}

	loadMoreMenuItems = () => {
		if (!this.busyLoadMoreMenuItem && this.canLoadMoreMenuItem) {
			this.busyLoadMoreMenuItem = true;

			this.loadMenuItems(true)
				.subscribe((response: any) => {
					var menuItems = response.Data;

					if (menuItems.length > 0) {
						this.menuItems = this.menuItems.concat(menuItems);
					}
					else {
						this.canLoadMoreMenuItem = false;
					}

					this.busyLoadMoreMenuItem = false;

					Util.log(this.LOG_TAG, 'loadMoreMenuItems => response', response);
				});
		}

		Util.log(this.LOG_TAG, 'loadMoreMenuItems()', this.canLoadMoreMenuItem);
	}

	chooseDishType = (dishType) => {
		dishType.isActive = !dishType.isActive;

		this.busyMenuItems = true;

		this.loadMenuItems(false)
			.subscribe((response: any) => {
				this.menuItems = response.Data;

				this.busyMenuItems = false;

				Util.log(this.LOG_TAG, 'loadMenuItems => response', response);
			});

		Util.log(this.LOG_TAG, 'chooseDishType()', dishType);
	}

	replaceSpaceWithDash = (value) => {
		return Util.replaceSpaceWithDash(value);
	}

	goBack = () => {
		this.location.back();

		Util.log(this.LOG_TAG, 'goBack');
	}
}