import { Component, ChangeDetectionStrategy, ViewEncapsulation, ViewChild, Output, NgZone, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// Shared Models
import { UserPayment } from '../../shared/models/user-payment';
import { UserAPIRequestData } from '../../shared/models/user-api-request-data';
import { SearchMenuAPIRequestData } from '../../shared/models/search-menu-api-request-data';
import { UserPaymentAPIRequestData } from '../../shared/models/user-payment-api-request-data';

// Shared Services
import { AppService } from '../../shared/services/app.service';
import { QueryParams } from '../../shared/models/query-params';
import { SaveUserPaymentModalComponent } from "../shared/components/save-user-payment-modal/save-user-payment-modal.component";

declare var document;

@Component({
  selector: 'user-payments',
  templateUrl: './user-payments.component.html',
  
})
export class UserPaymentsComponent {

  /**
   * Properties
   */
  busy = false;
  successMessage: string;
  errorMessage: string;

  searchText = '';
  userPayments = new Array<UserPayment>();

  @ViewChild('addUserPaymentModal') addUserPaymentModal: SaveUserPaymentModalComponent;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public appService: AppService) {
    this.universalInit();
  }

  universalInit() {
    Util.log('universalInit()');

    if (isPlatformBrowser(this.platformId)) {
      this.loadData();
    }
  }

  /**
   * Methods
   */

  loadData = () => {
    this.busy = true;

    var requestData = new UserAPIRequestData();

    this.appService.getUserPayments(requestData).subscribe(response => {
      this.userPayments = response;
      this.busy = false;

      Util.log('user payments ', response);
    });

    Util.log('loadData');
  }

  openAddUserPaymentModal = (userPayment?: UserPayment) => {
    this.addUserPaymentModal.open(userPayment);
  }

  deleteUserPayment = (userPayment: UserPayment) => {
    this.busy = true;

    var requestData = new UserPaymentAPIRequestData();
    UserPaymentAPIRequestData.fillUserPaymentID(requestData, userPayment);

    this.appService.deleteUserPayment(requestData).subscribe(response => {

      if (Util.isDefined(response) && Util.isDefined(response.Code) && response.Code == 'DELETE_CREDIT_CARD') {
        var userPaymentIndex = this.userPayments.indexOf(userPayment);

        if (userPaymentIndex > -1) {
          this.userPayments.splice(userPaymentIndex, 1);
        }

        this.successMessage = response.Message;
      }
      else {
        this.errorMessage = Util.makeErrorMessage('delete payment method');
      }

      this.busy = false;

      Util.log('user payments ', response);
    });
  }

  addUserPaymentModalEvents = (data) => {
    if (data.action == 'close') {

      var modalMode = data.modalMode;

      if (modalMode == this.constants.MODE_CREATE) {
        var userPayment = <UserPayment>data.userPayment;
        this.userPayments.push(userPayment);
      }

      // Show success message from modal
      if (Util.isDefined(data.successMessage)) {
        this.successMessage = data.successMessage;
      }

    }
  }

}
