import { OrderItem } from './order-item';
import { UserAPIRequestData } from './user-api-request-data';

/**
 * Order API Request Data
 */
export class RateOrderItemAPIRequestData extends UserAPIRequestData {
    public m: number; // Item ID
    public c: string; // CustomerComment
    public d: number; // CustomerRating

    public static fillOrderItem = (requestData: RateOrderItemAPIRequestData, orderItem: OrderItem) => {
        requestData.m = orderItem.ItemID;
        requestData.c = orderItem.CustomerComment;
        requestData.d = orderItem.CustomerRating;
    }
}