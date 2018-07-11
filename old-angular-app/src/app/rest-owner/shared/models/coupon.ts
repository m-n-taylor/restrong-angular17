/**
 * Coupon
 */

export class Coupon {
    public ID: number;
    public Name: string;
    public Description: string;
    public Limitation: string;
    public Enabled: boolean;
    public FireFlyID: string;
    public CouponCode: string;
    public DiscountPercent: number;
    public StartDate: string;
    public EndDate: string;
    public DailyStartTime: string;
    public DailyEndTime: string;
    public CouponType: number;
    public DiscountType: number;
    public DiscountValue: number;
    public DiscountCriteria: number;
    public DurationType: number;
    public MaxRedeemPerCustomer: number;
    public MaxRedeem: number;
    public MinOrder: number;
    public MaxOrder: number;
    public Is_Visible: boolean;
    public Is_Deleted: boolean;
    public DiningIn: boolean;
    public Catering: boolean;
    public Delivery: boolean;
    public Pickup: boolean;
    public MenuItems = new Array<any>();

    // Custom fields
    public busy: boolean;
    public busyDelete: boolean;
}