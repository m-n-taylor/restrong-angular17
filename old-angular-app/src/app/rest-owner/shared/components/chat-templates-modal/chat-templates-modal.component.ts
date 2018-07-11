import { Component, ViewChild, NgZone, EventEmitter, Output, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../../../shared/util';
import { Constants } from '../../../../shared/constants';

// RO Models
import { User } from '../../models/user';
import { ROAPIRequestData } from '../../models/ro-api-request-data';

// Shared Services
import { EventsService } from '../../../../shared/services/events.service';
import { BaseModal } from '../../../../shared/services/base-modal.service';

// RO Services
import { ROService } from '../../services/ro.service';

@Component({
    selector: 'chat-templates-modal',
    templateUrl: './chat-templates-modal.component.html',
    providers: []
})
export class ChatTemplatesModalComponent extends BaseModal {

    /**
     * Properties
     */
    LOG_TAG = 'ChatTemplatesModalComponent';

    messageTemplates = [];

    busy = false;

    resolve: any;

    @Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();

    constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public eventsService: EventsService, private ROService: ROService) {
        super(eventsService);
    }

    /**
     * Methods
     */
    open = (data: any) => {
        this.openModal();

        this.init(data);

        return new Promise<boolean>((resolve, reject) => {
            this.resolve = resolve;
        });
    }

    init = (data) => {
        this.messageTemplates = data.messageTemplates;
    }

    selectMessageTemplate = (messageTemplate) => {
        this.close({ messageTemplate: messageTemplate });
    }

    close = (data) => {
        this.resolve(data);

        this.closeModal();
    }
}