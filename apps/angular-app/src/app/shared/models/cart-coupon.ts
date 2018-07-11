import { CouponError } from "../../rest-owner/shared/models/coupon";

export interface CartCoupon {
    CouponID: number;
    CouponType: number;
    CouponCode: string;
    DurationType: number;
    DiscountType: number;
    DiscountCriteria: number;
    DiscountValue: number;
    MinOrder: number;
    MaxOrder: number;
    StartDate: string;
    EndDate: string;
    DailyStartTime: string;
    DailyEndTime: string;
    Is_AllowBundle: boolean;
    MenuItems: Array<string>;
    MaxRedeemPerCustomer: number;
    CustomerRedeemCount: number;
    ServiceTypes: Array<number>;

    // custom fields
    invalid: boolean;
    errors: Array<CouponError>;
}