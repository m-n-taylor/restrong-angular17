import { isPlatformBrowser } from '@angular/common';
import { Constants } from '../constants';
import { Util } from '../util';
import { SharedData } from '../models/shared-data';
import { APIRequestData } from './api-request-data';
import { QueryParams } from '../models/query-params';
import { UserAddress } from '../models/user-address';
import { SharedDataService } from '../services/shared-data.service';

/**
 * Search Menu API Request Data
 */
export class SearchMenuAPIRequestData extends APIRequestData {
    public qtype: string;
    public page: number;
    public pageSize: number;
    public min_price: number;
    public max_price: number;
    public proximity: number;
    public deliveryfee: number;
    public minimumorder: number;
    public menuType: string;
    public keywords: string;
    public coordinate: string;
    public option: number;
    public menuitemid: number;
    public zid: number;
    public restaurantid: number;
    public mhid: number;
    public cuisineID: string;
    public termsinclude: string;
    public usemap: number;
    public ff: string; // FireFlyID
    public Menus_SourceID: number;

    constructor() {
        super();
        //this.coordinate = '-118.29276237406617,34.07736310823318';
        this.usemap = 1;
    }

    public static fillQueryParams = (requestData: SearchMenuAPIRequestData, queryParams: QueryParams) => {
        var constants = new Constants();

        // if (typeof queryParams.keywords === 'string')
        if (Util.isDefined(queryParams.keywords))
            requestData.keywords = queryParams.keywords;
        // else requestData.keywords = queryParams.keywords.join(constants.KEYWORD_SEPRATOR);

        // requestData.coordinate = QueryParams.getStringCoordinate(queryParams.lat, queryParams.lng);
    }

    public static fillSharedData = (requestData: SearchMenuAPIRequestData, sharedDataService: SharedDataService) => {
        if (isPlatformBrowser(sharedDataService.platformId)) {
            if (sharedDataService.hasUserAddress())
                requestData.coordinate = UserAddress.getStringCoordinate(sharedDataService.userAddress.LatLng);
        }
        else {
            requestData.coordinate = '-118.29276237406617,34.07736310823318'; //TODO: needs to discuss this
        }

        requestData.min_price = sharedDataService.minPrice;
        requestData.max_price = sharedDataService.maxPrice;
        requestData.menuType = sharedDataService.serviceType;
        requestData.deliveryfee = sharedDataService.deliveryFee;
        requestData.minimumorder = sharedDataService.minOrder;
        requestData.proximity = sharedDataService.proximity;

        // Get selected cuisines
        var selectedCuisineIDs = [];

        for (var i in sharedDataService.selectedCuisines) {
            var cuisine = sharedDataService.selectedCuisines[i];

            selectedCuisineIDs.push(cuisine.id);
        }

        requestData.cuisineID = selectedCuisineIDs.join(',');
    }

    public static compareQueryParams = (requestData: SearchMenuAPIRequestData, queryParams: QueryParams) => {
        var constants = new Constants();

        var match = true;

        // if (requestData.min_price != queryParams.minPrice) match = false;
        // if (requestData.max_price != queryParams.maxPrice) match = false;
        // if (requestData.menuType != queryParams.serviceType) match = false;

        // if(typeof queryParams.keywords === 'string') {
        var keyword1 = requestData.keywords;
        var keyword2 = queryParams.keywords;

        if (!Util.isDefined(keyword1)) keyword1 = '';
        if (!Util.isDefined(keyword2)) keyword2 = '';

        if (keyword1 != keyword2) match = false;
        //}
        // else {
        //     if (requestData.keywords != queryParams.keywords.join(constants.KEYWORD_SEPRATOR)) match = false;
        // }

        //if (requestData.coordinate != QueryParams.getStringCoordinate(queryParams.lat, queryParams.lng)) match = false;

        return match;
    }
}