import { APIRequestData } from './api-request-data';

/**
 * API Request
 */
export class APIRequest {
    public url: string;
    public data: APIRequestData;
    public body: any;
    public method: number;
}