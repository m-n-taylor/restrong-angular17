import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Shared Helpers
import { Util } from '../shared/util';
import { Constants } from '../shared/constants';

// Shared Models
import { QueryParams } from '../shared/models/query-params';
import { SearchMenuAPIRequestData } from '../shared/models/search-menu-api-request-data';

// Shared Services
import { AppService } from '../shared/services/app.service';
import { SharedDataService } from '../shared/services/shared-data.service';

// Shared Components
import { FiltersComponent } from '../shared/components/filters/filters.component';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.Emulated,
  selector: 'search',
  templateUrl: './search.component.html',
  providers: []
})
export class SearchComponent {
  LOG_TAG = 'search-page =>';

  routeSubscription: any;

  queryParams = new QueryParams();

  selectedTab: string;

  pageDish = 1;
  busyDish = false;
  dishes: any = [];
  dishRequestData = new SearchMenuAPIRequestData();

  pageRest = 1;
  busyRest = false;
  restaurants: any = [];
  restRequestData = new SearchMenuAPIRequestData();

  constructor(public constants: Constants, public appService: AppService, private sharedDataService: SharedDataService, private route: ActivatedRoute, private router: Router) {
    Util.log('search-page => constructor()');

    this.routeSubscription = this.route.queryParams.subscribe((params: any) => {
      // Get selected tab
      this.selectedTab = params.activeTab || this.constants.PAGE_TAB_DISH;

      QueryParams.fillParams(this.queryParams, params);

      Util.log('search-page => QueryParams', params);

      this.universalInit();
    });

    // TODO: Convert query params to Slug params according to SEO requirments 
    // this.route.params.forEach((p) => {
    //   Util.log('slug params', p['id']);
    // });    
  }

  universalInit() {
    Util.log('search-page => universalInit()');

    this.loadData();
  }

  loadData = () => {
    if (this.selectedTab == this.constants.PAGE_TAB_DISH) {
      this.pageDish = 1;
      this.loadDishes();
    }
    else if (this.selectedTab == this.constants.PAGE_TAB_RESTAURANT) {
      this.pageRest = 1;
      this.loadRestaurants();
    }
  }

  loadDishes = (loadMore?) => {
    Util.log('search-page => loadDishes()', this.pageDish);

    this.busyDish = true;

    var requestData = new SearchMenuAPIRequestData();

    SearchMenuAPIRequestData.fillQueryParams(requestData, this.queryParams);
    SearchMenuAPIRequestData.fillSharedData(requestData, this.sharedDataService.data);

    this.dishRequestData = Util.clone(requestData); // Keep a copy of last `request data` sent to server

    Util.log(this.LOG_TAG, 'dishRequestData', this.dishRequestData);

    requestData.page = loadMore ? this.pageDish++ : 1;
    requestData.pageSize = 20;

    if (requestData.page == 1)
      this.dishes = [];

    this.appService.searchDish(requestData).subscribe(response => {
      this.dishes = this.dishes.concat(response.Data);
      this.busyDish = false;
      Util.log('dishes', this.dishes, this.busyDish);
    });
  }

  loadRestaurants = (loadMore?) => {
    Util.log('search-page => loadRestaurants()');

    this.busyRest = true;

    var requestData = new SearchMenuAPIRequestData();

    SearchMenuAPIRequestData.fillQueryParams(requestData, this.queryParams);
    SearchMenuAPIRequestData.fillSharedData(requestData, this.sharedDataService.data);

    this.restRequestData = Util.clone(requestData); // Keep a copy of last `request data` sent to server
    
    Util.log(this.LOG_TAG, 'restRequestData', this.restRequestData);

    requestData.page = loadMore ? this.pageRest++ : 1;
    requestData.pageSize = 20;

    if (requestData.page == 1)
      this.restaurants = [];

    this.appService.searchRestaurant(requestData).subscribe(response => {
      this.restaurants = this.restaurants.concat(response.Data);
      this.busyRest = false;
      Util.log('restaurants', this.restaurants);
    });

  }

  selectTab = (tab) => {
    this.queryParams.activeTab = tab;

    this.router.navigate(['search'], { queryParams: this.queryParams });
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

      // Get appropriate request data according to selected tab
      var requestData = this.selectedTab == this.constants.PAGE_TAB_RESTAURANT ? this.restRequestData : this.dishRequestData;

      if (!SearchMenuAPIRequestData.compareQueryParams(requestData, this.queryParams)) {
        Util.log(this.LOG_TAG, 'query params not matched');

        this.router.navigate(['search'], { queryParams: this.queryParams });
      }
      else {
        Util.log(this.LOG_TAG, 'shared data not matched');

        this.universalInit();
      }

    }
  }

  selectDishItem = (dish) => {
    if (dish.DishName !== '' && this.queryParams.keywords.indexOf(dish.DishName) === -1) {
      this.queryParams.keywords.push(dish.DishName);

      this.router.navigate(['menu'], { queryParams: this.queryParams });
    }
  }

  selectRestItem = (restaurant) => {
    this.queryParams.activeTab = null;
    this.queryParams.restaurantID = restaurant.RestaurantID;

    this.router.navigate(['restaurant-details'], { queryParams: this.queryParams });
  }

  openRestMapView = () => {
    this.router.navigate(['rest-map-view'], { queryParams: this.queryParams });
  }
}
