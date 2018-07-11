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
import { LoginAPIRequestData } from '../models/login-api-request-data';
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

// Shared Services
import { HttpClient } from './http.client';
import { UserService } from './user.service';

@Injectable()
export class AppService {
    static get parameters() {
        return [Constants, HttpClient, UserService];
    }
    constructor(public constants: Constants, private httpClient: HttpClient, public userService: UserService) {
    }

    /**
     * Get Security Question
     */
    getSecurityQuestion = (requestData: APIRequestData) => {
        var request = new APIRequest();
        request.url = `${this.constants.API_URL}/b/sq.aspx?key=${this.constants.API_KEY}`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.httpClient.sendRequest(request, true);
    }

    /**
     * Register user
     */
    register = (requestData: RegisterAPIRequestData) => {
        var request = new APIRequest();
        request.url = `${this.constants.API_URL}/b/a.aspx?key=${this.constants.API_KEY}`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.httpClient.sendRequest(request, true);
    }

    /**
     * Login the user
     */
    login = (requestData: LoginAPIRequestData) => {
        var request = new APIRequest();
        request.url = `${this.constants.API_URL}/b/l.aspx?key=${this.constants.API_KEY}`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.httpClient.sendRequest(request, true);
    }

    /**
     * Change Password
     */
    changePassword = (requestData: ChangePasswordAPIRequestData) => {
        var request = new APIRequest();
        request.url = `${this.constants.API_URL}/b/b.aspx?key=${this.constants.API_KEY}`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.httpClient.sendRequest(request, true);
    }

    /**
     * Forgot Password
     */
    forgotPassword = (requestData: ForgotPasswordAPIRequestData) => {
        var request = new APIRequest();
        request.url = `${this.constants.API_URL}/b/fp.aspx?key=${this.constants.API_KEY}`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.httpClient.sendRequest(request, true);
    }


    /**
     * Reset Password
     */
    resetPassword = (requestData: ResetPasswordAPIRequestData) => {
        var request = new APIRequest();
        request.url = `${this.constants.API_URL}/b/z.aspx?key=${this.constants.API_KEY}`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.httpClient.sendRequest(request, true);
    }

    /**
     * Gets all the addresses of login user
     */
    getUserAddresses = (requestData: UserAPIRequestData) => {
        UserAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

        var request = new APIRequest();
        request.url = `${this.constants.API_URL}/b/h.aspx?key=${this.constants.API_KEY}`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.httpClient.sendRequest(request, true);
    }

    /**
     * Save address of login user
     */
    saveUserAddress = (requestData: UserAddressAPIRequestData) => {
        UserAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

        var request = new APIRequest();
        request.url = `${this.constants.API_URL}/b/i.aspx?key=${this.constants.API_KEY}`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.httpClient.sendRequest(request, true);
    }

    /**
     * Update address of login user
     */
    updateUserAddress = (requestData: UserAddressAPIRequestData) => {
        UserAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

        var request = new APIRequest();
        request.url = `${this.constants.API_URL}/b/k.aspx?key=${this.constants.API_KEY}`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.httpClient.sendRequest(request, true);
    }

    /**
     * Delete address of login user
     */
    deleteUserAddress = (requestData: UserAddressAPIRequestData) => {
        UserAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

        var request = new APIRequest();
        request.url = `${this.constants.API_URL}/b/j.aspx?key=${this.constants.API_KEY}`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.httpClient.sendRequest(request, true);
    }

    /**
     * Gets all the payments method of login user
     */
    getUserPayments = (requestData: UserAPIRequestData) => {
        UserAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

        var request = new APIRequest();
        request.url = `${this.constants.API_URL}/b/e.aspx?key=${this.constants.API_KEY}`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.httpClient.sendRequest(request, true);
    }

    /**
     * Save the payment method of login user
     */
    saveUserPayment = (requestData: UserPaymentAPIRequestData) => {
        UserPaymentAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

        var request = new APIRequest();
        request.url = `${this.constants.API_URL}/b/o.aspx?key=${this.constants.API_KEY}`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.httpClient.sendRequest(request, true);
    }

