import { Component, ChangeDetectionStrategy, ViewEncapsulation, Input } from '@angular/core';

@Component({
    selector: 'mobile-device',
    templateUrl: './mobile-device.component.html',
    
})
export class MobileDeviceComponent {
    @Input() type: string;

    constructor() {
    }

    ngOnInit() {
    }
}