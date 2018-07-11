/**
 * MenuItem
 */
import { MenuOption } from "../../rest-owner/shared/models/menu-option";

export class MenuItem {
    // API Fields
    public RestaurantID: number;
    public RestaurantName: string;
    public Address: string;
    public ETA: string;
    public ETAMin: number;
    public ETAMax: number;
    public DeliveryCharge: number;
    public DeliveryModeID: number;
    public MinOrder: number;
    public IsSingleSize: boolean;
    public MenuItemID: number;
    public MenuItemName: string;
    public MenuItemDescription: string;
    public Price: number;
    public Availability: string;
    public FileName: string;
    public Latitude: string;
    public Longitude: string;
    public isDiningIn: boolean;
    public isCatering: boolean;
    public isDelivery: boolean;
    public isPickup: boolean;
    public IsOpen: boolean;
    public UTC_OpeningTime: string;
    public UTC_ClosingTime: string;
    public CuisineID: number;
    public CuisineName: string;
    public SegmentName: string;
    public Phone: string;
    public MenuImageExist: boolean;
    public RestImageExist: boolean;
    public RestRating: number;
    public RestRatingCount: number;
    public RestImage: string;
    public PriceLevel: string;
    public FFID: string;
    public Distance: string;
    public PayMenusServiceFee: boolean;
    public MenusServiceFee: number;
    public Menus_SourceID: number;
    public ShowImageInGallery: boolean;
    public ZipCode: string;

    // Custom Fields
    public subMenuItems = new Array<MenuItem>();
    public menuItemSuggestion: string;
    public mapMarker: any;
    public mapInfoWindow: any;
    public totalPrice: number;
    public cartCount: number;
    public quantity: number;
    public selectedMenuItemSize: any;
    public menuItemSizes: Array<any>;
    public menuItemOptions: Array<MenuOption>;
}