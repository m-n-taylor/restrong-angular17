import { Component } from '@angular/core';
import { Http } from '@angular/http';

// Shared Helpers
import { Constants } from '../../../angular-app/src/app/shared/constants';
import { Util } from '../../../angular-app/src/app/shared/util';

// Shared Models
import { User } from '../../../angular-app/src/app/shared/models/user';
import { SearchMenuAPIRequestData } from '../../../angular-app/src/app/shared/models/search-menu-api-request-data';

import { LoginAPIRequestData } from '../../../angular-app/src/app/consumer/shared/models/login-api-request-data';

// Shared Services
import { TransferHttp } from '../../../angular-app/src/modules/transfer-http/transfer-http';
import { HttpClient } from '../../../angular-app/src/app/shared/services/http.client';
import { AppService } from '../../../angular-app/src/app/shared/services/app.service';

import { IHttpResponse } from '../interfaces/http-response';
import { ITestItem } from '../interfaces/test-item';

import { Helper } from '../helper';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
// import 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [Constants, TransferHttp, HttpClient, AppService]
})
export class AppComponent {
    SORT_DEFAULT = 'SORT_DEFAULT';
    SORT_LOW_TIME_FIRST = 'SORT_LOW_TIME_FIRST';
    SORT_HIGH_TIME_FIRST = 'SORT_HIGH_TIME_FIRST';

    title = 'app';

    testCoordinate: string;

    pageSizeMin: number;
    pageSizeMax: number;

    proximity: number;

    testsStatus: string;
    parallelRequests: boolean;

    testList: Array<ITestItem>;

    totalTestsCount: number;

    sortBy: string;

    userDev: User;
    userLive: User;

    helper: Helper;

    private _successTestsCount: number;
    public get successTestsCount(): number {
        return this._successTestsCount;
    }
    public set successTestsCount(v: number) {
        this._successTestsCount = v;

        this._checkStatusIfParallel();
    }

    private _failTestsCount: number;
    public get failTestsCount(): number {
        return this._failTestsCount;
    }
    public set failTestsCount(v: number) {
        this._failTestsCount = v;

        this._checkStatusIfParallel();
    }

    testSubscriptions: Array<any>;

    private constantsDev: Constants;
    private transferHttpDev: TransferHttp;
    private httpClientDev: HttpClient;
    private appServiceDev: AppService;

    private constantsLive: Constants;
    private transferHttpLive: TransferHttp;
    private httpClientLive: HttpClient;
    private appServiceLive: AppService;

    constructor(private http: Http, private constants: Constants) {
        this._initOneTime();
        this._init();
    }

    private _initOneTime = () => {
        this.helper = new Helper();

        var userName = 'abuzerasif@gmail.com';
        var password = 'test1234';

        this.userDev = new User();
        this.userDev.UserName = userName;
        this.userDev.Password = password;

        this.userLive = new User();
        this.userLive.UserName = userName;
        this.userLive.Password = password;

        this.parallelRequests = false;

        this.proximity = 3;

        this.testCoordinate = '-118.42126029999997,34.0312732';

        this.pageSizeMin = 10;
        this.pageSizeMax = 50;
    }

    private _init = () => {
        this.sortBy = this.SORT_DEFAULT;

        this.testsStatus = this.helper.STATUS_STOPPED;

        this.testList = new Array<ITestItem>();

        this.totalTestsCount = 0;
        this.successTestsCount = 0;
        this.failTestsCount = 0;

        this.testSubscriptions = [];
    }

    ngOnInit() {
        Util.log('AppComponent');

        this.startTests();
    }

    startTests = () => {
        this._init();

        this.testsStatus = this.helper.STATUS_RUNNING;

        this._initTests(Constants.ENV_DEV)
            .then(value => {
                return this._initTests(Constants.ENV_LIVE);
            })
            .then(value => {
                if (!this.parallelRequests) {
                    this.testsStatus = this.helper.STATUS_COMPLETED;
                }
            });
    }

    private _checkStatusIfParallel = () => {
        if (this.parallelRequests && this.testsStatus == this.helper.STATUS_RUNNING) {
            if (this.totalTestsCount - (this.successTestsCount + this.failTestsCount) == 0) {
                this.testsStatus = this.helper.STATUS_COMPLETED;
            }
        }
    }

