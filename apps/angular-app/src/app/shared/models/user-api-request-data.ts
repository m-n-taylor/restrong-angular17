import { User } from './user';
import { APIRequestData } from './api-request-data';

/**
 * User API Request Data
 */
export class UserAPIRequestData extends APIRequestData {
    public x: string; // User Auth Code
    public i: number; // User ID

    public static fillLoginUser(requestData: UserAPIRequestData, loginUser: User) {
        requestData.x = loginUser.AuthCode;
        requestData.i = loginUser.ID;
    }
}