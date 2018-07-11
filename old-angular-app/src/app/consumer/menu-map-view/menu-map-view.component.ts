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
  selector: 'menu-map-view',
  templateUrl: './menu-map-view.component.html',
  providers: []
})
export class MenuMapViewComponent {
  routeSubscription: any;

  queryParams = new QueryParams();

  selectedTab: string;

  pageMenu = 1;
  busyMenu: boolean;
  menuItems = new Array<MenuItem>();
  menuItemsMarkers = new Array<any>();

  busyDishTypes: boolean;
  dishTypes = [];

  selectedMenuItem = null;

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
      // var latLng =  { lat: parseFloat(this.queryParams.lat.toString()), lng: parseFloat(this.queryParams.lng.toString()) };
      var latLng  = {};
      var mapOptions = Util.clone(this.constants.DEFAULT_MAP_OPTIONS);
      mapOptions.center = latLng;

      this.menuMap = new google.maps.Map(document.getElementById('menu-map'), mapOptions);

      this.menuMap.addListener('center_changed', () => {
        // this.queryParams.lat = this.menuMap.center.lat();
        // this.queryParams.lng = this.menuMap.center.lng();

        // this.router.navigate(['menu-map-view'], { queryParams: this.queryParams });

        // Util.log('center changed', this.queryParams);
      });
    }
  }

  loadData = () => {
    this.pageMenu = 1;

    this.loadMenuItems();

    this.loadDishTypes();
  }

  loadMenuItems = (loadMore?) => {
    Util.log('loadMenuItems()');

    this.menuItems = new Array<MenuItem>();
    this.menuItemsMarkers = new Array<any>();

    this.busyMenu = true;

    var requestData = new SearchMenuAPIRequestData();

    requestData.page = loadMore ? this.pageMenu++ : 1;
    requestData.pageSize = 100;

    SearchMenuAPIRequestData.fillQueryParams(requestData, this.queryParams);

    if (requestData.page == 1)
      this.menuItems = new Array<MenuItem>();

    this.appService.searchRestaurant(requestData).subscribe(response => {
      this.removeMenuItemsMarkers();

      this.menuItems = response.Data;

      if (isPlatformBrowser(this.platformId)) {
        var self = this;

        // Add markers to map if it is a browser
        for (var i = 0; i < this.menuItems.length; i++) {
          var menuItem = this.menuItems[i];

          var marker = new google.maps.Marker({
            position: { lat: parseFloat(menuItem.Latitude.toString()), lng: parseFloat(menuItem.Longitude.toString()) },
            map: this.menuMap,
            customInfo: menuItem
          });

          this.menuItemsMarkers.push(marker);

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
        this.markerCluster = new MarkerClusterer(this.menuMap, this.menuItemsMarkers,
          {
            imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
            minimumClusterSize: 25
          }
        );
      }

      this.busyMenu = false;

      Util.log('menuItems', this.menuItems);
    });

  }


  loadDishTypes = () => {
    Util.log('loadMenuItemTypes()');

    this.dishTypes = [];
    this.busyDishTypes = true;

    var requestData = new SearchMenuAPIRequestData();

    SearchMenuAPIRequestData.fillQueryParams(requestData, this.queryParams);

    this.appService.getDishTypes(requestData).subscribe(response => {
      this.dishTypes = response.Table;

      this.busyDishTypes = false;

      Util.log('menuItems types', response);
    });

  }

  filtersChangedEvent = (data) => {
    if (data.keywordType == this.constants.KEYWORD_TYPE_CUISINE) {
      this.router.navigate(['search'], { queryParams: this.queryParams });
    }
    else if (data.keywordType == this.constants.KEYWORD_TYPE_DISH || data.keywordType == this.constants.KEYWORD_TYPE_MENU_ITEM) {
      this.router.navigate(['menu-map-view'], { queryParams: this.queryParams });
    }
    else if (data.keywordType == this.constants.KEYWORD_TYPE_RESTAURANT) {
      this.router.navigate(['search'], { queryParams: this.queryParams });
    }
    else {
      this.router.navigate(['menu-map-view'], { queryParams: this.queryParams });
    }
  }

  chooseMapMarker = (marker) => {
    this.zone.run(() => {
      var menuItem = <MenuItem>marker.customInfo;

      this.selectedMenuItem = menuItem;

      google.maps.event.addListenerOnce(marker, 'click', () => {
        this.chooseMapMarker(marker);
      });

      Util.log('chooseMapMarker', menuItem);
    });
  }

  removeMenuItemsMarkers = () => {
    for (var i in this.menuItemsMarkers) {
      var item = this.menuItemsMarkers[i];
      item.setMap(null);
    }

    this.menuItemsMarkers = [];
  }

  selectMenuItem = (menuItem) => {
    this.selectedMenuItem = menuItem;

    this.menuItemOptionsModal.open(this.selectedMenuItem);

    Util.log('select menu item', menuItem);
  }

  selectDishType = (dishType) => {
    //this.filtersComponent.addKeyword(dishType.Name);
  }

  menuItemOptionsModalEvents = (event) => {
    Util.log('event data', event);
  }

  openMenuListView = () => {
    this.router.navigate(['menu'], { queryParams: this.queryParams });
  }

}