    private _initTests = (env): Promise<boolean> => {
        Constants.ENV = env;

        if (Constants.ENV == Constants.ENV_DEV) {
            this.constantsDev = new Constants();
            this.transferHttpDev = new TransferHttp(<any>this.http, <any>{});
            this.httpClientDev = new HttpClient(this.transferHttpDev, <any>this.http, this.constants, <any>{});
            this.httpClientDev.rawResponse = true;
            this.appServiceDev = new AppService(this.constantsDev, this.httpClientDev, <any>{});
        }

        if (Constants.ENV == Constants.ENV_LIVE) {
            this.constantsLive = new Constants();
            this.transferHttpLive = new TransferHttp(<any>this.http, <any>{});
            this.httpClientLive = new HttpClient(this.transferHttpLive, <any>this.http, this.constants, <any>{});
            this.httpClientLive.rawResponse = true;
            this.appServiceLive = new AppService(this.constantsLive, this.httpClientLive, <any>{});
        }

        return this.sendSearchDishRequest(env, { menuType: this.constants.SERVICE_TYPE_DELIVERY })
            .then(value => {
                return this.sendSearchDishRequest(env, { menuType: this.constants.SERVICE_TYPE_PICKUP });
            })
            .then(value => {
                return this.sendSearchDishRequest(env, { menuType: this.constants.SERVICE_TYPE_CATERING });
            })
            .then(value => {
                return this.sendSearchDishRequest(env, { menuType: this.constants.SERVICE_TYPE_DINEIN });
            })
            .then(value => {
                return this.sendSearchCuisineRequest(env, { menuType: this.constants.SERVICE_TYPE_DELIVERY });
            })
            .then(value => {
                return this.sendSearchCuisineRequest(env, { menuType: this.constants.SERVICE_TYPE_PICKUP });
            })
            .then(value => {
                return this.sendSearchCuisineRequest(env, { menuType: this.constants.SERVICE_TYPE_CATERING });
            })
            .then(value => {
                return this.sendSearchCuisineRequest(env, { menuType: this.constants.SERVICE_TYPE_DINEIN });
            })
            .then(value => {
                return this.sendSearchRestRequest(env, { menuType: this.constants.SERVICE_TYPE_DELIVERY });
            })
            .then(value => {
                return this.sendSearchRestRequest(env, { menuType: this.constants.SERVICE_TYPE_PICKUP });
            })
            .then(value => {
                return this.sendSearchRestRequest(env, { menuType: this.constants.SERVICE_TYPE_CATERING });
            })
            .then(value => {
                return this.sendSearchRestRequest(env, { menuType: this.constants.SERVICE_TYPE_DINEIN });
            })
            .then(value => {
                return this.sendSearchAutoSuggestRequest(env);
            })
            .then(value => {
                return this.sendGlobalAPIRequest(env);
            })
            .then(value => {
                return this.sendCorrectLoginRequest(env);
            })
            .then(value => {
                return this.sendWrongLoginRequest(env);
            });
    }

    private _getAppService = (env) => {
        return env == Constants.ENV_LIVE ? this.appServiceLive : this.appServiceDev;
    }

    private _getLogin = (env) => {
        return env == Constants.ENV_LIVE ? this.userLive : this.userDev;
    }

    private _initTestItem1 = (resolve, data): ITestItem => {
        if (this.parallelRequests) resolve();

        this.totalTestsCount++;

        var testItem: ITestItem = {};
        testItem.busy = true;
        testItem.passList = new Array<string>();
        testItem.failList = new Array<string>();
        testItem.defaultOrder = this.testList.length;

        Util.merge(testItem, data);

        this.testList.push(testItem);

        testItem.startTime = new Date().getTime();

        return testItem;
    }

    private _initTestItem2 = (testItem: ITestItem, response: IHttpResponse): boolean => {
        testItem.endTime = new Date().getTime();

        testItem.url = response.url;
        testItem.response = response._body;

        var isValidResponse = this.helper.isValidResponse(response);

        if (isValidResponse) {
            testItem.passList.push(this.helper.makeMessage(this.helper.MSG_VALID_JSON));
        }
        else {
            testItem.failList.push(this.helper.makeMessage(this.helper.MSG_VALID_JSON));
        }

        return isValidResponse;
    }

    private _initTestItem3 = (testItem: ITestItem, resolve) => {
        if (testItem.failList.length > 0) {
            testItem.success = false;
            testItem.showDetails = true;

            this.failTestsCount++;
        }
        else {
            testItem.success = true;

            this.successTestsCount++;
        }

        testItem.busy = false;

        if (!this.parallelRequests) resolve();
    }

