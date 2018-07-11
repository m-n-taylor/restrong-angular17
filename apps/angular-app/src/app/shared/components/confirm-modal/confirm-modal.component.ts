import { Component, ViewChild, NgZone, EventEmitter, Output, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../util';
import { Constants } from '../../constants';

// RO Models
import { User } from '../../models/user';

// Shared Services
import { EventsService } from '../../services/events.service';
import { BaseModal } from '../../services/base-modal.service';
import { ROService } from "../../../rest-owner/shared/services/ro.service";

// RO Services

declare var document, google;

class ConfirmModalData {
	public title?= 'Confirm';
	public message?= '';
	public okText?= 'Yes';
	public cancelText?= 'No';
}

@Component({
	selector: 'confirm-modal',
	templateUrl: './confirm-modal.component.html',
})
export class ConfirmModalComponent extends BaseModal {

	/**
	 * Properties
	 */
	LOG_TAG = 'ConfirmModalComponent';

	data: ConfirmModalData;

	busy = false;

	resolve: any;

	@Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();

	constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public eventsService: EventsService, private ROService: ROService) {
		super(eventsService);
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

	init = (data: ConfirmModalData) => {
		this.data = data;

		this.data.title = this.data.title || 'Confirm';
		this.data.okText = this.data.okText || 'Yes';
		this.data.cancelText = this.data.cancelText || 'No';
	}

	close = (confirm) => {
		this.resolve(confirm);

		this.closeModal();
	}
}