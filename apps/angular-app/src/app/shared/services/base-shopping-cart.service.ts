import { PLATFORM_ID, Inject, Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { Util } from '../util';
import { Constants } from '../constants';

import { MenuItem } from '../models/menu-item';
import { CartItem } from '../models/cart-item';
import { BaseSharedDataService } from "./base-shared-data.service";
import { CouponError, Coupon } from "../../rest-owner/shared/models/coupon";
import { CartCoupon } from "../models/cart-coupon";
import { EventsService } from "./events.service";
import { SearchMenuAPIRequestData } from '../models/search-menu-api-request-data';
import { UserAddress } from '../models/user-address';
import { TaxRateAPIRequestData } from '../models/tax-rate-api-request-data';
import { AppService } from './app.service';

declare var moment;

interface BaseShoppingCartConfig {
    key: string;
}

interface ICartMenuItem {
    totalPrice: number;
    quantity: number;
    selectedMenuItemSize: any;
    Price: number;
    menuItemOptions: any;
}

/**
 * ShoppingCart
 */
export abstract class BaseShoppingCart {
    LOG_TAG = 'BaseShoppingCart';

    public busy = false;
    public driverTip = 0;
    public subTotal = 0;
    public total = 0;
    public ETAMin = 0;
    public ETAMax = 0;
    public totalMenuItems = 0;
    public minOrderCartItems = new Array<CartItem>();
    public cartItems = new Array<CartItem>();

    constructor(private platformId: Object, private sharedData: BaseSharedDataService, private constants: Constants, private config: BaseShoppingCartConfig, private eventsService: EventsService, private appService: AppService) {
        if (config.key && isPlatformBrowser(this.platformId)) {
            if (Constants.DEBUG) {
                window['shoppingCart'] = this;
            }

            var shoppingCartStr = sessionStorage.getItem(config.key);

            if (typeof shoppingCartStr !== 'undefined' && shoppingCartStr) {
                var shoppingCart = <BaseShoppingCart>JSON.parse(shoppingCartStr);

                this.cartItems = shoppingCart.cartItems;

                this.refresh(true);
            }
        }

        Util.log('ShoppingCart Init()');
    }

    public static calculateMenuItemTotalPrice = (menuItem: ICartMenuItem) => {
        menuItem.totalPrice = 0;

        if (typeof menuItem.selectedMenuItemSize !== 'undefined' && menuItem.selectedMenuItemSize) {
            menuItem.totalPrice = menuItem.quantity * menuItem.selectedMenuItemSize.Price;
        }
        else {
            menuItem.totalPrice = menuItem.quantity * menuItem.Price;
        }

        // checks if item has options, then apply there prices
        if (typeof menuItem.menuItemOptions !== 'undefined' && menuItem.menuItemOptions) {
            for (var menuItemOptionIndex in menuItem.menuItemOptions) {
                var menuItemOption = menuItem.menuItemOptions[menuItemOptionIndex];

                // For single select items
                if (menuItemOption.Is_Single_Select) {
                    if (typeof menuItemOption.selectedOptionItem !== 'undefined' && menuItemOption.selectedOptionItem) {
                        menuItem.totalPrice += menuItem.quantity * menuItemOption.selectedOptionItem.Price;
                    }
                }
                else {
                    // For multi select items
                    for (var menuItemOptionItemIndex in menuItemOption.OptionItems) {
                        var menuItemOptionItem = menuItemOption.OptionItems[menuItemOptionItemIndex];

                        if (menuItemOptionItem.isSelected) {
                            menuItem.totalPrice += menuItem.quantity * menuItemOptionItem.Price;
                        }
                    }
                }
            }
        }
        return Util.round(menuItem.totalPrice);
    }

    public refresh = (ignoreSave?) => {
        this.driverTip = 0;
        this.subTotal = 0;
        this.total = 0;
        this.ETAMin = 0;
        this.ETAMax = 0;
        this.totalMenuItems = 0;
        this.minOrderCartItems = new Array<CartItem>();

        for (var cartItemIndex in this.cartItems) {
            var cartItem = this.cartItems[cartItemIndex];

            // Reset all the calculations
            cartItem.delivery = 0;
            cartItem.serviceFee = 0;
            cartItem.driverTip = 0;
            cartItem.tax = 0;
            cartItem.couponDiscount = 0;
            cartItem.subTotal = 0;
            cartItem.total = 0;

            // Calculating subTotal and totalMenuItems
            for (var menuItemIndex in cartItem.menuItems) {
                var menuItem = cartItem.menuItems[menuItemIndex];

                // Calculates the price of a menu item based on menu option items, qty etc
                cartItem.subTotal += BaseShoppingCart.calculateMenuItemTotalPrice(menuItem);

                this.totalMenuItems += menuItem.quantity;
            }

            /**
             * Coupon Discount
             */
            if (Util.isDefined(cartItem.appliedCoupons) && cartItem.appliedCoupons.length > 0) {
                for (var i in cartItem.appliedCoupons) {
                    var coupon = cartItem.appliedCoupons[i];

                    Util.log('coupon', coupon);

                    this.validateCouponByCartItem(cartItem, coupon);

                    if (!coupon.errors || !coupon.errors.length) {

                        // Calculating Item Based Discount
                        if (coupon.CouponType == this.constants.COUPON_TYPE_ITEM_BASED) {
                            var couponMenuItems = coupon.MenuItems;

                            for (var i in cartItem.menuItems) {
                                var cartMenuItem = cartItem.menuItems[i];

                                var index = couponMenuItems.indexOf(cartMenuItem.MenuItemName);

                                if (index > -1) {

                                    // Discount Type Percent
                                    if (coupon.DiscountType == this.constants.DISCOUNT_TYPE_PERCENT) {

                                        // Discount Criteria Full
                                        if (coupon.DiscountCriteria == this.constants.DISCOUNT_CRITERIA_FULL) {
                                            cartItem.couponDiscount += cartMenuItem.quantity * cartMenuItem.Price * (coupon.DiscountValue / 100);
                                        }
                                    }
                                }
                            }
                        }

                        // Calculating Order Based Discount
                        else if (coupon.CouponType == this.constants.COUPON_TYPE_ORDER_BASED) {

                            // Discount Type Percent
                            if (coupon.DiscountType == this.constants.DISCOUNT_TYPE_PERCENT) {

                                // Discount Criteria Full
                                if (coupon.DiscountCriteria == this.constants.DISCOUNT_CRITERIA_FULL) {
                                    var subTotal = cartItem.subTotal;

                                    if (coupon.MaxOrder > 0 && subTotal > coupon.MaxOrder) {
                                        subTotal = coupon.MaxOrder;
                                    }

                                    cartItem.couponDiscount += subTotal * (coupon.DiscountValue / 100);
                                }

                                // Discount Criteria Incremental
                                if (coupon.DiscountCriteria == this.constants.DISCOUNT_CRITERIA_INCREMENTAL) {
                                    var totalDiscountsCount = 1;

                                    if (coupon.MinOrder > 0) {
                                        var subTotal = cartItem.subTotal;

                                        if (coupon.MaxOrder > 0 && subTotal > coupon.MaxOrder) {
                                            subTotal = coupon.MaxOrder;
                                        }

                                        totalDiscountsCount = Math.floor(subTotal / coupon.MinOrder);
                                    }

                                    cartItem.couponDiscount += totalDiscountsCount * (coupon.MinOrder * (coupon.DiscountValue / 100));
                                }
                            }

                            // Discount Type Amount
                            else if (coupon.DiscountType == this.constants.DISCOUNT_TYPE_AMOUNT) {

                                // Discount Criteria Full
                                if (coupon.DiscountCriteria == this.constants.DISCOUNT_CRITERIA_FULL) {
                                    cartItem.couponDiscount += coupon.DiscountValue;
                                }

                                // Discount Criteria Incremental
                                if (coupon.DiscountCriteria == this.constants.DISCOUNT_CRITERIA_INCREMENTAL) {
                                    var totalDiscountsCount = 1;

                                    if (coupon.MinOrder > 0) {
                                        var subTotal = cartItem.subTotal;

                                        if (coupon.MaxOrder > 0 && subTotal > coupon.MaxOrder) {
                                            subTotal = coupon.MaxOrder;
                                        }

                                        totalDiscountsCount = Math.floor(subTotal / coupon.MinOrder);
                                    }

                                    cartItem.couponDiscount += (totalDiscountsCount * coupon.DiscountValue);
                                }
                            }
                        }
                    }
                }
            }

            // Adjust `CouponDiscount` if it increase `SubTotal`
            if (cartItem.couponDiscount > cartItem.subTotal) {
                cartItem.couponDiscount = cartItem.subTotal;
            }

            // Remove `couponDiscount` from `subTotal`
            cartItem.subTotal -= cartItem.couponDiscount;

            // Calculating `delivery`
            if (this.sharedData.serviceType == this.constants.SERVICE_TYPE_DELIVERY || this.sharedData.serviceType == this.constants.SERVICE_TYPE_CATERING) {
                cartItem.delivery = cartItem.DeliveryFlat;
            } else {
                cartItem.delivery = 0;
            }

            // Calculating `tax`
            if (cartItem.DeliveryModeID == this.constants.DELIVERY_MODE_SCHLEP_FETCH || cartItem.DeliveryModeID == this.constants.DELIVERY_MODE_MENUS) {
                cartItem.tax = Util.round(cartItem.subTotal * cartItem.taxPercent);
            } else {
                cartItem.tax = Util.round((cartItem.subTotal + cartItem.delivery) * cartItem.taxPercent);
            }

            // Calculating `driver tip`
            if (this.sharedData.serviceType == this.constants.SERVICE_TYPE_DELIVERY || this.sharedData.serviceType == this.constants.SERVICE_TYPE_CATERING) {
                cartItem.driverTip = Util.round(cartItem.subTotal * (this.sharedData.driverTipPercent / 100));
            } else {
                cartItem.driverTip = 0;
            }

            // Calculating `total`
            cartItem.total = Util.round(cartItem.subTotal + cartItem.tax + cartItem.delivery + cartItem.driverTip);

            // Calculating `service fee`
            if (cartItem.menusServiceFee) {
                cartItem.serviceFee = Util.round(cartItem.total * cartItem.menusServiceFee);
            } else {
                cartItem.serviceFee = 0;
            }

            // Adding service fee in `total`
            cartItem.total = Util.round(cartItem.serviceFee + cartItem.total);

            // Calculating driver tip
            this.driverTip += Util.round(cartItem.driverTip);

            // Calculating Grand subTotal
            this.subTotal = Util.round(cartItem.subTotal);

            // Calculating Grand total
            this.total = Util.round(this.total + cartItem.total);

            // Add `cart item` to min order list if min order not reached
            if (cartItem.MinOrder > (cartItem.subTotal + cartItem.couponDiscount)) {
                cartItem.requireMinOrder = true;
                this.minOrderCartItems.push(cartItem);
            }
            else {
                cartItem.requireMinOrder = false;
            }

            // Calculating `ETA`
            if (cartItem.ETAMax > this.ETAMax) {
                this.ETAMin = cartItem.ETAMin;
                this.ETAMax = cartItem.ETAMax;
            }
        }

        if (!ignoreSave) this.save();

        this.eventsService.onShoppingCartChanged.emit({});
    }

    validateCouponByCartItem = (cartItem: CartItem, coupon: CartCoupon) => {
        Util.log('validateCouponByCartItem', cartItem, coupon);

        var serviceType = this.constants.SERVICE_TYPE_ID[this.sharedData.serviceType];

        // Date
        var currentDate = moment().format('YYYY-MM-DD');
        var startDate = null;
        var endDate = null;

        if (coupon.DurationType == this.constants.DURATION_TYPE_DATE) {
            if (coupon.StartDate) {
                startDate = moment(coupon.StartDate).format('YYYY-MM-DD');
            }

            if (coupon.EndDate) {
                endDate = moment(coupon.EndDate).format('YYYY-MM-DD');
            }
        }

        // Time
        var currentTime = moment().format('HH:mm:ss');
        var startTime = null;
        var endTime = null;
        var validTime = true;

        if (coupon.DurationType == this.constants.DURATION_TYPE_DATE) {
            if (coupon.DailyStartTime) {
                startTime = coupon.DailyStartTime;
            }

            if (coupon.DailyEndTime) {
                endTime = coupon.DailyEndTime;
            }

            if (startTime && endTime) {
                validTime = false;

                // Ignore if both times are equal to EMPTY_TIME (00:00:00)
                if (startTime == this.constants.EMPTY_TIME && endTime == this.constants.EMPTY_TIME) {
                    validTime = true;
                } else {
                    if (currentTime >= startTime) {
                        if (currentTime <= endTime) {
                            validTime = true;
                        } else if (currentTime > endTime && endTime < startTime) {
                            validTime = true;
                        }
                    }
                }
            }
        }

        var errors = new Array<CouponError>();

        // Invalid Coupon
        if (coupon.invalid) {
            errors.push({
                message: "Coupon is not valid."
            });
        }
        // Max Customer Limit
        // else if (coupon.CustomerRedeemCount && coupon.MaxRedeemPerCustomer > 0 && coupon.CustomerRedeemCount >= coupon.MaxRedeemPerCustomer) {
        //     errors.push({
        //         message: "You can't use this coupon. Max usage limit reached."
        //     });
        // }
        // Date Limit
        else if (startDate && endDate && (currentDate < startDate || currentDate > endDate)) {
            errors.push({
                message: "Coupon is expired."
            });
        }
        // Time Limit
        else if (!validTime) {
            errors.push({
                message: 'Coupon is valid between ' + startTime + ' and ' + endTime
            });
        }
        else {

            // Validate Subtotal
            if (coupon.MinOrder && cartItem.subTotal < coupon.MinOrder) {
                errors.push({
                    message: 'Coupon is only applicable with Min Subtotal of $' + coupon.MinOrder + '.'
                });
            }

            // Validate Service Types
            if (coupon.ServiceTypes.indexOf(serviceType) == -1) {
                if (coupon.ServiceTypes.length > 0) {
                    errors.push({
                        message: 'Coupon is only applicable with ' + coupon.ServiceTypes.map(c => this.constants.SERVICE_TYPE_TITLE[c]).join(', ') + ' service type(s).'
                    });
                }
                else {
                    errors.push({
                        message: 'Coupon is not applicable with service type ' + this.constants.SERVICE_TYPE_TITLE[this.sharedData.serviceType]
                    });
                }
            }

            // Validate Menu Items
            if (coupon.CouponType == this.constants.COUPON_TYPE_ITEM_BASED) {
                var itemFound = false;
                var couponMenuItems = coupon.MenuItems;

                for (var i in cartItem.menuItems) {
                    var cartMenuItem = cartItem.menuItems[i];

                    var index = couponMenuItems.indexOf(cartMenuItem.MenuItemName);

                    if (index > -1) {
                        itemFound = true;
                    }
                }

                if (!itemFound) {
                    errors.push({
                        message: 'Coupon is not applicable with current menu items in the cart'
                    });
                }
            }

            // Duplicate Order Based Coupon
            var duplicateOrderCouponExist = cartItem.appliedCoupons.filter((c) => {
                return c.CouponType == this.constants.COUPON_TYPE_ORDER_BASED && c.CouponID != coupon.CouponID;
            });

            // Validate Duplicate Order Based Coupon
            if (coupon.CouponType == this.constants.COUPON_TYPE_ORDER_BASED && duplicateOrderCouponExist.length > 0) {
                errors.push({
                    message: 'You can only add one order based coupon'
                });
            }

            // Other Applied Coupons
            var otherAppliedCoupons = cartItem.appliedCoupons.filter((c) => {
                return c.CouponID != coupon.CouponID;
            });

            if (!coupon.Is_AllowBundle && otherAppliedCoupons.length > 0) {
                errors.push({
                    message: "Coupon is not bundleable with other coupons."
                });
            }
        }

        coupon.errors = errors;

        return errors.length == 0;
    }

    addMenuItem = async (menuItem: MenuItem, customDeliveryFee: any) => {
        Util.log(this.LOG_TAG, 'addMenuItem', menuItem, menuItem.ZipCode);

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
            foundCartItem.FFID = menuItem.FFID;
            // foundCartItem.source = menuItem.Menus_SourceID
            foundCartItem.menusServiceFee = menuItem.PayMenusServiceFee ? menuItem.MenusServiceFee : null;
            foundCartItem.Address = menuItem.Address;
            foundCartItem.Availability = menuItem.Availability;
            foundCartItem.FileName = menuItem.FileName;
            foundCartItem.ETA = menuItem.ETA;
            foundCartItem.ETAMin = menuItem.ETAMin;
            foundCartItem.ETAMax = menuItem.ETAMax;
            foundCartItem.DeliveryModeID = menuItem.DeliveryModeID;
            foundCartItem.driverTipPercent = 10;

            // Gets tax rate according to restaurant zip code
            var requestData = new TaxRateAPIRequestData();
            requestData.z = menuItem.ZipCode;

            var taxRateResponse = await this.appService.getTaxRate(requestData).toPromise();

            if (Util.isDefined(taxRateResponse) && Util.isDefined(taxRateResponse[0])) {
                foundCartItem.taxPercent = taxRateResponse[0].Value;
            }

            // Delivery Fee
            if (Util.isDefined(customDeliveryFee)) {
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

        return foundCartItem;
    }

    removeMenuItem = (menuItem: MenuItem, cartItem: CartItem) => {
        var menuItemIndex = cartItem.menuItems.indexOf(menuItem);

        if (menuItemIndex > -1) {
            cartItem.menuItems.splice(menuItemIndex, 1);

            if (cartItem.menuItems.length == 0) {
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

    updateMenuItemQty = (item: ICartMenuItem, value: number) => {
        var status = null;

        var maxLimit = this.constants.CART_ITEM_MAX_LIMIT;

        if (item.quantity + value > maxLimit) {
            status = this.constants.CART_MENU_ITEM_QTY_MAX_LIMIT;
        } else if (item.quantity + value < 1) {
            status = this.constants.CART_MENU_ITEM_QTY_ZERO_LIMIT;
        } else {
            status = this.constants.CART_MENU_ITEM_QTY_UPDATED;
            item.quantity += value;
        }

        this.refresh();

        return status;
    }

    private save = () => {
        if (this.config.key && isPlatformBrowser(this.platformId)) {
            var shoppingCart = {
                cartItems: this.cartItems
            };

            sessionStorage.setItem(this.config.key, JSON.stringify(shoppingCart));
        }
    }

    clear = () => {
        this.total = 0;
        this.totalMenuItems = 0;
        // this.minOrderCartItems = new Array<CartItem>();
        this.cartItems = new Array<CartItem>();

        this.refresh();
    }

    createICartCouponByICoupon = (ICoupon: Coupon) => {
        var ICartCoupon: CartCoupon = {
            CouponID: ICoupon.ID,
            CouponType: ICoupon.CouponType,
            CouponCode: ICoupon.CouponCode,
            DurationType: ICoupon.DurationType,
            DiscountType: ICoupon.DiscountType,
            DiscountCriteria: ICoupon.DiscountCriteria,
            DiscountValue: ICoupon.DiscountValue,
            MinOrder: ICoupon.MinOrder,
            MaxOrder: ICoupon.MaxOrder,
            Is_AllowBundle: ICoupon.Is_AllowBundle,
            MenuItems: ICoupon.MenuItems,
            StartDate: ICoupon.StartDate,
            EndDate: ICoupon.EndDate,
            DailyStartTime: ICoupon.DailyStartTime,
            DailyEndTime: ICoupon.DailyEndTime,
            MaxRedeemPerCustomer: ICoupon.MaxRedeemPerCustomer,
            CustomerRedeemCount: null,
            ServiceTypes: [],
            invalid: ICoupon.invalid,
            errors: ICoupon.errors || [],
        };

        if (ICoupon.Delivery) {
            ICartCoupon.ServiceTypes.push(this.constants.SERVICE_TYPE_ID_DELIVERY);
        }
        if (ICoupon.Pickup) {
            ICartCoupon.ServiceTypes.push(this.constants.SERVICE_TYPE_ID_PICKUP);
        }
        if (ICoupon.Catering) {
            ICartCoupon.ServiceTypes.push(this.constants.SERVICE_TYPE_ID_CATERING);
        }
        if (ICoupon.DiningIn) {
            ICartCoupon.ServiceTypes.push(this.constants.SERVICE_TYPE_ID_DINEIN);
        }

        return ICartCoupon;
    }
}