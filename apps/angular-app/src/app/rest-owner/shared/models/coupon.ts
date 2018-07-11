/**
 * Coupon
 */

export class CouponError {
    public message: string;
}

export class Coupon {
    public ID: number;
    public FireFlyID: string;
    public Name: string;
    public Heading: string;
    public Description: string;
    public Limitation: string;
    public CouponCode: string;
    public DiscountType: number;
    public DiscountCriteria: number;
    public DiscountValue: number;
    public StartDate: string;
    public EndDate: string;
    public DailyStartTime: string;
    public DailyEndTime: string;
    public CouponType: number;
    public MenuItems: Array<string>;
    public MinOrder: number;
    public MaxOrder: number;
    public MinQty: number;
    public MaxQty: number;
    public MaxRedeemPerCustomer: number;
    public MaxRedeem: number;
    public DurationType: number;
    public Is_AllowBundle: boolean;
    public RedeemCount: number;
    public Is_Visible: boolean;
    public Enabled: boolean;
    public Is_Deleted: boolean;
    public DiningIn: boolean;
    public Catering: boolean;
    public Delivery: boolean;
    public Pickup: boolean;
    
    // custom fields
    public busy: boolean;
    public busyDelete: boolean;
    public isSelected: boolean;
    public invalid: boolean;
    public errors: Array<CouponError>;
}

// export class Coupon {
//     public ID: number;
//     public Name: string;
//     public Description: string;
//     public Limitation: string;
//     public Enabled: boolean;
//     public FireFlyID: string;
//     public CouponCode: string;
//     public DiscountPercent: number;
//     public StartDate: string;
//     public EndDate: string;
//     public DailyStartTime: string;
//     public DailyEndTime: string;
//     public CouponType: number;
//     public DiscountType: number;
//     public DiscountValue: number;
//     public DiscountCriteria: number;
//     public DurationType: number;
//     public MaxRedeemPerCustomer: number;
//     public MaxRedeem: number;
//     public MinOrder: number;
//     public MaxOrder: number;
//     public Is_Visible: boolean;
//     public Is_Deleted: boolean;
//     public DiningIn: boolean;
//     public Catering: boolean;
//     public Delivery: boolean;
//     public Pickup: boolean;
//     public RedeemCount: number;
//     public TotalReach: number;
//     public TotalDiscount: number;
//     public Is_AllowBundle: boolean;
//     public MenuItems = new Array<any>();

//     // Custom fields
//     public busy: boolean;
//     public busyDelete: boolean;
// }