/**
 * Restaurant
 */
export class Restaurant {
    public ID: number;
    public FireFlyID: string;
    public Name: string;
    public Title: string;
    public Keywords: string;
    public Description: string;
    public Address_1: string;
    public Address_2: string;
    public City: string;
    public State: string;
    public ZipCode: string;
    public Phone: string;
    public Mobile: string;
    public Fax: string;
    public Email: string;
    public CI_FirstName: string;
    public CI_LastName: string;
    public CI_Address: string;
    public CI_City: string;
    public CI_State: string;
    public CI_ZipCode: string;
    public CI_ContactNo: string;
    public CI_Email: string;
    public CI_Webmaster_Name: string;
    public BirthDate: string;
    public LegalName: string;
    public AccountName: string;
    public BusinessInfo: string;
    public RoutingNumber: string;
    public AccountNumber: string;
    public TIN: string;
    public Tax: number;
    public Latitude: string;
    public Longitude: string;
    public FileName: string;
    public RestImageExist: boolean;
    public EnableOnlineOrdering: boolean;
    public Enabled: boolean;
    public Subscription: string;
    public SubscriptionID: number;
    public DeliveryTime_Min: string;
    public DeliveryTime_Max: string;
    public PickupTime_Min: string;
    public PickupTime_Max: string;
    public Terms: boolean;
    public DeliveryCharge: number;
    public WaivedDeliveryCharge: number;
    public MinOrder: number;
    public CuisineID: number;
    public Cuisine: string;
    public Segment: string;
    public ST_Catering_Enabled: boolean;
    public ST_Delivery_Enabled: boolean;
    public ST_DiningIn_Enabled: boolean;
    public ST_Pickup_Enabled: boolean;
    public CallOnNewOrder: boolean;
    public EmailOnNewOrder: boolean;
    public FaxOnNewOrder: boolean;
    public SMSOnNewOrder: boolean;
    public AutoAcceptNewOrder: boolean;
    public Braintree_Onboard_Status: number;
    public Braintree_Onboard_Message: string;

    //Custom fields
    public ConfirmAccountNumber: string;
    public customerName: string;
    public taxPercent: string;
    public isSelected: boolean;
    public isHidden: boolean;
}