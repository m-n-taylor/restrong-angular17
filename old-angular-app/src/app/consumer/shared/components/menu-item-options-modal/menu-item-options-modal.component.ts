import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from "rxjs/Rx";

// Shared Helpers
import { Util } from '../../../../shared/util';
import { Constants } from '../../../../shared/constants';

// Shared Models
import { MenuItem } from '../../../../shared/models/menu-item';
import { QueryParams } from '../../../../shared/models/query-params';
import { SearchMenuAPIRequestData } from '../../../../shared/models/search-menu-api-request-data';

// Shared Services
import { AppService } from '../../../../shared/services/app.service';
import { EventsService } from '../../../../shared/services/events.service';
import { ShoppingCart } from '../../../../shared/services/shopping-cart.service';
import { BaseModal } from '../../../../shared/services/base-modal.service';

@Component({
  selector: 'menu-item-options-modal',
  templateUrl: './menu-item-options-modal.component.html',
  providers: []
})
export class MenuItemOptionsModalComponent extends BaseModal {
  totalPrice = 0;
  selectedMenuItem = new MenuItem();

  @ViewChild('modal') public modal: any;
  @Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();

  queryParams: QueryParams;

  queryParamSubscription: Subscription;

  busy: boolean;

  customDeliveryFee: any = null;

  constructor(public eventsService: EventsService, private route: ActivatedRoute, public constants: Constants, public appService: AppService, public shoppingCart: ShoppingCart) {
    super(eventsService);

    this.queryParams = new QueryParams();
  }

  open = (menuItem: MenuItem) => {
    this.queryParamSubscription = this.route.queryParams.subscribe((params: any) => {
      QueryParams.fillParams(this.queryParams, params);

      this.selectedMenuItem = Util.clone(menuItem);
      this.selectedMenuItem.quantity = 1;
      this.updateTotalPrice();

      this.openModal();

      if (this.selectedMenuItem.DeliveryModeID == this.constants.DELIVERY_MODE_SCHLEP_FETCH) {
        this.busy = true;
        var requestData = new SearchMenuAPIRequestData();
        requestData.coordinate = ''; //QueryParams.getStringCoordinate(this.queryParams.lat, this.queryParams.lng);
        requestData.restaurantid = this.selectedMenuItem.RestaurantID;

        this.appService.getDeliveryFee(requestData)
          .subscribe((restDeliveryFeeList) => {
            var restID = this.selectedMenuItem.RestaurantID;
            var foundRestDeliveryFee = null;

            if (Util.isDefined(restDeliveryFeeList)) {
              for (var i in restDeliveryFeeList) {
                var restDeliveryFee = restDeliveryFeeList[i];

                if (restDeliveryFee.RestaurantID == restID) {
                  foundRestDeliveryFee = restDeliveryFee;
                  this.customDeliveryFee = foundRestDeliveryFee;
                  break;
                }
              }
            }

            this.busy = false;

            this.loadData();
          });
      }
      else {
        this.loadData();
      }

    });
  }

  loadData = () => {
    if (!this.selectedMenuItem.IsSingleSize) {
      this.busy = true;

      var requestData = new SearchMenuAPIRequestData();

      SearchMenuAPIRequestData.fillQueryParams(requestData, this.queryParams);

      requestData.menuitemid = this.selectedMenuItem.MenuItemID;

      this.appService.getMenuItemSizes(requestData)
        .subscribe(response => {
          this.selectedMenuItem.menuItemSizes = response.Data;
          this.busy = false;

          for (var i in this.selectedMenuItem.menuItemSizes) {
            var item = this.selectedMenuItem.menuItemSizes[i];
            if (item.Is_Default) {
              this.selectMenuItemSize(item);
              break;
            }
          }

        });
    }
    else {
      this.selectedMenuItem.menuItemSizes = [];
      this.selectMenuItemSize(null);
    }
  }

