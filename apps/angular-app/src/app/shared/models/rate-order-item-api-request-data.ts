import { OrderItem } from './order-item';
import { UserAPIRequestData } from './user-api-request-data';

/**
 * Order API Request Data
 */
export class RateOrderItemAPIRequestData extends UserAPIRequestData {
    public a: string; // Order Item Image ID
    public m: number; // Item ID
    public c: string; // CustomerComment
    public d: number; // CustomerRating
    public e: number; // Order ID
    public b: number; // index
    public o: string; // order number

    public static fillOrderItem = (requestData: RateOrderItemAPIRequestData, orderItem: OrderItem) => {
        requestData.m = orderItem.ItemID;
        requestData.c = orderItem.CustomerComment;
        requestData.d = orderItem.CustomerRating;
        requestData.e = orderItem.OrderID;
    }
}