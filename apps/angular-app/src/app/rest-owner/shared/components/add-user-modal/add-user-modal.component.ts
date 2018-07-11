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

declare var document, google;

@Component({
	selector: 'add-user-modal',
	templateUrl: './add-user-modal.component.html',
	
})
export class AddUserModalComponent extends BaseModal {

	/**
	 * Properties
	 */
	readonly LOG_TAG = 'AddUserModalComponent';

	readonly TAB_PROFILE = 'TAB_PROFILE';
	readonly TAB_ASSOC_REST = 'TAB_ASSOC_REST';

	private _originalUser: User; // Will keeps reference to orignal object
	user: User;

	ownerRestList: Array<Restaurant>;
	userRestList: Array<Restaurant>;
	userRestListFFIDs: Array<string>;

	selectAllRest: boolean;

	restSearchText = '';
	restSearchHiddenCount = 0;

	activeTab: string;
	busy: boolean;
	busySave: boolean;

	public get isNewUser(): boolean {
		return !Util.isDefined(this.user.id);
	}

	@Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();

	constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public eventsService: EventsService, private ROService: ROService, public input: InputService, private toastr: ToastsManager) {
		super(eventsService);

		this.initVariables();
	}

	/**
	 * Methods
	 */
	initVariables = () => {
		this.user = new User();

		this.ownerRestList = new Array<Restaurant>();
		this.userRestList = new Array<Restaurant>();
		this.userRestListFFIDs = new Array<string>();

		this.selectAllRest = false;
		this.busy = false;
		this.busySave = false;
	}

	open = (data) => {
		this.openModal();

		this.initVariables();
		this.init(data);
	}

	init = (data) => {
		if (Util.isDefined(data.user)) {
			this._originalUser = data.user;
			this.user = Util.clone(this._originalUser);
		}
		else {
			this.user = new User();

			// this.user.FirstName = 'TestFirstName';
			// this.user.LastName = 'TestLastName';
			// this.user.Email = 'TestEmail@test.com';
			// this.user.Password = 'TestPassword';
		}

		this.loadUserRestList();

		this.selectTab(this.TAB_PROFILE);
	}

	selectTab = (tab) => {
		this.activeTab = tab;
	}

	loadUserRestList = () => {
		Util.log(this.LOG_TAG, 'loadAssocRestTab()');

		this.busy = true;

		var requestData = new ROAPIRequestData();

		if (!this.isNewUser)
			ROAPIRequestData.fillID(requestData, this.user.id);

		var restListPromise = this.ROService.getUserRestList(requestData);

		restListPromise.subscribe((response: any) => {
			if (response.Status == this.constants.STATUS_SUCCESS) {
				this.ownerRestList = response.Data;
				this.userRestList = response.UserData || [];

				this.userRestListFFIDs = new Array<string>();

				for (var ownerRestIndex in this.ownerRestList) {
					var ownerRest = this.ownerRestList[ownerRestIndex];
					ownerRest.isSelected = false;

					for (var userRestListIndex in this.userRestList) {
						var userRest = this.userRestList[userRestListIndex];

						if (ownerRest.FireFlyID == userRest.FireFlyID) {
							ownerRest.isSelected = true;
							this.userRestListFFIDs.push(ownerRest.FireFlyID);

							break;
						}
					}
				}
			}

			this.busy = false;

			Util.log(this.LOG_TAG, 'getUserRestList', response);
		});
	}

	restSearchTextChanged = () => {
		this.restSearchHiddenCount = 0;

		for (var restIndex in this.ownerRestList) {
			var rest = this.ownerRestList[restIndex];

			rest.isHidden = rest.Name.toLowerCase().indexOf(this.restSearchText.toLowerCase()) == -1;

			if (rest.isHidden) {
				this.restSearchHiddenCount++;
			}
		}
	}

	selectAll = () => {
		this.userRestListFFIDs = new Array<string>();

		for (var ownerRestIndex in this.ownerRestList) {
			var ownerRest = this.ownerRestList[ownerRestIndex];
			ownerRest.isSelected = this.selectAllRest;

			if (ownerRest.isSelected) {
				this.userRestListFFIDs.push(ownerRest.FireFlyID);
			}
		}

		this.selectAllRest = this.selectAllRest;
	}

	ownerRestSelectionChanged = (rest: Restaurant) => {
		var restIndex = this.userRestListFFIDs.indexOf(rest.FireFlyID);

		if (rest.isSelected) {
			this.userRestListFFIDs.push(rest.FireFlyID);
		}
		else {
			this.userRestListFFIDs.splice(restIndex, 1);
		}

		Util.log(this.LOG_TAG, 'ownerRestSelectionChanged', rest.isSelected);
	}

	save = (form) => {
		if (!form.valid) {
			this.toastr.error('Form contains some errors.', 'Sorry!');
		}
		else {
			var oldFFIDs = this.userRestList.map((a) => a.FireFlyID);
			var newFFIDs = this.userRestListFFIDs;

			if (newFFIDs.length == 0) {
				this.toastr.error('Atleast 1 Restaurant must be selected...', 'Error!');
			}

			else {
				var addIDs: Array<string> = Util.arrayDiff(newFFIDs, oldFFIDs);
				var deleteIDs: Array<string> = Util.arrayDiff(oldFFIDs, newFFIDs);

				Util.log(this.LOG_TAG, 'addIDs', addIDs, 'deleteIDs', deleteIDs);

				Util.log(this.LOG_TAG, 'save', form);

				this.busySave = true;

				this.ROService.saveUser({ user: this.user }).subscribe((userResponse: any) => {

					if (userResponse.Status == this.constants.STATUS_SUCCESS) {

						if (this.isNewUser) {
							var user: User = userResponse.Data;
							user.Password = '';
							user.ConfirmPassword = '';

							this._originalUser = user;
							this.user = Util.clone(this._originalUser);

							this.modalEvents.emit({
								action: BaseModal.EVENT_ADD_ITEM,
								data: user
							});
						}
						else {
							this.user.Password = '';
							this.user.ConfirmPassword = '';
							Util.merge(this._originalUser, this.user);
						}

						// var promiseList = [];

						// if (addIDs.length > 0) {
						//   var requestData = new ROAPIRequestData();

						//   ROAPIRequestData.fillFireFlyID(requestData, addIDs.join(','));
						//   ROAPIRequestData.fillID(requestData, this.user.id);

						//   promiseList.push(this.ROService.addUserRestList(requestData));
						// }

						// if (deleteIDs.length > 0) {
						//   var requestData = new ROAPIRequestData();

						//   ROAPIRequestData.fillFireFlyID(requestData, deleteIDs.join(','));
						//   ROAPIRequestData.fillID(requestData, this.user.id);

						//   promiseList.push(this.ROService.deleteUserRestList(requestData));
						// }

						// if (promiseList.length > 0) {

						// Observable.forkJoin(promiseList).subscribe((restListResponse: any) => {
						//   this.onSaveSuccess(restListResponse[0].Status);
						// });



						// }

						if (addIDs.length > 0 || deleteIDs.length > 0) {
							var requestData = new ROAPIRequestData();

							requestData.ffadd = addIDs.join(',');
							requestData.ffdelete = deleteIDs.join(',');

							ROAPIRequestData.fillID(requestData, this.user.id);

							this.ROService.updateUserRestList(requestData).subscribe((restListResponse: any) => {
								this.onSaveSuccess(restListResponse.Status);
							});
						}
						else {
							this.onSaveSuccess(userResponse.Status);
						}

					}
					else {
						var code = userResponse.Code;

						if (userResponse.Code == 'ERR_EMAIL_EXIST') {
							form.controls.Email.setErrors({ asyncInvalid: true, asyncInvalidMsg: ' already exist' });
						}

						this.toastr.error('Sorry, Unable to save item', 'Error!');

						this.busySave = false;
					}

					Util.log(this.LOG_TAG, 'addUser', userResponse);
				});

			}
		}
	}

	onSaveSuccess = (status) => {
		this.busySave = false;

		if (status == this.constants.STATUS_SUCCESS) {
			this.toastr.success('Saved user successfully.', 'Success!');
			this.close();
		}
	}

	close = () => {
		this.modalEvents.emit({
			action: 'close',
			data: {}
		});

		this.closeModal();
	}
}