    /**
     * Update the payment method of login user
     */
    updateUserPayment = (requestData: UserPaymentAPIRequestData) => {
        UserPaymentAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

        var request = new APIRequest();
        request.url = `${this.constants.API_URL}/b/ubi.aspx?key=${this.constants.API_KEY}`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.httpClient.sendRequest(request, true);
    }

    /**
     * Delete the payment method of login user
     */
    deleteUserPayment = (requestData: UserPaymentAPIRequestData) => {
        UserPaymentAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

        var request = new APIRequest();
        request.url = `${this.constants.API_URL}/b/p.aspx?key=${this.constants.API_KEY}`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.httpClient.sendRequest(request, true);
    }

    /**
     * Get Tax Rate
     */
    getTaxRate = (requestData: TaxRateAPIRequestData) => {
        var request = new APIRequest();
        request.url = `${this.constants.API_URL}/b/gtr.aspx?key=${this.constants.API_KEY}`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.httpClient.sendRequest(request);
    }

    /**
     * Get Service Fee
     */
    getServiceFee = () => {
        var request = new APIRequest();
        request.url = `${this.constants.API_URL}/b/sfr.aspx?key=${this.constants.API_KEY}`;

        request.data = {};

        request.method = RequestMethod.Get;

        return this.httpClient.sendRequest(request);
    }

    /**
     * Get User Past orders
     */
    getPastOrders = (requestData: UserAPIRequestData) => {
        var request = new APIRequest();
        request.url = `${this.constants.API_URL}/b/w.aspx?key=${this.constants.API_KEY}`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.httpClient.sendRequest(request, true);
    }

    /**
     * Get Past order details
     */
    getPastOrderDetails = (requestData: UserAPIRequestData) => {
        var request = new APIRequest();
        request.url = `${this.constants.API_URL}/b/go.aspx?key=${this.constants.API_KEY}`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.httpClient.sendRequest(request, true);
    }

    /**
     * Get Past order items details
     */
    getPastOrderItemsDetails = (requestData: UserAPIRequestData) => {
        var request = new APIRequest();
        request.url = `${this.constants.API_URL}/b/x.aspx?key=${this.constants.API_KEY}`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.httpClient.sendRequest(request, true);
    }

    /**
     * Place order
     */
    placeOrder = (requestData: OrderAPIRequestData) => {
        var request = new APIRequest();
        request.url = `${this.constants.API_URL}/b/r.aspx?key=${this.constants.API_KEY}`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.httpClient.sendRequest(request, true);
    }

    /**
     * Pay order
     */
    payOrder = (requestData: OrderAPIRequestData) => {
        var request = new APIRequest();
        request.url = `${this.constants.API_URL}/b/pn.aspx?key=${this.constants.API_KEY}`;

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.httpClient.sendRequest(request, true);
    }

    /**
     * Place order item
     */
    placeOrderItem = (requestData: OrderItemAPIRequestData) => {
        var request = new APIRequest();
        request.url = `${this.constants.API_URL}/b/n.aspx?key=${this.constants.API_KEY}`;

        // TODO: Adding `o` (options items) in the body of the POST
        request.body = {
            o: requestData.o
        }

        delete requestData.o; // delete the `o` (options items) so it should not be passed in url

        request.data = requestData;

        request.method = RequestMethod.Post;

        return this.httpClient.sendRequest(request, true);
    }

    /**
     * Rate order item
     */
    rateOrderItem = (requestData: RateOrderItemAPIRequestData) => {
        var request = new APIRequest();
        request.url = `${this.constants.API_URL}/b/acf.aspx?key=${this.constants.API_KEY}`;
        
        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.httpClient.sendRequest(request, true);
    }

    /**
     * Searches Menus
     */
    private searchMenus = (requestData: SearchMenuAPIRequestData) => {
        var request = new APIRequest();
        request.url = `${this.constants.API_URL}/search_menus.aspx?key=${this.constants.API_KEY}`;

        // Update the value to appropriate ID for API 
        requestData.menuType = this.constants.SERVICE_TYPE_ID[requestData.menuType];

        request.data = requestData;

        request.method = RequestMethod.Get;

        return this.httpClient.sendRequest(request);
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
    searchHeadings = (requestData: SearchMenuAPIRequestData) => {
        requestData.qtype = requestData.mhid ? 'heading' : 'masterheading';

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
}