import { Component, Input, Output, EventEmitter, ViewChild, NgZone } from '@angular/core';
import { Router } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

// Shared Helpers
import { Util } from '../../../../shared/util';
import { Constants } from "../../../../shared/constants";

// RO Models
import { ROAPIRequestData } from '../../models/ro-api-request-data';
import { Restaurant } from "../../models/restaurant";

// Shared Services
import { PathService as Path } from '../../../../shared/services/path.service';

// RO Services
import { ROService } from '../../services/ro.service';

// RO Shared Components
import { MenuItemPreviewModalComponent } from '../../components/menu-item-preview-modal/menu-item-preview-modal.component';

// 3rd Party Libs
import { ToastsManager } from "ng2-toastr/ng2-toastr";
import * as _ from "lodash";

declare var google, Chart;

interface OtherRest {
    FireFlyID?: string;
    Name?: string;
    rest?: Restaurant;
    marker?: any;
    // chartInfo?: any;
    chartCompareInfo?: any;
    chartCuisineType?: any;
    chartMenuCompetition?: any;
    chartMissingMenu?: any;
    chartSegmentType?: any;
    chartRestType?: any;
}

interface MakeChartParams {
    identifierKey: string;
    allowOthers: boolean;
    allowAll: boolean;
    unionByOtherRests: boolean;
    yourItemListKey: string;
    restItemListKey: string;
    yoursValueColumnKey: string;
    othersValueColumnKey: string;
    allValueColumnKey: string;
    labelColumnKey: string;
}

@Component({
    selector: 'restaurant-menu-sense',
    templateUrl: './restaurant-menu-sense.component.html',
    providers: []
})
export class RestaurantMenuSenseComponent {
    LOG_TAG = 'RestaurantMenuSenseComponent =>';

    REST_ICON = 'img/ro/restaurant-map-orange.svg';
    OTHER_REST_ICON = 'img/ro/customer-map.svg';
    OTHER_REST_ACTIVE_ICON = 'img/ro/customer-map-orange.svg';

    busy = false;
    busyChartCompare = false;
    busyChartRestType = false;
    busyChartSegmentType = false;
    busyChartCuisineType = false;
    busyChartMissingMenu = false;
    busyChartMenuCompetition = false;
    proximity = 3;

    mapInfo = <any>{};
    mapInfoWindow = null;
    mapSelectedRestMarkers = [];

    otherRests = new Array<OtherRest>();

    chartInfo = {
        MenuCounts: <any>{},
        // RestType: <any>[],
        SegmentType: <any>[],
    };

    chartCompareInfo = <any>{
        Pagination: {
            TotalRow: 0
        }
    };

    chartCuisineType = <any>{
        Pagination: {
            TotalRow: 0
        }
    };

    chartMenuCompetition = <any>{
        Pagination: {
            TotalRow: 0
        }
    };

    chartMenuCompetitionSums = [];
    chartMenuCompetitionData: any;

    chartMissingMenu = <any>{
        Pagination: {
            TotalRow: 0
        }
    };

    otherChartCompareInfo = [];

    itemCompareChart = {
        pageSize: 25,
        chartObject: null
    };

    cuisineTypeChart = {
        pageSize: 25,
        chartObject: null
    };

    menuCompetitionChart = {
        pageSize: 25,
        chartObject: null
    };

    missingMenuChart = {
        pageSize: 25,
        chartObject: null
    };

    // restTypeChart = {
    //     labels: [],
    //     bgColors: [],
    //     chartObject: null
    // };

    // segmentTypeChart = {
    //     labels: [],
    //     bgColors: [],
    //     chartObject: null
    // };

    chartSegmentType: any;
    segmentTypeChartList = [];

    chartRestType: any;
    restTypeChartList = [];

    @Input() fireFlyID: string;
    @Input() rest: Restaurant;

    constructor(private ROService: ROService, public constants: Constants, private router: Router, private toastr: ToastsManager, private zone: NgZone) {
        Util.log(this.LOG_TAG, 'constructor', this.fireFlyID);
    }

    errorOnlineOrderingNotEnabled = () => {
        this.toastr.error('Online ordering is not enabled. You need to enable it first...', 'Error!');
    }

    ngOnInit() {
        Util.log(this.LOG_TAG, 'ngOnInit', this.fireFlyID);

        this.loadData();
    }

    loadData = () => {
        this.busy = true;

        var requestData = new ROAPIRequestData();
        requestData.ff = this.fireFlyID;
        requestData.proximity = this.proximity;

        // Get Rest Info
        var restInfoPromise = this.ROService.getRestInfo(Util.clone(requestData));

        // Get Chart Map Info
        var chartMapInfoPromise = this.ROService.getChartMapInfo(Util.clone(requestData));

        // Get Chart Menu Count
        var chartMenuCountPromise = this.ROService.getChartMenuCount(Util.clone(requestData));

        // Rest Type
        var restTypePromise = this.ROService.getChartRestType(Util.clone(requestData));

        // Segment
        var segmentPromise = this.ROService.getChartSegments(Util.clone(requestData));

        Observable.forkJoin([

            restInfoPromise,
            chartMapInfoPromise,
            this.loadChartItemCompareDataPromise(this.fireFlyID),
            chartMenuCountPromise,
            restTypePromise,
            segmentPromise,
            this.loadChartCuisineTypeDataPromise(this.fireFlyID),
            this.loadChartMenuCompetitionDataPromise(this.fireFlyID),
            this.loadChartMissingMenuDataPromise(this.fireFlyID),

        ]).subscribe(response => {
            var i = 0;

            // Rest Info
            var restInfo: any = response[i++];
            this.rest = restInfo.Data;

            // Chart Map Info
            this.mapInfo = response[i++];

            // Chart Compare Info
            this.chartCompareInfo = response[i++];

            // Chart Menu Count
            this.chartInfo.MenuCounts = response[i++];

            // Rest Type
            this.chartRestType = response[i++];

            // Segments
            this.chartSegmentType = response[i++];

            // Cusines
            this.chartCuisineType = response[i++];

            // Menu Competition
            this.chartMenuCompetition = response[i++];

            // Missing Menu
            this.chartMissingMenu = response[i++];

            this.busy = false;

            Util.log(this.LOG_TAG, 'loadChartsTab', response);

            this.initMapAndCharts();
        });

        Util.log(this.LOG_TAG, 'Chart JS', typeof Chart);
    }

