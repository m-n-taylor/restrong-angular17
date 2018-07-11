import { Component, ChangeDetectionStrategy, ViewEncapsulation, ViewChild, NgZone, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isBrowser } from 'angular2-universal';

// Shared Helpers
import { Util } from '../../util';

// Shared Models
import { UserPayment } from '../../models/user-payment';
import { UserAPIRequestData } from '../../models/user-api-request-data';
import { UserPaymentAPIRequestData } from '../../models/user-payment-api-request-data';

// Shared Services
import { AppService } from '../../services/app.service';
import { EventsService } from '../../services/events.service';
import { BaseModal } from '../../services/base-modal.service';

declare var document;

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.Emulated,
  selector: 'choose-user-payment-modal',
  templateUrl: './choose-user-payment-modal.component.html',
  providers: []
})
export class ChooseUserPaymentModalComponent extends BaseModal {

  /**
   * Properties
   */
  busy = false;

  userPayments = new Array<UserPayment>();

  @Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();

  constructor(public eventsService: EventsService, private appService: AppService, private zone: NgZone) {
    super(eventsService);
  }

  /**
   * Methods
   */
  open = (userPayments: Array<UserPayment>) => {
    this.userPayments = userPayments;

    this.openModal();
  }

  chooseUserPayment = (userPayment: UserPayment) => {
    this.close(userPayment);
  }

  close = (userPayment?: UserPayment) => {
    this.modalEvents.emit({
      action: 'close',
      data: userPayment
    });
    
    this.closeModal();
  }
}