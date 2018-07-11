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
    id?: number;
    FireFlyID?: string;
    Name?: string;
    // rest?: Restaurant;
    marker?: any;
    // chartInfo?: any;
    chartCompareInfo?: any;
    chartCuisineType?: any;
    chartMenuCompetition?: any;
    chartMissingMenu?: any;
    chartSegmentType?: any;
    chartRestType?: any;
    busy: boolean;
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
    
})
export class RestaurantMenuSenseComponent {
    LOG_TAG = 'RestaurantMenuSenseComponent =>';

    REST_ICON = 'img/ro/restaurant-map-orange.svg';
    OTHER_REST_ICON = Util.getOtherRestMapIcon(this.constants.colors.brandSuccess);
    // OTHER_REST_ACTIVE_ICON = Util.getOtherRestMapIcon(this.constants.colors.brandPrimary);

    CHART_TYPE_LINE = 'line';
    CHART_TYPE_VBAR = 'bar';
    CHART_TYPE_HBAR = 'horizontalBar';
    CHART_TYPE_RADAR = 'radar';
    CHART_TYPE_BUBBLE = 'bubble';

    CHART_COLORS_ARRAY_REST_START_INDEX = 2;

    busy = false;
    busyOtherRest = false;
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
    otherRestsFF = new Array<string>();

    chartInfo = {
        MenuCounts: <any>{},
        // RestType: <any>[],
        SegmentType: <any>[],
    };

    chartCompareTypeConfig = {
        type: this.CHART_TYPE_LINE
    };

    chartCompareInfo = <any>{
        Pagination: {
            TotalRow: 0
        }
    };