    loadOtherRestData = (otherRest: OtherRest) => {
        Util.log(this.LOG_TAG, 'loadOtherRestData', otherRest.FireFlyID);

        var requestData = new ROAPIRequestData();
        requestData.ff = otherRest.FireFlyID;
        requestData.proximity = this.proximity;

        this.busyChartCompare = true;
        this.busyChartRestType = true;
        this.busyChartSegmentType = true;
        this.busyChartCuisineType = true;
        this.busyChartMissingMenu = true;
        this.busyChartMenuCompetition = true;

        Observable.forkJoin([
            this.loadChartItemCompareDataPromise(otherRest.FireFlyID),
            this.ROService.getChartRestType(Util.clone(requestData)),
            this.ROService.getChartSegments(Util.clone(requestData)),
            this.loadChartCuisineTypeDataPromise(otherRest.FireFlyID),
            this.loadChartMenuCompetitionDataPromise(otherRest.FireFlyID),
            this.loadChartMissingMenuDataPromise(otherRest.FireFlyID),
        ]).subscribe(response => {

            var i = 0;

            // Chart Compare Info
            otherRest.chartCompareInfo = response[i++];

            // Rest Type
            otherRest.chartRestType = response[i++];

            // Segments
            otherRest.chartSegmentType = response[i++];
            // this.chartSegmentTypesList.push({
            //     Data: otherRest.chartSegmentType
            // });

            // Cusines
            otherRest.chartCuisineType = response[i++];

            // Menu Competition
            otherRest.chartMenuCompetition = response[i++];

            // Missing Menu
            otherRest.chartMissingMenu = response[i++];

            Util.log(this.LOG_TAG, 'loadOtherRestData', response);

            this.loadOtherRestCharts();
        });
    }

    loadOtherRestCharts = () => {
        setTimeout(() => {

            // this.initMap();

            this.initItemCompareChart();

            this.initCuisineTypeChart();

            this.initRestTypeChart();

            this.initSegmentTypeChart();

            this.initMissingMenuChart();

            this.initMenuCompetitionBarChart();

        }, 500);
    }

    private loadChartItemCompareDataPromise = (fireFlyID) => {
        var requestData = new ROAPIRequestData();
        requestData.ff = fireFlyID;
        requestData.proximity = this.proximity;
        // requestData.ps = this.itemCompareChart.pageSize;

        // Get Chart Compare Info
        var chartComparePromise = this.ROService.getChartCompareInfo(requestData);

        return chartComparePromise;
    }

    loadChartItemCompareData = () => {
        this.busy = true;

        this.loadChartItemCompareDataPromise(this.fireFlyID).subscribe(response => {
            // Chart Compare Info
            this.chartCompareInfo = response;

            this.busy = false;

            this.initItemCompareChart();
        });
    }

    loadChartCuisineTypeDataPromise = (fireFlyID) => {
        var requestData = new ROAPIRequestData();
        requestData.ff = fireFlyID;
        requestData.proximity = this.proximity;

        return this.ROService.getChartCuisines(requestData);
    }

    loadChartCuisineTypeData = () => {
        this.busy = true;

        this.loadChartCuisineTypeDataPromise(this.fireFlyID).subscribe(response => {
            // Chart Compare Info
            this.chartCuisineType = response;

            this.busy = false;

            this.initCuisineTypeChart();
        });
    }

    loadChartMenuCompetitionDataPromise = (fireFlyID) => {
        var requestData = new ROAPIRequestData();
        requestData.ff = fireFlyID;
        requestData.proximity = this.proximity;
        requestData.ps = this.menuCompetitionChart.pageSize;

        // Menu Competition
        return this.ROService.getChartMenuComparison(requestData);
    }

    loadChartMenuCompetitionData = () => {
        this.busy = true;

        this.loadChartMenuCompetitionDataPromise(this.fireFlyID).subscribe(response => {
            // Chart Menu Competition
            this.chartMenuCompetition = response;

            this.busy = false;

            this.initMenuCompetitionBarChart();
        });
    }

    loadChartMissingMenuDataPromise = (fireFlyID) => {
        var requestData = new ROAPIRequestData();
        requestData.ff = fireFlyID;
        requestData.proximity = this.proximity;
        requestData.ps = this.missingMenuChart.pageSize;

        // Missing Menu
        return this.ROService.getChartMissingMenu(Util.clone(requestData));
    }

    loadChartMissingMenuData = () => {
        this.busy = true;

        this.loadChartMissingMenuDataPromise(this.fireFlyID).subscribe(response => {
            // Chart Compare Info
            this.chartMissingMenu = response;

            this.busy = false;

            this.initMissingMenuChart();
        });
    }

