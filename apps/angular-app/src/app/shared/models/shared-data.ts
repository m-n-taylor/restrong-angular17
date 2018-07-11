import { BaseSharedData } from './base-shared-data';

// Shared Models
import { Cuisine } from '../models/cuisine';
import { ServiceFee } from '../models/service-fee';
import { UserAddress } from '../models/user-address';
import { PlatformSettings } from './platform-settings';

/**
 * SharedData
 */
export class SharedData extends BaseSharedData {
    // Delivery Notes
    public deliveryNotes: string;

    // Apt Suite No
    public aptSuiteNo: string;

    // User Address
    public userAddress: UserAddress;

    // Auto Suggest
    public autoSuggestList: any;

    // Cuisines
    public cuisines: Array<Cuisine>;

    // Selected Cuisines
    public selectedCuisines = new Array<Cuisine>();

    // Filters
    public isFiltersOpened: boolean;
    public minPrice: number;
    public maxPrice: number;
    public proximity: number;

    public deliveryFeeStep: number;
    public deliveryFee: any;

    public minOrderStep: number;
    public minOrder: any;

    public viewMode: number;

    public platformSettings = new PlatformSettings();
    
    // Shopping Cart
    public isShoppingCartOpened: boolean;
}