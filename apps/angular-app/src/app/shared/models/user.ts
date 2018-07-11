import { BaseUser } from "./base-user";

/**
 * User
 */

export class User extends BaseUser {
    public ID: number;
    public FirstName: string;
    public LastName: string;
    public MiddleName: string;
    public Login: string;
    public UserName: string;
    public Password: string;
    public ConfirmPassword: string;
    public Email: string;
    public ConfirmEmail: string;
    public IsEmailValidated: boolean;
    public Phone: string;
    public IsPhoneValidated: boolean;
    public Enabled: boolean;
    public AuthCode: string;
    public LastLogin: string;
    public LastIP: string;
    public SecurityQuestionID: number;
    public SecurityQuestion: string;
    public SecurityAnswer: string;
    public SocialPicture: string;
    public SoldOutAction: any;
    public Points: number;
    public AllowReviewOrderCount: number;

    // Custom Fields
    public sn_id: number;
}