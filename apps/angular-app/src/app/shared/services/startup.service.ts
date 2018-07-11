import { Injectable, Inject, Optional, PLATFORM_ID } from "@angular/core";
import { Http, RequestMethod } from "@angular/http";
import { Constants } from "../constants";

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Util } from "../util";
import { APIRequest } from "../models/api-request";
import { HttpTransferService } from "@ngx-universal/state-transfer";
import { HttpClient } from "./http.client";
import { isPlatformBrowser } from "@angular/common";

@Injectable()
export class StartupService {
    LOG_TAG = 'StartupService';

    isBrowser = false;

    private _data: any;
    public get data(): any {
        return this._data;
    }

    private _config: any;
    public get config(): any {
        return this._config;
    }

    public promise = null;
    public resolve = null;
    public reject = null;

    constructor(@Inject(PLATFORM_ID) private platformId: Object, @Inject('APP_HOST_URL') @Optional() private APP_HOST_URL: string, private httpClient: HttpClient, private tHttp: HttpTransferService, private constants: Constants) {
        this.isBrowser = isPlatformBrowser(this.platformId);

        if (this.isBrowser) {
            this.APP_HOST_URL = `${window.location.protocol}//${window.location.host}`;
        }

        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });

        Util.log(this.LOG_TAG, 'constructor', this.APP_HOST_URL);
    }

    async load() {
        this._data = null;

        this._config = {};

        var jsonConfig = {};
        var windowAppConfig = {};

        try {
            var request = new APIRequest();
            request.url = `${this.APP_HOST_URL}/config.json`;
            request.method = RequestMethod.Get;

            // jsonConfig = await this.tHttp.get(request.url).map(res => res).toPromise();
            jsonConfig = await this.httpClient.sendRequest(request, true).toPromise();

            Util.log(this.LOG_TAG, 'jsonConfig', jsonConfig);
        }
        catch (e) {
            Util.log(this.LOG_TAG, 'jsonConfig => Catch', e);
        }

        if (typeof window !== 'undefined') {
            windowAppConfig = window['APP_CONFIG'] || {};
        }

        Util.merge(this._config, windowAppConfig);
        Util.merge(this._config, jsonConfig);

        if (typeof window !== 'undefined') {
            window['APP_CONFIG'] = this._config;
        }

        Util.log(this.LOG_TAG, 'config', this.config);

        var fillableConfig = [
            'APP_VERSION',
            'PUBLIC_KEY',
            'INTERNAL_DEBUG',
            'APP_TYPE',
        ];

        var fillableStaticConfig = [
            'ENV',
            'DEBUG',
        ];

        for (var i in this.config) {
            var item = this.config[i];

            if (fillableConfig.indexOf(i) > -1 && typeof item !== 'undefined') {
                this.constants[i] = item;
            }

            if (fillableStaticConfig.indexOf(i) > -1 && typeof item !== 'undefined') {
                Constants[i] = item;
            }
        }

        this.constants.init();

        Util.log(this.LOG_TAG, 'constants init', this.constants);

        // return new Promise((resolve, reject) => {
        //     setTimeout(() => {
        //         resolve();
        //         Util.log(this.LOG_TAG, 'resolved');
        //     }, 0);
        // });

        var request = new APIRequest();
        request.url = `${this.constants.API_URL}/b/gps.aspx?key=${this.constants.API_KEY}&pcpk=${this.constants.PUBLIC_KEY}&IncludeIntroPages=false&IncludeSettings=true&includesocialids=true&includeappicon=true`;
        request.method = RequestMethod.Get;
        this._data = await this.httpClient.sendRequest(request, true).toPromise();

        this.resolve();

        return this.promise;
    }
}