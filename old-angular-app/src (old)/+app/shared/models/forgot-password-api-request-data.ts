import { ForgotPassword } from './forgot-password';

/**
 * ForgotPasswordAPIRequestData
 */
export class ForgotPasswordAPIRequestData {
    private static DELIVERY_MODE_EMAIL = 1;
    private static DELIVERY_MODE_PHONE = 2;

    public c: number; // DeliveryMode, // 1 = Email, 2 = Phone
    public e: string; // Email,
    public s: string; // SecurityQuestionAnswer

    public static fillForgotPassword = (requestData: ForgotPasswordAPIRequestData, forgotPassword: ForgotPassword) => {
        requestData.c = ForgotPasswordAPIRequestData.DELIVERY_MODE_EMAIL;
        requestData.e = forgotPassword.email;
        requestData.s = forgotPassword.securityAnswer;
    }
}