    initMapAndCharts = () => {
        setTimeout(() => {

            this.initMap();

            this.initItemCompareChart();

            this.initRestTypeChart();

            this.initCuisineTypeChart();

            this.initSegmentTypeChart();

            this.initMenuCompetitionBarChart();

            this.initMissingMenuChart();

        }, 500);
    }

    initMap = () => {
        var yourCoordinates = this.mapInfo.YourCoordinate;
        var otherCoordinates = this.mapInfo.OthersCoordinate;

        Util.log(this.LOG_TAG, 'yourCoordinates', yourCoordinates);

        var latLng = {
            lat: yourCoordinates.Latitude,
            lng: yourCoordinates.Longitude,
        };

        var mapOptions = Util.clone(this.constants.DEFAULT_MAP_OPTIONS);
        mapOptions.center = latLng;
        mapOptions.scrollwheel = false;
        mapOptions.disableDoubleClickZoom = true;
        mapOptions.zoomControl = true;

        var chartsMap = document.getElementById('charts-map');

        if (chartsMap) {

            var map = new google.maps.Map(chartsMap, mapOptions);

            new google.maps.Marker({
                position: latLng,
                map: map,
                icon: {
                    url: this.REST_ICON,
                    size: new google.maps.Size(40, 40),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(20, 21)
                },
                zIndex: 101,
            });

            // Add markers to map if it is a browser
            for (var i = 0; i < otherCoordinates.length; i++) {
                var coordinate = otherCoordinates[i];

                // Check if Rest is Already Active
                var temp = this.otherRests.filter(a => a.FireFlyID == coordinate.FireFlyID);
                var otherRest: OtherRest = null;
                if (temp.length > 0) {
                    otherRest = temp[0];
                }

                var marker = new google.maps.Marker({
                    position: { lat: parseFloat(coordinate.Latitude), lng: parseFloat(coordinate.Longitude) },
                    map: map,
                    icon: otherRest ? this.OTHER_REST_ACTIVE_ICON : this.OTHER_REST_ICON,
                    zIndex: this.constants.REST_MARKER_ZINDEX,
                    data: { coordinate: coordinate },
                });

                var _context = this;

                marker.addListener('click', function () {
                    _context._onRestMarkerClick(this);
                });

                marker.addListener('mouseover', function () {
                    _context._onRestMarkerOver(this, map);
                });

                // marker.addListener('mouseout', function () {
                //     _context._onRestMarkerOut(this);
                // });
            }

            // Add circle overlay and bind to marker
            var circle = new google.maps.Circle({
                map: map,
                center: latLng,
                radius: Util.getMetersByMiles(this.proximity),    // Converting miles to meters
                strokeColor: this.constants.colors.brandSuccess,
                strokeOpacity: 1,
                strokeWeight: 3,
                fillColor: this.constants.colors.brandSuccess,
                fillOpacity: 0.19,
            });
        }
    }

    private _onRestMarkerClick = (marker) => {
        if (!Util.isDefined(this.rest.EnableOnlineOrdering)) {
            this.errorOnlineOrderingNotEnabled();
        }
        else {
            var fireFlyID = marker.data.coordinate.FireFlyID;

            var otherRest: OtherRest;
            var list = this.otherRests.filter(r => r.FireFlyID == fireFlyID);

            if (list.length > 0) {
                otherRest = list[0];
            }

            if (!otherRest) {

                if (this.otherRests.length < this.constants.MAX_REST_SELECTION_LIMIT) {
                    marker.setIcon(this.OTHER_REST_ACTIVE_ICON);

                    otherRest = {};
                    Util.merge(otherRest, marker.data.coordinate);
                    otherRest.marker = marker;

                    this.otherRests.push(otherRest);

                    this.zone.run(() => {
                        this.loadOtherRestData(otherRest);
                    });
                }
                else {
                    this.toastr.error(`You can select max ${this.constants.MAX_REST_SELECTION_LIMIT} restaurants at a time.`, 'Error!');
                }
            }
            else {
                marker.setIcon(this.OTHER_REST_ICON);

                var index = this.otherRests.indexOf(otherRest);

                if (index > -1) {
                    this.otherRests.splice(index, 1);
                }

                this.loadOtherRestCharts();
            }
        }

        Util.log(this.LOG_TAG, '_onRestMarkerClick', index);
    }

    private _onRestInfoWindowClick = (marker) => {
        Util.log(this.LOG_TAG, '_onRestMarkerClick', marker);

        if (!Util.isDefined(this.rest.EnableOnlineOrdering)) {
            this.errorOnlineOrderingNotEnabled();
        }
        else {
            this.zone.run(() => {
                this.router.navigate([`${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`, this.fireFlyID, Path.RO.PREVIEW, marker.data.coordinate.FireFlyID]);
            });
        }
    }

