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
import { SharedDataService } from '../../services/shared-data.service';

@Component({
  selector: 'opera-modal',
  templateUrl: './opera-modal.component.html',
  providers: []
})
export class OperaModalComponent extends BaseModal {

  /**
   * Properties
   */
  LOG_TAG = 'OperaModalComponent';

  message = '';

  busy = false;

  resolve: any;

  @Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();

  constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public eventsService: EventsService, public sharedDataService: SharedDataService) {
    super(eventsService);
  }

  /**
   * Methods
   */
  open = () => {
    this.openModal();

    this.init();
  }

  init = () => {

  }

  close = (confirm) => {
    this.closeModal();
  }
}