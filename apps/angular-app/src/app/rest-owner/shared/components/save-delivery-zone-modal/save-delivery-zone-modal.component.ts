import { Component, ViewChild, NgZone, EventEmitter, Output, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

// Shared Helpers
import { Util } from '../../../../shared/util';
import { Constants } from '../../../../shared/constants';

// RO Models
import { Restaurant } from '../../models/restaurant';
import { DeliveryZone } from '../../models/delivery-zone';
import { ROAPIRequestData } from '../../models/ro-api-request-data';

// Shared Services
import { EventsService } from '../../../../shared/services/events.service';
import { BaseModal } from '../../../../shared/services/base-modal.service';
import { InputService } from '../../../../shared/services/input.service';

// RO Services
import { ROService } from '../../services/ro.service';
import { ROHelperService } from '../../services/helper.service';

// RO Components
import { ConfirmModalComponent } from "../../../../shared/components/confirm-modal/confirm-modal.component";

// 3rd Party Libs
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

declare var document, google;

@Component({
    selector: 'save-delivery-zone-modal',
    templateUrl: './save-delivery-zone-modal.component.html',
    
})
export class SaveDeliveryZoneModalComponent extends BaseModal {

    /**
     * Properties
     */
    readonly LOG_TAG = 'SaveDeliveryZoneModalComponent';

    fireFlyID: string;
    masterHeadID: number;

    deliveryZoneList: Array<DeliveryZone>;

    private _originalDeliveryZone: DeliveryZone; // Will keeps reference to orignal object
    private _deliveryZone: DeliveryZone;

    public get deliveryZone(): DeliveryZone {
        return this._deliveryZone;
    }
    public set deliveryZone(value: DeliveryZone) {
        this._originalDeliveryZone = value;
        this._deliveryZone = Util.clone(this._originalDeliveryZone);
    }

    restInfo: Restaurant;

    map: any;
    mapShape: any;

    saveMode: boolean;
    busy: boolean;

    // Map
    // circleShape: any;

    drawingManager: any;
    // polygonShape: any;
    colors = ['#1E90FF', '#FF1493', '#32CD32', '#FF8C00', '#4B0082'];
    selectedColor: any;
    colorButtons = {};

    public get isNewDeliveryZone(): boolean {
        return !Util.isDefined(this.deliveryZone.ID);
    }

    @ViewChild('confirmModal') public confirmModal: ConfirmModalComponent;

    @Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();

    constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public eventsService: EventsService, private ROService: ROService, public helperService: ROHelperService, public input: InputService, private toastr: ToastsManager) {
        super(eventsService);

        this.initDefaultVariables();
    }

    /**
     * Methods
     */
    open = (data) => {
        this.openModal();

        this.initDefaultVariables();
        this.init(data);
    }

    initDefaultVariables = () => {
        this.map = null;
        this.saveMode = false;
        this.busy = false;
    }

    init = (data) => {
        this.fireFlyID = data.fireFlyID;
        this.restInfo = data.restInfo;
        this.deliveryZoneList = data.deliveryZoneList;
        this.openDeliveryZone(data.deliveryZone);

        // this.loadData();
    }

    // closeSaveMode = () => {
    //     this.deliveryZone = null;

    //     this.saveMode = false;
    // }

    openDeliveryZone = (deliveryZone?: DeliveryZone) => {

        if (Util.isDefined(deliveryZone)) {
            this.deliveryZone = deliveryZone;
        }
        else {
            this.deliveryZone = new DeliveryZone();
            this.deliveryZone.ID = 0;
        }

        this.saveMode = true;

        this.initMap();
    }

    onDragSuccess = (event) => {
        Util.log(this.LOG_TAG, 'onDragSuccess', event, this.deliveryZoneList);

        this.helperService.calculateSortID(this.deliveryZoneList);

        this.saveSortOrder();
    }

    saveSortOrder = () => {
        this.busy = true;

        var requestData = new ROAPIRequestData();

        ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);

        var body = {
            SortDetails: []
        };

        for (var index in this.deliveryZoneList) {
            var deliveryZone = this.deliveryZoneList[index];

            if (Util.isDefined(deliveryZone.ID)) {
                body.SortDetails.push({
                    ID: deliveryZone.ID,
                    SortID: deliveryZone.SortID,
                });
            }
        }

        this.ROService.updateDeliveryZoneSortOrder(requestData, body).subscribe(response => {
            this.busy = false;

            Util.log(this.LOG_TAG, 'updateDeliveryZoneSortOrder', response);
        });
    }

    initMap = () => {

        setTimeout(() => {

            this.mapShape = null;

            var latLng = { lat: parseFloat(this.restInfo.Latitude), lng: parseFloat(this.restInfo.Longitude) };

            var mapOptions = Util.clone(this.constants.DEFAULT_MAP_OPTIONS);
            mapOptions.center = latLng;

            this.map = new google.maps.Map(document.getElementById('delivery-zone-map'), mapOptions);

            // Rest Marker
            var restMarker = new google.maps.Marker({
                position: latLng,
                map: this.map,
                icon: {
                    url: 'img/ro/restaurant-map.svg',
                    size: new google.maps.Size(40, 40),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(20, 21)
                }
            });

            // Creates a drawing manager attached to the map that allows the user to draw markers, lines, and shapes.
            this.drawingManager = new google.maps.drawing.DrawingManager({
                drawingMode: google.maps.drawing.OverlayType.POLYGON,
                drawingControlOptions: {
                    drawingModes: [
                        google.maps.drawing.OverlayType.POLYGON
                    ]
                },
                polygonOptions: {
                    strokeColor: this.constants.colors.brandSuccess,
                    strokeOpacity: 1,
                    strokeWeight: 3,
                    fillColor: this.constants.colors.brandSuccess,
                    fillOpacity: 0.19
                },
                map: this.map
            });

            google.maps.event.addListener(this.drawingManager, 'overlaycomplete', (e) => {
                if (e.type != google.maps.drawing.OverlayType.MARKER) {
                    // Disable drawing mode
                    this.enableDrawingMode(false);

                    var newShape = e.overlay;
                    newShape.type = e.type;

                    this.mapShape = newShape;

                    this.mapShape.setEditable(true);
                }
            });

            if (!this.isNewDeliveryZone) {

                if (this.deliveryZone.ZoneType == this.constants.ZONE_TYPE_POLYGON) {
                    this.onPolygonSelected();
                }
                else {
                    this.onCircleRadiusSelected();
                }
            }

            this.drawOtherShapes();

        }, 100);
    }

    drawOtherShapes = () => {
        for (var index in this.deliveryZoneList) {
            var zone = this.deliveryZoneList[index];

            if (zone.ID != this.deliveryZone.ID) {

                if (zone.ZoneType == this.constants.ZONE_TYPE_POLYGON) {
                    var latlngs = this._getPolygonArrByString(zone.PolygonData);

                    var polygon = this.makePolygon({
                        editable: false,
                        paths: latlngs,
                        strokeColor: this.constants.colors.darkGray,
                        fillColor: this.constants.colors.darkGray,
                    });
                }
                else {
                    var circle = this.makeCircle({
                        radius: Util.getMetersByMiles(zone.CircleRadius),
                        strokeColor: this.constants.colors.darkGray,
                        fillColor: this.constants.colors.darkGray,
                    });
                }
            }
        }
    }

    makePolygon = (newOptions) => {
        var options = {
            map: this.map,
            editable: true,
            strokeColor: this.constants.colors.brandSuccess,
            strokeOpacity: 1,
            strokeWeight: 3,
            fillColor: this.constants.colors.brandSuccess,
            fillOpacity: 0.19
        };

        Util.merge(options, newOptions);

        return new google.maps.Polygon(options);
    }

    makeCircle = (newOptions) => {
        var options = {
            map: this.map,
            center: { lat: parseFloat(this.restInfo.Latitude), lng: parseFloat(this.restInfo.Longitude) },
            strokeColor: this.constants.colors.brandSuccess,
            strokeOpacity: 1,
            strokeWeight: 3,
            fillColor: this.constants.colors.brandSuccess,
            fillOpacity: 0.19,
        };

        Util.merge(options, newOptions);

        return new google.maps.Circle(options);
    }

    enableDrawingMode = (enable) => {
        if (enable) {
            this.drawingManager.setOptions({
                drawingControl: true,
                drawingMode: google.maps.drawing.OverlayType.POLYGON,
            });
        }
        else {
            // Switch back to non-drawing mode after drawing a shape.
            this.drawingManager.setDrawingMode(null);

            this.drawingManager.setOptions({
                drawingControl: false
            });
        }
    }

    private _getPolygonArrByString = (value: string) => {
        var arr = value.split('|');

        var latlngs = [];

        for (var i in arr) {
            var item = arr[i];

            var coord = item.split(',');

            var latlng = {
                lat: parseFloat(coord[0]),
                lng: parseFloat(coord[1]),
            }

            latlngs.push(latlng);
        }

        return latlngs;
    }

    onPolygonSelected = () => {

        if (this.mapShape) {
            this.mapShape.setMap(null);
        }

        if (Util.isDefined(this.deliveryZone.PolygonData) && this.deliveryZone.PolygonData.length > 0) {
            this.enableDrawingMode(false);

            var latlngs = this._getPolygonArrByString(this.deliveryZone.PolygonData);

            // Add Polygon overlay and bind to marker
            this.mapShape = this.makePolygon({
                paths: latlngs,
            });
        }
        else {
            this.enableDrawingMode(true);
        }
    }

    clearPolygonShape = () => {
        this.deliveryZone.PolygonData = '';
        // this.mapShape = null;

        this.onPolygonSelected();
    }

    onCircleRadiusSelected = () => {
        Util.log(this.LOG_TAG, 'onCircleRadiusSelected');

        // Disable drawing mode
        this.enableDrawingMode(false);

        if (this.mapShape) {
            this.mapShape.setMap(null);
        }

        // Add circle overlay and bind to marker
        this.mapShape = this.makeCircle({
            radius: Util.getMetersByMiles(this.deliveryZone.CircleRadius)
        });
    }

    onCircleRadiusChanged = () => {
        Util.log(this.LOG_TAG, 'onCircleRadiusChanged', this.deliveryZone.CircleRadius);

        this.mapShape.setRadius(Util.getMetersByMiles(parseFloat(this.deliveryZone.CircleRadius)));
    }

    save = (form, next: any) => {
        Util.log(this.LOG_TAG, 'save');

        if (!Util.isDefined(this.deliveryZone.ZoneType)) {
            this.toastr.error('Please choose a zone type', 'Error!');
        }
        else if (this.deliveryZone.ZoneType == this.constants.ZONE_TYPE_POLYGON && !Util.isDefined(this.mapShape)) {
            this.toastr.error('Please draw a valid ploygon shape', 'Error!');
        }
        else {
            this._save(next);
        }
    }

    private _save = (next?: any) => {
        this.busy = true;

        this.deliveryZone.PolygonData = '';

        if (this.deliveryZone.ZoneType == this.constants.ZONE_TYPE_POLYGON) {
            var length = this.mapShape.getPath().getLength();

            for (var i = 0; i < length; i++) {
                this.deliveryZone.PolygonData += this.mapShape.getPath().getAt(i).toUrlValue();

                if (i < length - 1) {
                    this.deliveryZone.PolygonData += '|';
                }
            }
        }

        if (this.isNewDeliveryZone) {
            this.deliveryZoneList.push(this.deliveryZone);
        }
        else {
            Util.merge(this._originalDeliveryZone, this.deliveryZone);
        }

        if (next) next();

        this.close();

        Util.log(this.LOG_TAG, 'save', this.deliveryZone);
    }



    close = () => {
        this.modalEvents.emit({
            action: 'close',
            data: {}
        });

        this.closeModal();
    }
}