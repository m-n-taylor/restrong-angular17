import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Util } from '../../../../shared/util';

// RO Models
import { ROAPIRequestData } from '../../models/ro-api-request-data';

// RO Services
import { ROService } from '../../services/ro.service';

// RO Shared Components
import { MenuItemPreviewModalComponent } from '../../components/menu-item-preview-modal/menu-item-preview-modal.component';

@Component({
    selector: 'restaurant-menu-preview',
    templateUrl: './restaurant-menu-preview.component.html',
    providers: []
})
export class RestaurantMenuPreviewComponent {
    LOG_TAG = 'RestaurantMenuPreviewComponent =>';

    busy = false;
    data = <any>{};

    @Input() fireFlyID: string;

    @Output() fireFlyDataChange: EventEmitter<any>;

    @ViewChild('menuItemPreviewModal') public menuItemPreviewModal: MenuItemPreviewModalComponent;

    constructor(private ROService: ROService) {
        Util.log(this.LOG_TAG, 'constructor', this.fireFlyID);

        this.fireFlyDataChange = new EventEmitter<any>();
    }

    ngOnInit() {
        Util.log(this.LOG_TAG, 'ngOnInit', this.fireFlyID);

        this.busy = true;

        var requestData = new ROAPIRequestData();
        requestData.ff = this.fireFlyID;

        this.ROService.getPreview(requestData).subscribe(response => {
            this.data = response;
            this.busy = false;

            this.fireFlyDataChange.emit(this.data);

            Util.log(this.LOG_TAG, 'getPreview', response);
        });
    }

    openMenuItemPreviewModal = (menuItem: any) => {
        if (menuItem.HaveOption == 1) {

            this.menuItemPreviewModal.open({
                fireFlyID: this.fireFlyID,
                menuItem: menuItem
            });
        }
    }
}