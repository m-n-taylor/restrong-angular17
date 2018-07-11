import { Component, ViewChild, NgZone, EventEmitter, Output, Inject, PLATFORM_ID, Input, ChangeDetectorRef } from '@angular/core';
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
import { UserAPIRequestData } from "../../../../shared/models/user-api-request-data";

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import { AppService } from "../../../../shared/services/app.service";
import { ChangeAddressModalComponent } from "../change-address-modal/change-address-modal.component";
import { UserAddressAPIRequestData } from "../../../../shared/models/user-address-api-request-data";
import { ToastsManager } from "ng2-toastr/ng2-toastr";
import { ConfirmModalComponent } from "../../../../shared/components/confirm-modal/confirm-modal.component";
import { ShoppingCart } from '../../services/shopping-cart.service';

declare var document, google;

@Component({
	selector: 'user-address-list',
	templateUrl: './user-address-list.component.html',

})
export class UserAddressListComponent {
	LOG_TAG = 'UserAddressListComponent';

	userAddresses = new Array<UserAddress>();
	busyAction = false;

	@Input() busy = false;
	@Input() selectedUserAddress = new UserAddress();
	@Input() changeAddressModal: ChangeAddressModalComponent;

	@Output() events: EventEmitter<any> = new EventEmitter<any>();

	@ViewChild('confirmModal') public confirmModal: ConfirmModalComponent;

	constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public eventsService: EventsService, public sharedDataService: SharedDataService, private zone: NgZone, public appService: AppService, private toastr: ToastsManager, private shoppingCart: ShoppingCart) {
	}

	ngOnInit() {
		this.loadData();
	}

	loadData = () => {
		Util.log(this.LOG_TAG, 'loadData');

		this.busy = true;
		this.events.emit({
			action: 'busy',
			data: this.busy
		});

		var promiseList = [];

		var requestData = new UserAPIRequestData();
		promiseList.push(this.appService.getUserAddresses(requestData));

		Observable.forkJoin(promiseList).subscribe((responseList: any) => {
			var userAddressResponse = responseList[0];

			this.userAddresses = userAddressResponse;

			for (var i in this.userAddresses) {
				var userAddress = this.userAddresses[i];

				if (userAddress.Is_Default) {
					this.selectedUserAddress = userAddress;
				}
			}

			this.busy = false;
			this.events.emit({
				action: 'busy',
				data: this.busy
			});

			Util.log(this.LOG_TAG, 'promiseList()', responseList);
		});
	}

	editUserAddress = (userAddress?: UserAddress) => {
		Util.log(this.LOG_TAG, 'openAddNewAddressModal', userAddress);

		this.changeAddressModal.open({ userAddress: userAddress }).then((data) => {

			// If data is passed
			if (Util.isDefined(data)) {

				// if user address is passed
				if (Util.isDefined(data.userAddress)) {
					if (userAddress) {
						Util.merge(userAddress, data.userAddress);
					}
					else {
						userAddress = data.userAddress;
					}

					this.saveUserAddress(userAddress);
				}

			}
			else {
				// user cancelled
			}

			Util.log(this.LOG_TAG, 'openAddNewAddressModal', data);
		});
	}

	setDefaultUserAddress = (userAddress: UserAddress) => {
		if (this.shoppingCart.cartItems.length > 0) {
			this.confirmModal.open({ message: this.constants.MSG_WARN_CHANGE_ADDRESS, okText: 'Continue', cancelText: 'Cancel' })
				.then((confirm) => {
					if (confirm) {
						this._setDefaultUserAddress(userAddress);
					}
				});
		}
		else {
			this._setDefaultUserAddress(userAddress);
		}
	}

	private _setDefaultUserAddress = (userAddress: UserAddress) => {
		Util.log(this.LOG_TAG, 'setDefaultUserAddress');

		this.selectedUserAddress = userAddress;

		this.busyAction = true;

		var requestData = new UserAddressAPIRequestData();
		requestData.a = userAddress.ID;

		this.appService.setDefaultUserAddress(requestData)
			.subscribe(response => {

				if (Util.isDefined(response) && Util.isDefined(response.Code)) {
					if (response.Code == 'SET_DEFAULT_DELIVERY_ADDRESS') {
						this.toastr.success('Successfully set default delivery address.', 'Success!');

						this.sharedDataService.userAddress = userAddress;

						this.events.emit({
							action: 'set-default',
							data: this.busy
						});
					}
				}

				this.busyAction = false;

				Util.log('setDefaultUserAddress()', response);
			});
	}

	saveUserAddress = (userAddress: UserAddress) => {
		Util.log(this.LOG_TAG, 'saveUserAddress');

		this.busyAction = true;

		this.appService.saveUserAddress({ userAddress: userAddress })
			.subscribe(response => {

				if (Util.isDefined(response) && Util.isDefined(response.Code)) {
					if (response.Code == 'ADD_DELIVERY_ADDRESS') {
						userAddress.ID = response.NewID;
						this.userAddresses.push(userAddress);

						this.toastr.success('Address added successfully.', 'Success!');
					}
					else if (response.Code == 'UPDATE_DELIVERY_ADDRESS') {
						this.toastr.success('Address updated successfully.', 'Success!');
					}
				}

				this.busyAction = false;

				Util.log('saveUserAddress()', response);
			});
	}

	deleteUserAddress = (userAddressIndex: number, userAddress: UserAddress) => {
		this.confirmModal.open({ message: `Are you sure you want to delete ${userAddress.Address}?` })
			.then((confirm) => {

				if (confirm) {
					this._deleteUserAddress(userAddressIndex, userAddress);
				}

			});
	}

	private _deleteUserAddress = (userAddressIndex: number, userAddress: UserAddress) => {
		Util.log(this.LOG_TAG, 'deleteUserAddress');

		this.busyAction = true;

		var requestData = new UserAddressAPIRequestData();
		requestData.a = userAddress.ID;

		this.appService.deleteUserAddress(requestData)
			.subscribe(response => {

				if (Util.isDefined(response) && Util.isDefined(response.Code)) {
					if (response.Code == 'DELETE_DELIVERY_ADDRESS') {
						this.userAddresses.splice(userAddressIndex, 1);

						this.toastr.success('Successfully deleted delivery address.', 'Success!');
					}
				}

				this.busyAction = false;

				Util.log('deleteUserAddress()', response);
			});
	}
}