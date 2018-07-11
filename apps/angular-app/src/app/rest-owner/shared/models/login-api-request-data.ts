import { User } from './user';
import { Md5 } from 'ts-md5/dist/md5';
import { APIRequestData } from '../../../shared/models/api-request-data';

/**
 * Login API Request Data
 */
export class LoginAPIRequestData extends APIRequestData {
    public e: string; // Email
    public p: string; // Password

    public static fillUser = (requestData: LoginAPIRequestData, user: User) => {
        requestData.e = user.Email;
        requestData.p = user.Password;
        // requestData.p = <string> Md5.hashStr(user.password);
    }
}