import { Util } from '../../../shared/util';

import { MasterHead } from './master-head';
import { ROAPIRequestData } from './ro-api-request-data';

/**
 * Menu Item API Request Data
 */
export class MasterHeadAPIRequestData extends ROAPIRequestData {
    public name: string; // Name
    public des: string; // Description
    public ot: string; // Opening Time
    public ct: string; // Closing Time
    public enabled: boolean; // Enabled
    public diningin: boolean; // Is Dining In
    public catering: boolean; // Is Catering
    public delivery: boolean; // Is Delivery
    public pickup: boolean; // Is Pickup

    public static fillMasterHead = (requestData: MasterHeadAPIRequestData, head: MasterHead) => {
        if(Util.isDefined(head.Name)) requestData.name = head.Name;
        if(Util.isDefined(head.Description)) requestData.des = head.Description;
        if(Util.isDefined(head.Opening_Time)) requestData.ot = head.Opening_Time;
        if(Util.isDefined(head.Closing_Time)) requestData.ct = head.Closing_Time;
        if(Util.isDefined(head.Enabled)) requestData.enabled = head.Enabled;
        if(Util.isDefined(head.IsDiningIn)) requestData.diningin = head.IsDiningIn;
        if(Util.isDefined(head.IsCatering)) requestData.catering = head.IsCatering;
        if(Util.isDefined(head.IsDelivery)) requestData.delivery = head.IsDelivery;
        if(Util.isDefined(head.IsPickup)) requestData.pickup = head.IsPickup;
    }
}