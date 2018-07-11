import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

// Shared Helpers
import { Constants } from '../../../../shared/constants';
import { Util } from '../../../../shared/util';

// Shared Models
import { Cuisine } from '../../../../shared/models/cuisine';
import { CartItem } from '../../../../shared/models/cart-item';
import { QueryParams } from '../../../../shared/models/query-params';
import { SearchMenuAPIRequestData } from '../../../../shared/models/search-menu-api-request-data';

// Shared Services
import { AppService } from '../../../../shared/services/app.service';
import { ShoppingCart } from '../../../../shared/services/shopping-cart.service';
import { SharedDataService } from '../../../../shared/services/shared-data.service';

@Component({
  selector: 'shopping-cart',
  templateUrl: './shopping-cart.component.html'
})
export class ShoppingCartComponent {
  
  constructor(public constants: Constants, public sharedDataService: SharedDataService, private appService: AppService, public shoppingCart: ShoppingCart, private router: Router) {
    
  }

  updateQty = (menuItem, increment) => {

    var newQty = (increment + menuItem.quantity);

    if ((increment + menuItem.quantity) > this.constants.CART_ITEM_MAX_LIMIT) {
      alert(`You cant add more then ${this.constants.CART_ITEM_MAX_LIMIT} items`);
    }
    else {
      if(newQty < 1) newQty = 1;

      menuItem.quantity = newQty;

      this.shoppingCart.refresh();
    }

  };

  viewMenu = (restaurantID) => {
    this.sharedDataService.toggleShoppingCart();

    this.router.navigate(['restaurant-details'], { queryParams: {restaurantID: restaurantID} });
  }

  placeOrder = () => {
    this.sharedDataService.toggleShoppingCart();
    
    this.router.navigate(['checkout']);
  }

}
