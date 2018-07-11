import { EventEmitter } from '@angular/core';

// class ROModalListenerEvent {
//     public name: string;
//     public action: string;
//     public data: any;
// }

export class EventsService {
    public onModalStateChanged: EventEmitter<any>;
    public onUserLocationChanged: EventEmitter<any>;
    public onFiltersChanged: EventEmitter<any>;
    public onAuthCodeExpired: EventEmitter<any>;
    // public ROModalListener: EventEmitter<ROModalListenerEvent>;

    constructor() {
        this.onModalStateChanged = new EventEmitter();
        this.onUserLocationChanged = new EventEmitter();
        this.onFiltersChanged = new EventEmitter();
        this.onAuthCodeExpired = new EventEmitter();
        // this.ROModalListener = new EventEmitter();
    }
}