import { Component, ViewChild, NgZone, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseModal } from "../../../../shared/services/base-modal.service";
import { UserPayment } from "../../../../shared/models/user-payment";
import { Constants } from "../../../../shared/constants";
import { EventsService } from "../../../../shared/services/events.service";
import { AppService } from "../../../../shared/services/app.service";
import { UserPaymentAPIRequestData } from "../../../../shared/models/user-payment-api-request-data";
import { Util } from "../../../../shared/util";
import { ToastsManager } from "ng2-toastr/ng2-toastr";

declare var document;

@Component({
	selector: 'save-user-payment-modal',
	templateUrl: './save-user-payment-modal.component.html',
	
})
export class SaveUserPaymentModalComponent extends BaseModal {

	/**
	 * Properties
	 */
	LOG_TAG = 'SaveUserPaymentModalComponent';
	resolve: any;
	busy = false;

	userPayment = new UserPayment();
	expiryMonth: string;
	expiryYear: string;

	public get isNewUserPayment(): boolean {
		return Util.isNewObject(this.userPayment);
	}

	@Output() public modalEvents: EventEmitter<any> = new EventEmitter<any>();

	constructor(public constants: Constants, protected eventsService: EventsService, private appService: AppService, private zone: NgZone, private toastr: ToastsManager) {
		super(eventsService);
	}

	/**
	 * Methods
	 */
	open = (data) => {
		this.openModal();

		this.init(data);

		return new Promise<any>((resolve, reject) => {
			this.resolve = resolve;
		});
	}

	init = (data) => {
		var userPayment = data.userPayment;

		if (userPayment) {
			this.userPayment = Util.clone(userPayment);

			var expiry = this.userPayment.Expiry.split('/');
			this.expiryMonth = expiry[0];
			this.expiryYear = expiry[1];
		}
		else {
			this.userPayment = new UserPayment();
			this.expiryMonth = this.constants.CARD_MONTHS[0].value;
			this.expiryYear = this.constants.CARD_YEARS[0].value;
		}
	}

	saveUserPayment = () => {
		Util.log(this.LOG_TAG, 'saveUserPayment');

		this.userPayment.Expiry = `${this.expiryMonth}/${this.expiryYear}`;
		this.userPayment.CardHolder = `${this.userPayment.Billing_FirstName} ${this.userPayment.Billing_LastName}`;

		this.busy = true;

		this.appService.saveUserPayment({ userPayment: this.userPayment })
			.subscribe(response => {

				if (Util.isDefined(response) && Util.isDefined(response.Code)) {
					if (response.Code == 'ADD_CREDIT_CARD') {
						this.userPayment = response.Data[0];

						this.toastr.success('Successfully added payment method.', 'Success!');

						this.close({
							userPayment: this.userPayment,
							action: 'add'
						});
					}
					else if (response.Code == 'UPDATE_BILLING_ADDRESS') {
						this.toastr.success('Successfully updated payment method.', 'Success!');

						this.close({
							userPayment: this.userPayment,
							action: 'update'
						});
					}
				}

				this.busy = false;

				Util.log('saveUserPayment()', response);
			});
	}

	close = (data?) => {
		if (data) {
			this.resolve(data);
		}

		this.closeModal();
	}
}