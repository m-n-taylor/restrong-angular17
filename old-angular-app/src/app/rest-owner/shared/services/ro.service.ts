/**
 * AppService
 */
import { RequestMethod } from '@angular/http';
import { Injectable } from '@angular/core';

// Shared Helpers
import { Constants } from '../../../shared/constants';
import { Util } from '../../../shared/util';

// Shared Models
import { APIRequest } from '../../../shared/models/api-request';
import { APIRequestData } from '../../../shared/models/api-request-data';
import { ROAPIRequestData } from '../models/ro-api-request-data';
import { User } from '../models/user';
import { Head } from '../models/head';
import { HeadAPIRequestData } from '../models/head-api-request-data';
import { Coupon } from '../models/coupon';
import { CouponAPIRequestData } from '../models/coupon-api-request-data';
import { MasterHead } from '../models/master-head';
import { MasterHeadAPIRequestData } from '../models/masterhead-api-request-data';
import { DeliveryZone } from '../models/delivery-zone';
import { DeliveryZoneAPIRequestData } from '../models/delivery-zone-api-request-data';
import { MenuOptionItemAPIRequestData } from '../models/menu-option-item-api-request-data';

// RO Models
import { LoginAPIRequestData } from '../models/login-api-request-data';

// Shared Services
import { HttpClient } from '../../../shared/services/http.client';

// RO Services
import { UserService } from '../../shared/services/user.service';

class SendRequestOptions {
    apiURL: string;
    requestData?: ROAPIRequestData;
    cache?: boolean;
    ignoreLogin?: boolean;
    requestMethod?: RequestMethod;
    body?: any;
}


@Injectable()
export class ROService {

    private readonly API_GLOBAL = 'a/gbl';
    private readonly API_CUSTOMER = 'a/c';
    private readonly API_USER = 'a/u';
    private readonly API_REGISTRATION = 'a/reg';
    private readonly API_RESTAURANT = 'a/r';
    private readonly API_RESET = 'a/rs';
    private readonly API_REQUEST_DEMO = 'a/rd';
    private readonly API_MENUS = 'a/m';
    private readonly API_ORDERS = 'a/o';
    private readonly API_COUPONS = 'a/cc';
    private readonly API_PREVIEW = 'a/p';
    private readonly API_CHARTS = 'a/cg';
    private readonly API_FINANCIAL = 'a/f';
    private readonly API_SEO = 'b/seo';

    static get parameters() {
        return [Constants, HttpClient, UserService];
    }
    constructor(public constants: Constants, private httpClient: HttpClient, public userService: UserService) {

    }

    /**
     * Food Bytes
     */
    getFoodBytesList = (id?) => {
        var request = new APIRequest();

        request.url = 'https://apps.datassential.com/snap/api/FoodBytes?token=540eaaef-cf96-4664-be44-5934b5c8fdb1';

        if (id) {
            request.url += `&id=${id}`;
        }

        request.method = RequestMethod.Get;

        return this.httpClient.sendRequest(request, true);
    }


    /**
     * Send Request
     */
    private _sendRequest = (options: SendRequestOptions) => {
        var request = new APIRequest();

        request.url = `${this.constants.RO_API_URL}/${options.apiURL}.aspx?key=${this.constants.API_KEY}`;

        if (!options.ignoreLogin)
            ROAPIRequestData.fillLoginUser(options.requestData, this.userService.loginUser);

        if (Util.isDefined(options.requestData)) {
            request.data = options.requestData;
        }

        request.method = options.requestMethod || RequestMethod.Get;

        if (Util.isDefined(options.body)) request.body = options.body;

        return {
            promise: this.httpClient.sendRequest(request, options.cache),
            request: request
        }
    }

    /**
     * Global Settings
     */

    // Get Global Settings
    getGlobalSettings = () => {
        return this._sendRequest({
            apiURL: this.API_GLOBAL,
            ignoreLogin: true,
            cache: true
        });
    }

    /**
     * Customer
     */

    // Get Review List
    getReviewList = (requestData: any) => {
        requestData.qt = 'review';

        return this._sendRequest({
            apiURL: this.API_CUSTOMER,
            requestData: requestData
        });
    }

