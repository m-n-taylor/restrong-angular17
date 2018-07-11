import { UserPayment } from './user-payment';
import { UserAPIRequestData } from './user-api-request-data';

/**
 * User Payment API
 */
export class UserPaymentAPIRequestData extends UserAPIRequestData {
    public a: number; // ID
    public c: string; // CardNumber
    public d: string; // Expiry
    public e: string; // CVV
    public f: string; // Cardholder
    public af: string; // Billing_FirstName
    public al: string; // Billing_LastName
    public aa: string; // Billing_Address
    public ab: string; // Billing_Address2
    public ac: string; // Billing_City
    public as: string; // Billing_State
    public az: string; // Billing_Zip

    private static fillBillingInfo(requestData: UserPaymentAPIRequestData, userPayment: UserPayment) {
        requestData.af = userPayment.Billing_FirstName;
        requestData.al = userPayment.Billing_LastName;
        requestData.aa = userPayment.Billing_Address;
        requestData.ab = userPayment.Billing_Address2;
        requestData.ac = userPayment.Billing_City;
        requestData.as = userPayment.Billing_State;
        requestData.az = userPayment.Billing_Zip;
    }

    public static fillUserPaymentID(requestData: UserPaymentAPIRequestData, userPayment: UserPayment) {
        requestData.a = userPayment.ID;
    }

    public static fillUserPaymentForCreate(requestData: UserPaymentAPIRequestData, userPayment: UserPayment) {
        requestData.c = userPayment.CardNumber;
        requestData.d = userPayment.Expiry;
        requestData.e = userPayment.CVV;
        requestData.f = userPayment.CardHolder;

        UserPaymentAPIRequestData.fillBillingInfo(requestData, userPayment);
    }

    public static fillUserPaymentForUpdate(requestData: UserPaymentAPIRequestData, userPayment: UserPayment) {
        UserPaymentAPIRequestData.fillUserPaymentID(requestData, userPayment);

        UserPaymentAPIRequestData.fillBillingInfo(requestData, userPayment);
    }
}