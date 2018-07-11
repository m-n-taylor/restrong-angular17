import { User } from './user';
import { APIRequestData } from '../../../shared/models/api-request-data';

/**
 * User API Request Data
 */
export class UserAPIRequestData extends APIRequestData {
    // public x: string; // User Auth Code
    public uid: number; // User ID

    public static fillLoginUser(requestData: UserAPIRequestData, loginUser: User) {
        // requestData.x = loginUser.AuthCode;
        requestData.uid = loginUser.id;
    }
}