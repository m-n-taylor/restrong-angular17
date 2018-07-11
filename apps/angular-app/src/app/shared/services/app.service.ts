/**
 * AppService
 */
import { RequestMethod } from '@angular/http';
import { Injectable } from '@angular/core';

// Shared Helpers
import { Constants } from '../constants';
import { Util } from '../util';

// Shared Models
import { APIRequest } from '../models/api-request';
import { APIRequestData } from '../models/api-request-data';
import { UserAPIRequestData } from '../models/user-api-request-data';
import { OrderAPIRequestData } from '../models/order-api-request-data';
import { TaxRateAPIRequestData } from '../models/tax-rate-api-request-data';
import { RegisterAPIRequestData } from '../models/register-api-request-data';
import { OrderItemAPIRequestData } from '../models/order-item-api-request-data';
import { SearchMenuAPIRequestData } from '../models/search-menu-api-request-data';
import { UserPaymentAPIRequestData } from '../models/user-payment-api-request-data';
import { UserAddressAPIRequestData } from '../models/user-address-api-request-data';
import { ResetPasswordAPIRequestData } from '../models/reset-password-api-request-data';
import { RateOrderItemAPIRequestData } from '../models/rate-order-item-api-request-data';
import { ChangePasswordAPIRequestData } from '../models/change-password-api-request-data';
import { ForgotPasswordAPIRequestData } from '../models/forgot-password-api-request-data';

// CR Shared Models
import { LoginAPIRequestData } from '../../consumer/shared/models/login-api-request-data';

// Shared Services
import { HttpClient } from './http.client';
import { UserService } from '../../consumer/shared/services/user.service';
import { SoldOutActionAPIRequestData } from "../models/soldout-action-api-request-data";

@Injectable()
export class AppService {
    static get parameters() {
        return [Constants, HttpClient, UserService];
    }
    constructor(public constants: Constants, private httpClient: HttpClient, public userService: UserService) {
    }

    sendRequest = (request: APIRequest, cache?: boolean) => {
        request.url = `${this.constants.API_URL}${request.url}?key=${this.constants.API_KEY}&pcpk=${this.constants.PUBLIC_KEY}`;

        return this.httpClient.sendRequest(request, cache);
    }

    /**
     * Get Security Question
     */
    getSecurityQuestion = (requestData: APIRequestData) => {
        var request = new APIRequest();
        request.url = `/b/sq.aspx`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.sendRequest(request);
    }

    /**
     * Register user
     */
    register = (requestData: RegisterAPIRequestData) => {
        var request = new APIRequest();
        request.url = `/b/a.aspx`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.sendRequest(request);
    }

    /**
     * Login the user
     */
    login = (requestData: LoginAPIRequestData) => {
        var request = new APIRequest();
        request.url = `/b/l.aspx`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.sendRequest(request);
    }

    /**
     * Verify Phone
     */
    verifyPhone = (requestData: APIRequestData) => {
        var request = new APIRequest();
        request.url = `/b/vp.aspx`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.sendRequest(request);
    }

    /**
     * Verify Email
     */
    verifyEmail = (requestData: APIRequestData) => {
        var request = new APIRequest();
        request.url = `/b/v.aspx`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.sendRequest(request, true);
    }

    /**
     * Change Password
     */
    changePassword = (requestData: ChangePasswordAPIRequestData) => {
        var request = new APIRequest();
        request.url = `/b/b.aspx`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.sendRequest(request);
    }

    /**
     * Forgot Password
     */
    forgotPassword = (requestData: ForgotPasswordAPIRequestData) => {
        var request = new APIRequest();
        request.url = `/b/fp.aspx`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.sendRequest(request);
    }

    /**
     * Reset Password
     */
    resetPassword = (requestData: ResetPasswordAPIRequestData) => {
        var request = new APIRequest();
        request.url = `/b/z.aspx`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.sendRequest(request);
    }

    /**
     * Gets all the addresses of login user
     */
    getUserAddresses = (requestData: UserAPIRequestData) => {
        UserAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

        var request = new APIRequest();
        request.url = `/b/h.aspx`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.sendRequest(request);
    }

    /**
     * Add address of login user
     */
    _addUserAddress = (requestData: UserAddressAPIRequestData) => {
        UserAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

        var request = new APIRequest();
        request.url = `/b/i.aspx`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.sendRequest(request);
    }

    /**
     * Update address of login user
     */
    _updateUserAddress = (requestData: UserAddressAPIRequestData) => {
        UserAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

        var request = new APIRequest();
        request.url = `/b/k.aspx`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.sendRequest(request);
    }

    /**
     * Save address of login user
     */
    saveUserAddress = (data) => {
        var userAddress = data.userAddress;

        var requestData = new UserAddressAPIRequestData();

        UserAddressAPIRequestData.fillUserAddress(requestData, userAddress);

        if (Util.isNewObject(userAddress)) {
            var request = this._addUserAddress(requestData);
        }
        else {
            var request = this._updateUserAddress(requestData);
        }

        return request;
    }

