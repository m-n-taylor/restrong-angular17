import { BaseUser } from "../../../shared/models/base-user";
/**
 * User
 */

export class User extends BaseUser {
    public id: number;
    public AuthCode: string;
    public FirstName: string;
    public LastName: string;
    public MiddleName: string;
    public Login: string;
    public Email: string;
    public Password: string;
    public ConfirmPassword: string;
    public UserLevel: number;
    public Enabled: boolean;
    public Vicidial: number;
    public QuickBlox_UserID: number;
    public Terms: boolean;
    public NotificationTone: string;
    public EmailVerified: boolean;
    public ShowRestTabNav: boolean;
    public CallRestaurant: boolean;

    // public UserName: string;
    // public ConfirmPassword: string;
    // public ConfirmEmail: string;
    // public IsEmailValidated: boolean;
    // public Phone: string;
    // public IsPhoneValidated: boolean;
    // public Enabled: boolean;
    // public AuthCode: string;
    // public LastLogin: string;
    // public LastIP: string;
    // public SecurityQuestionID: number;
    // public SecurityQuestion: string;
    // public SecurityAnswer: string;
    // public Points: number;
    // public AllowReviewOrderCount: number;

    // // Custom Fields
    // public sn_id: number;
}