    /**
     * Reset
     */

    // Send Password Reset Code
    sendPasswordResetCode = (requestData: any) => {
        requestData.qt = 'forgot';

        return this._sendRequest({
            apiURL: this.API_RESET,
            requestData: requestData,

            ignoreLogin: true
        }).promise;
    }

    // Reset Password
    resetPassword = (requestData: any) => {
        requestData.qt = 'reset';

        return this._sendRequest({
            apiURL: this.API_RESET,
            requestData: requestData,

            ignoreLogin: true
        }).promise;
    }

    // Verify Email
    verifyEmail = (requestData: any) => {
        requestData.qt = 'verify_email';

        return this._sendRequest({
            apiURL: this.API_RESET,
            requestData: requestData,
            cache: true,
            ignoreLogin: true
        }).promise;
    }

    /**
     * Request DEMO
     */

    // Request DEMO
    requestDemo = (requestData: any) => {

        return this._sendRequest({
            apiURL: this.API_REQUEST_DEMO,
            requestData: requestData,
            ignoreLogin: true
        }).promise;
    }

    /**
     * User
     */

    // Login
    login = (requestData: any) => {
        requestData.qt = 'login';

        return this._sendRequest({
            apiURL: this.API_USER,
            requestData: requestData,

            ignoreLogin: true
        }).promise;
    }

    // Login
    loginWithAuthCode = (requestData: any) => {
        requestData.qt = 'auth_login';

        return this._sendRequest({
            apiURL: this.API_USER,
            requestData: requestData,

            ignoreLogin: true
        }).promise;
    }

    // Update Settings
    updateUserSettings = (requestData: ROAPIRequestData) => {
        requestData.qt = 'usersettings';

        var options = {
            apiURL: this.API_USER,
            requestData: requestData,
        };

        return this._sendRequest(options).promise;
    }

    // Change Password
    changePassword = (requestData: any, newOptions?) => {
        requestData.qt = 'pass';

        var options = {
            apiURL: this.API_USER,
            requestData: requestData,
            ignoreLogin: true
        };

        Util.merge(options, newOptions || {});

        return this._sendRequest(options).promise;
    }

    // Get User List
    getUserList = (requestData: any) => {
        requestData.qt = 'list';

        return this._sendRequest({
            apiURL: this.API_USER,
            requestData: requestData,

        }).promise;
    }

    // Add User
    private _addUser = (requestData: any) => {
        requestData.qt = 'addbyowner';

        return this._sendRequest({
            apiURL: this.API_USER,
            requestData: requestData,

        }).promise;
    }

    // Update User
    private _updateUser = (requestData: any) => {
        requestData.qt = 'update';

        return this._sendRequest({
            apiURL: this.API_USER,
            requestData: requestData,

        }).promise;
    }

    // Save User
    saveUser = (data) => {
        var user: User = data.user;

        var requestData = new ROAPIRequestData();

        ROAPIRequestData.fillUserForSaveUser(requestData, user);

        if (Util.isNewObject(user)) {
            var request = this._addUser(requestData);
        }
        else {
            var request = this._updateUser(requestData);
        }

        return request;
    }

    // Accept Terms Conditions
    updateTC = () => {
        var requestData = new ROAPIRequestData();

        requestData.qt = 'update';

        requestData.act = 'terms';

        return this._sendRequest({
            apiURL: this.API_USER,
            requestData: requestData,

        }).promise;
    }

    // Delete User
    deleteUser = (requestData: ROAPIRequestData) => {
        requestData.qt = 'del';

        return this._sendRequest({
            apiURL: this.API_USER,
            requestData: requestData,

        }).promise;
    }

    // User Rest List
    getUserRestList = (requestData: ROAPIRequestData) => {
        requestData.qt = 'restlist';

        return this._sendRequest({
            apiURL: this.API_USER,
            requestData: requestData,

        }).promise;
    }

    // Update User Rest List
    updateUserRestList = (requestData: ROAPIRequestData) => {
        requestData.qt = 'restlist_update';

        return this._sendRequest({
            apiURL: this.API_USER,
            requestData: requestData,

        }).promise;
    }

    /**
     * Registration
     */

