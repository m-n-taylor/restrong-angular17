import { Util } from '../../../shared/util';

import { User } from './user';
import { APIRequestData } from '../../../shared/models/api-request-data';

/**
 * User API Request Data
 */
export class ROAPIRequestData extends APIRequestData {
    public qt: string; // Query Type
    public act: string; // Action
    public uid: number; // User ID
    public ff: string; // Firefly
    public ffadd: string; // Firefly Add
    public ffdelete: string; // Firefly
    public authcode: string; // User Auth Code

    public pcpk: string; // public key

    public i: number; // ID

    public token: string; // Token
    public x: string; // Captcha Code

    public search: string; // Search
    public ps: number; // Page Size
    public proximity: number; // Proximity

    public ds: string; // Date Start
    public de: string; // Date End

    public mtype: number; // Service Type

    public excludecatering: boolean;

    public sid: number; // Order Status ID

    public showresttabnav: boolean;
    public callrestaurant: boolean;

    // Add/Update User
    public first: string; //FirstName
    public middle: string; //MiddleName
    public last: string; //MiddleName
    public e: string; //Email
    public p: string; //Password
    public ul: number; //User Level
    public enabled: boolean; //User Level

    public notificationtone: string;

    // Orders
    public oid: string; // Order ID

    //Menus
    public zid: number; // Menu Item Size ID
    public mid: number; // Menu Item ID
    public moid: number; // Menu Option ID
    public mhid: number; // Master Heading ID
    public hid: number; // Heading ID

    public menuitems: any;
    public OrderDetail: any;

    // Signup
    public z: string; // Zip Code
    public rn: string; // Rest Name
    public t: string; // Title
    public a: string; // Rest Address
    public c: string; // Verify code
    public n: string; // customer name
    public opera: boolean; // Opera
    public op: string; // Old password
    public np: string; // New password
    public terms: boolean; // Terms and conditions
    public plan: number; // Pricing plan

    // Rest Info
    public DeliveryZone: Array<any>;
    public DeliveryHours: Array<any>;
    public WorkingHours: Array<any>;
    public Holidays: Array<any>;

    // Schedule
    public CateringHours: Array<any>;
    public DiningHours: Array<any>;
    public PickupHours: Array<any>;

    // Reset Password
    public p2: string; // Confirm Password

    // Support email
    public ns: string;

    public static fillFireFlyID(requestData: ROAPIRequestData, firefly: string) {
        requestData.ff = firefly;
    }

    public static fillID(requestData: ROAPIRequestData, id: number) {
        requestData.i = id;
    }

    public static fillSearch(requestData: ROAPIRequestData, search: string) {
        requestData.search = search;
    }

    public static fillPage(requestData: ROAPIRequestData, page: any) {
        requestData.p = page;
    }

    public static fillPageSize(requestData: ROAPIRequestData, pageSize: number) {
        requestData.ps = pageSize;
    }

    public static fillUserLevel(requestData: ROAPIRequestData, userLevel: number) {
        requestData.ul = userLevel;
    }

    public static fillOrderID(requestData: ROAPIRequestData, orderID: string) {
        requestData.oid = orderID;
    }

    public static fillMasterHeadID(requestData: ROAPIRequestData, masterHeadID: number) {
        requestData.mhid = masterHeadID;
    }

    public static fillHeadID(requestData: ROAPIRequestData, headID: number) {
        requestData.hid = headID;
    }

    public static fillMenuItemID(requestData: ROAPIRequestData, menuItemID: number) {
        requestData.mid = menuItemID;
    }

    public static fillMenuOptionID(requestData: ROAPIRequestData, menuOptionID: number) {
        requestData.moid = menuOptionID;
    }

    public static fillLoginUser(requestData: ROAPIRequestData, loginUser: User) {
        if (Util.isDefined(loginUser)) {
            requestData.authcode = loginUser.AuthCode;
            requestData.uid = loginUser.id;
        }
    }

    public static fillUserForSaveUser(requestData: ROAPIRequestData, user: User) {
        if (Util.isDefined(user.id)) requestData.i = user.id;
        if (Util.isDefined(user.FirstName)) requestData.first = user.FirstName;
        if (Util.isDefined(user.MiddleName)) requestData.middle = user.MiddleName;
        if (Util.isDefined(user.LastName)) requestData.last = user.LastName;
        if (Util.isDefined(user.Email)) requestData.e = user.Email;
        if (Util.isDefined(user.Password)) requestData.p = user.Password;
        if (Util.isDefined(user.UserLevel)) ROAPIRequestData.fillUserLevel(requestData, user.UserLevel);
        requestData.enabled = user.Enabled || false;
        if (Util.isDefined(user.Terms)) requestData.terms = user.Terms;
    }
}