import { PLATFORM_ID, Inject, Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { Util } from '../util';
import { Constants } from '../constants';

import { SharedDataService } from '../services/shared-data.service';

import { MenuItem } from '../models/menu-item';
import { CartItem } from '../models/cart-item';

/**
 * ShoppingCart
 */

@Injectable()
export class ShoppingCart {
    private static SHOPPING_CART_KEY = 'SHOPPING_CART_KEY';
    public total = 0;
    public totalMenuItems = 0;
    private minOrderCartItems = new Array<CartItem>();
    public cartItems = new Array<CartItem>();

    constructor(@Inject(PLATFORM_ID) private platformId: Object, private sharedData: SharedDataService, private constants: Constants) {
        if (isPlatformBrowser(this.platformId)) {
            var shoppingCartStr = sessionStorage.getItem(ShoppingCart.SHOPPING_CART_KEY);

            if (typeof shoppingCartStr !== 'undefined' && shoppingCartStr) {
                var shoppingCart = <ShoppingCart>JSON.parse(shoppingCartStr);

                this.cartItems = shoppingCart.cartItems;

                this.refresh(true);
            }
        }

        Util.log('ShoppingCart Init()');
    }

    public static calculateMenuItemTotalPrice = (menuItem: MenuItem) => {
        var totalPrice = 0;

        if (typeof menuItem.selectedMenuItemSize !== 'undefined' && menuItem.selectedMenuItemSize) {
            totalPrice = menuItem.quantity * menuItem.selectedMenuItemSize.Price;
        }
        else {
            totalPrice = menuItem.quantity * menuItem.Price;
        }

        // checks if item has options, then apply there prices
        if (typeof menuItem.menuItemOptions !== 'undefined' && menuItem.menuItemOptions) {
            for (var menuItemOptionIndex in menuItem.menuItemOptions) {
                var menuItemOption = menuItem.menuItemOptions[menuItemOptionIndex];

                // For single select items
                if (menuItemOption.Is_Single_Select) {
                    if (typeof menuItemOption.selectedOptionItem !== 'undefined' && menuItemOption.selectedOptionItem) {
                        totalPrice += menuItem.quantity * menuItemOption.selectedOptionItem.Price;
                    }
                }
                else {
                    // For multi select items
                    for (var menuItemOptionItemIndex in menuItemOption.OptionItems) {
                        var menuItemOptionItem = menuItemOption.OptionItems[menuItemOptionItemIndex];

                        if (menuItemOptionItem.isSelected) {
                            totalPrice += menuItem.quantity * menuItemOptionItem.Price;
                        }
                    }
                }
            }
        }
        return totalPrice;
    }

    refresh = (ignoreSave?) => {
        this.total = 0;
        this.totalMenuItems = 0;
        this.minOrderCartItems = new Array<CartItem>();

        for (var cartItemIndex in this.cartItems) {
            var cartItem = this.cartItems[cartItemIndex];

            // Reset all the calculations
            cartItem.delivery = 0;
            cartItem.serviceFee = 0;
            cartItem.driverTip = 0;
            cartItem.tax = 0;
            cartItem.subTotal = 0;
            cartItem.total = 0;

            // Calculating subTotal and totalMenuItems
            for (var menuItemIndex in cartItem.menuItems) {
                var menuItem = cartItem.menuItems[menuItemIndex];

                cartItem.subTotal += ShoppingCart.calculateMenuItemTotalPrice(menuItem);

                this.totalMenuItems += menuItem.quantity;
            }

            cartItem.subTotal = Util.round(cartItem.subTotal);

            // Calculating `tax`
            cartItem.tax = Util.round(cartItem.subTotal * this.sharedData.taxPercent);

            // Calculating `delivery fees`
            if (this.sharedData.serviceType == this.constants.SERVICE_TYPE_DELIVERY) {

                if (cartItem.DeliveryModeID == this.constants.DELIVERY_MODE_SCHLEP_FETCH) {
                    cartItem.delivery = Util.round(cartItem.DeliveryFlat + (cartItem.subTotal * (cartItem.DeliveryPercentSubTotal / 100)));
                }
                else {
                    cartItem.delivery = cartItem.DeliveryFlat;
                }

            }

            // Calculating `driver tip`
            cartItem.driverTip = Util.round(cartItem.subTotal * (cartItem.driverTipPercent / 100));

            // Calculating `total`
            cartItem.total = Util.round(cartItem.subTotal + cartItem.tax + cartItem.delivery + cartItem.driverTip);

            // Calculating `service fee`
            if (Util.isDefined(this.sharedData.serviceFee)) {
                cartItem.serviceFee = Util.round(cartItem.total * (this.sharedData.serviceFee.SecurityFee / 100) + (this.sharedData.serviceFee.TransactionFee));
            }
            else {
                cartItem.serviceFee = 0;
            }

            // Adding service fee in `total`
            cartItem.total = Util.round(cartItem.total + cartItem.serviceFee);

            // Calculating Grand total
            this.total = Util.round(this.total + cartItem.total);

            // Add `cart item` to min order list if min order not reached
            if (cartItem.MinOrder > cartItem.subTotal) {
                this.minOrderCartItems.push(cartItem);
            }
        }

        if (!ignoreSave) this.save();
    }

    addMenuItem = (menuItem: MenuItem, customDeliveryFee: any) => {
        var foundCartItem: CartItem;

        for (var i in this.cartItems) {
            var cartItem = this.cartItems[i];

            if (cartItem.RestaurantID == menuItem.RestaurantID) {
                cartItem.menuItems.push(menuItem);
                foundCartItem = cartItem;
            }
        }

        if (!foundCartItem) {
            foundCartItem = new CartItem();
            foundCartItem.RestaurantID = menuItem.RestaurantID;
            foundCartItem.RestaurantName = menuItem.RestaurantName;
            foundCartItem.Address = menuItem.Address;
            foundCartItem.Availability = menuItem.Availability;
            foundCartItem.FileName = menuItem.FileName;
            foundCartItem.ETA = menuItem.ETA;
            foundCartItem.DeliveryModeID = menuItem.DeliveryModeID;
            foundCartItem.driverTipPercent = 10;
                
            // Delivery Fee
            if(Util.isDefined(customDeliveryFee)) {
                foundCartItem.DeliveryFlat = customDeliveryFee.DeliveryFee;
                foundCartItem.DeliveryPercentSubTotal = customDeliveryFee.PercentOfSubTotal;
            }
            else {
                foundCartItem.DeliveryFlat = menuItem.DeliveryCharge || 0;
                foundCartItem.DeliveryPercentSubTotal = 0;
            }

            foundCartItem.MinOrder = menuItem.MinOrder;
            foundCartItem.menuItems = [menuItem]

            foundCartItem.serviceTypes = [];

            if (menuItem.isDiningIn)
                foundCartItem.serviceTypes.push(this.constants.SERVICE_TYPE_DINEIN);
            if (menuItem.isCatering)
                foundCartItem.serviceTypes.push(this.constants.SERVICE_TYPE_CATERING);
            if (menuItem.isDelivery)
                foundCartItem.serviceTypes.push(this.constants.SERVICE_TYPE_DELIVERY);
            if (menuItem.isPickup)
                foundCartItem.serviceTypes.push(this.constants.SERVICE_TYPE_PICKUP);

            this.cartItems.push(foundCartItem);
        }

        this.refresh();
    }

    removeMenuItem = (menuItem: MenuItem, cartItem: CartItem) => {
        var menuItemIndex = cartItem.menuItems.indexOf(menuItem);

        if (menuItemIndex > -1) {
            cartItem.menuItems.splice(menuItemIndex, 1);

            if(cartItem.menuItems.length == 0) {
                var cartItemIndex = this.cartItems.indexOf(cartItem);

                this.cartItems.splice(cartItemIndex, 1);
            }
        }

        this.refresh();
    }

    removeCartItem = (cartItem: CartItem) => {
        var cartItemIndex = this.cartItems.indexOf(cartItem);

        if (cartItemIndex > -1) {
            this.cartItems.splice(cartItemIndex, 1);
        }

        this.refresh();
    }

    private save = () => {
        if (isPlatformBrowser(this.platformId)) {
            var shoppingCart = {
                cartItems: this.cartItems
            };

            sessionStorage.setItem(ShoppingCart.SHOPPING_CART_KEY, JSON.stringify(shoppingCart));
        }
    }

    clear = () => {
        this.total = 0;
        this.totalMenuItems = 0;
        this.minOrderCartItems = new Array<CartItem>();
        this.cartItems = new Array<CartItem>();

        this.refresh();
    }
}