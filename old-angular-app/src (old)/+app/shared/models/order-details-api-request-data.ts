import { UserPayment } from './user-payment';
import { UserAPIRequestData } from './user-api-request-data';

/**
 * Order API Request Data
 */
export class OrderDetailsAPIRequestData extends UserAPIRequestData {
    public b: number; // Item ID
}