    // Search Reg Rest
    searchRegRest = (requestData: any) => {
        requestData.qt = 'search';

        return this._sendRequest({
            apiURL: this.API_REGISTRATION,
            requestData: requestData,
            ignoreLogin: true,
        }).promise;
    }

    // Reg Rest
    registerRest = (requestData: any) => {
        requestData.qt = 'register';

        return this._sendRequest({
            apiURL: this.API_REGISTRATION,
            requestData: requestData,

            ignoreLogin: true,
        }).promise;
    }

    // Reg New Rest
    registerNewRest = (requestData: any) => {
        requestData.qt = 'new';

        return this._sendRequest({
            apiURL: this.API_REGISTRATION,
            requestData: requestData,

            ignoreLogin: true,
        }).promise;
    }

    // Verify Rest Code
    verifyRestCode = (requestData: any) => {
        requestData.qt = 'verify';

        return this._sendRequest({
            apiURL: this.API_REGISTRATION,
            requestData: requestData,

            ignoreLogin: true,
        }).promise;
    }

    // Verify Rest Email
    verifyRestEmail = (requestData: any) => {
        requestData.qt = 'verify_email';

        return this._sendRequest({
            apiURL: this.API_REGISTRATION,
            requestData: requestData,

            ignoreLogin: true,
        }).promise;
    }

    // Resend Code
    resendCode = (requestData: any) => {
        requestData.qt = 'resend';

        return this._sendRequest({
            apiURL: this.API_REGISTRATION,
            requestData: requestData,

            ignoreLogin: true,
        }).promise;
    }

    /**
     * Restaurant
     */

    // Get Rest List
    getRestList = (requestData: any) => {
        requestData.qt = 'list';

        return this._sendRequest({
            apiURL: this.API_RESTAURANT,
            requestData: requestData,
        }).promise;
    }

    // Get Rest Info
    getRestInfo = (requestData: ROAPIRequestData) => {
        requestData.qt = 'info';

        return this._sendRequest({
            apiURL: this.API_RESTAURANT,
            requestData: requestData,
        }).promise;
    }

    uploadRestImage = (requestData: ROAPIRequestData, formData: FormData) => {
        requestData.qt = 'image';

        requestData.act = 'upload';

        return this._sendRequest({
            apiURL: this.API_RESTAURANT,
            requestData: requestData,

            requestMethod: RequestMethod.Post,
            body: formData,
        }).promise;
    }

    deleteRestImage = (requestData: ROAPIRequestData) => {
        requestData.qt = 'image';

        requestData.act = 'del';

        return this._sendRequest({
            apiURL: this.API_RESTAURANT,
            requestData: requestData,

        }).promise;
    }

    // Accept Rest Contract
    acceptRestContract = (requestData: ROAPIRequestData) => {
        requestData.qt = 'terms';

        return this._sendRequest({
            apiURL: this.API_RESTAURANT,
            requestData: requestData,

        }).promise;
    }

    // Save Rest Info
    saveRestInfo = (requestData: ROAPIRequestData) => {
        requestData.qt = 'update';

        return this._sendRequest({
            apiURL: this.API_RESTAURANT,
            requestData: requestData,

        }).promise;
    }

    // Save Rest Info
    saveRestInfoHours = (requestData: ROAPIRequestData) => {
        requestData.qt = 'schedule';

        var body = {
            DeliveryZone: requestData.DeliveryZone,
            DeliveryHours: requestData.DeliveryHours,
            WorkingHours: requestData.WorkingHours,
            Holidays: requestData.Holidays,
        };

        delete requestData.DeliveryZone;
        delete requestData.DeliveryHours;
        delete requestData.WorkingHours;
        delete requestData.Holidays;

        return this._sendRequest({
            apiURL: this.API_RESTAURANT,
            requestData: requestData,

            requestMethod: RequestMethod.Post,
            body: body,
        }).promise;
    }

    // Get Rest Status
    getRestStatus = (requestData: ROAPIRequestData) => {
        requestData.qt = 'status';

        return this._sendRequest({
            apiURL: this.API_RESTAURANT,
            requestData: requestData,

        }).promise;
    }