    /**
     * Set default user address
     */
    setDefaultUserAddress = (requestData: UserAddressAPIRequestData) => {
        UserAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

        var request = new APIRequest();
        request.url = `/b/m.aspx`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.sendRequest(request);
    }

    /**
     * Delete address of login user
     */
    deleteUserAddress = (requestData: UserAddressAPIRequestData) => {
        UserAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

        var request = new APIRequest();
        request.url = `/b/j.aspx`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.sendRequest(request);
    }

    /**
     * Gets all the payments method of login user
     */
    getUserPayments = (requestData: UserAPIRequestData) => {
        UserAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

        var request = new APIRequest();
        request.url = `/b/e.aspx`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.sendRequest(request);
    }

    /**
     * Save the payment method of login user
     */
    _addUserPayment = (requestData: UserPaymentAPIRequestData) => {
        UserPaymentAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

        var request = new APIRequest();
        request.url = `/b/o.aspx`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.sendRequest(request);
    }

    /**
     * Update the payment method of login user
     */
    _updateUserPayment = (requestData: UserPaymentAPIRequestData) => {
        UserPaymentAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

        var request = new APIRequest();
        request.url = `/b/ubi.aspx`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.sendRequest(request);
    }

    /**
     * Save payment of login user
     */
    saveUserPayment = (data) => {
        var userPayment = data.userPayment;

        var requestData = new UserPaymentAPIRequestData();

        if (Util.isNewObject(userPayment)) {
            UserPaymentAPIRequestData.fillUserPaymentForCreate(requestData, userPayment);

            var request = this._addUserPayment(requestData);
        }
        else {
            UserPaymentAPIRequestData.fillUserPaymentForUpdate(requestData, userPayment);

            var request = this._updateUserPayment(requestData);
        }

        return request;
    }

    /**
     * Delete the payment method of login user
     */
    deleteUserPayment = (requestData: UserPaymentAPIRequestData) => {
        UserPaymentAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

        var request = new APIRequest();
        request.url = `/b/p.aspx`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.sendRequest(request);
    }

    /**
     * Set default user payment
     */
    setDefaultUserPayment = (requestData: UserPaymentAPIRequestData) => {
        UserPaymentAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

        var request = new APIRequest();
        request.url = `/b/q.aspx`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.sendRequest(request);
    }

    /**
     * Update Sold Out Action
     */
    updateSoldOutAction = (requestData: SoldOutActionAPIRequestData) => {
        UserAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

        var request = new APIRequest();
        request.url = `/b/ucs.aspx`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.sendRequest(request, false);
    }

    /**
     * Get Tax Rate
     */
    getTaxRate = (requestData: TaxRateAPIRequestData) => {
        var request = new APIRequest();
        request.url = `/b/gtr.aspx`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.sendRequest(request, true);
    }

    /**
     * Get Service Fee
     */
    getServiceFee = () => {
        var request = new APIRequest();
        request.url = `/b/sfr.aspx`;

        request.data = <any>{};

        request.method = RequestMethod.Get;

        return this.sendRequest(request, true);
    }

    /**
     * Get Service Fee
     */
    getAppSettings = (requestData: APIRequestData) => {
        var request = new APIRequest();
        request.url = `/b/ggs.aspx`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.sendRequest(request, true);
    }

    /**
     * Get User Past orders
     */
    getPastOrders = (requestData: UserAPIRequestData) => {
        var request = new APIRequest();
        request.url = `/b/w.aspx`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.sendRequest(request);
    }

    /**
     * Get Past order details
     */
    getPastOrderDetails = (requestData: UserAPIRequestData) => {
        var request = new APIRequest();
        request.url = `/b/go.aspx`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.sendRequest(request);
    }

    /**
     * Get Past order items details
     */
    getPastOrderItemsDetails = (requestData: UserAPIRequestData) => {
        var request = new APIRequest();
        request.url = `/b/x.aspx`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.sendRequest(request);
    }

    /**
     * Place order
     */
    placeOrder = (requestData: OrderAPIRequestData, body) => {
        var request = new APIRequest();
        request.url = `/b/r.aspx`;

        request.data = requestData;

        request.method = RequestMethod.Post;

        request.body = body;

        return this.sendRequest(request);
    }

    /**
     * Pay order
     */
    payOrder = (requestData: OrderAPIRequestData) => {
        var request = new APIRequest();
        request.url = `/b/pn.aspx`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.sendRequest(request);
    }

