import { Util } from "../util";
import { GMapOverlayViewConfig } from "./gmap-overlay-config";

declare var google;

export class GMapOverlayView {
    LOG_TAG = 'GMapOverlayView';

    private data: any;
    private bounds: any;
    private map: any;
    private element: HTMLElement;

    private setMap: any;
    private getPanes: any;
    private getProjection: any;
    private clickCallback: any;

    private config = new GMapOverlayViewConfig();

    constructor(element, map, clickCallback, config: GMapOverlayViewConfig) {
        this.bounds = null;
        this.element = element;
        this.map = map;
        this.clickCallback = clickCallback;
        this.config = config;

        this.setMap(map);
    }

    private setBounds = (bounds) => {
        this.bounds = bounds;
    }

    onAdd = () => {
        Util.log(this.LOG_TAG, 'onAdd');

        // Add the element to the "overlayLayer" pane.
        var panes = this.getPanes();
        panes.floatPane.appendChild(this.element);
    };

    draw = () => {
        Util.log(this.LOG_TAG, 'draw');

        var overlayProjection = this.getProjection();

        if (this.bounds && Util.isDefined(overlayProjection)) {
            var sw = overlayProjection.fromLatLngToDivPixel(this.bounds.getSouthWest());
            var ne = overlayProjection.fromLatLngToDivPixel(this.bounds.getNorthEast());

            var width = this.element.offsetWidth;
            var height = this.element.offsetHeight;

            Util.log(this.LOG_TAG, 'draw', 'width height', width, height);

            setTimeout(() => {
                this.element.style.left = (sw.x - (width / 2)) + 'px';
                this.element.style.top = (ne.y - height - this.config.marginBottom) + 'px';
                this.element.style.visibility = 'visible';
            }, 0);
        }
        else {
            this.element.style.visibility = 'hidden';
        }
    };

    onRemove = () => {
        this.element.parentNode.removeChild(this.element);
        this.element = null;
    };

    open = (latlng, data) => {
        this.data = data;

        this.setBounds(new google.maps.LatLngBounds(latlng, latlng));
        this.draw();
    }

    close = () => {
        this.setBounds(null);
        this.draw();
    }
}

if (typeof google !== 'undefined' && google) {
    GMapOverlayView.prototype = new google.maps.OverlayView();
}