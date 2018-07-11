export class HourDayDetails {
    public ID: number;
    public Opening_Time: string;
    public Closing_Time: string;
    public Enabled: boolean;

    // Custom fields
    public openingTimeError?: string;
    public closingTimeError?: string;
    public editMode: boolean;
    public dayIDFrom: number;
    public dayIDTo: number;
}

export class RestHours {
    public DayID: number;
    public RestaurantID: number;
    public DayDetails: Array<HourDayDetails>;
}