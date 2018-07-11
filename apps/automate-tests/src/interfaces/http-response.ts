export interface IHttpResponse {
    ok: boolean;
    status: number;
    statusText: string;
    type: number;
    url: string;
    _body: string;
    json: any;
}