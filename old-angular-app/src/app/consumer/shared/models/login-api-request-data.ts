import { User } from '../../../shared/models/user';
import { Md5 } from 'ts-md5/dist/md5';
import { APIRequestData } from '../../../shared/models/api-request-data';

/**
 * Login API Request Data
 */
export class LoginAPIRequestData extends APIRequestData {
    public static ACTION_LOGIN = 'login';
    public static ACTION_LOGOUT = 'logout';
    public static SOCIAL_LOGIN_FACEBOOK = 1;
    public static SOCIAL_LOGIN_GOOGLE = 2;
    public username: string;
    public password: string;
    public act: string;
    public access_token: string;
    public sn_id: number;

    public static fillUser = (requestData: LoginAPIRequestData, user: User) => {
        requestData.username = user.UserName;
        requestData.password = <string> Md5.hashStr(user.Password);
    }
}