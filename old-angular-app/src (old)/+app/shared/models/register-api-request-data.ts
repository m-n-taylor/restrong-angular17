import { User } from './user';
import { UserAPIRequestData } from './user-api-request-data';

/**
 * Register API Request Data
 */
export class RegisterAPIRequestData extends UserAPIRequestData {
    public f: string; // Firstname
    public l: string; // Lastname
    public u: string; // Username
    public e: string; // Email
    public ph: string; // Phone
    public p: string; // Password
    public p2: string; // Password
    public e2: string; // Email
    public s: number; // SecurityQuestionID
    public t: string; // SecurityQuestion

    public static fillUser = (requestData: RegisterAPIRequestData, user: User) => {
        requestData.f = user.FirstName;
        requestData.l = user.LastName;
        requestData.u = user.UserName;
        requestData.e = user.Email;
        requestData.e2 = user.ConfirmEmail;
        requestData.ph = user.Phone;
        requestData.p = user.Password;
        requestData.p2 = user.ConfirmPassword;
        requestData.s = user.SecurityQuestionID;
        requestData.t = user.SecurityAnswer;
    }
}