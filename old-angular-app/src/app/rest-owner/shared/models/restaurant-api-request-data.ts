import { Util } from '../../../shared/util';

import { Restaurant } from './restaurant';
import { ROAPIRequestData } from './ro-api-request-data';

/**
 * Restaurant API Request Data
 */
export class RestaurantAPIRequestData extends ROAPIRequestData {
    public name: string; // Name
    public description: string; // Description
    public keywords: string; // Keywords
    public address1: string; // Name
    public address2: string; // Name
    // public name: string; // Name
    // public name: string; // Name
    // public name: string; // Name
    // public name: string; // Name
    // public name: string; // Name

    // public static fillHead = (requestData: RestaurantAPIRequestData, rest: Restaurant) => {
    //     if(Util.isDefined(rest.Name)) requestData.name = rest.Name;
    //     if(Util.isDefined(rest.Name)) requestData.name = rest.Name;
    //     if(Util.isDefined(rest.Name)) requestData.name = rest.Name;
    //     if(Util.isDefined(rest.Name)) requestData.name = rest.Name;
    //     if(Util.isDefined(rest.Name)) requestData.name = rest.Name;
    //     if(Util.isDefined(rest.Name)) requestData.name = rest.Name;
    //     if(Util.isDefined(rest.Name)) requestData.name = rest.Name;
    //     if(Util.isDefined(rest.Name)) requestData.name = rest.Name;
    //     if(Util.isDefined(rest.Name)) requestData.name = rest.Name;
    //     if(Util.isDefined(rest.Name)) requestData.name = rest.Name;
    // }
}