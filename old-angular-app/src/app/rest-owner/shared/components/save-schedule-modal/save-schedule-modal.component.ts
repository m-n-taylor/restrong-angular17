import { Component, ViewChild, NgZone, EventEmitter, Output, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../../../shared/util';
import { Constants } from '../../../../shared/constants';

// RO Models
import { User } from '../../models/user';
import { MasterHead } from '../../models/master-head'
import { ROAPIRequestData } from '../../models/ro-api-request-data';

// Shared Services
import { EventsService } from '../../../../shared/services/events.service';
import { BaseModal } from '../../../../shared/services/base-modal.service';

// RO Services
import { ROService } from '../../services/ro.service';
import { HelperService } from '../../services/helper.service';

// Shared Components
import { DateTimeOptions } from '../../../../shared/components/datetime/datetime.component';

// 3rd Party Libs
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

declare var document, google;

@Component({
    selector: 'save-schedule-modal',
    templateUrl: './save-schedule-modal.component.html',
    providers: []
})
export class SaveScheduleModalComponent extends BaseModal {

    /**
     * Properties
     */
    readonly LOG_TAG = 'SaveScheduleModalComponent';

    readonly TAB_DELIVERY_HOURS = 'DeliveryHours';
    readonly TAB_PICKUP_HOURS = 'PickupHours';
    readonly TAB_CATERING_HOURS = 'CateringHours';
    readonly TAB_DINING_HOURS = 'DiningHours';

    fireFlyID: string;
    masterHead: MasterHead;

    schedule: any;
    activeTab: string;
    busy: boolean;

    invalidTabs: any = {};

    workingHoursDTOptions = <DateTimeOptions>{
        enableTime: true,
        noCalendar: true,
    };

    @Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();

    constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public eventsService: EventsService, private ROService: ROService, public helperService: HelperService, private toastr: ToastsManager) {
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
        this.busy = false;

        this.schedule = {};
        this.invalidTabs = {};
    }

    init = (data) => {
        this.fireFlyID = data.fireFlyID;
        this.masterHead = data.masterHead;

        if (this.masterHead.IsDelivery) {
            this.selectTab(this.TAB_DELIVERY_HOURS);
        }
        else if (this.masterHead.IsPickup) {
            this.selectTab(this.TAB_PICKUP_HOURS);
        }
        else if (this.masterHead.IsCatering) {
            this.selectTab(this.TAB_CATERING_HOURS);
        }
        else if (this.masterHead.IsDiningIn) {
            this.selectTab(this.TAB_DINING_HOURS);
        }

        this.loadData();
    }

    selectTab = (tab) => {
        this.activeTab = tab;
    }

    loadData = () => {
        Util.log(this.LOG_TAG, 'loadData()');

        this.busy = true;

        var requestData = new ROAPIRequestData();

        ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
        ROAPIRequestData.fillMasterHeadID(requestData, this.masterHead.ID);

        this.ROService.getScheduleList(requestData).subscribe(response => {
            this.schedule = response;

            this.helperService.initEmptyDayHours(this.schedule.DiningHours);
            this.helperService.initEmptyDayHours(this.schedule.CateringHours);
            this.helperService.initEmptyDayHours(this.schedule.DeliveryHours);
            this.helperService.initEmptyDayHours(this.schedule.PickupHours);

            this.busy = false;

            Util.log(this.LOG_TAG, 'getScheduleList', response);
        });
    }

    addHour = (beforeIndex, item, editMode?: boolean) => {
        this.helperService.addHour(beforeIndex, item, editMode);
    }

    updateHoursValidation = (tab) => {
        Util.log(this.LOG_TAG, 'updateHoursValidation', tab);

        return this.helperService.validateHours(this.schedule[tab]);
    }

    deleteHour = (index, item) => {
        item.DayDetails = item.DayDetails || [];
        item.DayDetails.splice(index, 1);

        this.updateHoursValidation(this.activeTab);
    }

    save = (closeModal?: boolean) => {
        Util.log(this.LOG_TAG, 'save');

        this.invalidTabs = {};

        if (this.masterHead.IsDelivery) {
            var valid = this.updateHoursValidation(this.TAB_DELIVERY_HOURS);

            if (!valid) {
                this.invalidTabs[this.TAB_DELIVERY_HOURS] = true;
            }
        }
        if (this.masterHead.IsPickup) {
            var valid = this.updateHoursValidation(this.TAB_PICKUP_HOURS);

            if (!valid) {
                this.invalidTabs[this.TAB_PICKUP_HOURS] = true;
            }
        }
        if (this.masterHead.IsCatering) {
            var valid = this.updateHoursValidation(this.TAB_CATERING_HOURS);

            if (!valid) {
                this.invalidTabs[this.TAB_CATERING_HOURS] = true;
            }
        }
        if (this.masterHead.IsDiningIn) {
            var valid = this.updateHoursValidation(this.TAB_DINING_HOURS);

            if (!valid) {
                this.invalidTabs[this.TAB_DINING_HOURS] = true;
            }
        }

        var validTabs = Object.keys(this.invalidTabs).length == 0;

        if (validTabs) {
            this.busy = true;

            var requestData = new ROAPIRequestData();

            ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
            ROAPIRequestData.fillMasterHeadID(requestData, this.masterHead.ID);

            requestData.DeliveryHours = this.schedule.DeliveryHours;
            requestData.CateringHours = this.schedule.CateringHours;
            requestData.PickupHours = this.schedule.PickupHours;
            requestData.DiningHours = this.schedule.DiningHours;

            this.ROService.updateScheduleList(requestData).subscribe(response => {
                this.schedule.DeliveryHours = response.DeliveryHours;
                this.schedule.CateringHours = response.CateringHours;
                this.schedule.PickupHours = response.PickupHours;
                this.schedule.DiningHours = response.DiningHours;

                this.busy = false;

                if (closeModal) {
                    this.close();
                }

                Util.log(this.LOG_TAG, 'updateScheduleList', response);
            });
        }
        else {
            this.toastr.error('Form contains some errors.', 'Sorry!');
        }
    }

    close = () => {
        this.modalEvents.emit({
            action: 'close',
            data: {}
        });

        this.closeModal();
    }
}