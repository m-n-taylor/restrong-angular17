import { PLATFORM_ID, Inject, Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BaseShoppingCart } from "../../../shared/services/base-shopping-cart.service";
import { SharedDataService } from "../../../shared/services/shared-data.service";
import { Constants } from "../../../shared/constants";
import { EventsService } from "../../../shared/services/events.service";
import { Util } from "../../../shared/util";
import { SearchMenuAPIRequestData } from '../../../shared/models/search-menu-api-request-data';
import { UserAddress } from '../../../shared/models/user-address';
import { AppService } from '../../../shared/services/app.service';
import { Observable } from 'rxjs/Observable';
import { FiltersChangedEvent } from '../../../shared/models/filters-changed-event';

/**
 * ShoppingCart
 */

@Injectable()
export class ShoppingCart extends BaseShoppingCart {
    LOG_TAG = 'CRShoppingCart';

    private _sharedDataService: SharedDataService;
    private _constants: Constants;
    private _appService: AppService;

    constructor( @Inject(PLATFORM_ID) platformId: Object, sharedData: SharedDataService, constants: Constants, private eventsSerivce: EventsService, appService: AppService) {
        super(platformId, sharedData, constants, { key: 'SHOPPING_CART_KEY' }, eventsSerivce, appService);

        this._sharedDataService = sharedData;
        this._constants = constants;
        this._appService = appService;

        Util.log(this.LOG_TAG, 'constructor()');

        this.eventsSerivce.onFiltersChanged.subscribe((filtersData: FiltersChangedEvent) => {
            Util.log(this.LOG_TAG, 'onFiltersChanged()');

            if (filtersData.filtersType.indexOf(this._constants.FILTER_USER_ADDRESS) > -1 && this._sharedDataService.hasUserAddress()) {
                this.updateCartItemsOnFilterChange();
                Util.log(this.LOG_TAG, 'updateCartItemsOnFilterChange()');
            }
            else {
                this.refresh();
                Util.log(this.LOG_TAG, 'refresh()');
            }
        });
    }

    updateCartItemsOnFilterChange = () => {
        this.busy = true;

        var promiseList = [];

        for (var i in this.cartItems) {
            var cartItem = this.cartItems[i];

            var requestData = new SearchMenuAPIRequestData();
            requestData.menuType = this._constants.SERVICE_TYPE_ID[this._sharedDataService.serviceType];
            requestData.coordinate = UserAddress.getStringCoordinate(this._sharedDataService.userAddress.LatLng);
            requestData.proximity = this._sharedDataService.proximity;
            // request.restaurantID = item.id;
            // request.Menus_SourceID = item.source;
            requestData.ff = cartItem.FFID;

            promiseList.push(this._appService.searchRestaurant(requestData));
        }

        Observable.forkJoin(promiseList)
            .subscribe((responseList: any) => {
                Util.log(this.LOG_TAG, 'updateCartItemsOnFilterChange', responseList);

                var cartIndexDeleteList = [];

                for (var i in responseList) {
                    var restItem = responseList[i].Data.length > 0 ? responseList[i].Data[0] : null;
                    var cartItem = this.cartItems[i];

                    if (restItem && cartItem.FFID == restItem.FFID && restItem.DeliveryCharge != null) {
                        cartItem.DeliveryFlat = restItem.DeliveryCharge;
                    }
                    else {
                        cartIndexDeleteList.push(i);
                    }
                }

                // Delete Cart items, that needs to delete
                for (var index = 0; index < cartIndexDeleteList.length; index++) {
                    this.cartItems.splice(cartIndexDeleteList[index], 1);
                }

                this.refresh();

                this.busy = false;
            });
    }

}