/**
 * UserPayment
 */
export class UserPayment {
    public ID: number;
    public CardNumber: string;
    public Expiry: string;
    public CVV: string;
    public CardHolder: string;
    public Billing_FirstName: string;
    public Billing_LastName: string;
    public Billing_Address: string;
    public Billing_Address2: string;
    public Billing_City: string;
    public Billing_State: string;
    public Billing_Zip: string;
    public CardType: string;
    public CardTypeImageURL: string;
    public Is_Default: boolean;

    /**
     * constructor
     */
    constructor() {
        this.CardNumber = '5555555555554444';
        this.Expiry = '12/18';
        this.CVV = '123';
        this.Billing_FirstName = 'Abuzer';
        this.Billing_LastName = 'Asif';
        this.Billing_Address = 'Test Address';
        this.Billing_City = 'Test City';
        this.Billing_State = 'Test State';
        this.Billing_Zip = 'Test Zip';
    }

    public static getDefaultOrFirst(userPayments: Array<UserPayment>): UserPayment {
        var userPayment: UserPayment;

        for(var i in userPayments) {
            var payment = userPayments[i];

            if(payment.Is_Default) {
                userPayment = payment;
                break;
            }
        }

        if(!userPayment && typeof userPayments !== 'undefined' && userPayments && userPayments.length > 0) {
            userPayment = userPayments[0];
        }

        return userPayment;
    }
}