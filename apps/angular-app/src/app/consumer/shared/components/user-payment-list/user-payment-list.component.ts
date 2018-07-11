import { Component, ViewChild, NgZone, EventEmitter, Output, Inject, PLATFORM_ID, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../../../shared/util';
import { Constants } from '../../../../shared/constants';

// Shared Models
import { UserPayment } from '../../../../shared/models/user-payment';

// Shared Services
import { EventsService } from '../../../../shared/services/events.service';
import { BaseModal } from '../../../../shared/services/base-modal.service';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { UserAPIRequestData } from "../../../../shared/models/user-api-request-data";

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import { AppService } from "../../../../shared/services/app.service";
import { ChangeAddressModalComponent } from "../change-address-modal/change-address-modal.component";
import { UserPaymentAPIRequestData } from "../../../../shared/models/user-payment-api-request-data";
import { ToastsManager } from "ng2-toastr/ng2-toastr";
import { ConfirmModalComponent } from "../../../../shared/components/confirm-modal/confirm-modal.component";
import { SaveUserPaymentModalComponent } from "../save-user-payment-modal/save-user-payment-modal.component";

declare var document, google;

@Component({
	selector: 'user-payment-list',
	templateUrl: './user-payment-list.component.html',

})
export class UserPaymentListComponent {
	LOG_TAG = 'UserPaymentListComponent';

	userPayments = new Array<UserPayment>();
	busy = false;

	@Input() selectedUserPayment = new UserPayment();
	@Output() selectedUserPaymentChange = new EventEmitter<any>();

	@Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();

	@ViewChild('confirmModal') public confirmModal: ConfirmModalComponent;
	@ViewChild('saveUserPaymentModal') public saveUserPaymentModal: SaveUserPaymentModalComponent;

	constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public eventsService: EventsService, public sharedDataService: SharedDataService, private zone: NgZone, public appService: AppService, private toastr: ToastsManager) {
	}

	ngOnInit() {
		this.loadData();
	}

	loadData = () => {
		Util.log(this.LOG_TAG, 'loadData');

		this.busy = true;

		var promiseList = [];

		var requestData = new UserAPIRequestData();
		promiseList.push(this.appService.getUserPayments(requestData));

		Observable.forkJoin(promiseList).subscribe((responseList: any) => {
			var userPaymentResponse = responseList[0];

			this.userPayments = userPaymentResponse;

			var temp = this.userPayments.filter(u => u.Is_Default);

			if (temp.length > 0) {
				this.selectedUserPayment = temp[0];
				this.selectedUserPaymentChange.emit(this.selectedUserPayment);
			}

			this.busy = false;

			Util.log(this.LOG_TAG, 'promiseList()', responseList);
		});
	}

	editUserPayment = (userPayment?: UserPayment) => {
		Util.log(this.LOG_TAG, 'editUserPayment', userPayment);

		this.saveUserPaymentModal.open({ userPayment: userPayment }).then((data) => {
			if (userPayment) {
				Util.merge(userPayment, data.userPayment);
			}
			else {
				this.userPayments.push(data.userPayment);
			}

			Util.log(this.LOG_TAG, 'openAddNewAddressModal', data);
		});
	}

	setDefaultUserPayment = (userPayment: UserPayment) => {
		Util.log(this.LOG_TAG, 'setDefaultUserPayment');

		for (var i in this.userPayments) {
			var item = this.userPayments[i];
			item.Is_Default = false;
		}

		userPayment.busy = true;

		var requestData = new UserPaymentAPIRequestData();
		requestData.a = userPayment.ID;

		this.appService.setDefaultUserPayment(requestData)
			.subscribe(response => {

				if (Util.isDefined(response) && Util.isDefined(response.Code)) {
					if (response.Code == 'SET_DEFAULT_CREDIT_CARD') {
						userPayment.Is_Default = true;

						this.selectedUserPayment = userPayment;
						this.selectedUserPaymentChange.emit(this.selectedUserPayment);

						this.toastr.success('Successfully set default delivery address.', 'Success!');
					}
				}

				userPayment.busy = false;

				Util.log('setDefaultUserPayment()', response);
			});
	}

	saveUserPayment = (userPayment: UserPayment) => {
		Util.log(this.LOG_TAG, 'saveUserPayment');

		this.busy = true;

		this.appService.saveUserPayment({ userPayment: userPayment })
			.subscribe(response => {

				if (Util.isDefined(response) && Util.isDefined(response.Code)) {
					if (response.Code == 'ADD_DELIVERY_ADDRESS') {
						userPayment.ID = response.NewID;
						this.userPayments.push(userPayment);

						this.toastr.success('Address added successfully.', 'Success!');
					}
					else if (response.Code == 'UPDATE_DELIVERY_ADDRESS') {
						this.toastr.success('Address updated successfully.', 'Success!');
					}
				}

				this.busy = false;

				Util.log('saveUserPayment()', response);
			});
	}

	deleteUserPayment = (userPaymentIndex: number, userPayment: UserPayment) => {
		this.confirmModal.open({ message: `Are you sure you want to delete ${userPayment.CardHolder}?` })
			.then((confirm) => {

				if (confirm) {
					this._deleteUserPayment(userPaymentIndex, userPayment);
				}

			});
	}

	private _deleteUserPayment = (userPaymentIndex: number, userPayment: UserPayment) => {
		Util.log(this.LOG_TAG, 'deleteUserPayment');

		userPayment.busy = true;

		var requestData = new UserPaymentAPIRequestData();
		requestData.a = userPayment.ID;

		this.appService.deleteUserPayment(requestData)
			.subscribe(response => {

				if (Util.isDefined(response) && Util.isDefined(response.Code)) {
					if (response.Code == 'DELETE_CREDIT_CARD') {
						this.userPayments.splice(userPaymentIndex, 1);

						this.toastr.success('Successfully deleted delivery address.', 'Success!');
					}
				}

				userPayment.busy = false;

				Util.log('deleteUserPayment()', response);
			});
	}
}