import { Md5 } from 'ts-md5/dist/md5';

import { ResetPassword } from './reset-password';
import { APIRequestData } from "./api-request-data";

/**
 * ResetPasswordAPIRequestData
 */
export class ResetPasswordAPIRequestData extends APIRequestData {
    public r: string; // reset code
    public p: string; // password
    public p2: string; // confirm password

    public static fillResetPassword = (requestData: ResetPasswordAPIRequestData, resetPassword: ResetPassword) => {
        requestData.r = resetPassword.resetCode;
        requestData.p = <string>Md5.hashStr(resetPassword.newPassword);
        requestData.p2 = <string>Md5.hashStr(resetPassword.confirmPassword);
    }
}