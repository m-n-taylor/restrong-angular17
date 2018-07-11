import { Component, ViewChild, NgZone, EventEmitter, Output, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

// Shared Helpers
import { Util } from '../../../../shared/util';
import { Constants } from '../../../../shared/constants';

// RO Models
import { User } from '../../models/user';
import { Restaurant } from '../../models/restaurant';
import { ROAPIRequestData } from '../../models/ro-api-request-data';

// Shared Services
import { InputService } from '../../../../shared/services/input.service';
import { EventsService } from '../../../../shared/services/events.service';
import { BaseModal } from '../../../../shared/services/base-modal.service';

// RO Services
import { ROService } from '../../services/ro.service';

// 3rd Party Libs
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { ColorService } from "../../../../shared/services/color.service";

declare var document, google;

@Component({
	selector: 'color-picker-modal',
	templateUrl: './color-picker-modal.component.html',
	
})
export class ColorPickerModalComponent extends BaseModal {

	/**
	 * Properties
	 */
	readonly LOG_TAG = 'ColorPickerModalComponent';
	resolve: any;

	colorPaletteList = [];

	constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public eventsService: EventsService, private ROService: ROService, public colorService: ColorService, private toastr: ToastsManager) {
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
		this.colorPaletteList = this.colorService.colorPaletteList;
	}

	chooseColorPalette = (colorPalette) => {
		this.close({
			colorPalette: colorPalette
		});
	}

	close = (data?) => {
		if (data) {
			this.resolve(data);
		}

		this.closeModal();
	}
}