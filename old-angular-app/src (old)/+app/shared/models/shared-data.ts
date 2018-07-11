// Shared Models
import { Cuisine } from '../models/cuisine';
import { ServiceFee } from '../models/service-fee';
import { UserAddress } from '../models/user-address';

/**
 * SharedData
 */
export class SharedData {
    // Service type
    public serviceType: string;

    // Tax Rate Percent
    public taxPercent: number;

    // Driver Tip Percent
    public driverTipPercent: number;

    // Delivery Notes
    public deliveryNotes: string;

    // Apt Suite No
    public aptSuiteNo: string;

    // Service fee
    public serviceFee: ServiceFee;
    
    // User Address
    public userAddress: UserAddress;

    // Auto Suggest
    public autoSuggestList: any;

    // Cuisines
    public cuisines: Array<Cuisine>;

    // Selected Cuisines
    public selectedCuisines = new Array<Cuisine>();
}