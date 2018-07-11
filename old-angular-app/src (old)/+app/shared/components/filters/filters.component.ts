import { Component, Input, Output, EventEmitter } from '@angular/core';

// Shared Helpers
import { Constants } from '../../constants';
import { Util } from '../../util';

// Shared Models
import { Cuisine } from '../../models/cuisine';
import { CartItem } from '../../models/cart-item';
import { QueryParams } from '../../models/query-params';
import { SearchMenuAPIRequestData } from '../../models/search-menu-api-request-data';

// Shared Services
import { AppService } from '../../services/app.service';
import { ShoppingCart } from '../../services/shopping-cart.service';
import { SharedDataService } from '../../services/shared-data.service';

@Component({
  selector: 'filters',
  templateUrl: './filters.component.html'
})
export class FiltersComponent {
  @Input() queryParams: QueryParams;
  @Output() filtersChanged: EventEmitter<any> = new EventEmitter<any>();

  searchText = '';
  autoSuggestList: any = {};

  dishAutoSuggestList = [];
  cuisineAutoSuggestList = [];
  restAutoSuggestList = [];

  showAutoSuggest = false;

  constructor(public constants: Constants, public sharedDataService: SharedDataService, private appService: AppService, public shoppingCart: ShoppingCart) {
    this.autoSuggestList = this.sharedDataService.data.autoSuggestList || {};
  }

  searchTextChanged = () => {
    this.showAutoSuggest = true;

    // Dishes
    var dishList = this.autoSuggestList.Dish || [];

    this.dishAutoSuggestList = dishList.filter((item) => {
      return item.Name.toLowerCase().indexOf(this.searchText.toLowerCase()) > -1;
    });

    this.dishAutoSuggestList = this.dishAutoSuggestList.slice(0, 3);

    // Cuisines
    var cuisineList = this.autoSuggestList.Cuisine || [];

    this.cuisineAutoSuggestList = cuisineList.filter((item) => {
      return item.Name.toLowerCase().indexOf(this.searchText.toLowerCase()) > -1;
    });

    this.cuisineAutoSuggestList = this.cuisineAutoSuggestList.slice(0, 3);

    // Restaurants
    var restList = this.autoSuggestList.Restaurant || [];

    this.restAutoSuggestList = restList.filter((item) => {
      return item.Name.toLowerCase().indexOf(this.searchText.toLowerCase()) > -1;
    });

    this.restAutoSuggestList = this.restAutoSuggestList.slice(0, 3);
  }

  focusSearchText = (focus) => {
    this.showAutoSuggest = focus;

    Util.log('focusSearchText()', focus);
  }

  canChangeServiceType = (serviceType) => {
    var unSupportedCartItems = new Array<CartItem>();

    for (var i in this.shoppingCart.cartItems) {
      var cartItem = this.shoppingCart.cartItems[i];

      if (cartItem.serviceTypes.indexOf(serviceType) == -1) {
        unSupportedCartItems.push(cartItem);
      }
    }

    if (unSupportedCartItems.length > 0) {
      var message = "";

      for (var i in unSupportedCartItems) {
        var cartItem = unSupportedCartItems[i];

        message += cartItem.RestaurantName;

        if (parseInt(i) < unSupportedCartItems.length - 1) {
          message += ', ';
        }
      }

      message += " doesn't offer " + serviceType + " service. If you change the service type then the restaurant(s) will be removed from cart.";

      if (confirm(message)) {
        for (var i in unSupportedCartItems) {
          this.shoppingCart.removeCartItem(unSupportedCartItems[i]);
        }

        this.changeServiceType(serviceType);
      }
    }
    else {
      this.changeServiceType(serviceType);
    }
  }

  changeServiceType = (serviceType) => {
    this.queryParams.serviceType = serviceType;

    this.applyFilter();
  }

  applyFilter = () => {
    if (Util.isDefined(this.searchText) && this.searchText.length > 0) {
      this.addKeyword(this.searchText);

      this.searchText = '';
    }
    else {
      this.emitFiltersChanged();
    }
  }

  emitFiltersChanged = (keyword?, keywordType?) => {
    if (keyword) {
      // If keyword type is unknown
      if (!keywordType) {
        var requestData = new SearchMenuAPIRequestData();

        SearchMenuAPIRequestData.fillQueryParams(requestData, this.queryParams);

        this.appService.getKeywordsType(requestData).subscribe(response => {

          if (Util.isDefined(response.WordType) && Util.isDefined(response.WordType[0])) {
            var type = response.WordType[0].KeywordType;

            this.filtersChanged.emit({
              keywordType: type
            });
          }

          Util.log('getKeywordsType response', response);
        });
      }
      else {
        this.filtersChanged.emit({
          keywordType: keywordType
        });
      }
    }
    else {
      this.filtersChanged.emit({});
    }
  }

  autoSuggestItemClicked = (item, keywordType) => {
    this.addKeyword(item.Name, keywordType);

    this.searchText = '';

    Util.log('autoSuggestItemClicked()', item);
  }

  addKeyword = (keyword, keywordType?) => {
    this.queryParams.keywords.push(keyword);

    this.emitFiltersChanged(keyword, keywordType);
  }

  removeKeyword = (index) => {
    this.queryParams.keywords.splice(index, 1);

    this.emitFiltersChanged(this.queryParams.keywords.length > 0);
  }

  selectCuisine = (cuisine: Cuisine) => {
    this.sharedDataService.selectCuisine(cuisine);

    this.emitFiltersChanged();
  }

}