    private _sendLoginRequest = (env, loginUser: User) => {
        var request = new LoginAPIRequestData();
        request.act = LoginAPIRequestData.ACTION_LOGIN;
        LoginAPIRequestData.fillUser(request, loginUser);

        return this._getAppService(env).login(request);
    }

    sortTests = () => {
        this.testList.sort((a: ITestItem, b: ITestItem) => {

            if (this.sortBy == this.SORT_LOW_TIME_FIRST || this.sortBy == this.SORT_HIGH_TIME_FIRST) {
                if (Util.isDefined(a.endTime) && Util.isDefined(a.startTime) && Util.isDefined(b.endTime) && Util.isDefined(b.startTime)) {
                    var timeA = a.endTime - a.startTime;
                    var timeB = b.endTime - b.startTime;

                    if (timeA <= timeB) return (this.sortBy == this.SORT_HIGH_TIME_FIRST ? 1 : -1);
                    else return (this.sortBy == this.SORT_HIGH_TIME_FIRST ? -1 : 1);
                }
            }
            else if (this.sortBy == this.SORT_DEFAULT) {
                if (a.defaultOrder > b.defaultOrder) return 1;
                else return -1;
            }

            return 0;
        });
    }

    cancelTests = () => {
        Util.log('cancelTests', this.testSubscriptions);

        for (var i in this.testSubscriptions) {
            var sub = this.testSubscriptions[i];

            sub.unsubscribe();
        }

        this._init();
    }

    toggleViewDetails = (test: ITestItem) => {
        test.showDetails = !test.showDetails;
    }

    toggleViewResponse = (test: ITestItem) => {
        test.showResponse = !test.showResponse;
    }

    sendSearchDishRequest = (env, data): Promise<boolean> => {
        return new Promise<boolean>((resolve, reject) => {
            var testItem = this._initTestItem1(resolve, { env: env, title: `Search Dish API - ${data.menuType}` });

            var requestData = new SearchMenuAPIRequestData();
            requestData.coordinate = this.testCoordinate;
            requestData.proximity = this.proximity;
            requestData.page = 1;
            requestData.pageSize = Util.getRandomInt(this.pageSizeMin, this.pageSizeMax);

            Util.merge(requestData, data);

            var subscription = this._getAppService(env).searchDish(requestData).subscribe((successResponse) => {
                var isValidResponse = this._initTestItem2(testItem, successResponse);

                if (isValidResponse) {
                    var body = successResponse.json();

                    var attrs = ['Data'];

                    if (!Util.hasProperty(body, attrs)) {
                        testItem.failList.push(this.helper.makeMessage(this.helper.MSG_ATTR, { attrs: attrs }));
                    }
                    else {
                        testItem.passList.push(this.helper.makeMessage(this.helper.MSG_ATTR, { attrs: attrs }));

                        if (body.Data.length > requestData.pageSize) {
                            testItem.failList.push(this.helper.makeMessage(this.helper.MSG_PAGE_SIZE));
                        }
                        else {
                            testItem.passList.push(this.helper.makeMessage(this.helper.MSG_PAGE_SIZE));
                        }
                    }
                }

                this._initTestItem3(testItem, resolve);

                Util.log('searchDish', successResponse);
            }, (errorResponse) => {
                this._initTestItem2(testItem, errorResponse);

                this._initTestItem3(testItem, resolve);

                Util.log('searchDish Error', errorResponse);
            });

            this.testSubscriptions.push(subscription);
        });
    }

    sendSearchCuisineRequest = (env, data): Promise<boolean> => {
        return new Promise<boolean>((resolve, reject) => {
            var testItem = this._initTestItem1(resolve, { env: env, title: `Search Cuisine API - ${data.menuType}` });

            var requestData = new SearchMenuAPIRequestData();
            requestData.coordinate = this.testCoordinate;
            requestData.proximity = this.proximity;
            requestData.page = 1;
            requestData.pageSize = Util.getRandomInt(this.pageSizeMin, this.pageSizeMax);

            Util.merge(requestData, data);

            var subscription = this._getAppService(env).searchCuisine(requestData).subscribe((successResponse) => {
                var isValidResponse = this._initTestItem2(testItem, successResponse);

                if (isValidResponse) {
                    var body = successResponse.json();

                    var attrs = ['Data'];

                    if (!Util.hasProperty(body, attrs)) {
                        testItem.failList.push(this.helper.makeMessage(this.helper.MSG_ATTR, { attrs: attrs }));
                    }
                    else {
                        testItem.passList.push(this.helper.makeMessage(this.helper.MSG_ATTR, { attrs: attrs }));

                        if (body.Data.length > requestData.pageSize) {
                            testItem.failList.push(this.helper.makeMessage(this.helper.MSG_PAGE_SIZE));
                        }
                        else {
                            testItem.passList.push(this.helper.makeMessage(this.helper.MSG_PAGE_SIZE));
                        }
                    }
                }

                this._initTestItem3(testItem, resolve);

                Util.log('searchCuisine', successResponse);
            }, (errorResponse) => {
                this._initTestItem2(testItem, errorResponse);

                this._initTestItem3(testItem, resolve);

                Util.log('searchCuisine Error', errorResponse);
            });

            this.testSubscriptions.push(subscription);
        });
    }

