import { Component, ViewChild, NgZone, EventEmitter, Output, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../../../shared/util';
import { Constants } from '../../../../shared/constants';

// RO Models
import { MasterHead } from '../../models/master-head';
import { MasterHeadAPIRequestData } from '../../models/masterhead-api-request-data';

// Shared Services
import { EventsService } from '../../../../shared/services/events.service';
import { InputService } from '../../../../shared/services/input.service';
import { BaseModal } from '../../../../shared/services/base-modal.service';

// RO Services
import { ROService } from '../../services/ro.service';

// 3rd Party Libs
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

declare var document, google;

@Component({
  selector: 'save-masterhead-modal',
  templateUrl: './save-masterhead-modal.component.html',
  providers: []
})
export class SaveMasterHeadModalComponent extends BaseModal {

  /**
   * Properties
   */
  LOG_TAG = 'SaveMasterHeadModalComponent';

  fireFlyID: string;

  activeTab: string;

  private _originalMasterHead: MasterHead; // Will keeps reference to orignal object
  masterHead = new MasterHead();

  busy = false;

  public get isNewMasterHead(): boolean {
    return !Util.isDefined(this.masterHead.ID);
  }

  @Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();

  constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public eventsService: EventsService, private ROService: ROService, public input: InputService, private toastr: ToastsManager) {
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
    this.fireFlyID = data.fireFlyID;

    if (Util.isDefined(data.masterHead)) {
      this._originalMasterHead = data.masterHead;
      this.masterHead = Util.clone(this._originalMasterHead);
    }
    else {
      this.masterHead = new MasterHead();
    }

  }

  save = (form) => {
    Util.log(this.LOG_TAG, 'save', form);

    this.busy = true;

    var data = {
      fireFlyID: this.fireFlyID,
      masterHead: this.masterHead
    };

    this.ROService.saveMasterHead(data).subscribe(response => {
      if (response.Status == this.constants.STATUS_SUCCESS) {
        var isNew = this.isNewMasterHead;

        if (isNew) {
          var masterHead: MasterHead = response.Data;

          this._originalMasterHead = masterHead;
          this.masterHead = Util.clone(this._originalMasterHead);

          this.modalEvents.emit({
            action: BaseModal.EVENT_ADD_ITEM,
            data: masterHead
          });

        }
        else {
          Util.merge(this._originalMasterHead, this.masterHead);
        }

        this.toastr.success(`${this.masterHead.Name} ${ isNew ? 'added' : 'updated' } successfully.`, 'Success!');
      }
      else {
        this.toastr.error('Unable to save item, Please try later.', 'Sorry!');
      }

      this.busy = false;

      this.close();

      this.toastr.success

      Util.log(this.LOG_TAG, 'save', response);
    });
  }

  close = () => {
    this.modalEvents.emit({
      action: 'close',
      data: {}
    });

    this.closeModal();
  }
}