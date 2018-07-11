import { Component, ViewChild, NgZone, EventEmitter, Input, Output, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../../../shared/util';
import { Constants } from '../../../../shared/constants';

// RO Models
import { ROAPIRequestData } from '../../models/ro-api-request-data';

// CR Models
import { SearchMenuAPIRequestData } from '../../../../shared/models/search-menu-api-request-data';

// Shared Services
import { AppService as CRService } from '../../../../shared/services/app.service';
import { EventsService } from '../../../../shared/services/events.service';
import { BaseModal } from '../../../../shared/services/base-modal.service';
import { InputService } from '../../../../shared/services/input.service';

// RO Services
import { ROService } from '../../services/ro.service';

// 3rd Party Libs
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

declare var document, google;

@Component({
	selector: 'request-demo',
	templateUrl: './request-demo.component.html',
	
})
export class RequestDemoComponent extends BaseModal {

	/**
	 * Properties
	 */
	LOG_TAG = 'RequestDemoComponent';

	busy = false;
	isBrowser = false;

	data: any = {};

	constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public eventsService: EventsService, private ROService: ROService, public input: InputService, private toastr: ToastsManager) {
		super(eventsService);

		this.isBrowser = isPlatformBrowser(this.platformId);
	}

	ngOnInit() {
		Util.log(this.LOG_TAG, 'init()');
	}

	submitRequestDemo = (event, form) => {
		Util.log(this.LOG_TAG, 'submitRequestDemo()', event, form);

		this.busy = true;

		var request = {
			f: this.data.FirstName,
			l: this.data.LastName,
			rn: this.data.RestName,
			e: this.data.Email,
			p: this.data.Phone,
		};

		this.ROService.requestDemo(request).subscribe((response: any) => {
			if (response.Status == this.constants.STATUS_SUCCESS) {
				this.toastr.success(`You request is submitted successfully. We will contact you as soon as possible.`, 'Success!');
			}
			else {
				this.toastr.error(`Unable to process your request at the moment, Please try again later.`, 'Error!');
			}

			this.data = {};

			form.resetForm();

			this.busy = false;

			Util.log(this.LOG_TAG, 'requestDemo response', response);
		});
	}
}