import { UserPayment } from './user-payment';
import { UserAddress } from './user-address';
import { CartItem } from './cart-item';
import { UserAPIRequestData } from './user-api-request-data';

import { SharedDataService } from '../services/shared-data.service';

/**
 * Order API Request Data
 */
export class OrderAPIRequestData extends UserAPIRequestData {
    private static PAYMENT_METHOD_COD = 1;
    private static PAYMENT_METHOD_CREDIT_CARD = 2;

    public b: number; // Order ID
    public c: number; // DeliveryAddressID
    public d: number; // SubTotal
    public e: number; // Delivery
    public f: number; // Total
    public g: any; // ETA
    public h: any; // Distance
    // public j: any; // DrivingDistance
    public k: any; // PaymentMethod
    public dtp: number; // DriverTipPercent
    // public dt: any; // DriverTip
    public l: number; // CreditCardID
    public m: string; // AptSuiteNo
    public n: string; // DeliveryNotes
    public r: number; // restaurant id
    public s: number; // ServiceType

    constructor() {
        super();
    }

    public static fillUserAddress = (requestData: OrderAPIRequestData, userAddress: UserAddress) => {
        requestData.c = userAddress.ID;
    }

    public static fillUserPayment = (requestData: OrderAPIRequestData, userPayment: UserPayment) => {
        requestData.k = OrderAPIRequestData.PAYMENT_METHOD_CREDIT_CARD;
        requestData.l = userPayment.ID;
    }

    public static fillCartItem = (requestData: OrderAPIRequestData, cartItem: CartItem) => {
        // requestData.d = cartItem.subTotal;
        // requestData.e = cartItem.delivery;
        // requestData.f = cartItem.total;
        // requestData.g = cartItem.ETA;
        //requestData.h = cartItem.distance;
        requestData.r = cartItem.RestaurantID;
    }

}