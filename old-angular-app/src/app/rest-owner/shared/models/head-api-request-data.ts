import { Util } from '../../../shared/util';

import { Head } from './head';
import { ROAPIRequestData } from './ro-api-request-data';

/**
 * Head API Request Data
 */
export class HeadAPIRequestData extends ROAPIRequestData {
    public name: string; // Name
    public des: string; // Description
    public enabled: boolean; // Enabled

    public static fillHead = (requestData: HeadAPIRequestData, head: Head) => {
        if(Util.isDefined(head.Name)) requestData.name = head.Name;
        if(Util.isDefined(head.Description)) requestData.des = head.Description;
        if(Util.isDefined(head.Enabled)) requestData.enabled = head.Enabled;
    }
}