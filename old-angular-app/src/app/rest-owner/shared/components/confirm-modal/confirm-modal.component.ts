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

class ConfirmModalData {
  public message: string;
}

@Component({
  selector: 'confirm-modal',
  templateUrl: './confirm-modal.component.html',
  providers: []
})
export class ConfirmModalComponent extends BaseModal {

  /**
   * Properties
   */
  LOG_TAG = 'ConfirmModalComponent';

  message = '';

  busy = false;

  resolve: any;

  @Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();

  constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public eventsService: EventsService, private ROService: ROService) {
    super(eventsService);

    // this.eventsService.ROModalListener.subscribe((event) => {
    //   if (event.name == 'confirm-modal') {
    //     if (event.action == 'open') {
    //       this.open(event.data);
    //     }

    //     Util.log(this.LOG_TAG, 'ROModalListener', event);
    //   }
    // });
  }

  /**
   * Methods
   */
  open = (data: ConfirmModalData) => {
    this.openModal();

    this.init(data);

    return new Promise<boolean>((resolve, reject) => {
        this.resolve = resolve;
    });
  }

  init = (data) => {
    this.message = data.message;
  }

  close = (confirm) => {
    this.resolve(confirm);

    this.closeModal();
  }
}