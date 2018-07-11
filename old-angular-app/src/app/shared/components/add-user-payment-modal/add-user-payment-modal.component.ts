import { Component, ChangeDetectionStrategy, ViewEncapsulation, ViewChild, NgZone, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Shared Helpers
import { Util } from '../../util';
import { Constants } from '../../constants';

// Shared Models
import { UserPayment } from '../../models/user-payment';
import { UserAPIRequestData } from '../../models/user-api-request-data';
import { UserPaymentAPIRequestData } from '../../models/user-payment-api-request-data';

// Shared Services
import { AppService } from '../../services/app.service';
import { BaseModal } from '../../services/base-modal.service';
import { EventsService } from '../../services/events.service';

declare var document;

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.Emulated,
  selector: 'add-user-payment-modal',
  templateUrl: './add-user-payment-modal.component.html',
  providers: []
})
export class AddUserPaymentModalComponent extends BaseModal {

  /**
   * Properties
   */
  private busy = false;
  private mode: number;
  private modalTitle: string;

  private userPayment: UserPayment;

  @Output() public modalEvents: EventEmitter<any> = new EventEmitter<any>();

  constructor(private constants: Constants, protected eventsService: EventsService, private appService: AppService, private zone: NgZone) {
    super(eventsService);
  }

  /**
   * Methods
   */

  open = (userPayment?: UserPayment) => {
    this.openModal();

    if (userPayment) {
      this.mode = this.constants.MODE_UPDATE;
      this.modalTitle = 'Update payment method';

      this.userPayment = userPayment;
    }
    else {
      this.mode = this.constants.MODE_CREATE;
      this.modalTitle = 'Add a payment method';

      this.userPayment = new UserPayment();
    }
  }

  private saveUserPayment = () => {
    this.busy = true;

    var requestData = new UserPaymentAPIRequestData();

    if (this.mode == this.constants.MODE_UPDATE) {
      // Updating the record

      UserPaymentAPIRequestData.fillUserPaymentForUpdate(requestData, this.userPayment);

      this.appService.updateUserPayment(requestData).subscribe(response => {

        if (Util.isDefined(response) && Util.isDefined(response.Code) && response.Code == 'UPDATE_BILLING_ADDRESS') {

          this.close({
            userPayment: this.userPayment,
            modalMode: this.constants.MODE_UPDATE,
            successMessage: response.Message
          });

        }

        this.busy = false;

        Util.log('updateUserPayment()', response);
      });
    }
    else {
      // Creating the record

      UserPaymentAPIRequestData.fillUserPaymentForCreate(requestData, this.userPayment);

      this.appService.saveUserPayment(requestData).subscribe(response => {

        if (Util.isDefined(response) && Util.isDefined(response.Code) && response.Code == 'ADD_CREDIT_CARD') {
          this.userPayment = response.Data[0];

          this.close({
            userPayment: this.userPayment,
            modalMode: this.constants.MODE_CREATE,
            successMessage: response.Message
          });

        }

        this.busy = false;

        Util.log('createUserPayment()', response);
      });
    }

    Util.log('saveUserPayment()', this.userPayment);
  }

  private close = (data) => {
    data = data || {};
    data.action = 'close';

    this.modalEvents.emit(data);

    this.closeModal();
  }
}