    private _onRestMarkerOver = (marker, map) => {
        Util.log(this.LOG_TAG, '_onRestMarkerOver', marker);

        marker.setZIndex(this.constants.ACTIVE_REST_MARKER_ZINDEX);

        if (this.mapInfoWindow) {
            if (this.mapInfoWindow.contentDIV) {
                // this.mapInfoWindow.contentDIV.removeEventListener('click');
            }
            this.mapInfoWindow.close();
        }

        this.mapInfoWindow = new google.maps.InfoWindow();

        this.mapInfoWindow.setPosition(marker.getPosition());
        this.mapInfoWindow.setOptions({
            pixelOffset: new google.maps.Size(0, -30)
        });

        var contentDIV = document.createElement('div');
        contentDIV.style.cursor = 'pointer';

        var innerHTML = '';

        if (marker.data.coordinate.RestLogo) {
            innerHTML += `<div style="float: left; width: 60px; height: 60px; background: url('${this.constants.SERVER_URL}/${marker.data.coordinate.RestLogo}'); background-repeat: no-repeat; background-size: contain; background-position: center;"></div>`;
        }
        else {
            innerHTML += `<div style="float: left; padding: 10px; background-color: rgba(69, 90, 100, 0.05);"><div style="width: 40px; height: 40px; background: url('img/ro/photo-placeholder.svg'); background-repeat: no-repeat; background-size: contain; background-position: center;"></div></div>`;
        }

        innerHTML += `<h3 style="float: left; padding-left: 10px; margin-top: 15px;">${marker.data.coordinate.Name}</h3>`;

        contentDIV.innerHTML = innerHTML;

        this.mapInfoWindow.setContent(contentDIV);
        this.mapInfoWindow.open(map);

        contentDIV.addEventListener('click', () => {
            this._onRestInfoWindowClick(marker);
        });

        this.mapInfoWindow.contentDIV = contentDIV;
    }

    private _onRestMarkerOut = (marker, infoWindow) => {
        Util.log(this.LOG_TAG, '_onRestMarkerOut', marker);

        marker.setZIndex(this.constants.REST_MARKER_ZINDEX);

        infoWindow.close();
    }

    private makeChartData = (params: MakeChartParams) => {
        // debugger;
        var allItemList = [];
        var allRestItemList = [];
        var yourItemList = <Array<any>>_.get(this, params.yourItemListKey);

        allItemList = _.unionBy(allItemList, yourItemList, params.identifierKey);
        allRestItemList.push({
            label: 'Your menu',
            list: yourItemList,
        });

        for (var otherRestIndex in this.otherRests) {
            var otherRest = this.otherRests[otherRestIndex];

            var restItemList = _.get(otherRest, params.restItemListKey);

            if (params.unionByOtherRests) {
                allItemList = _.unionBy(allItemList, restItemList, params.identifierKey);
            }
            allRestItemList.push({
                label: otherRest.Name,
                list: restItemList,
            });
        }

        var labels = [];
        var restsLinePoints = [];

        for (var i in allItemList) {
            var item = allItemList[i];

            labels.push(item[params.labelColumnKey]);

            for (var allRestDishListIndex in allRestItemList) {
                var restDishItem = allRestItemList[allRestDishListIndex];

                if (parseInt(i) == 0) {
                    restsLinePoints[allRestDishListIndex] = {
                        label: restDishItem.label,
                        yoursList: [],
                        othersList: [],
                        allList: [],
                    }
                }

                var temp = restDishItem.list.filter(a => a[params.identifierKey] == item[params.identifierKey]);
                var foundItem = null;
                if (temp.length > 0) {
                    foundItem = temp[0];
                }

                if (foundItem) {
                    restsLinePoints[allRestDishListIndex].yoursList.push(_.get(foundItem, params.yoursValueColumnKey) || 0);
                    if (params.allowOthers) {
                        restsLinePoints[allRestDishListIndex].othersList.push(_.get(foundItem, params.othersValueColumnKey) || 0);
                    }
                    if (params.allowAll) {
                        restsLinePoints[allRestDishListIndex].allList.push(_.get(foundItem, params.allValueColumnKey) || 0);
                    }
                }
                else {
                    restsLinePoints[allRestDishListIndex].yoursList.push(0);
                    if (params.allowOthers) {
                        restsLinePoints[allRestDishListIndex].othersList.push(0);
                    }
                    if (params.allowAll) {
                        restsLinePoints[allRestDishListIndex].allList.push(0);
                    }
                }

            }

        }

        var datasets = [];
        var colorIndex = 0;

        for (var restsLinePointsIndex in restsLinePoints) {
            var item = restsLinePoints[restsLinePointsIndex];

            var color = this.constants.chartColorsArray[colorIndex++];

            datasets.push({
                label: item.label,
                fill: false,
                backgroundColor: color,
                borderColor: color,
                data: item.yoursList,
                cubicInterpolationMode: 'default',
            });

            if (parseInt(restsLinePointsIndex) == 0) {

                if (params.allowOthers) {
                    color = this.constants.chartColorsArray[colorIndex++];

                    datasets.push({
                        label: `Other surrounding ${this.rest.Cuisine} `,
                        fill: false,
                        backgroundColor: color,
                        borderColor: color,
                        data: item.othersList,
                        cubicInterpolationMode: 'default',
                    });
                }

                if (params.allowAll) {
                    color = this.constants.chartColorsArray[colorIndex++];

                    datasets.push({
                        label: `All ` + item.othersList.length,
                        fill: false,
                        backgroundColor: color,
                        borderColor: color,
                        data: item.allList,
                        cubicInterpolationMode: 'default',
                    });
                }
            }
        }

        var data = {
            labels: labels,
            datasets: datasets
        };

        return data;
    }

