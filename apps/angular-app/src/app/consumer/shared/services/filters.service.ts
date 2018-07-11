import { PLATFORM_ID, Inject, Injectable, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SharedDataService } from "../../../shared/services/shared-data.service";
import { Constants } from "../../../shared/constants";
import { EventsService } from "../../../shared/services/events.service";
import { ShoppingCart } from "./shopping-cart.service";
import { CartItem } from "../../../shared/models/cart-item";
import { Util } from "../../../shared/util";
import { SearchMenuAPIRequestData } from "../../../shared/models/search-menu-api-request-data";
import { AppService } from "../../../shared/services/app.service";
import { Cuisine } from "../../../shared/models/cuisine";
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

/**
 * Filters Service
 */
@Injectable()
export class FiltersService {
    LOG_TAG = 'FiltersService';

    confirmModal: ConfirmModalComponent;

    constructor( @Inject(PLATFORM_ID) platformId: Object, private sharedDataService: SharedDataService, private shoppingCart: ShoppingCart, private constants: Constants, private eventsSerivce: EventsService, private appService: AppService, private eventsService: EventsService) {
        Util.log(this.LOG_TAG, 'constructor', this.confirmModal);

        this.eventsService.requestServiceTypeChange.subscribe((data) => {
            Util.log(this.LOG_TAG, 'requestServiceTypeChange', data);

            if (this.sharedDataService.serviceType != data.value) {
                this.changeServiceType(data.value);
            }
        });
    }

    setConfirmModal = (confirmModal: ConfirmModalComponent) => {
        this.confirmModal = confirmModal;
    }

    updateFiltersValue = () => {
        this.sharedDataService.deliveryFee = this.constants.DELIVERY_STEPS_VAL[this.sharedDataService.deliveryFeeStep];

        this.sharedDataService.minOrder = this.constants.MIN_ORDER_STEPS_VAL[this.sharedDataService.minOrderStep];

        Util.log(this.LOG_TAG, 'updateFiltersValue()');
    }

    changeServiceType = (serviceType) => {
        this.requestChangeServiceType(serviceType)
            .then((isChanged) => {
                if (isChanged) {
                    this.applyFilter(this.constants.FILTER_SERVICE_TYPE);
                }
            });
    }

    changeViewMode = (viewMode) => {
        this.sharedDataService.viewMode = viewMode;

        this.eventsService.onFiltersChanged.emit({
            filtersType: [this.constants.FILTER_VIEW_MODE]
        });
    }

    selectCuisine = (cuisine: Cuisine) => {
        this.sharedDataService.selectCuisine(cuisine);

        this.eventsService.onFiltersChanged.emit({
            filtersType: [this.constants.FILTER_CUISINE]
        });
    }

    applyFilter = (filterType: string) => {
        this.updateFiltersValue();

        this.eventsService.onFiltersChanged.emit({
            filtersType: [filterType]
        });

        // if (Util.isDefined(this.searchText) && this.searchText.length > 0) {
        //   this.addKeyword(this.searchText);

        //   this.searchText = '';
        // }
        // else {
        // this.emitFiltersChanged();
        //}
    }

    private requestChangeServiceType = (serviceType) => {
        return new Promise<boolean>((resolve, reject) => {
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

                this.confirmModal.open({
                    message: message
                }).then((confirm) => {
                    if (confirm) {
                        for (var i in unSupportedCartItems) {
                            this.shoppingCart.removeCartItem(unSupportedCartItems[i]);
                        }

                        this.sharedDataService.serviceType = serviceType;
                        this.sharedDataService.save();
                        
                        resolve(true);
                    }
                    else {
                        resolve(false);
                    }
                });
            }
            else {
                this.sharedDataService.serviceType = serviceType;

                resolve(true);
            }
        });
    }

    // emitFiltersChanged = (keyword?, keywordType?) => {
    //     if (keyword) {
    //         // If keyword type is unknown
    //         if (!keywordType) {
    //             var requestData = new SearchMenuAPIRequestData();

    //             requestData.keywords = keyword;
    //             // SearchMenuAPIRequestData.fillQueryParams(requestData, this.queryParams);

    //             this.appService.getKeywordsType(requestData).subscribe(response => {

    //                 if (Util.isDefined(response.WordType) && Util.isDefined(response.WordType[0])) {
    //                     var type = response.WordType[0].KeywordType;

    //                     this.eventsService.onFiltersChanged.emit({
    //                         filtersType: [this.constants.FILTER_KEYWORDS],
    //                         keywordType: type
    //                     });
    //                 }

    //                 Util.log('getKeywordsType response', response);
    //             });
    //         }
    //         else {
    //             this.eventsService.onFiltersChanged.emit({
    //                 filtersType: [this.constants.FILTER_KEYWORDS],
    //                 keywordType: keywordType
    //             });
    //         }
    //     }
    //     else {
    //         this.eventsService.onFiltersChanged.emit({
    //             filtersType: [this.constants.FILTER_KEYWORDS]
    //         });
    //     }
    // }

}