    // Enable Rest Ordering
    enableRestOrdering = (requestData: ROAPIRequestData) => {
        requestData.qt = 'enableordering';

        return this._sendRequest({
            apiURL: this.API_RESTAURANT,
            requestData: requestData,

        }).promise;
    }

    // Enable Rest
    enableRest = (requestData: ROAPIRequestData) => {
        requestData.qt = 'enable';

        return this._sendRequest({
            apiURL: this.API_RESTAURANT,
            requestData: requestData,

        }).promise;
    }

    /**
     * Menus
     */

    /* Delivery Zone */

    // Get Delivery Zone list
    getDeliveryZoneList = (requestData: ROAPIRequestData) => {
        requestData.qt = 'dzone';

        requestData.act = 'list';

        return this._sendRequest({
            apiURL: this.API_RESTAURANT,
            requestData: requestData,
        }).promise;
    }

    // Add Delivery Zone
    private _addDeliveryZone = (requestData: ROAPIRequestData) => {
        requestData.qt = 'dzone';

        requestData.act = 'add';

        return this._sendRequest({
            apiURL: this.API_RESTAURANT,
            requestData: requestData,

        }).promise;
    }

    // Update Delivery Zone
    private _updateDeliveryZone = (requestData: ROAPIRequestData) => {
        requestData.qt = 'dzone';

        requestData.act = 'update';

        return this._sendRequest({
            apiURL: this.API_RESTAURANT,
            requestData: requestData,

        }).promise;
    }

    // Save Delivery Zone
    saveDeliveryZone = (data) => {
        var fireFlyID = data.fireFlyID;
        var deliveryZone: DeliveryZone = data.deliveryZone;

        var requestData = new DeliveryZoneAPIRequestData();

        DeliveryZoneAPIRequestData.fillFireFlyID(requestData, fireFlyID);
        DeliveryZoneAPIRequestData.fillDeliveryZone(requestData, deliveryZone);

        if (Util.isNewObject(deliveryZone)) {
            var request = this._addDeliveryZone(requestData);
        }
        else {
            DeliveryZoneAPIRequestData.fillID(requestData, deliveryZone.ID);

            var request = this._updateDeliveryZone(requestData);
        }

        return request;
    }

    // Delete Delivery Zone
    deleteDeliveryZone = (requestData: ROAPIRequestData) => {
        requestData.qt = 'dzone';

        requestData.act = 'del';

        return this._sendRequest({
            apiURL: this.API_RESTAURANT,
            requestData: requestData,

        }).promise;
    }

