import { Component, ChangeDetectionStrategy, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isBrowser } from 'angular2-universal';

// Shared Helpers
import { Util } from '../shared/util';
import { Constants } from '../shared/constants';

// Shared Models
import { MenuItem } from '../shared/models/menu-item';
import { QueryParams } from '../shared/models/query-params';
import { SearchMenuAPIRequestData } from '../shared/models/search-menu-api-request-data';

// Shared Services
import { AppService } from '../shared/services/app.service';
import { SharedDataService } from '../shared/services/shared-data.service';
import { ShoppingCart } from '../shared/services/shopping-cart.service';

// Shared Components
import { FiltersComponent } from '../shared/components/filters/filters.component';
import { MenuItemOptionsModalComponent } from '../shared/components/menu-item-options-modal/menu-item-options-modal.component';

declare var google;

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.Emulated,
  selector: 'menu',
  templateUrl: './menu.component.html',
  providers: []
})
export class MenuComponent {
  LOG_TAG = 'menu-page =>';

  routeSubscription: any;

  queryParams = new QueryParams();

  selectedTab: string;

  pageMenu = 1;
  busyMenu: boolean;
  menuItems = new Array<MenuItem>();
  menuRequestData = new SearchMenuAPIRequestData();

  busyDishTypes: boolean;
  dishTypes = [];

  selectedMenuItem = new MenuItem();

  @ViewChild('filters') public filtersComponent: FiltersComponent;
  @ViewChild('menuItemOptionsModal') public menuItemOptionsModal: MenuItemOptionsModalComponent;

  constructor(public constants: Constants, public appService: AppService, private route: ActivatedRoute, private router: Router, public shoppingCart: ShoppingCart, private sharedDataService: SharedDataService) {

    this.routeSubscription = this.route.queryParams.subscribe((params: any) => {

      QueryParams.fillParams(this.queryParams, params);

      this.universalInit();
    });

    Util.log('menu constructor()', this.route.params);
  }

  universalInit() {
    Util.log('menu universalInit()');

    this.loadData();
  }

  loadData = function () {
    this.pageMenu = 1;

    this.loadMenuItems();

    this.loadDishTypes();
  }

  loadMenuItems = (loadMore?) => {
    Util.log('loadMenuItems()');

    this.busyMenu = true;

    var requestData = new SearchMenuAPIRequestData();

    SearchMenuAPIRequestData.fillQueryParams(requestData, this.queryParams);
    SearchMenuAPIRequestData.fillSharedData(requestData, this.sharedDataService.data);

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

    if (requestData.page == 1)
      this.menuItems = new Array<MenuItem>();

    this.appService.searchRestaurant(requestData).subscribe(response => {
      this.menuItems = this.menuItems.concat(response.Data);

      this.busyMenu = false;

      Util.log('menuItems', this.menuItems);
    });
  }

  loadDishTypes = () => {
    Util.log('loadMenuItemTypes()');

    this.dishTypes = [];
    this.busyDishTypes = true;

    var requestData = new SearchMenuAPIRequestData();
    //requestData.page = 1;
    //requestData.pageSize = 20;

    SearchMenuAPIRequestData.fillQueryParams(requestData, this.queryParams);

    this.appService.getDishTypes(requestData).subscribe(response => {
      this.dishTypes = response.Table;

      this.busyDishTypes = false;

      Util.log('menuItems types', response);
    });

  }

  filtersChangedEvent = (data) => {
    if (Util.isDefined(data.keywordType)) {

      if (data.keywordType == this.constants.KEYWORD_TYPE_CUISINE) {
        this.queryParams.activeTab = this.constants.PAGE_TAB_DISH;
        this.router.navigate(['search'], { queryParams: this.queryParams });
      }
      else if (data.keywordType == this.constants.KEYWORD_TYPE_DISH || data.keywordType == this.constants.KEYWORD_TYPE_MENU_ITEM) {
        this.router.navigate(['menu'], { queryParams: this.queryParams });
      }
      else if (data.keywordType == this.constants.KEYWORD_TYPE_RESTAURANT) {
        this.queryParams.activeTab = this.constants.PAGE_TAB_RESTAURANT;
        this.router.navigate(['search'], { queryParams: this.queryParams });
      }

    }
    else {

      // If there are no keywords, then take user back to search page
      if (!Util.isDefined(this.queryParams.keywords) || Util.isEmpty(this.queryParams.keywords)) {
        this.queryParams.activeTab = this.constants.PAGE_TAB_DISH;
        this.router.navigate(['search'], { queryParams: this.queryParams });
      }
      else if (!SearchMenuAPIRequestData.compareQueryParams(this.menuRequestData, this.queryParams)) {
        Util.log(this.LOG_TAG, 'query params not matched');

        this.router.navigate(['menu'], { queryParams: this.queryParams });
      }
      else {
        Util.log(this.LOG_TAG, 'shared data not matched');

        this.universalInit();
      }

    }

  }

  selectMenuItem = (menuItem) => {
    this.selectedMenuItem = menuItem;

    this.menuItemOptionsModal.open(this.selectedMenuItem);

    Util.log('select menu item', menuItem);
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

}
