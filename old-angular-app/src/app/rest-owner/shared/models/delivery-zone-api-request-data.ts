import { Util } from '../../../shared/util';

import { DeliveryZone } from './delivery-zone';
import { ROAPIRequestData } from './ro-api-request-data';

/**
 * Delivery Zone API Request Data
 */
export class DeliveryZoneAPIRequestData extends ROAPIRequestData {
    public name: string; // Name
    public des: string; // Description
    public enabled: boolean; // Enabled
    public mtype: number;
    public dc: number;
    public minorder: string;
    public minpax: number;
    public poly: string;
    public radius: string;
    public ztype: number;
    public ptd: string;
    public pth: string;
    public ptm: string;

    public static fillDeliveryZone = (requestData: DeliveryZoneAPIRequestData, deliveryZone: DeliveryZone) => {
        if(Util.isDefined(deliveryZone.Name)) requestData.name = deliveryZone.Name;
        if(Util.isDefined(deliveryZone.Description)) requestData.des = deliveryZone.Description;
        if(Util.isDefined(deliveryZone.Enabled)) requestData.enabled = deliveryZone.Enabled;
        if(Util.isDefined(deliveryZone.ServiceTypeID)) requestData.mtype = deliveryZone.ServiceTypeID;
        if(Util.isDefined(deliveryZone.DeliveryCharge)) requestData.dc = deliveryZone.DeliveryCharge;
        if(Util.isDefined(deliveryZone.MinimumOrderCost)) requestData.minorder = deliveryZone.MinimumOrderCost;
        if(Util.isDefined(deliveryZone.MinimumPax)) requestData.minpax = deliveryZone.MinimumPax;
        if(Util.isDefined(deliveryZone.PolygonData)) requestData.poly = deliveryZone.PolygonData;
        if(Util.isDefined(deliveryZone.CircleRadius)) requestData.radius = deliveryZone.CircleRadius;
        if(Util.isDefined(deliveryZone.ZoneType)) requestData.ztype = deliveryZone.ZoneType;
        if(Util.isDefined(deliveryZone.PreparationTime_Days)) requestData.ptd = deliveryZone.PreparationTime_Days;
        if(Util.isDefined(deliveryZone.PreparationTime_Hours)) requestData.pth = deliveryZone.PreparationTime_Hours;
        if(Util.isDefined(deliveryZone.PreparationTime_Minutes)) requestData.ptm = deliveryZone.PreparationTime_Minutes;
    }
}