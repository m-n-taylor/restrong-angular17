// Shared Models
import { Cuisine } from '../models/cuisine';
import { ServiceFee } from '../models/service-fee';
import { UserAddress } from '../models/user-address';

/**
 * Base SharedData
 */
export abstract class BaseSharedData {
    // Service type
    public serviceType: string;

    // Tax Rate Percent
    // public taxPercent: number;

    // Service fee
    public serviceFee: ServiceFee;

    // Driver Tip Percent
    public driverTipPercent: number;
}