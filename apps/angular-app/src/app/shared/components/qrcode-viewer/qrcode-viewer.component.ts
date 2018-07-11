import { Component, ChangeDetectionStrategy, ViewEncapsulation, Input } from '@angular/core';
import QRCode from "qrcode";
import { Util } from '../../util';

@Component({
    selector: 'qrcode-viewer',
    template: `<img [src]="QRImage" />`,
})
export class QRCodeViewerComponent {
    LOG_TAG = 'QRCodeViewerComponent';

    QRImage: string;

    @Input() text: string;

    constructor() {
    }

    async ngOnInit() {
        Util.log(this.LOG_TAG, 'ngOnInit');

        this.QRImage = await QRCode.toDataURL(this.text);
    }
}