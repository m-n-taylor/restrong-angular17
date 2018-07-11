import { Component, ChangeDetectionStrategy, ViewEncapsulation, ViewChild, PLATFORM_ID, Inject } from '@angular/core';
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
import { ShoppingCart } from '../../shared/services/shopping-cart.service';
import { SharedDataService } from '../../shared/services/shared-data.service';

// Shared Components
import { FiltersComponent } from '../shared/components/filters/filters.component';
import { MenuItemComponent } from '../shared/components/menu-item/menu-item.component';
import { SearchBoxComponent } from '../shared/components/search-box/search-box.component';
import { MenuItemOptionsModalComponent } from '../shared/components/menu-item-options-modal/menu-item-options-modal.component';

declare var google;

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.Emulated,
  selector: 'menu-component',
  templateUrl: './menu.component.html',
  providers: []
})
export class MenuComponent {
  LOG_TAG = 'menu-page =>';

  routeSubscription: any;

  queryParams = new QueryParams();

  selectedTab: string;

  pageMenu: number;
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
  dishTypes = [];

  selectedMenuItem = new MenuItem();

  @ViewChild('filtersComponent') public filtersComponent: FiltersComponent;
  @ViewChild('searchBoxComponent') public searchBoxComponent: SearchBoxComponent;
  @ViewChild('menuItemOptionsModal') public menuItemOptionsModal: MenuItemOptionsModalComponent;

  constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public appService: AppService, private route: ActivatedRoute, private router: Router, public shoppingCart: ShoppingCart, public sharedDataService: SharedDataService, public eventsService: EventsService) {

    this.routeSubscription = this.route.queryParams.subscribe((params: any) => {

      QueryParams.fillParams(this.queryParams, params);

      Util.log('menu-page => QueryParams', this.queryParams, params);

      this.initPage();
    });

    // Listen to `user location changed` event
    this.eventsService.onUserLocationChanged.subscribe((googlePlace) => {
      this.initPage();

      Util.log(this.LOG_TAG, 'UserLocationChanged()');
    });

    Util.log('menu constructor()', this.route.params);
  }

  initPage() {
    Util.log('menu initPage()');

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
      Util.log('menu-page => loadMenuItems()', this.pageMenu);

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
      requestData.pageSize = 20;

      SearchMenuAPIRequestData.fillQueryParams(requestData, this.queryParams);
      SearchMenuAPIRequestData.fillSharedData(requestData, this.sharedDataService);

      if (requestData.page == 1)
        this.menuItems = new Array<MenuItem>();

      this.appService.searchRestaurant(requestData).subscribe(response => {
        this.hasMoreMenu = response.Data && response.Data.length;

        if (this.hasMoreMenu) {
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

        Util.log('menuItems', this.menuItems);
      });
    }
    else {
      Util.log('No Request sent', this.hasMoreMenu, this.busyMenu);
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
                  this.filtersComponent.canChangeServiceType(serviceType);

                  Util.log('Change service type', serviceType);
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

        Util.log('getAvailableServiceTypes', this.availableServiceTypes);
        this.noResults = true;
        this.busyMenu = false;
      });
  };

  loadDishTypes = () => {
    Util.log('loadMenuItemTypes()');

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

      Util.log('menuItems types', response);
    });

  }

  filtersChangedEvent = (data) => {
    Util.log('filtersChangedEvent', data, this.queryParams);

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

  menuItemClicked = (data) => {
    Util.log('menuItemClicked', data);

    var action = data.action;
    var menuItem = data.menuItem;

    if (action == MenuItemComponent.ACTION_VIEW_MENU) {
      this.router.navigate(['restaurant-details'], { queryParams: { restaurantID: menuItem.RestaurantID } });
    }
    else if (action == MenuItemComponent.ACTION_VIEW_ADD_CART) {
      this.selectedMenuItem = menuItem;

      this.menuItemOptionsModal.open(this.selectedMenuItem);
    }
  }

  chooseDishType = (dishType) => {
    dishType.active = !dishType.active;

    this.loadData();
  }

  menuItemOptionsModalEvents = (event) => {
    Util.log('event data', event);
  }

  openMenuMapView = () => {
    this.router.navigate(['menu-map-view'], { queryParams: this.queryParams });
  }

  selectCuisine = (cuisine: Cuisine) => {
    this.sharedDataService.selectCuisine(cuisine);

    this.filtersChangedEvent({});
  }

}