    // Update Delivery Zone Sort Order
    updateDeliveryZoneSortOrder = (requestData: ROAPIRequestData, body) => {
        requestData.qt = 'dzone';

        requestData.act = 'sort';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,

            requestMethod: RequestMethod.Post,
            body: body
        }).promise;
    }

    /* Schedule */

    // Get Schedule list
    getScheduleList = (requestData: ROAPIRequestData) => {
        requestData.qt = 'sched';

        requestData.act = 'list';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,
        }).promise;
    }

    // Update Schedule list
    updateScheduleList = (requestData: ROAPIRequestData) => {
        requestData.qt = 'sched';

        requestData.act = 'add';

        var body = {
            DeliveryHours: requestData.DeliveryHours,
            CateringHours: requestData.CateringHours,
            DiningHours: requestData.DiningHours,
            PickupHours: requestData.PickupHours,
        };

        delete requestData.DeliveryHours;
        delete requestData.CateringHours;
        delete requestData.DiningHours;
        delete requestData.PickupHours;

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,

            requestMethod: RequestMethod.Post,
            body: body,
        }).promise;
    }

    /* Master Heading */

    // Get Master Head list
    getMasterHeadList = (requestData: ROAPIRequestData) => {
        requestData.qt = 'masterheading';

        requestData.act = 'list';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,
        }).promise;
    }

    // Add Master Head
    private _addMasterHead = (requestData: ROAPIRequestData) => {
        requestData.qt = 'masterheading';

        requestData.act = 'add';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,

        }).promise;
    }

    // Update Master Head
    private _updateMasterHead = (requestData: ROAPIRequestData) => {
        requestData.qt = 'masterheading';

        requestData.act = 'update';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,

        }).promise;
    }

    // Save Master Head
    saveMasterHead = (data) => {
        var fireFlyID = data.fireFlyID;
        var masterHead: MasterHead = data.masterHead;

        var requestData = new MasterHeadAPIRequestData();

        MasterHeadAPIRequestData.fillFireFlyID(requestData, fireFlyID);
        MasterHeadAPIRequestData.fillMasterHead(requestData, masterHead);

        if (Util.isNewObject(masterHead)) {
            var request = this._addMasterHead(requestData);
        }
        else {
            MasterHeadAPIRequestData.fillID(requestData, masterHead.ID);

            var request = this._updateMasterHead(requestData);
        }

        return request;
    }

    // Delete Master Head
    deleteMasterHead = (requestData: ROAPIRequestData) => {
        requestData.qt = 'masterheading';

        requestData.act = 'del';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,

        }).promise;
    }

    // Update Master Head Sort Order
    updateMasterHeadSortOrder = (requestData: ROAPIRequestData, body) => {
        requestData.qt = 'masterheading';

        requestData.act = 'sort';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,

            requestMethod: RequestMethod.Post,
            body: body
        }).promise;
    }

    // Get Master Head info
    getMasterHeadInfo = (requestData: ROAPIRequestData) => {
        requestData.qt = 'masterheading';

        requestData.act = 'info';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,
        }).promise;
    }

    /* Heading */

    // Get Head list
    getHeadList = (requestData: ROAPIRequestData) => {
        requestData.qt = 'heading';

        requestData.act = 'list';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,
        }).promise;
    }

    // Get Head info
    getHeadInfo = (requestData: ROAPIRequestData) => {
        requestData.qt = 'heading';

        requestData.act = 'info';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,
        }).promise;
    }

    // Add Head
    private _addHead = (requestData: ROAPIRequestData) => {
        requestData.qt = 'heading';

        requestData.act = 'add';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,

        }).promise;
    }

    // Update Head
    private _updateHead = (requestData: ROAPIRequestData) => {
        requestData.qt = 'heading';

        requestData.act = 'update';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,

        }).promise;
    }

    // Save Head
    saveHead = (data) => {
        var fireFlyID = data.fireFlyID;
        var masterHeadID = data.masterHeadID;
        var head: Head = data.head;

        var requestData = new HeadAPIRequestData();

        HeadAPIRequestData.fillFireFlyID(requestData, fireFlyID);
        HeadAPIRequestData.fillHead(requestData, head);

        if (Util.isNewObject(head)) {
            HeadAPIRequestData.fillMasterHeadID(requestData, masterHeadID);

            var request = this._addHead(requestData);
        }
        else {
            HeadAPIRequestData.fillID(requestData, head.ID);

            var request = this._updateHead(requestData);
        }

        return request;
    }

    // Delete Head
    deleteHead = (requestData: ROAPIRequestData) => {
        requestData.qt = 'heading';

        requestData.act = 'del';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,

        }).promise;
    }

    // Update Head Sort Order
    updateHeadSortOrder = (requestData: ROAPIRequestData, body) => {
        requestData.qt = 'heading';

        requestData.act = 'sort';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,

            requestMethod: RequestMethod.Post,
            body: body
        }).promise;
    }

    /* Menu Item */

    // Get Menu Item list
    getMenuItemList = (requestData: ROAPIRequestData) => {
        requestData.qt = 'menu';

        requestData.act = 'list';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,
        }).promise;
    }

    // Get Menu Item info
    getMenuItemInfo = (requestData: ROAPIRequestData) => {
        requestData.qt = 'menu';

        requestData.act = 'info';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,
        }).promise;
    }

    // Add Menu Item
    addMenuItem = (requestData: ROAPIRequestData) => {
        requestData.qt = 'menu';

        requestData.act = 'add';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,

        }).promise;
    }

    // Update Menu Item
    updateMenuItem = (requestData: ROAPIRequestData) => {
        requestData.qt = 'menu';

        requestData.act = 'update';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,

        }).promise;
    }

    // Delete Menu Item
    deleteMenuItem = (requestData: ROAPIRequestData) => {
        requestData.qt = 'menu';

        requestData.act = 'del';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,

        }).promise;
    }

    uploadMenuItemImage = (requestData: ROAPIRequestData, formData: FormData) => {
        requestData.qt = 'image';

        requestData.act = 'upload';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,

            requestMethod: RequestMethod.Post,
            body: formData,
        }).promise;
    }

    deleteMenuItemImage = (requestData: ROAPIRequestData) => {
        requestData.qt = 'image';

        requestData.act = 'del';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,

        }).promise;
    }

    // Update Menu Item Sort Order
    updateMenuItemSortOrder = (requestData: ROAPIRequestData, body) => {
        requestData.qt = 'menu';

        requestData.act = 'sort';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,

            requestMethod: RequestMethod.Post,
            body: body
        }).promise;
    }

    /* Menu Item Size */

    // Get Menu Item Size list
    getMenuItemSizeList = (requestData: ROAPIRequestData) => {
        requestData.qt = 'menusize';

        requestData.act = 'list';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,

        }).promise;
    }

    // Add Menu Item Size
    addMenuItemSize = (requestData: ROAPIRequestData) => {
        requestData.qt = 'menusize';

        requestData.act = 'add';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,

        }).promise;
    }

    // Update Menu Item Size
    updateMenuItemSize = (requestData: ROAPIRequestData) => {
        requestData.qt = 'menusize';

        requestData.act = 'update';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,

        }).promise;
    }

    // Delete Menu Item Size
    deleteMenuItemSize = (requestData: ROAPIRequestData) => {
        requestData.qt = 'menusize';

        requestData.act = 'del';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,

        }).promise;
    }

    // Update Menu Item Size Sort Order
    updateMenuItemSizeSortOrder = (requestData: ROAPIRequestData, body) => {
        requestData.qt = 'menusize';

        requestData.act = 'sort';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,

            requestMethod: RequestMethod.Post,
            body: body
        }).promise;
    }

    /* Menu Option */

    // Get Menu Option list
    getMenuOptionList = (requestData: ROAPIRequestData) => {
        requestData.qt = 'menuoption';

        requestData.act = 'list';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,
        }).promise;
    }

    // Add Menu Option
    addMenuOption = (requestData: ROAPIRequestData) => {
        requestData.qt = 'menuoption';

        requestData.act = 'add';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,

        }).promise;
    }

    // Update Menu Option
    updateMenuOption = (requestData: ROAPIRequestData) => {
        requestData.qt = 'menuoption';

        requestData.act = 'update';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,

        }).promise;
    }

    // Delete Menu Option
    deleteMenuOption = (requestData: ROAPIRequestData) => {
        requestData.qt = 'menuoption';

        requestData.act = 'del';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,

        }).promise;
    }

    // Update Menu Option Sort Order
    updateMenuOptionSortOrder = (requestData: ROAPIRequestData, body) => {
        requestData.qt = 'menuoption';

        requestData.act = 'sort';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,

            requestMethod: RequestMethod.Post,
            body: body
        }).promise;
    }

    /* Menu Option Item */

    // Get Menu Option Item list
    getMenuOptionItemList = (requestData: ROAPIRequestData) => {
        requestData.qt = 'menuoptionitem';

        requestData.act = 'list';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,

        }).promise;
    }

    // Add Menu Option
    addMenuOptionItem = (requestData: MenuOptionItemAPIRequestData) => {
        requestData.qt = 'menuoptionitem';

        requestData.act = 'add';

        var body = {
            SizeDetails: requestData.SizeDetails
        }

        delete requestData.SizeDetails;

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,

            requestMethod: RequestMethod.Post,
            body: body
        }).promise;
    }

    // Update Menu Option
    updateMenuOptionItem = (requestData: MenuOptionItemAPIRequestData) => {
        requestData.qt = 'menuoptionitem';

        requestData.act = 'update';

        var body = {
            SizeDetails: requestData.SizeDetails
        }

        delete requestData.SizeDetails;

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,

            requestMethod: RequestMethod.Post,
            body: body
        }).promise;
    }

    // Delete Menu Option
    deleteMenuOptionItem = (requestData: ROAPIRequestData) => {
        requestData.qt = 'menuoptionitem';

        requestData.act = 'del';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,

        }).promise;
    }

    // Update Menu Option Item Sort Order
    updateMenuOptionItemSortOrder = (requestData: ROAPIRequestData, body) => {
        requestData.qt = 'menuoptionitem';

        requestData.act = 'sort';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData,

            requestMethod: RequestMethod.Post,
            body: body
        }).promise;
    }

    // Get Option Group Suggestion
    getOptionGroupSuggestion = (requestData: ROAPIRequestData) => {
        requestData.qt = 'optiongroup';

        requestData.act = 'list';

        return this._sendRequest({
            apiURL: this.API_MENUS,
            requestData: requestData
        }).promise;
    }

    /**
     * Orders
     */

    // Get Order List
    getOrderList = (requestData: ROAPIRequestData) => {
        requestData.qt = 'list';

        return this._sendRequest({
            apiURL: this.API_ORDERS,
            requestData: requestData,
        });
    }

    // Get Order Info
    getOrderInfo = (requestData: ROAPIRequestData) => {
        requestData.qt = 'detail';

        return this._sendRequest({
            apiURL: this.API_ORDERS,
            requestData: requestData,
        }).promise;
    }

    // Accept Order
    acceptOrder = (requestData: ROAPIRequestData) => {
        ROAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

        requestData.qt = 'accept';

        return this._sendRequest({
            apiURL: this.API_ORDERS,
            requestData: requestData,

        }).promise;
    }

    // Reject Order
    rejectOrder = (requestData: ROAPIRequestData) => {
        ROAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

        requestData.qt = 'cancel';

        return this._sendRequest({
            apiURL: this.API_ORDERS,
            requestData: requestData,

        }).promise;
    }

    // Get Map Customer Route
    getMapCustomerRoute = (requestData: ROAPIRequestData) => {
        requestData.qt = 'route';

        return this._sendRequest({
            apiURL: this.API_ORDERS,
            requestData: requestData,
        }).promise;
    }

    /**
     * Coupons
     */

    // Get Coupon List
    getCouponList = (requestData: ROAPIRequestData) => {
        requestData.qt = 'list';

        return this._sendRequest({
            apiURL: this.API_COUPONS,
            requestData: requestData,
        }).promise;
    }

    // Add Coupon
    private _addCoupon = (requestData: ROAPIRequestData) => {
        requestData.qt = 'add';

        var body = {
            menuitems: requestData.menuitems
        }

        delete requestData.menuitems;

        return this._sendRequest({
            apiURL: this.API_COUPONS,
            requestData: requestData,

            requestMethod: RequestMethod.Post,
            body: body,
        }).promise;
    }

    // Update Coupon
    private _updateCoupon = (requestData: ROAPIRequestData) => {
        requestData.qt = 'update';

        var body = {
            menuitems: requestData.menuitems
        }

        delete requestData.menuitems;

        return this._sendRequest({
            apiURL: this.API_COUPONS,
            requestData: requestData,

            requestMethod: RequestMethod.Post,
            body: body,
        }).promise;
    }

    // Save Coupon
    saveCoupon = (data) => {
        var fireFlyID = data.fireFlyID;
        var coupon: Coupon = data.coupon;

        var requestData = new CouponAPIRequestData();

        requestData.menuitems = coupon.MenuItems;

        CouponAPIRequestData.fillFireFlyID(requestData, fireFlyID);
        CouponAPIRequestData.fillCoupon(requestData, coupon);

        if (Util.isNewObject(coupon)) {
            var request = this._addCoupon(requestData);
        }
        else {
            CouponAPIRequestData.fillID(requestData, coupon.ID);

            var request = this._updateCoupon(requestData);
        }

        return request;
    }

    // Delete Master Head
    deleteCoupon = (requestData: ROAPIRequestData) => {
        requestData.qt = 'del';

        return this._sendRequest({
            apiURL: this.API_COUPONS,
            requestData: requestData,

        }).promise;
    }

    // Get Short Menu Item List
    getShortMenuItemList = (requestData: ROAPIRequestData) => {
        requestData.qt = 'menuitem';

        return this._sendRequest({
            apiURL: this.API_COUPONS,
            requestData: requestData,
        }).promise;
    }

    /**
     * Preview
     */

    // Get Preview
    getPreview = (requestData: any) => {
        requestData.qt = 'preview';

        return this._sendRequest({
            apiURL: this.API_PREVIEW,
            requestData: requestData,
        }).promise;
    }

    // Get Preview
    getMenuItemPreview = (requestData: any) => {
        requestData.qt = 'menuitem';

        return this._sendRequest({
            apiURL: this.API_PREVIEW,
            requestData: requestData,
        }).promise;
    }

    // Get Menu Option Size Preview
    getMenuOptionSizePreview = (requestData: any) => {
        requestData.qt = 'menuoptionsize';

        return this._sendRequest({
            apiURL: this.API_PREVIEW,
            requestData: requestData,
        }).promise;
    }

    // Get Menu Options Preview
    getMenuOptionsPreview = (requestData: any) => {
        requestData.qt = 'menuoptions';

        return this._sendRequest({
            apiURL: this.API_PREVIEW,
            requestData: requestData,
        }).promise;
    }

    /**
     * Charts
     */

    // Get Chart Map Info
    getChartMapInfo = (requestData: any) => {
        requestData.qt = 'map';

        return this._sendRequest({
            apiURL: this.API_CHARTS,
            requestData: requestData,
            cache: true,
        }).promise;
    }

    // Get Chart Info
    // getChartInfo = (requestData: any) => {
    //     requestData.qt = 'cg';

    //     return this._sendRequest({
    //         apiURL: this.API_CHARTS,
    //         requestData: requestData,
    //     }).promise;
    // }

    // Get Chart Compare Info
    getChartCompareInfo = (requestData: any) => {
        requestData.qt = 'compare';

        return this._sendRequest({
            apiURL: this.API_CHARTS,
            requestData: requestData,
            cache: true,
        }).promise;
    }

    // Get Chart Menu Count
    getChartMenuCount = (requestData: any) => {
        requestData.qt = 'menucount';

        return this._sendRequest({
            apiURL: this.API_CHARTS,
            requestData: requestData,
            cache: true,
        }).promise;
    }

    // Get Chart Menu Count
    getChartRestType = (requestData: any) => {
        requestData.qt = 'resttype';

        return this._sendRequest({
            apiURL: this.API_CHARTS,
            requestData: requestData,
            cache: true,
        }).promise;
    }

    // Get Chart Segments
    getChartSegments = (requestData: any) => {
        requestData.qt = 'segment';

        return this._sendRequest({
            apiURL: this.API_CHARTS,
            requestData: requestData,
            cache: true,
        }).promise;
    }

    // Get Chart Cuisines
    getChartCuisines = (requestData: any) => {
        requestData.qt = 'cuisine';

        return this._sendRequest({
            apiURL: this.API_CHARTS,
            requestData: requestData,
            cache: true,
        }).promise;
    }

    // Get Menu Comparison
    getChartMenuComparison = (requestData: any) => {
        requestData.qt = 'menucompetition';

        return this._sendRequest({
            apiURL: this.API_CHARTS,
            requestData: requestData,
            cache: true,
        }).promise;
    }

    // Get Missing Menu
    getChartMissingMenu = (requestData: any) => {
        requestData.qt = 'missingmenu';

        return this._sendRequest({
            apiURL: this.API_CHARTS,
            requestData: requestData,
            cache: true,
        }).promise;
    }

    /**
     * Financial
     */

    // Get Financial Statement
    getFinancialStatement = (requestData: any) => {
        requestData.qt = 'statement';

        return this._sendRequest({
            apiURL: this.API_FINANCIAL,
            requestData: requestData,
        });
    }

    // Get Financial Report
    getFinancialReport = (requestData: any) => {
        requestData.qt = 'report';

        return this._sendRequest({
            apiURL: this.API_FINANCIAL,
            requestData: requestData,
        }).promise;
    }

    // /**
    //  * SEO
    //  */

    // // Get Cities
    // getCities = () => {
    //     var requestData: any = {};
    //     requestData.qt = 'city';

    //     return this._sendRequest({
    //         apiURL: this.API_SEO,
    //         requestData: requestData,
    //     }).promise;
    // }
}