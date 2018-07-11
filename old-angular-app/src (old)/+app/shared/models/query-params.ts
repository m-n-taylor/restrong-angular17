// Shared Helpers
import { Util } from '../util';

export class QueryParams {
    public activeTab: string;
    public menuItemID: number;
    public restaurantID: number;
    public minPrice: number;
    public maxPrice: number;
    public serviceType: string;
    public page: number;
    public pageSize: number;
    public menuType: string;
    public proximity: number;
    public lat: number;
    public lng: number;
    public returnUrl: string;
    public resetCode: string;
    public keywords = new Array<string>();

    public static getStringCoordinate = (lat: any, lng: any) => {
        return `${lng},${lat}`;
    }

    public static fillParams = (queryParams: QueryParams, params) => {
        if (Util.isDefined(params.keywords) && params.keywords != '') {
            queryParams.keywords = params.keywords.split(',');
        }

        queryParams.serviceType = params.serviceType || 'delivery';
        queryParams.minPrice = params.minPrice || 0;
        queryParams.maxPrice = params.maxPrice || 100;
        queryParams.proximity = params.proximity || 3;
        queryParams.lat = params.lat;
        queryParams.lng = params.lng;

        if(Util.isDefined(params.restaurantID)) queryParams.restaurantID = params.restaurantID;
        if(Util.isDefined(params.returnUrl)) queryParams.returnUrl = params.returnUrl;
        if(Util.isDefined(params.resetCode)) queryParams.resetCode = params.resetCode;
    }

    // public AddKeyword = (keyword) => {
    //     if (keyword !== '' && this.keywords.indexOf(keyword) === -1) {
    //         this.keywords.push(keyword);
    //     }
    // }
    // public RemoveKeyword = (index) => {
    //     this.keywords.splice(index, 1);
    // }
}