    initItemCompareChart = () => {
        // NEW LOGIC
        // var allDishList = [];
        // var allRestDishList = [];
        // var yourDishList = <Array<any>>this.chartCompareInfo.Data;

        // allDishList = _.unionBy(allDishList, yourDishList, 'id');
        // allRestDishList.push({
        //     label: 'Yours',
        //     list: yourDishList,
        // });

        // for (var otherRestIndex in this.otherRests) {
        //     var otherRest = this.otherRests[otherRestIndex];

        //     var restDishList = otherRest.chartCompareInfo.Data;

        //     allDishList = _.unionBy(allDishList, restDishList, 'id');
        //     allRestDishList.push({
        //         label: otherRest.Name,
        //         list: restDishList,
        //     });
        // }

        // var labels = [];
        // var restsLinePoints = [];

        // for (var i in allDishList) {
        //     var dishItem = allDishList[i];

        //     labels.push(dishItem.Name);

        //     for (var allRestDishListIndex in allRestDishList) {
        //         var restDishItem = allRestDishList[allRestDishListIndex];

        //         if (parseInt(i) == 0) {
        //             restsLinePoints[allRestDishListIndex] = {
        //                 label: restDishItem.label,
        //                 yoursList: [],
        //                 othersList: [],
        //             }
        //         }

        //         var temp = restDishItem.list.filter(a => a.id == dishItem.id);
        //         var foundDish = null;
        //         if (temp.length > 0) {
        //             foundDish = temp[0];
        //         }

        //         if (foundDish) {
        //             restsLinePoints[allRestDishListIndex].yoursList.push(foundDish.Yours.AvgPrice || 0);
        //             restsLinePoints[allRestDishListIndex].othersList.push(foundDish.Others.AvgPrice || 0);
        //         }
        //         else {
        //             restsLinePoints[allRestDishListIndex].yoursList.push(0);
        //             restsLinePoints[allRestDishListIndex].othersList.push(0);
        //         }

        //     }

        // }

        // var datasets = [];
        // var colorIndex = 0;

        // for (var restsLinePointsIndex in restsLinePoints) {
        //     var item = restsLinePoints[restsLinePointsIndex];

        //     var color = this.constants.chartColorsArray[colorIndex++];

        //     datasets.push({
        //         label: item.label + '  ' + item.yoursList.length,
        //         fill: false,
        //         backgroundColor: color,
        //         borderColor: color,
        //         data: item.yoursList,
        //         cubicInterpolationMode: 'default',
        //     });

        //     if (parseInt(restsLinePointsIndex) == 0) {
        //         color = this.constants.chartColorsArray[colorIndex++];

        //         datasets.push({
        //             label: 'Others  ' + item.othersList.length,
        //             fill: false,
        //             backgroundColor: color,
        //             borderColor: color,
        //             data: item.othersList,
        //             cubicInterpolationMode: 'default',
        //         });
        //     }
        // }


        // OLD LOGIC
        // allDishList = yourDishList.map(function (a) {
        //     return {
        //         id: a.id,
        //         Name: a.Name
        //     }
        // });

        // allDishList.push({
        //     name: 'Yours',
        //     list: yourDishList
        // });

        // // Other Rest
        // for (var otherRestIndex in this.otherRests) {
        //     var otherRest = this.otherRests[otherRestIndex];

        //     var dishList = otherRest.chartCompareInfo.Data;

        //     allDishList.push({
        //         name: otherRest.Name,
        //         list: dishList,
        //     });
        // }

        // for (var dishListIndex in allDishList) {
        //     var dishList = allDishList[dishListIndex];

        //     for (var dishItemIndex in dishList.list) {
        //         var dishItem = dishList.list[dishItemIndex];

        //         var list = chartDishList.filter(a => a.id == dishItem.id);

        //         if (list.length > 0) {
        //             var item = list[0];


        //         }
        //         else {
        //             chartDishList.push({
        //                 id: dishItem.id,
        //                 name: dishItem.Name,
        //             })
        //         }
        //     }
        // }


        // var labels = [];




        // var dishList = this.chartCompareInfo.Data;
        // for (var i in dishList) {
        //     var item = dishList[i];

        //     labels.push(item.Name);
        //     yoursLinePoints.push(item.Yours.AvgPrice || 0);

        //     if (loadOthers) {
        //         othersLinePoints.push(item.Others.AvgPrice || 0);
        //     }
        // }

        // var datasets = [
        //     {
        //         label: "Yours",
        //         fill: false,
        //         backgroundColor: this.constants.chartColors.red,
        //         borderColor: this.constants.chartColors.red,
        //         data: yoursLinePoints,
        //         cubicInterpolationMode: 'default',
        //     }
        // ];

        // if (loadOthers) {
        //     datasets.push({
        //         label: "Others",
        //         fill: false,
        //         backgroundColor: this.constants.chartColors.blue,
        //         borderColor: this.constants.chartColors.blue,
        //         data: othersLinePoints,
        //         cubicInterpolationMode: 'default',
        //     });
        // }

        // // Other Rest
        // for (var otherRestIndex in this.otherRests) {
        //     var otherRest = this.otherRests[otherRestIndex];

        //     var dishList = otherRest.chartCompareInfo.Data;
        //     var otherRestLinePoints = [];

        //     for (var dishIndex in dishList) {
        //         var item = dishList[dishIndex];
        //         otherRestLinePoints.push(item.Yours.AvgPrice || 0);
        //     }

        //     var color = this.constants.chartColorsArray[parseInt(otherRestIndex) + 1];

        //     datasets.push({
        //         label: otherRest.Name,
        //         fill: false,
        //         backgroundColor: color,
        //         borderColor: color,
        //         data: otherRestLinePoints,
        //         cubicInterpolationMode: 'default',
        //     });
        // }

        if (Util.isDefined(this.itemCompareChart.chartObject)) {
            this.itemCompareChart.chartObject.destroy();
        }

        var ctx = document.getElementById("item-compare-chart");

        // var data = {
        //     labels: labels,
        //     datasets: datasets
        // };

        var data = this.makeChartData({
            identifierKey: 'id',
            allowOthers: true,
            allowAll: true,
            unionByOtherRests: false,
            yourItemListKey: 'chartCompareInfo.Data',
            restItemListKey: 'chartCompareInfo.Data',
            yoursValueColumnKey: 'Yours.AvgPrice',
            othersValueColumnKey: 'Others.AvgPrice',
            allValueColumnKey: 'All.AvgPrice',
            labelColumnKey: 'Name',
        });

        this.itemCompareChart.chartObject = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    animateScale: true
                },
                tooltips: {
                    callbacks: {
                        label: (tooltipItems, data) => {
                            return ` $${tooltipItems.yLabel}`;
                        }
                    }
                }
            }
        });

        this.busyChartCompare = false;
    }


    initCuisineTypeChart = () => {
        // NEW Logic
        // var allList = [];
        // var allRestList = [];
        // var yourList = <Array<any>>this.chartCuisineType.Data;

        // allList = _.unionBy(allList, yourList, 'CuisineID');
        // allRestList.push({
        //     label: 'Yours',
        //     list: yourList,
        // });

        // for (var otherRestIndex in this.otherRests) {
        //     var otherRest = this.otherRests[otherRestIndex];

        //     var cuisineList = otherRest.chartCuisineType.Data;

        //     allList = _.unionBy(allList, cuisineList, 'CuisineID');
        //     allRestList.push({
        //         label: otherRest.Name,
        //         list: cuisineList,
        //     });
        // }

        // var labels = [];
        // var restsLinePoints = [];

        // for (var i in allList) {
        //     var cuisineItem = allList[i];

        //     labels.push(cuisineItem.CuisineName);

        //     for (var allRestCuisineListIndex in allRestList) {
        //         var restDishItem = allRestList[allRestCuisineListIndex];

        //         if (parseInt(i) == 0) {
        //             restsLinePoints[allRestCuisineListIndex] = {
        //                 label: restDishItem.label,
        //                 yoursList: [],
        //                 othersList: [],
        //             }
        //         }

        //         var temp = restDishItem.list.filter(a => a.CuisineID == cuisineItem.CuisineID);
        //         var foundDish = null;
        //         if (temp.length > 0) {
        //             foundDish = temp[0];
        //         }

        //         if (foundDish) {
        //             restsLinePoints[allRestCuisineListIndex].yoursList.push(foundDish.Inc_Percent || 0);
        //             // restsLinePoints[allRestCuisineListIndex].othersList.push(foundDish.Inc_Percent || 0);
        //         }
        //         else {
        //             restsLinePoints[allRestCuisineListIndex].yoursList.push(0);
        //             // restsLinePoints[allRestCuisineListIndex].othersList.push(0);
        //         }
        //     }
        // }

        // var datasets = [];
        // var colorIndex = 0;

        // for (var restsLinePointsIndex in restsLinePoints) {
        //     var item = restsLinePoints[restsLinePointsIndex];

        //     var color = this.constants.chartColorsArray[colorIndex++];

        //     datasets.push({
        //         label: item.label + '  ' + item.yoursList.length,
        //         fill: false,
        //         backgroundColor: color,
        //         borderColor: color,
        //         data: item.yoursList,
        //         cubicInterpolationMode: 'default',
        //     });

        //     // if (parseInt(restsLinePointsIndex) == 0) {
        //     //     color = this.constants.chartColorsArray[colorIndex++];

        //     //     datasets.push({
        //     //         label: 'Others  ' + item.othersList.length,
        //     //         fill: false,
        //     //         backgroundColor: color,
        //     //         borderColor: color,
        //     //         data: item.othersList,
        //     //         cubicInterpolationMode: 'default',
        //     //     });
        //     // }
        // }

        // OLD Logic
        // var labels = [];
        // var yours = [];
        // var colors = [];

        // var cuisineTypes = this.chartInfo.CusineType.Data;
        // var cuisineTypesLength = cuisineTypes.length;

        // for (var i in cuisineTypes) {
        //     var cuisineType = cuisineTypes[i];

        //     if (cuisineType.CuisineID == this.rest.CuisineID) {
        //         // blue color
        //         colors.push(this.constants.chartColors.blue);
        //     }
        //     else {
        //         // red color
        //         colors.push(this.constants.chartColors.red);
        //     }

        //     labels.push(cuisineType.CuisineName);
        //     yours.push(cuisineType.Inc_Percent);
        // }

        // var data = {
        //     labels: labels,
        //     datasets: datasets
        // };

        if (Util.isDefined(this.cuisineTypeChart.chartObject)) {
            this.cuisineTypeChart.chartObject.destroy();
        }

        var ctx = document.getElementById("cuisine-type-chart");

        var data = this.makeChartData({
            identifierKey: 'CuisineID',
            allowOthers: false,
            allowAll: false,
            unionByOtherRests: true,
            yourItemListKey: 'chartCuisineType.Data',
            restItemListKey: 'chartCuisineType.Data',
            yoursValueColumnKey: 'Inc_Percent',
            othersValueColumnKey: '',
            allValueColumnKey: '',
            labelColumnKey: 'CuisineName',
        });

        this.cuisineTypeChart.chartObject = new Chart(ctx, {
            type: 'horizontalBar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                // legend: {
                //     display: false
                // },
                tooltips: {
                    callbacks: {
                        label: (tooltipItems, data) => {
                            return ` ${tooltipItems.xLabel}%`;
                        }
                    }
                },
            }
        });

        this.busyChartCuisineType = false;
    }

    initMenuCompetitionBarChart = () => {
        // var labels = [];
        // var yours = [];
        // var others = [];

        // var menuCompetitions = this.chartInfo.MenuCompetition.Data;

        // var menuCompetitionsLength = menuCompetitions.length;
        // for (var i in menuCompetitions) {
        //     var menuCompetition = menuCompetitions[i];

        //     labels.push(menuCompetition.DishName);
        //     yours.push(menuCompetition.Yours_Percent);
        //     others.push(menuCompetition.Others_Percent);
        // }

        // var data = {
        //     labels: labels,
        //     datasets: [
        //         {
        //             label: "Yours",
        //             borderColor: this.constants.chartColors.red,
        //             data: yours,
        //         },
        //         {
        //             label: "Others",
        //             borderColor: this.constants.chartColors.blue,
        //             data: others,
        //         }
        //     ]
        // };

        var data = this.makeChartData({
            identifierKey: 'id',
            allowOthers: true,
            allowAll: false,
            unionByOtherRests: true,
            yourItemListKey: 'chartMenuCompetition.Data',
            restItemListKey: 'chartMenuCompetition.Data',
            yoursValueColumnKey: 'Yours_Percent',
            othersValueColumnKey: 'Others_Percent',
            allValueColumnKey: '',
            labelColumnKey: 'DishName',
        });

        // Util.log('chartMenuCompetition', data);
debugger;
        this.chartMenuCompetitionData = data;

        this.chartMenuCompetitionSums = [];


        var newDatasets = [];

        for (var i in data.datasets) {
            var dataset = data.datasets[i];

            var newDataset = {
                label: dataset.label,
                fill: false,
                backgroundColor: this.constants.chartColorsArray[parseInt(i) + 2],
                borderColor: this.constants.chartColorsArray[parseInt(i) + 2],
                data: [],
                cubicInterpolationMode: 'default',
            };

            newDatasets.push(newDataset);

            var sum = 0;

            for (var j in dataset.data) {
                var number = dataset.data[j];
                sum += number;
            }

            dataset.sum = Util.round(sum);

            for (var j in dataset.data) {
                var number = dataset.data[j];

                newDataset.data.push(number / dataset.sum);
            }

            // for (var j in dataset.data) {
            //     var number = dataset.data[j];

            //     this.chartMenuCompetitionSums.push({
            //         label: data.labels[j],
            //         sum: Util.round(sum),
            //         max: number + '/' + sum,
            //         rPoint: Util.round(number / sum)
            //     });
            // }
        }

        // data.datasets = data.datasets.concat(newDatasets);
        data.datasets = newDatasets;

        this.chartMenuCompetitionData = data;

        Util.log('chartMenuCompetitionData', this.chartMenuCompetitionData);

        if (Util.isDefined(this.menuCompetitionChart.chartObject)) {
            this.menuCompetitionChart.chartObject.destroy();
        }

        var ctx = document.getElementById("menu-competition-bar-chart");

        this.menuCompetitionChart.chartObject =
            new Chart(ctx, {
                type: 'radar',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        animateScale: true
                    },
                    legend: {
                        position: 'right'
                    },
                    tooltips: {
                        callbacks: {
                            label: (tooltipItems, data) => {
                                return ` ${tooltipItems.yLabel}`;
                            }
                        }
                    }
                }
            });

        this.busyChartMenuCompetition = false;
    }

    initMissingMenuChart = () => {
        // OLD Logic
        // var labels = [];
        // var linePoints = [];

        // var missingMenus = this.chartInfo.MissingMenu.Data;

        // var missingMenusLength = missingMenus.length;
        // for (var i in missingMenus) {
        //     var missingMenu = missingMenus[i];

        //     labels.push(missingMenu.DishName);
        //     linePoints.push(missingMenu.Others_PEN_Percent);
        // }

        if (Util.isDefined(this.missingMenuChart.chartObject)) {
            this.missingMenuChart.chartObject.destroy();
        }

        var ctx = document.getElementById("missing-menu-chart");

        // var data = {
        //     labels: labels,
        //     datasets: [
        //         {
        //             label: "Missing menu curve by penetration",
        //             fill: false,
        //             backgroundColor: "rgba(255,99,132,0.4)",
        //             borderColor: "rgba(255,99,132,1)",
        //             data: linePoints,
        //             cubicInterpolationMode: 'default',
        //         }
        //     ]
        // };

        var data = this.makeChartData({
            identifierKey: 'id',
            allowOthers: false,
            allowAll: false,
            unionByOtherRests: true,
            yourItemListKey: 'chartMissingMenu.Data',
            restItemListKey: 'chartMissingMenu.Data',
            yoursValueColumnKey: 'Others_PEN_Percent',
            othersValueColumnKey: '',
            allValueColumnKey: '',
            labelColumnKey: 'DishName',
        });

        // Calculating the `PointRadius` for each point based on its value
        var MIN_POINT_RADIUS = 2;
        var MAX_POINT_RADIUS = 20;

        for (var i in data.datasets) {
            var dataset = data.datasets[i];

            var pointRadiusList = [];

            for (var j in dataset.data) {
                var number = dataset.data[j];

                var value = (number / 100) * MAX_POINT_RADIUS;

                if (value < MIN_POINT_RADIUS) {
                    value = MIN_POINT_RADIUS;
                }

                pointRadiusList.push(value);
            }

            dataset.pointRadius = pointRadiusList;
            dataset.pointHoverRadius = pointRadiusList;
        }

        this.missingMenuChart.chartObject = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                showLines: false,
                responsive: true,
                maintainAspectRatio: false,
                tooltips: {
                    callbacks: {
                        label: (tooltipItems, data) => {
                            return ` ${tooltipItems.yLabel}`;
                        }
                    }
                }
            }
        });

        this.busyChartMissingMenu = false;
    }

    initRestTypeChart = () => {
        for (var i in this.restTypeChartList) {
            var item = this.restTypeChartList[i];

            if (Util.isDefined(item.chartObject)) {
                item.chartObject.destroy();
            }
        }

        this.restTypeChartList = [{
            name: 'you',
            Data: this.chartRestType
        }];

        var restTypes = this.otherRests.map((r) => {
            return {
                name: r.Name,
                Data: r.chartRestType
            }
        });

        this.restTypeChartList = this.restTypeChartList.concat(restTypes);

        setTimeout(() => {

            for (var restTypeIndex in this.restTypeChartList) {
                var restItem = this.restTypeChartList[restTypeIndex];

                restItem.labels = [];
                restItem.bgColors = [
                    this.constants.chartColors.red,
                    this.constants.chartColors.blue,
                ];

                var arcs = [];

                var restTypes = restItem.Data;

                // Find total Restaurants Count
                var totalCount = 0;
                for (var i in restTypes) {
                    var restType = restTypes[i];
                    totalCount += restType.Count;
                }

                for (var i in restTypes) {
                    var restType = restTypes[i];

                    restItem.labels.push(restType.RestaurantType);

                    arcs.push(Util.round((restType.Count / totalCount) * 100));
                }

                Util.log(this.LOG_TAG, 'initRestTypeChart()', arcs);


                var ctx = document.getElementById(`rest-type-chart-${restTypeIndex}`);

                if (ctx) {
                    var data = {
                        labels: restItem.labels,
                        datasets: [
                            {
                                data: arcs,
                                backgroundColor: restItem.bgColors,
                                hoverBackgroundColor: restItem.bgColors
                            }
                        ]
                    };

                    // For a pie chart
                    restItem.chartObject = new Chart(ctx, {
                        type: 'pie',
                        data: data,
                        options: {
                            maintainAspectRatio: false,
                            animation: {
                                animateRotate: true,
                                animateScale: true,
                            },
                            legend: {
                                display: false
                            },
                            tooltips: {
                                callbacks: {
                                    label: function (tooltipItem, data) {
                                        var dataset = data.datasets[tooltipItem.datasetIndex];
                                        //get the current items value
                                        var currentValue = dataset.data[tooltipItem.index];
                                        return ` ${currentValue}%`;
                                    }
                                }
                            }
                        }
                    });
                }
            }

            this.busyChartRestType = false;

        }, 1000);
    }

    initSegmentTypeChart = () => {
        for (var i in this.segmentTypeChartList) {
            var item = this.segmentTypeChartList[i];

            if (Util.isDefined(item.chartObject)) {
                item.chartObject.destroy();
            }
        }

        this.segmentTypeChartList = [{
            name: 'you',
            Data: this.chartSegmentType
        }];

        var restSegments = this.otherRests.map((r) => {
            return {
                name: r.Name,
                Data: r.chartSegmentType
            }
        });

        this.segmentTypeChartList = this.segmentTypeChartList.concat(restSegments);

        setTimeout(() => {
            for (var segmentTypeIndex in this.segmentTypeChartList) {
                var segmentItem = this.segmentTypeChartList[segmentTypeIndex];

                segmentItem.labels = [];
                segmentItem.bgColors = [
                    this.constants.chartColors.red,
                    this.constants.chartColors.blue,
                    this.constants.chartColors.purple,
                    this.constants.chartColors.yellow,
                    this.constants.chartColors.gray,
                ];

                var arcs = [];

                for (var i in segmentItem.Data) {
                    var segmentType = segmentItem.Data[i];

                    segmentItem.labels.push(segmentType.SegmentName);

                    arcs.push(segmentType.Inc_Percent);
                }

                Util.log(this.LOG_TAG, 'initSegmentTypeChart()', arcs);

                var ctx = document.getElementById(`segment-type-chart-${segmentTypeIndex}`);

                if (ctx) {
                    var data = {
                        labels: segmentItem.labels,
                        datasets: [
                            {
                                data: arcs,
                                backgroundColor: segmentItem.bgColors
                            }
                        ]
                    };

                    segmentItem.chartObject = new Chart(ctx, {
                        type: 'pie',
                        data: data,
                        options: {
                            maintainAspectRatio: false,
                            animation: {
                                animateRotate: true,
                                animateScale: true,
                            },
                            legend: {
                                display: false
                            },
                            tooltips: {
                                callbacks: {
                                    label: function (tooltipItem, data) {
                                        //get the concerned dataset
                                        var dataset = data.datasets[tooltipItem.datasetIndex];
                                        //calculate the total of this data set
                                        var total = dataset.data.reduce(function (previousValue, currentValue, currentIndex, array) {
                                            return previousValue + currentValue;
                                        });
                                        //get the current items value
                                        var currentValue = dataset.data[tooltipItem.index];
                                        //calculate the precentage based on the total and current item, also this does a rough rounding to give a whole number
                                        var precentage = Math.floor(((currentValue / total) * 100) + 0.5);

                                        return ` ${precentage}%`;
                                    }
                                }
                            }
                        }
                    });
                }
            }

            this.busyChartSegmentType = false;
        }, 1000);
    }
}