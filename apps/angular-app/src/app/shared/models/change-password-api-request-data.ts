import { Md5 } from 'ts-md5/dist/md5';

import { ChangePassword } from './change-password';
import { UserAPIRequestData } from './user-api-request-data';

/**
 * Change Password API Request Data
 */
export class ChangePasswordAPIRequestData extends UserAPIRequestData {
    public p: string; // Old password
    public p1: string; // New password
    public p2: string; // New Confirm password

    public static fillUserPassword = (requestData: ChangePasswordAPIRequestData, userPassword: ChangePassword) => {
        requestData.p = <string> Md5.hashStr(userPassword.oldPassword);
        requestData.p1 = <string> Md5.hashStr(userPassword.newPassword);
        requestData.p2 = <string> Md5.hashStr(userPassword.confirmPassword);
    }
}