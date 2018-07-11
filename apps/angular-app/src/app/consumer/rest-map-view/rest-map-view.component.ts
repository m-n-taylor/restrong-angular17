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
import { SharedDataService } from "../../shared/services/shared-data.service";
import { UserAddress } from "../../shared/models/user-address";
import { HelperService } from "../../shared/services/helper.service";
import { GMapOverlayView } from "../../shared/models/gmap-overlay";
import { EventsService } from "../../shared/services/events.service";

declare var google, MarkerClusterer;

@Component({
	selector: 'rest-map-view',
	templateUrl: './rest-map-view.component.html',
})
export class RestMapViewComponent {
	LOG_TAG = 'RestMapViewComponent';

	isBrowser = false;
	routeSubscription: any;
	filtersChangedSubscription: any;

	queryParams = new QueryParams();

	selectedTab: string;

	pageRest = 1;
	busyRest: boolean;
	restItems = new Array<MenuItem>();
	activeRestItem: MenuItem = null;
	markerCluster = null;
	map: any;
	overlayView: GMapOverlayView;

	lastRequestData: any;

	@ViewChild('activeRestItemElement') public activeRestItemElement: any;

	constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public appService: AppService, private route: ActivatedRoute, private router: Router, private zone: NgZone, public sharedDataService: SharedDataService, private helperService: HelperService, private eventsService: EventsService) {
		this.isBrowser = isPlatformBrowser(this.platformId);

		this.filtersChangedSubscription = this.eventsService.onFiltersChanged.subscribe(this.onFiltersChanged);

		Util.log(this.LOG_TAG, 'constructor()');
	}

	ngOnInit() {
		Util.log(this.LOG_TAG, 'ngOnInit()');

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

			this.map = new google.maps.Map(document.getElementById('rest-map'), mapOptions);
		}
		else {
			this.map.setCenter(latLng);
		}

		if (!Util.log(this.overlayView)) {
			this.overlayView = new GMapOverlayView(this.activeRestItemElement.nativeElement, this.map, this.onRestItemClick, {
				marginBottom: 56
			});
		}

		google.maps.event.addListenerOnce(this.map, 'idle', () => {

			this.initRest();

			this.loadRestaurants()
				.subscribe((response) => {
					this.removeMapMarkers();

					this.restItems = response.Data;

					this.drawMapMarkers();

					this.map.setOptions({ draggable: true, zoomControl: true });

					var latLng = UserAddress.getLatLng(this.sharedDataService.userAddress);

					this.zone.run(() => {
						this.busyRest = false;
					});
				});
		});

		this.drawUserMarker();
	}

	initRest = () => {
		this.pageRest = 1;
	}

	loadRestaurants = () => {
		Util.log(this.LOG_TAG, 'loadRestaurants()');

		this.busyRest = true;

		var requestData = new SearchMenuAPIRequestData();

		requestData.page = this.pageRest;
		requestData.pageSize = this.constants.MAX_ITEMS_PS;

		SearchMenuAPIRequestData.fillQueryParams(requestData, this.queryParams);
		SearchMenuAPIRequestData.fillSharedData(requestData, this.sharedDataService);

		this.lastRequestData = Util.clone(requestData);

		return this.appService.searchRestaurant(requestData);
	}

	drawMapMarkers = () => {
		var markers = [];

		for (var restItemIndex in this.restItems) {
			var restItem = this.restItems[restItemIndex];

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
					self.setActiveRestItem(mapMarker.args.restItem);
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
		// 	this.setActiveRestItem(this.restItems[0]);
		// }
	};

	removeMapMarkers = () => {
		for (var restItemIndex in this.restItems) {
			var restItem = this.restItems[restItemIndex];

			restItem.mapMarker.setMap(null);
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

	setActiveRestItem = (restItem) => {
		Util.log(this.LOG_TAG, 'setActiveRestItem', restItem, this.activeRestItem);

		if (this.activeRestItem) {
			this.activeRestItem.mapMarker.setIcon({
				url: this.helperService.getForkMapIcon(this.sharedDataService.platformSettings.Color_RestMapIcon)
			});

			this.activeRestItem.mapMarker.setZIndex(this.constants.MAP_REST_ZINDEX);
		}

		if (this.activeRestItem != restItem) {
			this.activeRestItem = restItem;

			this.activeRestItem.mapMarker.setIcon({
				url: this.helperService.getForkMapIcon(this.sharedDataService.platformSettings.Color_SelectedMapIcon)
			});

			this.activeRestItem.mapMarker.setZIndex(this.constants.MAP_REST_ACTIVE_ZINDEX);

			this.overlayView.open(this.activeRestItem.mapMarker.position, this.activeRestItem);
		}
		else {
			this.activeRestItem = null;
			this.overlayView.close();
		}
	};

	onRestItemClick = () => {
		var restaurant = this.activeRestItem;

		Util.log(this.LOG_TAG, 'onRestItemClick', restaurant);

		this.router.navigate([`/restaurant/${this.sharedDataService.serviceType}/${Util.replaceSpaceWithDash(restaurant.CuisineName)}/${Util.replaceSpaceWithDash(restaurant.RestaurantName)}-${Util.replaceSpaceWithDash(restaurant.Address)}/${restaurant.FFID}`]);
	}

	onFiltersChanged = (data) => {
		Util.log(this.LOG_TAG, 'onFiltersChanged()', data);

		// Get appropriate request data according to selected tab
		var requestData = this.lastRequestData;

		if (!SearchMenuAPIRequestData.compareQueryParams(requestData, this.queryParams)) {
			Util.log(this.LOG_TAG, 'query params not matched', this.queryParams);

			this.router.navigate(['rest-map-view'], { queryParams: this.queryParams });
		}
		else {
			Util.log(this.LOG_TAG, 'shared data not matched');

			this.initPage();
		}
	}

	openRestListView = () => {
		this.router.navigate(['search'], { queryParams: this.queryParams });
	}

	ngOnDestroy() {
		Util.log(this.LOG_TAG, 'ngOnDestroy');

		if (this.filtersChangedSubscription) {
			this.filtersChangedSubscription.unsubscribe();
		}

		if (this.routeSubscription) {
			this.routeSubscription.unsubscribe();
		}
	}
}
