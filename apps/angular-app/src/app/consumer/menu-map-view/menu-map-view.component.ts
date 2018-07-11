import { Component, ChangeDetectionStrategy, ViewEncapsulation, NgZone, ViewChild, PLATFORM_ID, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// Shared Models
import { MenuItem } from '../../shared/models/menu-item';
import { QueryParams } from '../../shared/models/query-params';
import { SearchMenuAPIRequestData } from '../../shared/models/search-menu-api-request-data';

// Shared Services
import { AppService } from '../../shared/services/app.service';

// Shared Components
import { FiltersComponent } from '../shared/components/filters/filters.component';
import { MenuItemOptionsModalComponent } from '../shared/components/menu-item-options-modal/menu-item-options-modal.component';
import { UserAddress } from "../../shared/models/user-address";
import { SharedDataService } from "../../shared/services/shared-data.service";
import { GMapOverlayView } from "../../shared/models/gmap-overlay";
import { HelperService } from "../../shared/services/helper.service";
import { EventsService } from "../../shared/services/events.service";
import { MenuItemComponent } from "../../shared/components/menu-item/menu-item.component";
import * as _ from "lodash";

declare var google, MarkerClusterer;

@Component({
	selector: 'menu-map-view',
	templateUrl: './menu-map-view.component.html'
})
export class MenuMapViewComponent {
	LOG_TAG = 'MenuMapViewComponent';

	isBrowser = false;
	routeSubscription: any;
	filtersChangedSubscription: any;

	queryParams = new QueryParams();

	selectedTab: string;

	pageMenu = 1;
	busyMenu: boolean;
	menuItems = new Array<MenuItem>();
	activeMenuItem: MenuItem = null;
	menuItemsMarkers = new Array<any>();

	busyDishTypes: boolean;
	dishTypes = [];

	selectedMenuItem = null;

	markerCluster = null;

	overlayView: GMapOverlayView;
	map: any;

	@ViewChild('activeMenuItemElement') public activeMenuItemElement: any;
	@ViewChild('menuItemOptionsModal') public menuItemOptionsModal: MenuItemOptionsModalComponent;

	constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public appService: AppService, private route: ActivatedRoute, private router: Router, private zone: NgZone, private sharedDataService: SharedDataService, private helperService: HelperService, private eventsService: EventsService) {
		this.isBrowser = isPlatformBrowser(this.platformId);

		this.filtersChangedSubscription = this.eventsService.onFiltersChanged.subscribe(this.onFiltersChanged);

		Util.log(this.LOG_TAG, 'constructor');
	}

	ngOnInit() {
		Util.log(this.LOG_TAG, 'ngOnInit()', this.activeMenuItemElement);

		if (this.isBrowser) {
			this.routeSubscription = this.route.queryParams.subscribe((params: any) => {
				QueryParams.fillParams(this.queryParams, params);

				this.initPage();
			});
		}
	}

	initPage = () => {
		this.loadData();
	}

	loadData = () => {
		this.drawMap();
	}

	drawMap = () => {
		var latLng = UserAddress.getLatLng(this.sharedDataService.userAddress);

		if (!Util.log(this.map)) {
			var mapOptions = Util.clone(this.constants.DEFAULT_MAP_OPTIONS);
			mapOptions.center = latLng;

			this.map = new google.maps.Map(document.getElementById('menu-map'), mapOptions);
		}
		else {
			this.map.setCenter(latLng);
		}

		if (!Util.log(this.overlayView)) {
			this.overlayView = new GMapOverlayView(this.activeMenuItemElement.nativeElement, this.map, this.onMenuItemClick, {
				marginBottom: 56
			});
		}

		google.maps.event.addListenerOnce(this.map, 'idle', () => {

			this.initMenuItems();

			this.loadMenuItems()
				.subscribe((response) => {
					this.removeMapMarkers();

					this.menuItems = response.Data;

					this.drawMapMarkers();

					this.map.setOptions({ draggable: true, zoomControl: true });

					var latLng = UserAddress.getLatLng(this.sharedDataService.userAddress);

					this.zone.run(() => {
						this.busyMenu = false;
					});
				});
		});

		this.drawUserMarker();
	}

	initMenuItems = () => {
		this.pageMenu = 1;
	}

	loadMenuItems = () => {
		Util.log(this.LOG_TAG, 'loadMenuItems()');

		this.busyMenu = true;

		var requestData = new SearchMenuAPIRequestData();

		requestData.page = this.pageMenu;
		requestData.pageSize = this.constants.MAX_ITEMS_PS;

		SearchMenuAPIRequestData.fillQueryParams(requestData, this.queryParams);
		SearchMenuAPIRequestData.fillSharedData(requestData, this.sharedDataService);

		return this.appService.searchRestaurant(requestData);
	}

	drawMapMarkers = () => {
		var markers = [];

		for (var menuItemIndex in this.menuItems) {
			var restItem = this.menuItems[menuItemIndex];

			var mapMarker = new google.maps.Marker({
				position: new google.maps.LatLng(restItem.Latitude, restItem.Longitude),
				map: this.map,
				icon: {
					url: this.helperService.getForkMapIcon(this.sharedDataService.platformSettings.Color_RestMapIcon),
				},
				args: {
					restItem: restItem
				},
				zIndex: this.constants.MAP_REST_ZINDEX
			});

			var self = this;

			(function (mapMarker) {
				mapMarker.addListener('click', () => {
					self.setActiveMenuItem(mapMarker.args.restItem);
				});
			}(mapMarker));

			restItem.mapMarker = mapMarker;

			markers.push(mapMarker);
		}

		// Removes the old marker cluster, if exist
		// if (Util.isDefined(this.markerCluster)) {
		// 	this.markerCluster.clearMarkers();
		// }

		// // Add a marker clusterer to manage the markers.
		// this.markerCluster = new MarkerClusterer(this.map, markers, {
		// 	imagePath: 'img/markercluster/m',
		// 	minimumClusterSize: 25
		// });

		// sets first item to be active
		// if (this.restItems.length > 0) {
		// 	this.setActiveMenuItem(this.restItems[0]);
		// }
	};

	removeMapMarkers = () => {
		for (var menuItemIndex in this.menuItems) {
			var menuItem = this.menuItems[menuItemIndex];

			menuItem.mapMarker.setMap(null);
		}
	};

	drawUserMarker = () => {
		var latLng = this.sharedDataService.userAddress.LatLng.split(',');

		var lat = latLng[0];
		var lng = latLng[1];

		var userMarker = new google.maps.Marker({
			position: new google.maps.LatLng(lat, lng),
			map: this.map,
			icon: {
				url: this.helperService.getSimpleMapIcon(this.sharedDataService.platformSettings.Color_UserMapIcon),
			},
			zIndex: this.constants.MAP_USER_ZINDEX
		});
	};

	setActiveMenuItem = (menuItem) => {
		Util.log(this.LOG_TAG, 'setActiveMenuItem', menuItem, this.activeMenuItem);

		if (this.activeMenuItem) {
			this.activeMenuItem.mapMarker.setIcon({
				url: this.helperService.getForkMapIcon(this.sharedDataService.platformSettings.Color_RestMapIcon)
			});

			this.activeMenuItem.mapMarker.setZIndex(this.constants.MAP_REST_ZINDEX);
		}

		if (this.activeMenuItem != menuItem) {
			this.activeMenuItem = menuItem;

			this.activeMenuItem.mapMarker.setIcon({
				url: this.helperService.getForkMapIcon(this.sharedDataService.platformSettings.Color_SelectedMapIcon)
			});

			this.activeMenuItem.mapMarker.setZIndex(this.constants.MAP_REST_ACTIVE_ZINDEX);

			this.overlayView.open(this.activeMenuItem.mapMarker.position, this.activeMenuItem);
		}
		else {
			this.activeMenuItem = null;
			this.overlayView.close();
		}
	};

	onMenuItemClick = (event) => {
		Util.log(this.LOG_TAG, 'onMenuItemClick', event, this.activeMenuItem);

		var action = event.action;
		var menuItem: MenuItem = event.menuItem;

		if (action == MenuItemComponent.ACTION_VIEW_MENU) {
			this.router.navigate([`/restaurant/${this.sharedDataService.serviceType}/${Util.replaceSpaceWithDash(menuItem.CuisineName)}/${Util.replaceSpaceWithDash(menuItem.RestaurantName)}-${Util.replaceSpaceWithDash(menuItem.Address)}/${menuItem.FFID}`]);
		}

		if (action == MenuItemComponent.ACTION_VIEW_ADD_CART) {
			this.menuItemOptionsModal.open(<MenuItem>_.omit(menuItem, 'mapMarker'));
		}
	}

	onFiltersChanged = (data) => {

	}

	openMenuListView = () => {
		this.router.navigate(['menu'], { queryParams: this.queryParams });
	}
}
