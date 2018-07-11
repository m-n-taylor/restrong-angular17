import { Component, ChangeDetectionStrategy, ViewEncapsulation, ViewChild, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// Shared Models
import { MenuItem } from '../../shared/models/menu-item';
import { Cuisine } from '../../shared/models/cuisine';
import { QueryParams } from '../../shared/models/query-params';
import { SearchMenuAPIRequestData } from '../../shared/models/search-menu-api-request-data';

// Shared Services
import { AppService } from '../../shared/services/app.service';
import { EventsService } from '../../shared/services/events.service';
import { SharedDataService } from '../../shared/services/shared-data.service';

// Shared Components
import { MenuItemComponent } from '../../shared/components/menu-item/menu-item.component';
import { FiltersComponent } from '../shared/components/filters/filters.component';
import { SearchBoxComponent } from '../shared/components/search-box/search-box.component';
import { MenuItemOptionsModalComponent } from '../shared/components/menu-item-options-modal/menu-item-options-modal.component';
import { request } from 'https';

declare var google;

@Component({
	selector: 'menu-component',
	templateUrl: './menu.component.html',

})
export class MenuComponent {
	LOG_TAG = 'MenuComponent';

	isBrowser = false;

	routeSubscription: any;
	filtersChangedSubscription: any;

	queryParams = new QueryParams();

	selectedTab: string;

	showMoreChips = false;
	busyMoreDishes = false;

	pageMenu: number;
	pageSizeMenu = 20;
	busyMenu = false;
	hasMoreMenu: boolean;
	noResults: boolean;
	defaultNoResultConfig = {
		icon: 'burger-search-fail-icon',
		title: "We can't find menu items",
		subtitle: 'Try to change your filters or search for something else.'
	};
	noResultConfig: any;
	menuItems = new Array<MenuItem>();
	menuRequestData = new SearchMenuAPIRequestData();
	availableServiceTypes: any;
	availableServiceTypesCount: number;

	busyDishTypes: boolean;
	isOverflowDishChips: boolean;
	dishTypes = [];

	selectedMenuItem: MenuItem;
	showMoreDishes: boolean;

	swiperConfig = {
		slidesPerView: 3,
		spaceBetween: 30,
		slidesPerGroup: 3,
		nextButton: '.swiper-button-next',
		prevButton: '.swiper-button-prev',
		breakpoints: {
			1024: {
				slidesPerView: 3,
				spaceBetween: 0,
			},
			768: {
				slidesPerView: 2,
				spaceBetween: 0,
			},
			640: {
				slidesPerView: 1,
				spaceBetween: 0,
			},
			320: {
				slidesPerView: 1,
				spaceBetween: 0,
			}
		}
	};

	// enableBodyScroll

	@ViewChild('dishChipsContainer') public dishChipsContainer: any;
	@ViewChild('searchBoxComponent') public searchBoxComponent: SearchBoxComponent;
	@ViewChild('menuItemOptionsModal') public menuItemOptionsModal: MenuItemOptionsModalComponent;

	constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public appService: AppService, private route: ActivatedRoute, private router: Router, public sharedDataService: SharedDataService, public eventsService: EventsService) {
		this.isBrowser = isPlatformBrowser(this.platformId);

		this.filtersChangedSubscription = this.eventsService.onFiltersChanged.subscribe(this.onFiltersChanged);

		this.routeSubscription = this.route.queryParams.subscribe((params: any) => {

			QueryParams.fillParams(this.queryParams, params);

			Util.log(this.LOG_TAG, 'menu-page => QueryParams', this.queryParams, params);

			this.initPage();
		});

		// Listen to `user location changed` event
		// this.eventsService.onUserLocationChanged.subscribe((googlePlace) => {
		// 	this.initPage();

		// 	Util.log(this.LOG_TAG, 'UserLocationChanged()');
		// });

		Util.log(this.LOG_TAG, 'menu constructor()', this.route.params);
	}

	initPage() {
		Util.log(this.LOG_TAG, 'menu initPage()');

		this.loadData();
	}

	loadData = function () {
		this.initMenuItems();

		this.loadMenuItems();

		this.loadDishTypes();
	}

	initMenuItems = () => {
		this.pageMenu = 1;
		this.hasMoreMenu = true;
		this.noResults = false;
		this.noResultConfig = Util.clone(this.defaultNoResultConfig);
	}

	loadMenuItems = (loadMore?) => {
		if (this.hasMoreMenu && !this.busyMenu) {
			Util.log(this.LOG_TAG, 'menu-page => loadMenuItems()', this.pageMenu);

			this.busyMenu = true;

			var requestData = new SearchMenuAPIRequestData();

			SearchMenuAPIRequestData.fillQueryParams(requestData, this.queryParams);
			SearchMenuAPIRequestData.fillSharedData(requestData, this.sharedDataService);

			requestData.termsinclude = "";

			// Add dish types here
			if (Util.isDefined(this.dishTypes)) {
				var selectedDishTypes = this.dishTypes.filter(function (item) {
					return item.active;
				});

				if (Util.isDefined(selectedDishTypes)) {
					for (var i in selectedDishTypes) {
						var dishType = selectedDishTypes[i];

						requestData.termsinclude += dishType.Name + '|';
					}
				}
			}

			this.menuRequestData = Util.clone(requestData); // Keep a copy of last `request data` sent to server

			Util.log(this.LOG_TAG, 'menuRequestData', this.menuRequestData);

			requestData.page = loadMore ? this.pageMenu++ : 1;
			requestData.pageSize = this.pageSizeMenu;

			SearchMenuAPIRequestData.fillQueryParams(requestData, this.queryParams);
			SearchMenuAPIRequestData.fillSharedData(requestData, this.sharedDataService);

			if (requestData.page == 1)
				this.menuItems = new Array<MenuItem>();

			this.appService.searchRestaurant(requestData).subscribe(response => {
				this.hasMoreMenu = response.Data && response.Data.length;

				if (this.hasMoreMenu) {
					this.hasMoreMenu = response.Data.length >= this.pageSizeMenu;

					this.menuItems = this.menuItems.concat(response.Data);

					this.busyMenu = false;
				}
				else {
					if (requestData.page == 1) {
						this.loadMenuItemsAvailableServiceTypes(requestData);
					}
					else {
						this.busyMenu = false;
					}
				}

				Util.log(this.LOG_TAG, 'menuItems', this.menuItems);
			});
		}
		else {
			Util.log(this.LOG_TAG, 'No Request sent', this.hasMoreMenu, this.busyMenu);
		}
	}

	loadMenuItemsAvailableServiceTypes = (request) => {
		this.appService.getAvailableServiceTypes(request)
			.subscribe(response => {
				this.noResultConfig = {
					icon: 'burger-search-fail-icon',
					title: "We can't find menu items for " + this.sharedDataService.serviceType + " service.",
					subtitle: 'But we found results in other serivce types.',
					buttons: []
				}

				this.availableServiceTypes = {};
				this.availableServiceTypesCount = 0;

				var availableServiceTypes = response.Table;

				for (var i in availableServiceTypes) {
					var availableServiceType = availableServiceTypes[i];

					if (availableServiceType.isExist) {
						var button = {
							title: this.constants.SERVICE_TYPE_TITLE[availableServiceType.MenuType],
							type: 'service-type',
							action: ((serviceType) => {
								return () => {
									this.eventsService.requestServiceTypeChange.emit({ value: serviceType });
									// this.filtersComponent.canChangeServiceType(serviceType);

									Util.log(this.LOG_TAG, 'Change service type', serviceType);
								}
							})(this.constants.SERVICE_TYPE_TITLE[availableServiceType.MenuType])
						};

						this.noResultConfig.buttons.push(button);

						this.availableServiceTypesCount++;
					}
				}

				if (this.availableServiceTypesCount == 0) {
					this.noResultConfig = Util.clone(this.defaultNoResultConfig);
				}

				Util.log(this.LOG_TAG, 'getAvailableServiceTypes', this.availableServiceTypes);
				this.noResults = true;
				this.busyMenu = false;
			});
	};

	loadDishTypes = () => {
		Util.log(this.LOG_TAG, 'loadMenuItemTypes()');

		this.isOverflowDishChips = false;
		this.dishTypes = [];
		this.busyDishTypes = true;

		var requestData = new SearchMenuAPIRequestData();
		//requestData.page = 1;
		//requestData.pageSize = 20;

		SearchMenuAPIRequestData.fillQueryParams(requestData, this.queryParams);
		SearchMenuAPIRequestData.fillSharedData(requestData, this.sharedDataService);

		this.appService.getDishTypes(requestData).subscribe(response => {
			this.dishTypes = response.Table;

			this.busyDishTypes = false;

			setTimeout(() => {
				this.checkOverflowDishChips();
			}, 100);

			Util.log(this.LOG_TAG, 'menuItems types', response);
		});
	}

	checkOverflowDishChips = () => {
		if (Util.isDefined(this.dishChipsContainer)) {
			var element: HTMLElement = this.dishChipsContainer.nativeElement;

			this.isOverflowDishChips = element.scrollHeight > element.clientHeight;
		}
	}

	onFiltersChanged = (data) => {
		Util.log(this.LOG_TAG, 'filtersChangedEvent', data, this.queryParams);

		if (Util.isDefined(data.keywordType)) {

			if (data.keywordType == this.constants.KEYWORD_TYPE_CUISINE) {
				this.router.navigate(['search'], { queryParams: this.queryParams });
			}
			else if (data.keywordType == this.constants.KEYWORD_TYPE_DISH || data.keywordType == this.constants.KEYWORD_TYPE_MENU_ITEM) {
				this.router.navigate(['menu'], { queryParams: this.queryParams });
			}
			else if (data.keywordType == this.constants.KEYWORD_TYPE_RESTAURANT) {
				this.router.navigate(['search'], { queryParams: this.queryParams });
			}

		}
		else {

			// If there are no keywords, then take user back to search page
			if (!Util.isDefined(this.queryParams.keywords) || Util.isEmpty(this.queryParams.keywords)) {
				this.router.navigate(['search'], { queryParams: this.queryParams });
			}
			else if (!SearchMenuAPIRequestData.compareQueryParams(this.menuRequestData, this.queryParams)) {
				Util.log(this.LOG_TAG, 'query params not matched');

				this.router.navigate(['menu'], { queryParams: this.queryParams });
			}
			else {
				Util.log(this.LOG_TAG, 'shared data not matched');

				this.initPage();
			}
		}
	}

	menuItemClicked = (data, menuItem, disableViewMenu) => {
		Util.log(this.LOG_TAG, 'menuItemClicked', data);

		var action = data.action;
		var menuItem = data.menuItem;

		if (action == MenuItemComponent.ACTION_VIEW_ADD_CART) {
			// this.selectedMenuItem = menuItem;

			this.menuItemOptionsModal.open(menuItem);
		}
		else if (action == MenuItemComponent.ACTION_VIEW_MORE_DISHES) {
			this.setShowMoreDishes(menuItem);
		}
		else if (!disableViewMenu && action == MenuItemComponent.ACTION_VIEW_MENU) {
			this.router.navigate([`/restaurant/${this.sharedDataService.serviceType}/${this.replaceSpaceWithDash(menuItem.CuisineName)}/${this.replaceSpaceWithDash(menuItem.RestaurantName)}-${this.replaceSpaceWithDash(menuItem.Address)}/${menuItem.FFID}`]);
		}
	}

	setShowMoreDishes = (menuItem: MenuItem) => {
		if (menuItem) {
			Util.enableBodyScroll(false);

			this.selectedMenuItem = menuItem;

			this.busyMoreDishes = true;

			var requestData = new SearchMenuAPIRequestData();

			SearchMenuAPIRequestData.fillQueryParams(requestData, this.queryParams);
			SearchMenuAPIRequestData.fillSharedData(requestData, this.sharedDataService);
			requestData.restaurantid = this.selectedMenuItem.RestaurantID;
			requestData.Menus_SourceID = this.selectedMenuItem.Menus_SourceID;
			requestData.termsinclude = "";

			this.appService.searchMenuItems(requestData)
				.subscribe(response => {
					this.selectedMenuItem.subMenuItems = response.Data;
					this.busyMoreDishes = false;
					this.showMoreDishes = true;
				});
		}
		else {
			Util.enableBodyScroll(true);

			this.showMoreDishes = false;
			this.selectedMenuItem = null;
		}
	}

	changeShowMoreDishesSlide = (direction: number) => {
		var menuItemListElement: any = document.querySelector('.more-dishes-container .menu-item-list');
		var elementWidth = menuItemListElement.offsetWidth;

		Util.scrollLeft(menuItemListElement, menuItemListElement.scrollLeft + (elementWidth * direction), 200);
	}

	clickOutsideShowMoreDishes = (event) => {
		Util.log(this.LOG_TAG, 'clickOutsideShowMoreDishes', event);

		this.setShowMoreDishes(null);
	}

	chooseDishType = (dishType) => {
		dishType.active = !dishType.active;

		this.loadData();
	}

	menuItemOptionsModalEvents = (event) => {
		Util.log(this.LOG_TAG, 'event data', event);
	}

	openMenuMapView = () => {
		this.router.navigate(['menu-map-view'], { queryParams: this.queryParams });
	}

	selectCuisine = (cuisine: Cuisine) => {
		this.sharedDataService.selectCuisine(cuisine);

		// this.filtersChangedEvent({});
	}

	replaceSpaceWithDash = (value) => {
		return Util.replaceSpaceWithDash(value);
	}

	ngOnDestroy() {
		Util.log(this.LOG_TAG, 'ngOnDestroy');

		if (this.showMoreDishes) {
			this.setShowMoreDishes(null);
		}

		if (this.filtersChangedSubscription) {
			this.filtersChangedSubscription.unsubscribe();
		}

		if (this.routeSubscription) {
			this.routeSubscription.unsubscribe();
		}
	}

}
