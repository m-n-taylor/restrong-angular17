import { MenuItem } from './menu-item';

/**
 * CartItem
 */
export class CartItem {
    public RestaurantID: number;
    public RestaurantName: string;
    public Address: string;
    public ETA: string;
    public DeliveryFlat: number;
    public DeliveryPercentSubTotal: number;
    public DeliveryModeID: number;
    public MinOrder: number;
    public Availability: string;
    public FileName: string;
    public serviceTypes: Array<string>;
    
    public delivery = 0;
    public serviceFee = 0;
    public driverTip = 0;
    public driverTipPercent = 0;
    public tax = 0;
    public subTotal = 0;
    public total = 0;
    public menuItems = new Array<MenuItem>();
}