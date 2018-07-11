import { MenuItem } from './menu-item';
import { CartCoupon } from "./cart-coupon";

/**
 * CartItem
 */
export class CartItem {
    public RestaurantID: number;
    public RestaurantName: string;
    public FFID: string;
    public Address: string;
    public ETA: string;
    public ETAMin: number;
    public ETAMax: number;
    public DeliveryFlat: number;
    public DeliveryPercentSubTotal: number;
    public DeliveryModeID: number;
    public MinOrder: number;
    public Availability: string;
    public FileName: string;
    public serviceTypes: Array<string>;

    public requireMinOrder = false;
    public menusServiceFee = 0;
    public subscriptionID = 0;
    public delivery = 0;
    public serviceFee = 0;
    public driverTip = 0;
    public driverTipPercent = 0;
    public tax = 0;
    public taxPercent = 0;
    public busyAddCouponCode: boolean;
    public couponCode: string;
    public couponDiscount = 0;
    public subTotal = 0;
    public total = 0;
    public coupons = new Array<CartCoupon>();
    public appliedCoupons = new Array<CartCoupon>();
    public menuItems = new Array<MenuItem>();
    public orderResult: any;
}