  selectMenuItemSize = (menuItemSize) => {
    if (this.busy) return;

    this.busy = true;
    this.selectedMenuItem.menuItemOptions = [];

    var zid = null;

    if (menuItemSize) {
      this.selectedMenuItem.selectedMenuItemSize = menuItemSize;

      zid = this.selectedMenuItem.selectedMenuItemSize.id;
    }

    var requestData = new SearchMenuAPIRequestData();

    SearchMenuAPIRequestData.fillQueryParams(requestData, this.queryParams);

    requestData.menuitemid = this.selectedMenuItem.MenuItemID;
    requestData.zid = zid;

    this.appService.getMenuItemOptions(requestData)
      .subscribe(response => {
        this.selectedMenuItem.menuItemOptions = Util.clone(response.MenuOptions);
        this.busy = false;

        for (var i in this.selectedMenuItem.menuItemOptions) {
          var item = this.selectedMenuItem.menuItemOptions[i];
          for (var j in item.OptionItems) {
            var optionItem = item.OptionItems[j];

            if (optionItem.Is_Default) {
              this.selectMenuItemOptionItem(optionItem, item);
              if (item.Is_Single_Select) break;
            }
          }
        }

        this.updateTotalPrice();
      });
  };

  selectMenuItemOptionItem = (optionItem, menuItemOption) => {
    if (menuItemOption.Is_Single_Select) {
      // Single select
      menuItemOption.selectedOptionItem = optionItem;
    }
    else if (!menuItemOption.Is_Single_Select) {
      // Multiple select
      optionItem.isSelected = !optionItem.isSelected;

      if (optionItem.isSelected) {
        if (typeof menuItemOption.totalSelectedOptionItems === 'undefined' || !menuItemOption.totalSelectedOptionItems)
          menuItemOption.totalSelectedOptionItems = 0;

        // Maximum limit
        if (menuItemOption.Maximum_Select > 1 && menuItemOption.totalSelectedOptionItems == menuItemOption.Maximum_Select) {
          optionItem.isSelected = false;
          alert('Maximum limit reached. You cant add more.');
          return;
        }
        menuItemOption.totalSelectedOptionItems++;
      }
      else {
        menuItemOption.totalSelectedOptionItems--;
      }
    }

    this.updateTotalPrice();
  }

  addToCart = () => {
    this.busy = true;
    var isValid = true;
    var menuItem = this.selectedMenuItem;

    // Checks if menu item size is availble and user has choosen atleast 1 size
    if (menuItem.menuItemSizes.length > 0 && ((typeof menuItem.selectedMenuItemSize === 'undefined' || !menuItem.selectedMenuItemSize))) {
      isValid = false;
      alert('Choose item size - You need to choose atleast 1 option');
    }
    else {
      // Checks the validation rules on the option items of a particular menu item
      for (var i in menuItem.menuItemOptions) {
        var menuItemOption = menuItem.menuItemOptions[i];

        // For single select items
        if (menuItemOption.Is_Single_Select) {
          if (typeof menuItemOption.selectedOptionItem === 'undefined' || !menuItemOption.selectedOptionItem) {
            isValid = false;
            alert(menuItemOption.OptionHeader + '- You need to choose atleast 1 option');
            break;
          }
        }
        else {
          // For multi select items
          var totalSelectedOptionItems = menuItemOption.totalSelectedOptionItems || 0;
          if (totalSelectedOptionItems < menuItemOption.Minimum_Select) {
            isValid = false;
            alert(menuItemOption.OptionHeader + '- You need to choose atleast ' + menuItemOption.Minimum_Select + ' option');
            break;
          }
        }

      }
    }

    // If user selected valid options, then update the cart
    if (isValid) {
      this.shoppingCart.addMenuItem(this.selectedMenuItem, this.customDeliveryFee);
      this.close();
    }

    this.busy = false;
  }

  updateQty = (increment) => {

    var newQty = (increment + this.selectedMenuItem.quantity);

    if ((increment + this.selectedMenuItem.quantity) > this.constants.CART_ITEM_MAX_LIMIT) {
      alert(`You cant add more then ${this.constants.CART_ITEM_MAX_LIMIT} items`);
    }
    else {
      if(newQty < 1) newQty = 1;

      this.selectedMenuItem.quantity = newQty;
      this.updateTotalPrice();
    }

  };

  updateTotalPrice = () => {
    this.totalPrice = ShoppingCart.calculateMenuItemTotalPrice(this.selectedMenuItem);
  }

  close = () => {
    this.queryParamSubscription.unsubscribe();

    this.closeModal();
  }

}
