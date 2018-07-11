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
    // public lat: number;
    // public lng: number;
    public returnUrl: string;
    public resetCode: string;
    public keywords = '';

    public static getStringCoordinate = (lat: any, lng: any) => {
        return `${lng},${lat}`;
    }

    public static fillParams = (queryParams: QueryParams, params) => {
        console.log('fillParams =>', params);
        // if (Util.isDefined(params.keywords) && params.keywords != '') {

        //     if(!Util.isDefined(queryParams.keywords)) queryParams.keywords = '';

        //     queryParams.keywords += params.keywords;

        // }

        // if (Util.isDefined(params.keywords)) {
        //     queryParams.keywords = params.keywords;

        //     if (typeof params.keywords === 'string') {
        //         queryParams.keywords = [params.keywords];
        //     }
        //     else {
        //         queryParams.keywords = params.keywords;
        //     }
        // }
        // else {
        //     queryParams.keywords = new Array<string>();
        // }

        queryParams.keywords = params.keywords;
        // queryParams.serviceType = params.serviceType || 'delivery';
        // queryParams.minPrice = params.minPrice || 0;
        // queryParams.maxPrice = params.maxPrice || 100;
        // queryParams.lat = params.lat;
        // queryParams.lng = params.lng;

        if (Util.isDefined(params.restaurantID)) queryParams.restaurantID = params.restaurantID;
        if (Util.isDefined(params.returnUrl)) queryParams.returnUrl = params.returnUrl;
        if (Util.isDefined(params.resetCode)) queryParams.resetCode = params.resetCode;
    }

    public static keywordExist = (queryParams: QueryParams, keyword) => {
        return Util.isDefined(queryParams.keywords) && queryParams.keywords.toLowerCase().indexOf(keyword.toLowerCase()) > -1;
    }

    public static addKeyword = (queryParams: QueryParams, keyword) => {
        if (!Util.isDefined(queryParams.keywords) || queryParams.keywords.trim().length == 0 || queryParams.keywords == '') {
            queryParams.keywords = keyword;
        }
        else {
            if (!QueryParams.keywordExist(queryParams, keyword)) queryParams.keywords += ',' + keyword;
        }
    }

    public static removeKeyword = (queryParams: QueryParams, keywordIndex) => {
        if (Util.isDefined(queryParams.keywords) && queryParams.keywords.trim().length > 0) {
            
            var keywordsArr = queryParams.keywords.split(',');

            keywordsArr.splice(keywordIndex, 1);

            queryParams.keywords = keywordsArr.join(',');
        }
    }
    // public RemoveKeyword = (index) => {
    //     this.keywords.splice(index, 1);
    // }
}