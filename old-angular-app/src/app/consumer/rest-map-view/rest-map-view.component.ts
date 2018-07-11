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
import { ShoppingCart } from '../../shared/services/shopping-cart.service';

// Shared Components
import { FiltersComponent } from '../shared/components/filters/filters.component';
import { MenuItemOptionsModalComponent } from '../shared/components/menu-item-options-modal/menu-item-options-modal.component';

declare var google, MarkerClusterer;

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.Emulated,
  selector: 'rest-map-view',
  templateUrl: './rest-map-view.component.html',
  providers: []
})
export class RestMapViewComponent {
  routeSubscription: any;

  queryParams = new QueryParams();

  selectedTab: string;

  pageRest = 1;
  busyRest: boolean;
  restaurants = new Array<MenuItem>();
  restaurantsMarkers = new Array<any>();

  dishTypes = [];

  selectedRestaurant = null;

  markerCluster = null;

  menuMap: any;

  @ViewChild('filters') public filtersComponent: FiltersComponent;
  @ViewChild('menuItemOptionsModal') public menuItemOptionsModal: MenuItemOptionsModalComponent;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public appService: AppService, private route: ActivatedRoute, private router: Router, public shoppingCart: ShoppingCart, private zone: NgZone) {
    Util.log('menu map ctor()');
  }

  ngOnInit() {
    Util.log('ngOnInit()');

    this.routeSubscription = this.route.queryParams.subscribe((params: any) => {
      QueryParams.fillParams(this.queryParams, params);

      this.loadMenuItemsMapView();

      this.loadData();
    });

    Util.log('menu constructor()', this.route.params);
  }

  loadMenuItemsMapView = () => {
    if (isPlatformBrowser(this.platformId)) {
      var latLng = {}; //{ lat: parseFloat(this.queryParams.lat.toString()), lng: parseFloat(this.queryParams.lng.toString()) };

      var mapOptions = Util.clone(this.constants.DEFAULT_MAP_OPTIONS);
      mapOptions.center = latLng;

      this.menuMap = new google.maps.Map(document.getElementById('rest-map'), mapOptions);

      this.menuMap.addListener('center_changed', () => {
        // this.queryParams.lat = this.menuMap.center.lat();
        // this.queryParams.lng = this.menuMap.center.lng();

        // this.router.navigate(['rest-map-view'], { queryParams: this.queryParams });

        // Util.log('center changed', this.queryParams);
      });
    }
  }

  loadData = () => {
    this.pageRest = 1;

    this.loadRestaurants();
  }

  loadRestaurants = (loadMore?) => {
    Util.log('loadRestaurants()');

    this.restaurants = new Array<MenuItem>();
    this.restaurantsMarkers = [];

    this.busyRest = true;

    var requestData = new SearchMenuAPIRequestData();

    requestData.page = loadMore ? this.pageRest++ : 1;
    requestData.pageSize = 100;

    SearchMenuAPIRequestData.fillQueryParams(requestData, this.queryParams);

    if (requestData.page == 1)
      this.restaurants = [];

    this.appService.searchRestaurant(requestData).subscribe(response => {
      this.removeRestItemsMarkers();

      this.restaurants = response.Data;

      if (isPlatformBrowser(this.platformId)) {
        var self = this;

        // Add markers to map if it is a browser
        for (var i = 0; i < this.restaurants.length; i++) {
          var menuItem = this.restaurants[i];

          var marker = new google.maps.Marker({
            position: { lat: parseFloat(menuItem.Latitude.toString()), lng: parseFloat(menuItem.Longitude.toString()) },
            map: this.menuMap,
            customInfo: menuItem
          });

          this.restaurantsMarkers.push(marker);

          google.maps.event.addListenerOnce(marker, 'click', function () {
            self.chooseMapMarker(this);
          });

          if (i == 0) {
            this.chooseMapMarker(marker);
          }
        }

        // Removes the old marker cluster, if exist
        if (Util.isDefined(this.markerCluster)) {
          this.markerCluster.clearMarkers();
        }

        // Add a marker clusterer to manage the markers.
        this.markerCluster = new MarkerClusterer(this.menuMap, this.restaurantsMarkers,
          {
            imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
            minimumClusterSize: 25
          }
        );
      }

      this.busyRest = false;

      Util.log('restaurants', this.restaurants);
    });

  }

  filtersChangedEvent = (data) => {
    if (data.keywordType == this.constants.KEYWORD_TYPE_CUISINE) {
      this.router.navigate(['search'], { queryParams: this.queryParams });
    }
    else if (data.keywordType == this.constants.KEYWORD_TYPE_DISH || data.keywordType == this.constants.KEYWORD_TYPE_MENU_ITEM) {
      this.router.navigate(['rest-map-view'], { queryParams: this.queryParams });
    }
    else if (data.keywordType == this.constants.KEYWORD_TYPE_RESTAURANT) {
      this.router.navigate(['search'], { queryParams: this.queryParams });
    }
    else {
      this.router.navigate(['rest-map-view'], { queryParams: this.queryParams });
    }
  }

  chooseMapMarker = (marker) => {
    this.zone.run(() => {
      var menuItem = <MenuItem>marker.customInfo;

      this.selectedRestaurant = menuItem;

      google.maps.event.addListenerOnce(marker, 'click', () => {
        this.chooseMapMarker(marker);
      });

      Util.log('chooseMapMarker', menuItem);
    });
  }

  removeRestItemsMarkers = () => {
    for (var i in this.restaurantsMarkers) {
      var item = this.restaurantsMarkers[i];
      item.setMap(null);
    }
    this.restaurantsMarkers = [];
  }

  selectRestItem = (restaurant) => {
    this.router.navigate(['restaurant-details'], { queryParams: {restaurantID: restaurant.RestaurantID} });
  }

  selectDishType = (dishType) => {
    //this.filtersComponent.addKeyword(dishType.Name);
  }

  menuItemOptionsModalEvents = (event) => {
    Util.log('event data', event);
  }

  openRestListView = () => {
    this.router.navigate(['search'], { queryParams: this.queryParams });
  }

}