    chartCuisineTypeConfig = {
        type: this.CHART_TYPE_HBAR
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

    chartMissingMenuConfig = {
        type: this.CHART_TYPE_BUBBLE
    };

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

    chartMenuCompetitionTypeConfig = {
        type: this.CHART_TYPE_RADAR
    }

    menuCompetitionChart = {
        pageSize: 25,
        chartObject: null
    };

    missingMenuChart = {
        pageSize: 25,
        chartObject: null
    };

    chartSegmentType: any;
    segmentTypeChartList = [];

    chartRestType: any;
    restTypeChartList = [];

    // restFFList = [
    //     'LNE308',
    //     'LBT407',
    // ];

    restMapMarkers = [];

    excludeCatering = false;

    @Input() fireFlyID: string;
    @Input() rest: Restaurant;

    constructor(private ROService: ROService, public constants: Constants, private router: Router, private toastr: ToastsManager, private zone: NgZone) {
        Util.log(this.LOG_TAG, 'constructor', this.fireFlyID);

        if (typeof sessionStorage !== 'undefined' && sessionStorage) {
            var otherRestsFF = sessionStorage.getItem('otherRestsFF');

            if (otherRestsFF) {
                this.otherRestsFF = JSON.parse(otherRestsFF);
            }
        }
    }

    errorOnlineOrderingNotEnabled = () => {
        this.toastr.error('Online ordering is not enabled. You need to enable it first...', 'Error!');
    }

    ngOnInit() {
        Util.log(this.LOG_TAG, 'ngOnInit');

        this.loadData();
    }

    loadData = () => {
        this.busy = true;

        var requestData = new ROAPIRequestData();
        requestData.ff = this.fireFlyID;
        requestData.proximity = this.proximity;

        // Get Rest Info
        // var restInfoPromise = this.ROService.getRestInfo(Util.clone(requestData));

        // Get Chart Map Info
        var chartMapInfoPromise = this.ROService.getChartMapInfo(Util.clone(requestData));

        // Get Chart Menu Count
        var chartMenuCountPromise = this.ROService.getChartMenuCount(Util.clone(requestData));

        // Rest Type
        var restTypePromise = this.ROService.getChartRestType(Util.clone(requestData));

        // Segment
        var segmentPromise = this.ROService.getChartSegments(Util.clone(requestData));

        Observable.forkJoin([

            chartMapInfoPromise,
            this.loadChartItemCompareDataPromise(this.fireFlyID, this.excludeCatering),
            chartMenuCountPromise,
            restTypePromise,
            segmentPromise,
            this.loadChartCuisineTypeDataPromise(this.fireFlyID),
            this.loadChartMenuCompetitionDataPromise(this.fireFlyID),
            this.loadChartMissingMenuDataPromise(this.fireFlyID),

        ]).subscribe(response => {
            var i = 0;

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

        this.busyOtherRest = true;
        this.busyChartCompare = true;
        this.busyChartRestType = true;
        this.busyChartSegmentType = true;
        this.busyChartCuisineType = true;
        this.busyChartMissingMenu = true;
        this.busyChartMenuCompetition = true;

        Observable.forkJoin([

            this.loadChartItemCompareDataPromise(otherRest.FireFlyID, this.excludeCatering),
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

            // Cusines
            otherRest.chartCuisineType = response[i++];

            // Menu Competition
            otherRest.chartMenuCompetition = response[i++];

            // Missing Menu
            otherRest.chartMissingMenu = response[i++];

            otherRest.busy = false;

            Util.log(this.LOG_TAG, 'loadOtherRestData', response);

            this.loadOtherRestCharts();

            this.busyOtherRest = false;
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

            Util.log(this.LOG_TAG, 'loadOtherRestCharts');

        }, 500);
    }

    private loadChartItemCompareDataPromise = (fireFlyID, excludeCatering) => {
        var requestData = new ROAPIRequestData();
        requestData.ff = fireFlyID;
        requestData.excludecatering = excludeCatering;
        requestData.proximity = this.proximity;
        // requestData.ps = this.itemCompareChart.pageSize;

        // Get Chart Compare Info
        var chartComparePromise = this.ROService.getChartCompareInfo(requestData);

        return chartComparePromise;
    }

    loadChartItemCompareData = () => {
        this.busyChartCompare = true;

        var promiseList = [];

        promiseList.push(this.loadChartItemCompareDataPromise(this.fireFlyID, this.excludeCatering));

        for (var i in this.otherRests) {
            var otherRest = this.otherRests[i];

            promiseList.push(this.loadChartItemCompareDataPromise(otherRest.FireFlyID, this.excludeCatering));
        }

        Observable.forkJoin(promiseList).subscribe((response: any) => {
            // Chart Compare Info
            this.chartCompareInfo = response[0];

            for (var i = 0; i < this.otherRests.length; i++) {
                var otherRest = this.otherRests[i];

                otherRest.chartCompareInfo = response[i + 1];
            }

            this.busyChartCompare = false;

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

            for (var i = 0; i < this.otherRestsFF.length; i++) {
                var fireFlyID = this.otherRestsFF[i];

                var temp = this.restMapMarkers.filter(m => m.data.coordinate.FireFlyID == fireFlyID);

                if (temp.length > 0) {
                    var marker = temp[0];

                    this._onRestMarkerClick(marker, true, i);
                }
            }

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

            this.restMapMarkers = [];

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
                    // icon: otherRest ? this.OTHER_REST_ACTIVE_ICON : this.OTHER_REST_ICON,
                    icon: this.OTHER_REST_ICON,
                    zIndex: this.constants.REST_MARKER_ZINDEX,
                    data: { coordinate: coordinate },
                });

                var _context = this;

                marker.addListener('click', function () {
                    _context._onRestMarkerClick(this, false, null);
                });

                marker.addListener('mouseover', function () {
                    _context._onRestMarkerOver(this, map);
                });

                this.restMapMarkers.push(marker);

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

    private _onRestMarkerClick = (marker, restoringRests: boolean, colorIndex) => {
        Util.log('_onRestMarkerClick', marker, restoringRests, colorIndex);

        if (colorIndex === null) {
            colorIndex = this.otherRests.length;
        }

        colorIndex += this.CHART_COLORS_ARRAY_REST_START_INDEX + 1;

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

            // this.busyOtherRest = true;
            this.busyChartCompare = true;
            this.busyChartRestType = true;
            this.busyChartSegmentType = true;
            this.busyChartCuisineType = true;
            this.busyChartMissingMenu = true;
            this.busyChartMenuCompetition = true;

            if (!otherRest) {

                if (!this.busyOtherRest || restoringRests) {

                    if (this.otherRests.length < this.constants.MAX_REST_SELECTION_LIMIT) {
                        this.zone.run(() => {
                            var icon = Util.getOtherRestMapIcon(this.constants.chartColorsArray[colorIndex]);
                            marker.setIcon(icon);

                            Util.log('_onRestMarkerClick => setIcon', this.constants.chartColorsArray[colorIndex]);

                            otherRest = {
                                busy: true
                            };

                            Util.merge(otherRest, marker.data.coordinate);
                            otherRest.marker = marker;

                            this.otherRests.push(otherRest);

                            this.loadOtherRestData(otherRest);
                        });

                        Util.log('_onRestMarkerClick => Selected', marker);
                    }
                    else {
                        this.toastr.error(`You can select max ${this.constants.MAX_REST_SELECTION_LIMIT} restaurants at a time.`, 'Error!');
                    }
                }
                else {
                    this.toastr.warning('Please wait for restaurant to load before you add a new restaurant', 'Please wait');
                }
            }
            else {
                marker.setIcon(this.OTHER_REST_ICON);

                var index = this.otherRests.indexOf(otherRest);

                if (index > -1) {
                    this.otherRests.splice(index, 1);
                    Util.log('_onRestMarkerClick => Delselected', marker);
                }

                this.zone.run(() => {
                    this.loadOtherRestCharts();
                });
            }

            if (!restoringRests) {
                this.otherRestsFF = this.otherRests.map(r => r.FireFlyID);
                sessionStorage.setItem('otherRestsFF', JSON.stringify(this.otherRestsFF));

                Util.log(this.LOG_TAG, 'otherRestsFF', this.otherRestsFF);
            }
        }
    }

    private _onRestInfoWindowClick = (marker) => {
        Util.log(this.LOG_TAG, '_onRestInfoWindowClick', marker);

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

        var innerHTML = '<div class="clearfix">';

        if (marker.data.coordinate.RestLogo) {
            innerHTML += `<div style="float: left; width: 60px; height: 60px; background: url('${this.constants.SERVER_URL}/${marker.data.coordinate.RestLogo}'); background-repeat: no-repeat; background-size: contain; background-position: center;"></div>`;
        }
        else {
            innerHTML += `<div style="float: left; padding: 10px; background-color: rgba(69, 90, 100, 0.05);"><div style="width: 40px; height: 40px; background: url('img/ro/photo-placeholder.svg'); background-repeat: no-repeat; background-size: contain; background-position: center;"></div></div>`;
        }

        innerHTML += `  <div style="float: left;">
                            <h3 style="padding-left: 10px; margin-top: 15px;">${marker.data.coordinate.Name}</h3>
                            <div style="color: #39CE7B; text-align: center; font-weight: bold;">View Menu</div>
                        </div>`;

        innerHTML += `</div>`;

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

    private getChartType = (type) => {
        if (type == this.CHART_TYPE_BUBBLE) {
            return this.CHART_TYPE_LINE;
        }
        else {
            return type;
        }
    }

    private _interceptChartData = (config, data) => {
        if (config.type == this.CHART_TYPE_BUBBLE) {

            // Calculating the `PointRadius` for each point based on its value
            var MIN_POINT_RADIUS = 2;
            var MAX_POINT_RADIUS = 20;

            for (var i in data.datasets) {
                var dataset = data.datasets[i];

                var pointRadiusList = [];

                var MAX = 0;
                var MIN = 0;

                for (var j in dataset.data) {
                    var number = dataset.data[j];

                    if (number > MAX) {
                        MAX = number;
                    }

                    if (number < MIN) {
                        MIN = number;
                    }
                }

                for (var j in dataset.data) {
                    var number = dataset.data[j];

                    var value = (number / MAX) * MAX_POINT_RADIUS;

                    if (value < MIN_POINT_RADIUS) {
                        value = MIN_POINT_RADIUS;
                    }

                    pointRadiusList.push(Util.round(value));
                }

                Util.log('pointRadiusList', MAX, MIN, pointRadiusList);

                dataset.pointRadius = pointRadiusList;
                dataset.pointHoverRadius = pointRadiusList;
            }
        }
    }

    private _makeChartOptions = (config) => {
        var options: any = {};

        if (config.type == this.CHART_TYPE_BUBBLE) {
            options.showLines = false;

            options.layout = {
                padding: {
                    left: 0,
                    right: 0,
                    top: 25,
                    bottom: 0
                }
            };

            options.scales = {
                yAxes: [{
                    ticks: {
                        padding: 25
                    }
                }]
            };
        }
        else if (config.type == this.CHART_TYPE_RADAR) {
            options.tooltips = {
                mode: 'index'
            };
        }

        return options;
    }

    private _makeChartData = (params: MakeChartParams) => {
        var allItemList = [];
        var allRestItemList = [];
        var yourItemList = <Array<any>>_.get(this, params.yourItemListKey);

        allItemList = _.unionBy(allItemList, yourItemList, params.identifierKey);
        allRestItemList.push({
            label: 'Your menu',
            list: yourItemList,
            fireFlyID: this.rest.FireFlyID,
            cuisineID: this.rest.CuisineID,
        });

        for (var otherRestIndex in this.otherRests) {
            var otherRest = this.otherRests[otherRestIndex];

            if (!otherRest.busy) {
                var restItemList = _.get(otherRest, params.restItemListKey);

                if (params.unionByOtherRests) {
                    allItemList = _.unionBy(allItemList, restItemList, params.identifierKey);
                }
                allRestItemList.push({
                    label: otherRest.Name,
                    list: restItemList,
                    fireFlyID: otherRest.FireFlyID,
                });
            }
        }

        var labels = [];
        var restsLinePoints = [];

        for (var i in allItemList) {
            var index = parseInt(i);
            var item = allItemList[i];

            labels.push(item[params.labelColumnKey]);

            for (var allRestDishListIndex in allRestItemList) {
                var restDishItem = allRestItemList[allRestDishListIndex];

                if (index == 0) {
                    restsLinePoints[allRestDishListIndex] = {
                        label: restDishItem.label,
                        yoursList: [],
                        othersList: [],
                        allList: [],
                    }

                    if (Util.isDefined(restDishItem.fireFlyID)) {
                        restsLinePoints[allRestDishListIndex].fireFlyID = restDishItem.fireFlyID;
                    }

                    if (Util.isDefined(restDishItem.cuisineID)) {
                        restsLinePoints[allRestDishListIndex].cuisineID = restDishItem.cuisineID;
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
        var colorIndex = this.CHART_COLORS_ARRAY_REST_START_INDEX;

        for (var restsLinePointsIndex in restsLinePoints) {
            var item = restsLinePoints[restsLinePointsIndex];

            var color = this.constants.chartColorsArray[colorIndex++];

            datasets.push({
                label: item.label,
                fill: false,
                backgroundColor: color,
                borderColor: color,
                pointBackgroundColor: color,
                pointBorderColor: color,
                data: item.yoursList,
                cubicInterpolationMode: 'default',
                fireFlyID: item.fireFlyID || null,
                cuisineID: item.cuisineID || null,
            });

            if (parseInt(restsLinePointsIndex) == 0) {

                if (params.allowOthers) {
                    color = this.constants.chartColorsArray[0];

                    datasets.push({
                        label: `Other surrounding ${this.rest.Cuisine} `,
                        fill: false,
                        backgroundColor: color,
                        borderColor: color,
                        pointBackgroundColor: color,
                        pointBorderColor: color,
                        data: item.othersList,
                        cubicInterpolationMode: 'default',
                        cuisineID: item.cuisineID || null,
                    });
                }

                if (params.allowAll) {
                    color = this.constants.chartColorsArray[1];

                    datasets.push({
                        label: `All`,
                        fill: false,
                        backgroundColor: color,
                        borderColor: color,
                        pointBackgroundColor: color,
                        pointBorderColor: color,
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
        if (Util.isDefined(this.itemCompareChart.chartObject)) {
            this.itemCompareChart.chartObject.destroy();
        }

        var ctx = document.getElementById("item-compare-chart");

        var data = this._makeChartData({
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

        this._interceptChartData(this.chartCompareTypeConfig, data);

        var generalOptions = this._makeChartOptions(this.chartCompareTypeConfig);

        var options = {
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
            },
            legend: { position: 'bottom' }
        };

        _.merge(options, generalOptions);

        this.itemCompareChart.chartObject = new Chart(ctx, {
            type: this.getChartType(this.chartCompareTypeConfig.type),
            data: data,
            options: options
        });

        ctx.onclick = (evt) => {
            var activePoints = this.itemCompareChart.chartObject.getElementAtEvent(evt);
            var datasets = this.itemCompareChart.chartObject.getDatasetAtEvent(evt);

            if (activePoints.length > 0) {
                //get the internal index of slice in pie chart
                var clickedElementIndex = activePoints[0]["_index"];
                var clickedDatasetIndex = activePoints[0]["_datasetIndex"];

                //get specific label by index 
                var label = this.itemCompareChart.chartObject.data.labels[clickedElementIndex];

                //get value by index
                var dataset = this.itemCompareChart.chartObject.data.datasets[clickedDatasetIndex];
                var value = dataset.data[clickedElementIndex];

                /* other stuff that requires slice's label and value */

                var queryParams: any = {};
                queryParams.keywords = label;
                queryParams.lat = this.rest.Latitude;
                queryParams.lng = this.rest.Longitude;
                queryParams.proximity = this.proximity;

                if (Util.isDefined(dataset.fireFlyID)) {
                    queryParams.fireFlyID = dataset.fireFlyID;
                }

                else if (Util.isDefined(dataset.cuisineID)) {
                    queryParams.cuisineID = dataset.cuisineID;
                }

                this.router.navigate([`${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`, this.fireFlyID, Path.RO.MENU_ITEMS], { queryParams: queryParams });
            }
        }

        this.busyChartCompare = false;
    }

    updateItemCompareChartType = () => {
        this.busyChartCompare = true;

        setTimeout(() => {
            this.initItemCompareChart();
        }, 500);
    }

    initCuisineTypeChart = () => {
        if (Util.isDefined(this.cuisineTypeChart.chartObject)) {
            this.cuisineTypeChart.chartObject.destroy();
        }

        var ctx = document.getElementById("cuisine-type-chart");

        var data = this._makeChartData({
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

        this._interceptChartData(this.chartCuisineTypeConfig, data);

        var generalOptions = this._makeChartOptions(this.chartCuisineTypeConfig);

        var options = {
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
            legend: { position: 'bottom' }
        }

        _.merge(options, generalOptions);

        this.cuisineTypeChart.chartObject = new Chart(ctx, {
            type: this.getChartType(this.chartCuisineTypeConfig.type),
            data: data,
            options: options
        });

        ctx.onclick = (evt) => {
            var activePoints = this.cuisineTypeChart.chartObject.getElementAtEvent(evt);
            var datasets = this.cuisineTypeChart.chartObject.getDatasetAtEvent(evt);

            if (activePoints.length > 0) {
                //get the internal index of slice in pie chart
                var clickedElementIndex = activePoints[0]["_index"];
                var clickedDatasetIndex = activePoints[0]["_datasetIndex"];

                //get specific label by index 
                var label = this.cuisineTypeChart.chartObject.data.labels[clickedElementIndex];

                //get value by index
                var dataset = this.cuisineTypeChart.chartObject.data.datasets[clickedDatasetIndex];
                var value = dataset.data[clickedElementIndex];

                /* other stuff that requires slice's label and value */

                var queryParams: any = {};
                queryParams.lat = this.rest.Latitude;
                queryParams.lng = this.rest.Longitude;
                queryParams.proximity = this.proximity;

                var temp = this.chartCuisineType.Data.filter(a => a.CuisineName.toLowerCase() == label.toLowerCase());

                if (temp.length > 0) {
                    queryParams.cuisineName = temp[0].CuisineName;
                    queryParams.cuisineID = temp[0].CuisineID;
                }

                this.router.navigate([`${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`, this.fireFlyID, Path.RO.DISHES], { queryParams: queryParams });
            }
        }

        this.busyChartCuisineType = false;
    }

    updateCuisineTypeChartType = () => {
        this.busyChartCuisineType = true;

        setTimeout(() => {
            this.initCuisineTypeChart();
        }, 500);
    }

    initMissingMenuChart = () => {
        if (Util.isDefined(this.missingMenuChart.chartObject)) {
            this.missingMenuChart.chartObject.destroy();
        }

        var ctx = document.getElementById("missing-menu-chart");

        var data = this._makeChartData({
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

        this._interceptChartData(this.chartMissingMenuConfig, data);

        var generalOptions = this._makeChartOptions(this.chartMissingMenuConfig);

        var options = {
            responsive: true,
            maintainAspectRatio: false,
            tooltips: {
                callbacks: {
                    label: (tooltipItems, data) => {
                        return ` ${tooltipItems.yLabel}`;
                    }
                }
            },
            legend: { position: 'bottom' }
        };

        _.merge(options, generalOptions);

        this.missingMenuChart.chartObject = new Chart(ctx, {
            type: this.getChartType(this.chartMissingMenuConfig.type),
            data: data,
            options: options
        });

        ctx.onclick = (evt) => {
            var activePoints = this.missingMenuChart.chartObject.getElementAtEvent(evt);
            var datasets = this.missingMenuChart.chartObject.getDatasetAtEvent(evt);

            if (activePoints.length > 0) {
                //get the internal index of slice in pie chart
                var clickedElementIndex = activePoints[0]["_index"];
                var clickedDatasetIndex = activePoints[0]["_datasetIndex"];

                //get specific label by index 
                var label = this.missingMenuChart.chartObject.data.labels[clickedElementIndex];

                //get value by index
                var dataset = this.missingMenuChart.chartObject.data.datasets[clickedDatasetIndex];
                var value = dataset.data[clickedElementIndex];

                /* other stuff that requires slice's label and value */

                var queryParams: any = {};
                queryParams.lat = this.rest.Latitude;
                queryParams.lng = this.rest.Longitude;
                queryParams.proximity = this.proximity;
                queryParams.keywords = label;

                this.router.navigate([`${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`, this.fireFlyID, Path.RO.MENU_ITEMS], { queryParams: queryParams });
            }
        }

        this.busyChartMissingMenu = false;
    }

    updateMissingMenuChartType = () => {
        this.busyChartMissingMenu = true;

        setTimeout(() => {
            this.initMissingMenuChart();
        }, 500);
    }

    initMenuCompetitionBarChart = () => {
        if (Util.isDefined(this.menuCompetitionChart.chartObject)) {
            this.menuCompetitionChart.chartObject.destroy();
        }

        var ctx = document.getElementById("menu-competition-bar-chart");

        var data = this._makeChartData({
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

        for (var i in data.datasets) {
            var dataset = data.datasets[i];

            dataset.tempData = dataset.data;
            dataset.data = [];

            var sum = 0;

            for (var j in dataset.tempData) {
                var number = dataset.tempData[j];
                sum += number;
            }

            dataset.sum = Util.round(sum);

            for (var j in dataset.tempData) {
                var number = dataset.tempData[j];

                dataset.data.push(Util.round(number / dataset.sum));
            }
        }

        this._interceptChartData(this.chartMenuCompetitionTypeConfig, data);

        var generalOptions = this._makeChartOptions(this.chartMenuCompetitionTypeConfig);

        var options = {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                animateScale: true
            },
            // legend: {
            //     position: 'right'
            // },
            tooltips: {
                callbacks: {
                    label: (tooltipItems, data) => {
                        Util.log('hover', tooltipItems, data);
                        return ` ${tooltipItems.yLabel}`;
                    }
                }
            },
            legend: { position: 'bottom' }
        }

        _.merge(options, generalOptions);

        this.menuCompetitionChart.chartObject = new Chart(ctx, {
            type: this.getChartType(this.chartMenuCompetitionTypeConfig.type),
            data: data,
            options: options
        });

        ctx.onclick = (evt) => {
            var activePoints = this.menuCompetitionChart.chartObject.getElementAtEvent(evt);
            var datasets = this.menuCompetitionChart.chartObject.getDatasetAtEvent(evt);

            Util.log('Menu Competition', activePoints);

            if (activePoints.length > 0) {
                //get the internal index of slice in pie chart
                var clickedElementIndex = activePoints[0]["_index"];
                var clickedDatasetIndex = activePoints[0]["_datasetIndex"];

                //get specific label by index 
                var label = this.menuCompetitionChart.chartObject.data.labels[clickedElementIndex];

                //get value by index
                var dataset = this.menuCompetitionChart.chartObject.data.datasets[clickedDatasetIndex];
                var value = dataset.data[clickedElementIndex];

                /* other stuff that requires slice's label and value */

                var queryParams: any = {};
                queryParams.lat = this.rest.Latitude;
                queryParams.lng = this.rest.Longitude;
                queryParams.proximity = this.proximity;
                queryParams.keywords = label;

                if (Util.isDefined(dataset.fireFlyID)) {
                    queryParams.fireFlyID = dataset.fireFlyID;
                }

                else if (Util.isDefined(dataset.cuisineID)) {
                    queryParams.cuisineID = dataset.cuisineID;
                }

                Util.log('Menu Competition', dataset);

                this.router.navigate([`${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`, this.fireFlyID, Path.RO.MENU_ITEMS], { queryParams: queryParams });
            }
        }

        this.busyChartMenuCompetition = false;
    }

    updateMenuCompetitionChartType = () => {
        this.busyChartMenuCompetition = true;

        setTimeout(() => {
            this.initMenuCompetitionBarChart();
        }, 500);
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

        }, 500);
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

        var bgColorsCache = {};

        setTimeout(() => {
            for (var segmentTypeIndex in this.segmentTypeChartList) {
                var segmentItem = this.segmentTypeChartList[segmentTypeIndex];

                segmentItem.labels = [];
                segmentItem.bgColors = [];

                var bgColorsIndex = 0;
                var arcs = [];

                for (var i in segmentItem.Data) {
                    var segmentType = segmentItem.Data[i];

                    segmentItem.labels.push(segmentType.SegmentName);

                    bgColorsCache[segmentType.SegmentID] = bgColorsCache[segmentType.SegmentID] || this.constants.chartColorsArray[bgColorsIndex++];
                    segmentItem.bgColors.push(bgColorsCache[segmentType.SegmentID]);

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
        }, 500);
    }
}