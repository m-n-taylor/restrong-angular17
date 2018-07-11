import { Component, ChangeDetectionStrategy, ViewEncapsulation, ViewChild, NgZone, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Shared Helpers
import { Util } from '../../../../shared/util';

// Shared Models
import { UserAddress } from '../../../../shared/models/user-address';
import { UserAPIRequestData } from '../../../../shared/models/user-api-request-data';

// Shared Services
import { AppService } from '../../../../shared/services/app.service';
import { BaseModal } from '../../../../shared/services/base-modal.service';
import { EventsService } from '../../../../shared/services/events.service';

declare var document;

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.Emulated,
  selector: 'manage-user-addresses-modal',
  templateUrl: './manage-user-addresses-modal.component.html',
  providers: []
})
export class ManageUserAddressesModalComponent extends BaseModal {

  /**
   * Properties
   */
  busy = false;

  userAddresses = new Array<UserAddress>();

  selectedUserAddress = new UserAddress();

  @Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();

  constructor(public eventsService: EventsService, private appService: AppService, private zone: NgZone) {
    super(eventsService);
  }

  /**
   * Methods
   */

  open = (userAddresses?: Array<UserAddress>) => {
    this.openModal();

    if (!userAddresses) {
      this.loadData();
    }
    else {
      this.userAddresses = userAddresses;
    }
  }

  loadData = () => {
    this.busy = true;

    var requestData = new UserAPIRequestData();

    this.appService.getUserAddresses(requestData).subscribe(response => {
      this.userAddresses = response;
      this.busy = false;

      Util.log('manage user addresses ', response);
    });

    Util.log('loadData');
  }


  chooseUserAddress = (userAddress: UserAddress) => {
    this.selectedUserAddress = userAddress;
  }

  save = () => {
    this.close(this.selectedUserAddress);
  }

  close = (userAddress?: UserAddress) => {
    this.modalEvents.emit({
      action: 'close',
      data: userAddress
    });
    
    this.closeModal();
  }
}