import { UserAddress } from './user-address';
import { APIRequestData } from './api-request-data';

/**
 * Tax Rate API
 */
export class TaxRateAPIRequestData extends APIRequestData {
    public z: string; // Zip
    public s: string; // State

    public static fillUserAddress(requestData: TaxRateAPIRequestData, userAddress: UserAddress) {
        requestData.z = userAddress.Zip;
        requestData.s = userAddress.State;
    }
}