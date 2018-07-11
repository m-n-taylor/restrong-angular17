import { Component, ViewChild, NgZone, EventEmitter, Output, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../../../shared/util';
import { Constants } from '../../../../shared/constants';

// RO Models
import { Coupon } from '../../models/coupon';
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
import { ROMenuItem } from "../../models/ro-menu-item";

declare var document, google;

@Component({
	selector: 'save-coupon-modal',
	templateUrl: './save-coupon-modal.component.html',
	
})
export class SaveCouponModalComponent extends BaseModal {

	/**
	 * Properties
	 */
	LOG_TAG = 'SaveCouponModalComponent';

	TYPE_ORDER_BASED = this.constants.COUPON_TYPE_ORDER_BASED;
	TYPE_ITEM_BASED = this.constants.COUPON_TYPE_ITEM_BASED;

	DISCOUNT_TYPE_PERCENT = this.constants.DISCOUNT_TYPE_PERCENT;
	DISCOUNT_TYPE_AMOUNT = this.constants.DISCOUNT_TYPE_AMOUNT;

	DURATION_TYPE_ALWAYS = this.constants.DURATION_TYPE_ALWAYS;
	DURATION_TYPE_DATE = this.constants.DURATION_TYPE_DATE;

	fireFlyID: string;
	rest: Restaurant;

	private _originalCoupon: Coupon; // Will keeps reference to orignal object
	coupon: Coupon;

	rangeDate = null;
	rangeDateError = null;
	DTOptions = <DateTimeOptions>{
		mode: 'range',
		// minDate: 'today',
	};

	timeDTOptions = <DateTimeOptions>{
		enableTime: true,
		noCalendar: true,
	};

	menuItemList: Array<ROMenuItem>;

	serviceTypeError: boolean;

	dailyStartTimeError = null;
	dailyEndTimeError = null;

	menuItemsError: any;

	requiredMinSubtotal: boolean;

	busy = false;
	busySave = false;

	public get isNewCoupon(): boolean {
		return !Util.isDefined(this.coupon.ID);
	}

	public get canUpdateCoupon(): boolean {
		return this.coupon.RedeemCount == 0;
	}

	@Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();

	constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public eventsService: EventsService, private ROService: ROService, private zone: NgZone, private toastr: ToastsManager, public input: InputService, private changeDetectorRef: ChangeDetectorRef) {
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
		this.menuItemList = new Array<ROMenuItem>();
		this.dailyStartTimeError = null;
		this.dailyEndTimeError = null;
		this.menuItemsError = null;
		this.serviceTypeError = false;
		this.requiredMinSubtotal = false;

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

			this.rangeDate = [
				this.coupon.StartDate,
				this.coupon.EndDate,
			];
		}
		else {
			this.zone.run(() => {
				this.coupon = new Coupon();

				this.coupon.DiscountType = this.DISCOUNT_TYPE_AMOUNT;
				this.coupon.DurationType = this.DURATION_TYPE_ALWAYS;
				this.coupon.DiscountCriteria = this.constants.DISCOUNT_CRITERIA_FULL;
				this.changeCouponType(this.TYPE_ORDER_BASED);
				this.coupon.RedeemCount = 0;

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

					if (menuItem.Name.toLowerCase() == selectedMenuItem.toLowerCase()) {
						menuItem.isSelected = true;
					}
				}

				// Util.log(this.LOG_TAG, 'selectedMenuItems', selectedMenuItems);
			}

			this.busy = false;

			Util.log(this.LOG_TAG, 'getShortMenuItemList', response);
		});
	}

	selectServiceType = (serviceTypeColumn, serviceTypeColumnLabel, serviceTypeEnabled) => {
		if (this.canUpdateCoupon) {
			this.coupon[serviceTypeColumn] = serviceTypeEnabled ? !this.coupon[serviceTypeColumn] : false;

			if (!serviceTypeEnabled) {
				this.toastr.error(`${serviceTypeColumnLabel} is not enabled in your Restaurant.`, 'Error!');
			}
		}

		this.validateServiceTypes();
	}

	changeDurationType = () => {
		Util.log('changeDurationType', this.canUpdateCoupon, this.coupon.DurationType);
		if (this.canUpdateCoupon) {
			this.validateRangeDate();
			this.validateDailyTime();
		}
	}

	changeCouponType = (couponType?) => {
		if (couponType) {
			this.coupon.CouponType = couponType;
		}

		if (this.coupon.CouponType == this.TYPE_ITEM_BASED) {
			this.coupon.DiscountType = this.DISCOUNT_TYPE_PERCENT;
			this.coupon.DiscountCriteria = this.constants.DISCOUNT_CRITERIA_FULL;
		}
	}

	changeDiscountValue = () => {
		Util.log('changeDiscountValue', this.coupon.DiscountValue);
	}

	changeDiscountCriteria = () => {
		Util.log('changeDiscountCriteria');

		if (this.coupon.DiscountCriteria == this.constants.DISCOUNT_CRITERIA_INCREMENTAL) {
			this.requiredMinSubtotal = true;
		}
		else {
			this.requiredMinSubtotal = false;
		}

		this.changeDetectorRef.detectChanges();
	}

	validateServiceTypes = () => {
		var valid = true;
		this.serviceTypeError = false;

		if (!this.coupon.Delivery && !this.coupon.Pickup && !this.coupon.Catering && !this.coupon.DiningIn) {
			valid = false;

			this.serviceTypeError = true;
		}

		return valid;
	}

	validateMinMaxOrder = (form) => {
		var valid = true;

		if (Util.isDefined(this.coupon.MaxOrder) && Util.isDefined(this.coupon.MinOrder)) {

			if (parseFloat(this.coupon.MaxOrder.toString()) < parseFloat(this.coupon.MinOrder.toString())) {
				valid = false;

				if (Util.isDefined(form.controls.MaxSubtotal)) {
					form.controls.MaxSubtotal.setErrors({ asyncInvalid: true, asyncInvalidMsg: ` must be greater then or equal to Min Subtotal` });
				}
			}
			else if (parseFloat(this.coupon.MaxOrder.toString()) > parseFloat(this.coupon.MinOrder.toString())) {

				if (Util.isDefined(form.controls.MaxSubtotal)) {
					form.controls.MaxSubtotal.setErrors(null);
				}
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

				form.controls.TotalCoupons.setErrors({ asyncInvalid: true, asyncInvalidMsg: ` must be greater then or equal to Total Coupons (Per Customer)` });

				Util.log('validateTotalCoupons', 'Set ERROR');
			}
			else if (parseFloat(this.coupon.MaxRedeem.toString()) > parseFloat(this.coupon.MaxRedeemPerCustomer.toString())) {
				form.controls.TotalCoupons.setErrors(null);

				Util.log('validateTotalCoupons', 'Set Null');
			}

		}

		Util.log('validateTotalCoupons', valid, this.coupon.MaxRedeem, this.coupon.MaxRedeemPerCustomer);

		return valid;
	}

	validateRangeDate = () => {
		Util.log('rangeDate', this.rangeDate);

		var valid = true;

		// if ((this.coupon.DurationType == this.DURATION_TYPE_DATE) && (!Util.isDefined(this.rangeDate) || !Util.isDefined(this.rangeDate.length) || this.rangeDate.length != 2)) {
		// 	this.rangeDateError = 'Dates are required';
		// 	valid = false;
		// }
		// else {
		// 	this.rangeDateError = null;
		// }

		return valid;
	}

	validateDailyTime = () => {
		var valid = true;

		if (this.coupon.DurationType == this.DURATION_TYPE_DATE && this.coupon.DailyStartTime != this.constants.EMPTY_TIME && this.coupon.DailyEndTime != this.constants.EMPTY_TIME && this.coupon.DailyStartTime >= this.coupon.DailyEndTime) {
			this.dailyEndTimeError = 'End Time should be greater then Start Time';

			valid = false;
		}
		else {
			this.dailyEndTimeError = null;
		}

		return valid;
	}

	validateMenuItems = (menuItemList) => {
		var valid = true;

		if (this.coupon.CouponType == this.TYPE_ITEM_BASED && menuItemList.length == 0) {
			this.menuItemsError = 'Please choose atleast one item.';

			valid = false;
		}
		else {
			this.menuItemsError = null;
		}

		return valid;
	}

	validateDiscount = (form) => {
		Util.log('validateDiscount', form);

		var valid = true;

		if (this.coupon.DiscountType == this.DISCOUNT_TYPE_PERCENT) {
			if (this.coupon.DiscountValue > 100) {
				form.controls.DiscountValue.setErrors({ asyncInvalid: true, asyncInvalidMsg: ` must be less then or equal to 100%` });

				valid = false;
			}
		}
		else {
			var errors = form.controls.DiscountValue.errors || {};

			if (Util.isDefined(errors.asyncInvalid)) {
				form.controls.DiscountValue.setErrors(null);
			}
		}

		// var invalid = form.controls.DiscountValue.invalid;

		// if (!invalid) {
		// 	form.controls.DiscountValue.setErrors(null);
		// }

		return valid;
	}

	save = (event, form) => {
		Util.log(this.LOG_TAG, 'save', event, form, this.rangeDate);

		var valid = true;

		valid = this.validateServiceTypes() && valid;
		valid = this.validateMinMaxOrder(form) && valid;
		valid = this.validateTotalCoupons(form) && valid;
		valid = this.validateRangeDate() && valid;
		valid = this.validateDailyTime() && valid;
		valid = this.validateDiscount(form) && valid;

		var menuItemList = this.menuItemList.filter(item => item.isSelected);
		valid = this.validateMenuItems(menuItemList) && valid;

		if (valid && form.valid) {
			this.busySave = true;

			if (this.rangeDate) {
				this.coupon.StartDate = this.rangeDate[0];
				this.coupon.EndDate = this.rangeDate[1];
			}

			this.coupon.MenuItems = menuItemList.map(m => m.Name);

			// this.coupon.bundle = true;

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
					else {
						this.toastr.error('Sorry, Unable to save item', 'Error!');
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
		else {
			this.toastr.error('Form contains some errors.', 'Sorry!');
		}
	}

	clickOutside = (event) => {
		if (this.isModalOpen) {
			if (event.target.className.indexOf('modal') > -1 && event.target.className.indexOf('fade') > -1) {
				this.close();
			}
		}

		Util.log(this.LOG_TAG, 'clickOutside', event);
	}

	close = () => {
		this.modalEvents.emit({
			action: 'close',
			data: {}
		});

		this.closeModal();
	}
}