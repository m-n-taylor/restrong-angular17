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

declare var document, google;

@Component({
  selector: 'order-status-history-modal',
  templateUrl: './order-status-history-modal.component.html',
  providers: []
})
export class OrderStatusHistoryModalComponent extends BaseModal {

  /**
   * Properties
   */
  LOG_TAG = 'OrderStatusHistoryModalComponent';

  order: any = {};
  busy = false;

  @Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();

  constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public eventsService: EventsService, private ROService: ROService) {
    super(eventsService);
  }

  /**
   * Methods
   */
  open = (data) => {
    this.openModal();

    this.init(data);
  }

  init = (data) => {
    this.order = data.order;
  }

  close = () => {
    this.modalEvents.emit({
      action: 'close',
      data: {}
    });

    this.closeModal();
  }
}