    /**
     * Place order item
     */
    placeOrderItem = (requestData: OrderItemAPIRequestData) => {
        var request = new APIRequest();
        request.url = `/b/n.aspx`;

        // TODO: Adding `o` (options items) in the body of the POST
        request.body = {
            o: requestData.o
        }

        delete requestData.o; // delete the `o` (options items) so it should not be passed in url

        request.data = requestData;

        request.method = RequestMethod.Post;

        return this.sendRequest(request);
    }

    /**
     * Rate order item
     */
    rateOrderItem = (requestData: RateOrderItemAPIRequestData) => {
        var request = new APIRequest();
        request.url = `/b/acf.aspx`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.sendRequest(request);
    }

    /**
     * Upload Review Image
     */
    uploadReviewImage = (requestData: RateOrderItemAPIRequestData, formData: FormData) => {
        var request = new APIRequest();
        request.url = '/b/cfu_mi.aspx';

        request.data = requestData;
        request.body = formData;

        request.method = RequestMethod.Post;

        return this.sendRequest(request);
    }

    /**
     * Delete Review Image
     */
    deleteReviewImage = (requestData: RateOrderItemAPIRequestData) => {
        var request = new APIRequest();
        request.url = '/b/cfu_mi_r.aspx';

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.sendRequest(request);
    }

    /**
     * Coupons
     */
    getVisibleCoupons = (requestData: APIRequestData) => {
        var request = new APIRequest();
        request.url = `/b/gcl.aspx`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.sendRequest(request);
    }

    validateCouponCode = (requestData: APIRequestData) => {
        var request = new APIRequest();
        request.url = `/b/vcc.aspx`;

        request.data = requestData;

        request.method = RequestMethod.Post;

        return this.sendRequest(request);
    }

    /**
     * Searches Menus
     */
    private searchMenus = (requestData: SearchMenuAPIRequestData) => {
        var request = new APIRequest();
        request.url = `/search_menus.aspx`;

        // Update the value to appropriate ID for API 
        if (typeof this.constants.SERVICE_TYPE_ID[requestData.menuType] !== 'undefined') {
            requestData.menuType = this.constants.SERVICE_TYPE_ID[requestData.menuType];
        }

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.sendRequest(request, true);
    }

    // Searches all the dishes
    searchDish = (requestData: SearchMenuAPIRequestData) => {
        requestData.qtype = 'dish';

        return this.searchMenus(requestData);
    }


    // Searches all the cuisines
    searchCuisine = (requestData: SearchMenuAPIRequestData) => {
        requestData.qtype = 'cuisine';

        return this.searchMenus(requestData);
    }

    // Searches all the restaurants
    searchRestaurant = (requestData: SearchMenuAPIRequestData) => {
        requestData.qtype = 'menu';

        return this.searchMenus(requestData);
    }

    // Searches all the menu items
    searchMenuItems = (requestData: SearchMenuAPIRequestData) => {
        requestData.qtype = 'menuitems';

        return this.searchMenus(requestData);
    }

    // Searches all the masterheading / heading
    searchMasterHeadings = (requestData: SearchMenuAPIRequestData) => {
        requestData.qtype = 'masterheading';

        return this.searchMenus(requestData);
    }

    searchHeadings = (requestData: SearchMenuAPIRequestData) => {
        requestData.qtype = 'heading';

        return this.searchMenus(requestData);
    }

    // Get all the menu item sizes
    getMenuItemSizes = (requestData: SearchMenuAPIRequestData) => {
        requestData.qtype = 'menuoptionsize';
        requestData.option = 0;

        return this.searchMenus(requestData);
    }

    // Get all the menu item options
    getMenuItemOptions = (requestData: SearchMenuAPIRequestData) => {
        requestData.qtype = 'menuoptions';
        requestData.option = 0;

        return this.searchMenus(requestData);
    }

    // Get all the menu item types
    getDishTypes = (requestData: SearchMenuAPIRequestData) => {
        requestData.qtype = 'menuname';

        return this.searchMenus(requestData);
    }

    // Get autosuggest search list
    getAutoSuggestList = (requestData: SearchMenuAPIRequestData) => {
        requestData.qtype = 'autosuggest';

        return this.searchMenus(requestData);
    }

    // Get keywords type
    getKeywordsType = (requestData: SearchMenuAPIRequestData) => {
        requestData.qtype = 'wordfilter';

        return this.searchMenus(requestData);
    }

    /**
     * Get Delivery Fee
     */
    getDeliveryFee = (requestData: SearchMenuAPIRequestData) => {
        requestData.qtype = 'deliveryfee';

        return this.searchMenus(requestData);
    }

    /**
     * Get Available Service Types
     */
    getAvailableServiceTypes = (requestData: SearchMenuAPIRequestData) => {
        requestData.qtype = 'servicetype';

        return this.searchMenus(requestData);
    }

    /**
     * Get Cities
     */
    getCities = (requestData: any) => {
        requestData.qtype = 'city';

        var request = new APIRequest();
        request.url = `/b/seo.aspx`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.sendRequest(request, true);
    }
}