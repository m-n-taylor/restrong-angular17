/**
 * Delivery Zone
 */

export class DeliveryZone {
    public ID: number;
    public Name: string;
    public Description: string;
    public Enabled: boolean;
    public ZoneType: number = 1;
    public MasterHeadingID: number;
    public ServiceTypeID: number;
    public MinimumOrderCost: string;
    public MinimumPax: number;
    public DeliveryCharge: number;
    public PreparationTime_Days: string;
    public PreparationTime_Hours: string;
    public PreparationTime_Minutes: string;
    public PolygonData: string;
    public CircleRadius: string;
    public SortID: number;
    public Is_Deleted: false;
}