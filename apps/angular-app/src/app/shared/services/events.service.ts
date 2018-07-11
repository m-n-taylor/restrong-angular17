import { EventEmitter } from '@angular/core';
import { FiltersChangedEvent } from "../models/filters-changed-event";

// class ROModalListenerEvent {
//     public name: string;
//     public action: string;
//     public data: any;
// }

export class EventsService {
    public onModalStateChanged = new EventEmitter();
    public onUserLocationChanged = new EventEmitter();
    public onFiltersChanged = new EventEmitter<FiltersChangedEvent>();
    public onShoppingCartChanged = new EventEmitter<any>();
    public onAuthCodeExpired = new EventEmitter();
    // public ROModalListener: EventEmitter<ROModalListenerEvent>;
    public requestServiceTypeChange = new EventEmitter();
    public requestSelectRestTab = new EventEmitter();
    public onRestTabSelected = new EventEmitter();
}