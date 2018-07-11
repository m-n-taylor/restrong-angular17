import { Util } from '../../../shared/util';

import { Coupon } from './coupon';
import { ROAPIRequestData } from './ro-api-request-data';

/**
 * Coupon API Request Data
 */
export class CouponAPIRequestData extends ROAPIRequestData {
    public n: string; // Name
    public des: string; // Description
    public c: string; // Coupon Code
    public d: number; // Discount
    public ds: string; // Date Start
    public de: string; // Date End
    public daily_start: string;
    public daily_end: string;
    public ctype: number;
    public dtype: number;
    public durationtype: number;
    public discountcriteria: number;
    public minorder: number;
    public maxorder: number;
    public limitation: string;
    public redeem_max: number;
    public redeem_percustomer: number;
    public enabled: boolean; // Enabled
    public visible: boolean; // visible
    public delivery: boolean; 
    public pickup: boolean; 
    public catering: boolean; 
    public diningin: boolean; 
    public bundle: boolean; 

    public static fillCoupon = (requestData: CouponAPIRequestData, coupon: Coupon) => {
        if (Util.isDefined(coupon.CouponCode)) requestData.c = coupon.CouponCode;
        if (Util.isDefined(coupon.Description)) requestData.des = coupon.Description;
        if (Util.isDefined(coupon.Limitation)) requestData.limitation = coupon.Limitation;
        if (Util.isDefined(coupon.DurationType)) requestData.durationtype = coupon.DurationType;
        if (Util.isDefined(coupon.StartDate)) requestData.ds = coupon.StartDate;
        if (Util.isDefined(coupon.EndDate)) requestData.de = coupon.EndDate;
        if (Util.isDefined(coupon.DailyStartTime)) requestData.daily_start = coupon.DailyStartTime;
        if (Util.isDefined(coupon.DailyEndTime)) requestData.daily_end = coupon.DailyEndTime;
        if (Util.isDefined(coupon.CouponType)) requestData.ctype = coupon.CouponType;
        if (Util.isDefined(coupon.DiscountType)) requestData.dtype = coupon.DiscountType;
        if (Util.isDefined(coupon.DiscountValue)) requestData.d = coupon.DiscountValue;
        if (Util.isDefined(coupon.DiscountCriteria)) requestData.discountcriteria = coupon.DiscountCriteria;
        if (Util.isDefined(coupon.MinOrder)) requestData.minorder = coupon.MinOrder;
        if (Util.isDefined(coupon.MaxOrder)) requestData.maxorder = coupon.MaxOrder;
        if (Util.isDefined(coupon.MaxRedeemPerCustomer)) requestData.redeem_percustomer = coupon.MaxRedeemPerCustomer;
        if (Util.isDefined(coupon.MaxRedeem)) requestData.redeem_max = coupon.MaxRedeem;
        requestData.enabled = coupon.Enabled || false;
        if (Util.isDefined(coupon.Is_Visible)) requestData.visible = coupon.Is_Visible;
        if (Util.isDefined(coupon.Delivery)) requestData.delivery = coupon.Delivery;
        if (Util.isDefined(coupon.Pickup)) requestData.pickup = coupon.Pickup;
        if (Util.isDefined(coupon.Catering)) requestData.catering = coupon.Catering;
        if (Util.isDefined(coupon.DiningIn)) requestData.diningin = coupon.DiningIn;
        requestData.bundle = coupon.Is_AllowBundle;
    }
}