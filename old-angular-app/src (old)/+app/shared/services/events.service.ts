import { EventEmitter } from '@angular/core';

export class EventsService {
    public onModalStateChanged: EventEmitter<any>;
    public onUserLocationChanged: EventEmitter<any>;

    constructor() {
        this.onModalStateChanged = new EventEmitter();
        this.onUserLocationChanged = new EventEmitter();
    }
}