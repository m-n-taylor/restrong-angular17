import { UserPayment } from './user-payment';
import { UserAPIRequestData } from './user-api-request-data';

/**
 * Order API Request Data
 */
export class OrderItemsDetailsAPIRequestData extends UserAPIRequestData {
    public a: number; // Order ID
}