    sendSearchRestRequest = (env, data): Promise<boolean> => {
        return new Promise<boolean>((resolve, reject) => {
            var testItem = this._initTestItem1(resolve, { env: env, title: `Search Restaurant API - ${data.menuType}` });

            var requestData = new SearchMenuAPIRequestData();
            requestData.coordinate = this.testCoordinate;
            requestData.proximity = this.proximity;
            requestData.page = 1;
            requestData.pageSize = Util.getRandomInt(this.pageSizeMin, this.pageSizeMax);

            Util.merge(requestData, data);

            var subscription = this._getAppService(env).searchRestaurant(requestData).subscribe((successResponse) => {
                var isValidResponse = this._initTestItem2(testItem, successResponse);

                if (isValidResponse) {
                    var body = successResponse.json();

                    var attrs = ['Data'];

                    if (!Util.hasProperty(body, attrs)) {
                        testItem.failList.push(this.helper.makeMessage(this.helper.MSG_ATTR, { attrs: attrs }));
                    }
                    else {
                        testItem.passList.push(this.helper.makeMessage(this.helper.MSG_ATTR, { attrs: attrs }));

                        if (body.Data.length > requestData.pageSize) {
                            testItem.failList.push(this.helper.makeMessage(this.helper.MSG_PAGE_SIZE));
                        }
                        else {
                            testItem.passList.push(this.helper.makeMessage(this.helper.MSG_PAGE_SIZE));
                        }
                    }
                }

                this._initTestItem3(testItem, resolve);

                Util.log('sendSearchRestRequest', successResponse);
            }, (errorResponse) => {
                this._initTestItem2(testItem, errorResponse);

                this._initTestItem3(testItem, resolve);

                Util.log('sendSearchRestRequest Error', errorResponse);
            });

            this.testSubscriptions.push(subscription);
        });
    }

    sendSearchAutoSuggestRequest = (env): Promise<boolean> => {
        return new Promise<boolean>((resolve, reject) => {
            var testItem = this._initTestItem1(resolve, { env: env, title: 'Search Auto Suggest API' });

            var requestData = new SearchMenuAPIRequestData();
            requestData.coordinate = this.testCoordinate;
            requestData.proximity = this.proximity;

            var subscription = this._getAppService(env).getAutoSuggestList(requestData).subscribe((successResponse) => {
                var isValidResponse = this._initTestItem2(testItem, successResponse);

                if (isValidResponse) {
                    var body = successResponse.json();

                    var attrs = [
                        'Cuisine',
                        'Dish',
                        'Restaurant',
                    ];

                    if (!Util.hasProperty(body, attrs)) {
                        testItem.failList.push(this.helper.makeMessage(this.helper.MSG_ATTR, { attrs: attrs }));
                    }
                    else {
                        testItem.passList.push(this.helper.makeMessage(this.helper.MSG_ATTR, { attrs: attrs }));
                    }
                }

                this._initTestItem3(testItem, resolve);

                Util.log('sendSearchAutoSuggestRequest', successResponse);
            }, (errorResponse) => {
                this._initTestItem2(testItem, errorResponse);

                this._initTestItem3(testItem, resolve);

                Util.log('sendSearchAutoSuggestRequest Error', errorResponse);
            });

            this.testSubscriptions.push(subscription);
        });
    }

