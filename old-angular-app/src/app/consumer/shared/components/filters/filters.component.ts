import { Component, Input, Output, EventEmitter } from '@angular/core';

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
import { EventsService } from '../../../../shared/services/events.service';
import { ShoppingCart } from '../../../../shared/services/shopping-cart.service';
import { SharedDataService } from '../../../../shared/services/shared-data.service';

@Component({
    selector: 'filters',
    templateUrl: './filters.component.html'
})
export class FiltersComponent {
    LOG_TAG = 'FiltersComponent =>';

    @Input() queryParams: QueryParams;
    @Output() filtersChanged: EventEmitter<any> = new EventEmitter<any>();

    constructor(public constants: Constants, public sharedDataService: SharedDataService, private appService: AppService, public shoppingCart: ShoppingCart, public eventsService: EventsService) {
        this.updateFiltersValue();
    }

    updateFiltersValue = () => {
        this.sharedDataService.deliveryFee = this.constants.DELIVERY_STEPS_VAL[this.sharedDataService.deliveryFeeStep];

        this.sharedDataService.minOrder = this.constants.MIN_ORDER_STEPS_VAL[this.sharedDataService.minOrderStep];

        Util.log(this.LOG_TAG, 'updateFiltersValue()');
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
        this.sharedDataService.serviceType = serviceType;

        this.applyFilter();
    }

    changeViewMode = (viewMode) => {
        this.sharedDataService.viewMode = viewMode;

        this.emitFiltersChanged();
    }

    applyFilter = () => {
        this.updateFiltersValue();

        // if (Util.isDefined(this.searchText) && this.searchText.length > 0) {
        //   this.addKeyword(this.searchText);

        //   this.searchText = '';
        // }
        // else {
        this.emitFiltersChanged();
        //}
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

                        this.eventsService.onFiltersChanged.emit({
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

                this.eventsService.onFiltersChanged.emit({
                    keywordType: keywordType
                });
            }
        }
        else {
            this.filtersChanged.emit({});

            this.eventsService.onFiltersChanged.emit({});
        }
    }

    selectCuisine = (cuisine: Cuisine) => {
        this.sharedDataService.selectCuisine(cuisine);

        this.emitFiltersChanged();
    }

}
