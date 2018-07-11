import { Component, ViewChild, NgZone, EventEmitter, Output, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../../../shared/util';
import { Constants } from '../../../../shared/constants';

// Shared Models
import { UserAddress } from '../../../../shared/models/user-address';

// Shared Services
import { EventsService } from '../../../../shared/services/events.service';
import { BaseModal } from '../../../../shared/services/base-modal.service';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { ToastsManager } from "ng2-toastr/ng2-toastr";

declare var document, google;

@Component({
	selector: 'user-address-list-modal',
	templateUrl: './user-address-list-modal.component.html',
	
})
export class UserAddressListModalComponent extends BaseModal {
	LOG_TAG = 'UserAddressListModalComponent';

	resolve: any;
	busy = false;

	@Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();

	constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public eventsService: EventsService, public sharedDataService: SharedDataService, private zone: NgZone, private toastr: ToastsManager, private changeDetectorRef: ChangeDetectorRef) {
		super(eventsService);
	}

	/**
	 * Methods
	 */
	open = () => {
		this.openModal();

		this.init();

		return new Promise<any>((resolve, reject) => {
			this.resolve = resolve;
		});
	}

	init = () => {

	}

	userAddressListEvent = (event) => {
		Util.log(this.LOG_TAG, 'userAddressListEvent', event);

		if (event.action == 'busy') {
			this.busy = event.data;
			this.changeDetectorRef.detectChanges();
		}

		if (event.action == 'set-default') {
			this.close();
		}
	}

	close = (data?) => {
		this.resolve(data);

		this.closeModal();
	}
}