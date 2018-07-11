import { Component, ViewChild, NgZone, EventEmitter, Output, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../../../shared/util';
import { Constants } from '../../../../shared/constants';

// RO Models
import { Head } from '../../models/head';
import { HeadAPIRequestData } from '../../models/head-api-request-data';

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
  selector: 'save-head-modal',
  templateUrl: './save-head-modal.component.html',
  
})
export class SaveHeadModalComponent extends BaseModal {

  /**
   * Properties
   */
  LOG_TAG = 'SaveHeadModalComponent';

  fireFlyID: string;
  masterHeadID: number;

  private _originalHead: Head; // Will keeps reference to orignal object
  head = new Head();

  busy = false;

  public get isNewHead(): boolean {
    return !Util.isDefined(this.head.ID);
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
    this.masterHeadID = data.masterHeadID;

    if (Util.isDefined(data.head)) {
      this._originalHead = data.head;
      this.head = Util.clone(this._originalHead);
    }
    else {
      this.head = new Head();
    }
  }

  save = (form) => {
    Util.log(this.LOG_TAG, 'save', form);

    this.busy = true;

    var data = {
      fireFlyID: this.fireFlyID,
      masterHeadID: this.masterHeadID,
      head: this.head
    };

    this.ROService.saveHead(data).subscribe(response => {
      if (this.isNewHead) {

        if (response.Status == this.constants.STATUS_SUCCESS) {
          var head: Head = response.Data;

          this._originalHead = head;
          this.head = Util.clone(this._originalHead);

          this.modalEvents.emit({
            action: BaseModal.EVENT_ADD_ITEM,
            data: head
          });
        }
        else {
          this.toastr.error('Sorry, Unable to save item', 'Error!');
        }

      }
      else {
        if (response.Status == this.constants.STATUS_SUCCESS) {
          Util.merge(this._originalHead, this.head);
        }
      }

      this.busy = false;

      if (response.Status == this.constants.STATUS_SUCCESS)
        this.close();

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