    sendGlobalAPIRequest = (env): Promise<boolean> => {
        return new Promise<boolean>((resolve, reject) => {
            var testItem = this._initTestItem1(resolve, { env: env, title: 'Global API' });

            var requestData: any = {};
            requestData.m = 'mobile';

            var subscription = this._getAppService(env).getAppSettings(requestData).subscribe((successResponse) => {
                var isValidResponse = this._initTestItem2(testItem, successResponse);

                if (isValidResponse) {
                    var body = successResponse.json();

                    var attrs = [
                        'AboutText',
                        'PointSystem',
                        'PromotionSection',
                        'RefundPolicy',
                        'SoldOutActions',
                        'YourPointsText',
                    ];

                    if (!Util.hasProperty(body, attrs)) {
                        testItem.failList.push(this.helper.makeMessage(this.helper.MSG_ATTR, { attrs: attrs }));
                    }
                    else {
                        testItem.passList.push(this.helper.makeMessage(this.helper.MSG_ATTR, { attrs: attrs }));
                    }
                }

                this._initTestItem3(testItem, resolve);

                Util.log('sendGlobalAPIRequest', successResponse);
            }, (errorResponse) => {
                this._initTestItem2(testItem, errorResponse);

                this._initTestItem3(testItem, resolve);

                Util.log('sendGlobalAPIRequest Error', errorResponse);
            });

            this.testSubscriptions.push(subscription);
        });
    }


    /**
     * Correct Login Request
     */

    sendCorrectLoginRequest = (env): Promise<boolean> => {
        return new Promise<boolean>((resolve, reject) => {
            var testItem = this._initTestItem1(resolve, { env: env, title: 'Login API (Correct Credentials)' });

            var loginUser = this._getLogin(env);

            var subscription = this._sendLoginRequest(env, loginUser).subscribe((successResponse: IHttpResponse) => {
                var isValidResponse = this._initTestItem2(testItem, successResponse);

                if (isValidResponse) {
                    var body = successResponse.json();

                    var attrs = [
                        'Email',
                    ];

                    if (!Util.hasProperty(body, attrs)) {
                        testItem.failList.push(this.helper.makeMessage(this.helper.MSG_ATTR, { attrs: attrs }));
                    }
                    else {
                        testItem.passList.push(this.helper.makeMessage(this.helper.MSG_ATTR, { attrs: attrs }));

                        if (body.Email != loginUser.UserName) {
                            testItem.failList.push(this.helper.makeMessage(this.helper.MSG_ATTR_CORRECT_VALUE, { attrs: ['Email'] }));
                        }
                        else {
                            testItem.passList.push(this.helper.makeMessage(this.helper.MSG_ATTR_CORRECT_VALUE, { attrs: ['Email'] }));
                        }
                    }
                }

                this._initTestItem3(testItem, resolve);

            }, (errorResponse) => {
                this._initTestItem2(testItem, errorResponse);

                this._initTestItem3(testItem, resolve);
            });

            this.testSubscriptions.push(subscription);
        });
    }

    /**
     * Wrong Login Request
     */

    sendWrongLoginRequest = (env): Promise<boolean> => {
        return new Promise<boolean>((resolve, reject) => {
            var testItem = this._initTestItem1(resolve, { env: env, title: 'Login API (Wrong Credentials)' });

            var loginUser = new User();
            loginUser.UserName = 'random-example@menus.com';
            loginUser.Password = 'random-password';

            var subscription = this._sendLoginRequest(env, loginUser).subscribe(successResponse => {
                var isValidResponse = this._initTestItem2(testItem, successResponse);

                if (isValidResponse) {
                    var body = successResponse.json();

                    var attrs = [
                        'Code',
                    ];

                    if (!Util.hasProperty(body, attrs)) {
                        testItem.failList.push(this.helper.makeMessage(this.helper.MSG_ATTR, { attrs: attrs }));
                    }
                    else {
                        testItem.passList.push(this.helper.makeMessage(this.helper.MSG_ATTR, { attrs: attrs }));

                        if (body.Code != 'INVALID_USER') {
                            testItem.failList.push(this.helper.makeMessage(this.helper.MSG_ATTR_CORRECT_VALUE, { attrs: ['Code'] }));
                        }
                        else {
                            testItem.passList.push(this.helper.makeMessage(this.helper.MSG_ATTR_CORRECT_VALUE, { attrs: ['Code'] }));
                        }
                    }
                }

                this._initTestItem3(testItem, resolve);

            }, (errorResponse) => {
                this._initTestItem2(testItem, errorResponse);

                this._initTestItem3(testItem, resolve);
            });

            this.testSubscriptions.push(subscription);
        });
    }
}