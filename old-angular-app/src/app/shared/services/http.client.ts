/**
 * HttpClient
 */
import { RequestMethod, Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

// Shared Helpers
import { Constants } from '../../shared/constants';
import { Util } from '../../shared/util';

// Shared Models
import { User } from '../../shared/models/user';
import { APIRequest } from '../../shared/models/api-request';
import { UserAddress } from '../../shared/models/user-address';
import { UserPayment } from '../../shared/models/user-payment';
import { QueryParams } from '../../shared/models/query-params';

// Shared Services
import { EventsService } from '../../shared/services/events.service';
import { TransferHttp } from '../../../modules/transfer-http/transfer-http';

@Injectable()
export class HttpClient {
    private LOG_TAG = 'HttpClient';

    public rawResponse: boolean;

    static get parameters() {
        return [TransferHttp, Http, Constants, EventsService]; //ModelService, 
    }

    constructor(private tHttp: TransferHttp, private http: Http, private constants: Constants, private eventsService: EventsService) {
        //Util.log(this.LOG_TAG, 'constructor');
    }

    private _serialize = function (obj) {
        var str = [];
        for (var p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        return str.join("&");
    }

    private _responseInterceptor = (res) => {
        //Util.log(this.LOG_TAG, 'RAW Response', res);

        var response = res;

        if (Util.isDefined(res.json)) {
            response = res.json();
        }

        //Util.log(this.LOG_TAG, 'Intercepting Response', response);

        if (Util.isDefined(response.Status) && response.Status == this.constants.STATUS_ERROR && Util.isDefined(response.Code) && response.Code == 'INVALID_API_AUTHCODE') {
            //Util.log(this.LOG_TAG, 'Auth Expired');

            this.eventsService.onAuthCodeExpired.emit({
                type: 'RO'
            });
        }

        return response;
    }

    sendRequest = (request: APIRequest, cache?: boolean) => {
        var result = null;

        if (request.method == RequestMethod.Get) {

            if (request.data) {
                request.url += '&' + this._serialize(request.data);
            }

            //Util.log(' =>', request.url);

            if (this.rawResponse) {
                result = this.http.get(request.url).map(res => res);
            }
            else {
                if (cache) {
                    result = this.tHttp.get(request.url).map(this._responseInterceptor);
                }
                else {
                    result = this.http.get(request.url).map(this._responseInterceptor);
                }
            }
        }
        else if (request.method == RequestMethod.Post) {
            request.url += '&' + this._serialize(request.data);

            request.body = request.body || {};

            if (this.rawResponse) {
                result = this.http.get(request.url).map(res => res);
            }
            else {
                result = this.http.post(request.url, request.body).map(this._responseInterceptor);
            }
        }

        return result;
    }
}