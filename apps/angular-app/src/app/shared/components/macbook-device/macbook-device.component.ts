import { Component, ChangeDetectionStrategy, ViewEncapsulation, Input } from '@angular/core';

@Component({
    selector: 'macbook-device',
    templateUrl: './macbook-device.component.html',
    
})
export class MacbookDeviceComponent {

    @Input() type = '';

    constructor() {

    }

    hasClass = (name) => {
        return this.type.indexOf(this.type) > -1;
    }

    isIPhone8 = () => {
        return this.hasClass('iphone8');
    }
}