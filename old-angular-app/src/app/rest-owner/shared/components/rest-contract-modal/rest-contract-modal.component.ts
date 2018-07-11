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
import { SharedDataService } from '../../services/shared-data.service';

// 3rd Party Libs
import * as moment from 'moment';

declare var document, google;

@Component({
  selector: 'rest-contract-modal',
  templateUrl: './rest-contract-modal.component.html',
  providers: []
})
export class RestContractModalComponent extends BaseModal {

  /**
   * Properties
   */
  LOG_TAG = 'RestContractModalComponent =>';

  rest: any = {};
  subscription: any = {};

  today = moment().toISOString();

  busy = false;

  isAcceptedTC = false;

  resolve: any;

  @Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();

  constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public eventsService: EventsService, private ROService: ROService, public sharedDataService: SharedDataService) {
    super(eventsService);
  }

  /**
   * Methods
   */
  open = (data) => {
    this.openModal();

    this.init(data);

    return new Promise<boolean>((resolve, reject) => {
        this.resolve = resolve;
    });
  }

  init = (data) => {
    this.rest = data.rest;
    this.subscription = data.subscription;

    Util.log(this.LOG_TAG, 'init()', this.rest);
  }

  acceptTC = () => {
    this.close(this.isAcceptedTC);
  }

  close = (acceptedTerms?: boolean) => {
    this.resolve(acceptedTerms || false);

    this.closeModal();
  }
}