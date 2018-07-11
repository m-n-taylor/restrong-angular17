import { Constants } from '../constants';
import { SharedData } from '../models/shared-data';
import { APIRequestData } from './api-request-data';
import { QueryParams } from '../models/query-params';

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

    constructor() {
        super();
        //this.coordinate = '-118.29276237406617,34.07736310823318';
        this.usemap = 1;
    }

    public static fillQueryParams = (requestData: SearchMenuAPIRequestData, queryParams: QueryParams) => {
        var constants = new Constants();

        requestData.min_price = queryParams.minPrice;
        requestData.max_price = queryParams.maxPrice;
        requestData.menuType = queryParams.serviceType;
        requestData.proximity = queryParams.proximity;
        requestData.keywords = queryParams.keywords.join(constants.KEYWORD_SEPRATOR);
        requestData.coordinate = QueryParams.getStringCoordinate(queryParams.lat, queryParams.lng);
    }

    public static fillSharedData = (requestData: SearchMenuAPIRequestData, sharedData: SharedData) => {
        // Get selected cuisines
        var selectedCuisineIDs = [];

        for (var i in sharedData.selectedCuisines) {
            var cuisine = sharedData.selectedCuisines[i];

            selectedCuisineIDs.push(cuisine.id);
        }

        requestData.cuisineID = selectedCuisineIDs.join(',');
    }

    public static compareQueryParams = (requestData: SearchMenuAPIRequestData, queryParams: QueryParams) => {
        var constants = new Constants();

        var match = true;

        if (requestData.min_price != queryParams.minPrice) match = false;
        if (requestData.max_price != queryParams.maxPrice) match = false;
        if (requestData.menuType != queryParams.serviceType) match = false;
        if (requestData.proximity != queryParams.proximity) match = false;
        if (requestData.keywords != queryParams.keywords.join(constants.KEYWORD_SEPRATOR)) match = false;
        if (requestData.coordinate != QueryParams.getStringCoordinate(queryParams.lat, queryParams.lng)) match = false;

        return match;
    }
}