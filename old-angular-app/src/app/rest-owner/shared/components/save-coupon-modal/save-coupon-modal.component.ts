import { Component, ViewChild, NgZone, EventEmitter, Output, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../../../shared/util';
import { Constants } from '../../../../shared/constants';

// RO Models
import { Coupon } from '../../models/coupon';
import { MenuItem } from '../../models/menu-item';
import { Restaurant } from '../../models/restaurant';
import { CouponAPIRequestData } from '../../models/coupon-api-request-data';

// Shared Services
import { EventsService } from '../../../../shared/services/events.service';
import { BaseModal } from '../../../../shared/services/base-modal.service';
import { InputService } from "../../../../shared/services/input.service";

// RO Services
import { ROService } from '../../services/ro.service';

// Shared Components
import { DateTimeOptions } from "../../../../shared/components/datetime/datetime.component";

// 3rd Party Libs
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

declare var document, google;

@Component({
	selector: 'save-coupon-modal',
	templateUrl: './save-coupon-modal.component.html',
	providers: []
})
export class SaveCouponModalComponent extends BaseModal {

	/**
	 * Properties
	 */
	LOG_TAG = 'SaveCouponModalComponent';

	TYPE_ITEM_BASED = 1;
	TYPE_ORDER_BASED = 2;

	DISCOUNT_TYPE_PERCENT = this.constants.DISCOUNT_TYPE_PERCENT;
	DISCOUNT_TYPE_AMOUNT = this.constants.DISCOUNT_TYPE_AMOUNT;

	DURATION_TYPE_ALWAYS = 1;
	DURATION_TYPE_DATE = 2;

	fireFlyID: string;
	rest: Restaurant;

	private _originalCoupon: Coupon; // Will keeps reference to orignal object
	coupon: Coupon;

	rangeDate = null;
	rangeDateError = null;
	DTOptions = <DateTimeOptions>{
		mode: 'range'
	};

	timeDTOptions = <DateTimeOptions>{
		enableTime: true,
		noCalendar: true,
	};

	menuItemList: Array<MenuItem>;
	// selectedMenuItemList = new Array<MenuItem>();

	dailyStartTimeError = null;
	dailyEndTimeError = null;

	busy = false;
	busySave = false;

	public get isNewCoupon(): boolean {
		return !Util.isDefined(this.coupon.ID);
	}

	@Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();

	constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public eventsService: EventsService, private ROService: ROService, private zone: NgZone, private toastr: ToastsManager, public input: InputService) {
		super(eventsService);

		this.initOnce();
	}

	/**
	 * Methods
	 */
	open = (data) => {
		this.openModal();

		this.initOnce();
		this.init(data);
	}

	initOnce = () => {
		this.coupon = new Coupon();
		this.rangeDate = null;
		this.rangeDateError = null;
		this.menuItemList = new Array<MenuItem>();
		this.dailyStartTimeError = null;
		this.dailyEndTimeError = null;
	
		this.busy = false;
		this.busySave = false;
	}

	init = (data) => {
		Util.log(this.LOG_TAG, 'init');

		this.fireFlyID = data.fireFlyID;
		this.rest = data.rest;

		if (Util.isDefined(data.coupon)) {
			this._originalCoupon = data.coupon;
			this.coupon = Util.clone(this._originalCoupon);

			// this.coupon.DurationType = this.DURATION_TYPE_DATE;
			this.rangeDate = [
				this.coupon.StartDate,
				this.coupon.EndDate,
			];
		}
		else {
			this.zone.run(() => {
				this.coupon = new Coupon();

				this.coupon.DiscountType = this.DISCOUNT_TYPE_AMOUNT;
				this.coupon.DurationType = this.DURATION_TYPE_DATE;
				this.coupon.DiscountCriteria = this.constants.DISCOUNT_CRITERIA_FULL;
				this.changeCouponType(this.TYPE_ITEM_BASED);

				// this.coupon.Name = 'TestName ';
				// this.coupon.CouponCode = 'TestCode123' + Util.getRandomInt(1, 99999999);;
				// this.coupon.Description = 'TestDescription';
				// this.coupon.Limitation = 'TestLimitation';
				// this.rangeDate = [
				// 	'2017-05-10T00:00:00',
				// 	'2017-05-29T00:00:00',
				// ];

				// this.coupon.DiscountValue = 20;
				// this.coupon.MinOrder = 50;
				// this.coupon.MaxOrder = 300;
				// this.coupon.MaxRedeemPerCustomer = 5;
				// this.coupon.MaxRedeem = 150;
			});
		}

		// If DailyStartTime is NULL
		if (!Util.isDefined(this.coupon.DailyStartTime)) {
			this.coupon.DailyStartTime = this.constants.EMPTY_TIME;
		}

		// If DailyEndTime is NULL
		if (!Util.isDefined(this.coupon.DailyEndTime)) {
			this.coupon.DailyEndTime = this.constants.EMPTY_TIME;
		}

		this.loadData();

		Util.log(this.LOG_TAG, 'coupon', this.coupon);
	}

	loadData = () => {
		Util.log(this.LOG_TAG, 'loadData()');

		this.busy = true;

		var requestData = new CouponAPIRequestData();

		CouponAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);

		this.ROService.getShortMenuItemList(requestData).subscribe(response => {
			this.menuItemList = response.Data;

			for (var i in this.menuItemList) {
				var menuItem = this.menuItemList[i];

				var selectedMenuItems = this.coupon.MenuItems || [];

				for (var j in selectedMenuItems) {
					var selectedMenuItem = selectedMenuItems[j];

					if (menuItem.ID == selectedMenuItem.ID) {
						menuItem.isSelected = true;
					}
				}
			}

			this.busy = false;

			Util.log(this.LOG_TAG, 'getShortMenuItemList', response);
		});
	}

	changeCouponType = (couponType) => {
		this.coupon.CouponType = couponType;

		if (this.coupon.CouponType == this.TYPE_ITEM_BASED) {
			this.coupon.DiscountType = this.DISCOUNT_TYPE_PERCENT;
			this.coupon.DiscountCriteria = this.constants.DISCOUNT_CRITERIA_FULL;
		}
	}

	changeDurationType = (durationType) => {
		this.coupon.DurationType = durationType;

		this.validateDailyTime();
	}

	changeDiscountCriteria = (criteriaType) => {
		this.coupon.DiscountCriteria = criteriaType;
	}

	validateMinMaxOrder = (form) => {
		var valid = true;

		if (Util.isDefined(this.coupon.MaxOrder) && Util.isDefined(this.coupon.MinOrder)) {

			if (parseFloat(this.coupon.MaxOrder.toString()) < parseFloat(this.coupon.MinOrder.toString())) {
				valid = false;

				form.controls.MaxSubtotal.setErrors({ asyncInvalid: true, asyncInvalidMsg: ` must be greater then or equal to Min Subtotal` });

				Util.log('validateMinMaxOrder', 'Set ERROR');
			}
			else if (parseFloat(this.coupon.MaxOrder.toString()) > parseFloat(this.coupon.MinOrder.toString())) {
				form.controls.MaxSubtotal.setErrors(null);

				Util.log('validateMinMaxOrder', 'Set Null');
			}

		}

		Util.log('validateMinMaxOrder', valid, this.coupon.MaxOrder, this.coupon.MinOrder);

		return valid;
	}

	validateTotalCoupons = (form) => {
		var valid = true;

		if (Util.isDefined(this.coupon.MaxRedeem) && Util.isDefined(this.coupon.MaxRedeemPerCustomer)) {

			if (parseFloat(this.coupon.MaxRedeem.toString()) < parseFloat(this.coupon.MaxRedeemPerCustomer.toString())) {
				valid = false;

				form.controls.MaxRedeem.setErrors({ asyncInvalid: true, asyncInvalidMsg: ` must be greater then or equal to Total Coupons (Per Customer)` });

				Util.log('validateTotalCoupons', 'Set ERROR');
			}
			else if (parseFloat(this.coupon.MaxRedeem.toString()) > parseFloat(this.coupon.MaxRedeemPerCustomer.toString())) {
				form.controls.MaxRedeem.setErrors(null);

				Util.log('validateTotalCoupons', 'Set Null');
			}

		}

		Util.log('validateTotalCoupons', valid, this.coupon.MaxRedeem, this.coupon.MaxRedeemPerCustomer);

		return valid;
	}

	validateRangeDate = () => {
		Util.log('rangeDate', this.rangeDate);

		var valid = true;

		if ((this.coupon.DurationType == this.DURATION_TYPE_DATE) && (!Util.isDefined(this.rangeDate) || !Util.isDefined(this.rangeDate.length) || this.rangeDate.length != 2)) {
			this.rangeDateError = 'Dates are required';
			valid = false;
		}
		else {
			this.rangeDateError = null;
		}

		return valid;
	}

	validateDailyTime = () => {
		var valid = true;

		if (this.coupon.DurationType == this.DURATION_TYPE_DATE && this.coupon.DailyStartTime >= this.coupon.DailyEndTime) {
			this.dailyEndTimeError = 'End Time should be greater then Start Time';

			valid = false;
		}
		else {
			this.dailyEndTimeError = null;
		}

		return valid;
	}

	selectServiceType = (serviceTypeColumn, serviceTypeColumnLabel, enabled) => {
		this.coupon[serviceTypeColumn] = enabled ? !this.coupon[serviceTypeColumn] : false;

		if (!enabled) {
			this.toastr.error(`${serviceTypeColumnLabel} is not enabled in your Restaurant.`, 'Error!');
		}
	}

	save = (event, form) => {
		Util.log(this.LOG_TAG, 'save', event, form, this.rangeDate);

		var valid = true;

		valid = valid && this.validateMinMaxOrder(form);

		valid = valid && this.validateRangeDate();

		valid = valid && this.validateDailyTime();

		if (valid && form.valid) {
			this.busySave = true;

			this.coupon.StartDate = this.rangeDate[0];
			this.coupon.EndDate = this.rangeDate[1];

			this.coupon.MenuItems = this.menuItemList.filter(item => item.isSelected);

			var data = {
				fireFlyID: this.fireFlyID,
				coupon: this.coupon
			};

			this.ROService.saveCoupon(data).subscribe(response => {
				if (this.isNewCoupon) {

					if (response.Status == this.constants.STATUS_SUCCESS) {
						var coupon: Coupon = response.Data;

						this._originalCoupon = coupon;
						this.coupon = Util.clone(this._originalCoupon);

						this.modalEvents.emit({
							action: BaseModal.EVENT_ADD_ITEM,
							data: coupon
						});
					}
					else {
						this.toastr.error('Sorry, Unable to save item', 'Error!');
					}

				}
				else {

					if (response.Status == this.constants.STATUS_SUCCESS) {
						Util.merge(this._originalCoupon, this.coupon);
					}

				}

				this.busySave = false;

				if (response.Status == this.constants.STATUS_SUCCESS) {
					this.toastr.success('Coupon saved successfully.', 'Success!');

					this.close();
				} else {

					if (response.Code == 'ERR_COUPON_EXIST') {
						form.controls.Code.setErrors({ asyncInvalid: true, asyncInvalidMsg: ` already exists` });
					}
				}

				Util.log(this.LOG_TAG, 'save', response);
			}, (err) => {
				this.busySave = false;

				this.toastr.error('Unable to perform operation at the moment. Please try later.', 'Oops!');
			});
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