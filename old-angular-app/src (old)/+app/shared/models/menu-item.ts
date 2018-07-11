/**
 * MenuItem
 */
export class MenuItem {
    // API Fields
    public RestaurantID: number;
    public RestaurantName: string;
    public Address: string;
    public ETA: string;    
    public DeliveryCharge: number; 
    public DeliveryModeID: number;   
    public MinOrder: number;
    public IsSingleSize: boolean;
    public MenuItemID: number;
    public MenuItemName: string;
    public Price: number;
    public Availability: string;
    public FileName: string;
    public Latitude: string;
    public Longitude: string;
    public isDiningIn: boolean;
    public isCatering: boolean;
    public isDelivery: boolean;
    public isPickup: boolean;
    
    // Custom Fields
    public quantity: number;
    public selectedMenuItemSize: any;
    public menuItemSizes: Array<any>;
    public menuItemOptions: Array<any>;
}