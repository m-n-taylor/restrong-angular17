/**
 * HttpClient
 */
import { RequestMethod, Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

// Shared Helpers
import { Util } from '../../shared/util';

// Shared Models
import { User } from '../../shared/models/user';
import { APIRequest } from '../../shared/models/api-request';
import { UserAddress } from '../../shared/models/user-address';
import { UserPayment } from '../../shared/models/user-payment';
import { QueryParams } from '../../shared/models/query-params';

// Shared Services
import { ModelService } from '../../shared/services/model.service';

@Injectable()
export class HttpClient {
    static get parameters() {
        return [ModelService, Http];
    }
    constructor(private model: ModelService, private http: Http) {
    }

    serialize = function (obj) {
        var str = [];
        for (var p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        return str.join("&");
    }

    sendRequest = (request: APIRequest, ignoreCache?: boolean) => {
        var result = null;

        if (request.method == RequestMethod.Get) {
            request.url += '&' + this.serialize(request.data);

            Util.log(' =>', request.url);

            if (ignoreCache) {
                result = this.http.get(request.url).map(res => res.json())
                    .catch(err => {
                        return Observable.throw(err);
                    });
            }
            else {
                result = this.model.get(request.url);
            }
        }
        else if(request.method == RequestMethod.Post) {
            request.url += '&' + this.serialize(request.data);

            request.body = request.body || {};

            result = this.http.post(request.url, request.body).map(res => res.json())
                    .catch(err => {
                        return Observable.throw(err);
                    });
        }

        return result;
    }
}