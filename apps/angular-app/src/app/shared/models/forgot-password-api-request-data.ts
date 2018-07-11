import { ForgotPassword } from './forgot-password';
import { APIRequestData } from "./api-request-data";

/**
 * ForgotPasswordAPIRequestData
 */
export class ForgotPasswordAPIRequestData extends APIRequestData {
    private static DELIVERY_MODE_EMAIL = 1;
    private static DELIVERY_MODE_PHONE = 2;

    public c: number; // DeliveryMode, // 1 = Email, 2 = Phone
    public e: string; // Email,
    public p: string; // Phone,
    public s: string; // SecurityQuestionAnswer

    public static fillForgotPassword = (requestData: ForgotPasswordAPIRequestData, forgotPassword: ForgotPassword) => {
    }
}