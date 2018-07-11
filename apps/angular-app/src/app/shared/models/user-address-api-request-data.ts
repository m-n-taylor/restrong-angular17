import { UserAddress } from './user-address';
import { UserAPIRequestData } from './user-api-request-data';
import { Util } from "../util";

/**
 * User Address API Request Data
 */
export class UserAddressAPIRequestData extends UserAPIRequestData {
    public a: number; // ID
    public b: string; // Address
    public c: string = ''; // Address2
    public d: string; // City
    public e: string; // State
    public f: string; // Zip
    public g: string; // LatLng

    public static fillUserAddress(requestData: UserAddressAPIRequestData, userAddress: UserAddress) {
        if (Util.isDefined(userAddress.ID)) {
            requestData.a = userAddress.ID;
        }

        requestData.b = userAddress.Address || '';
        requestData.d = userAddress.City || '';
        requestData.e = userAddress.State || '';
        requestData.f = userAddress.Zip || '';
        requestData.g = userAddress.LatLng || '';
    }
}