import { Component, ViewChild, NgZone, EventEmitter, Output, Inject, PLATFORM_ID } from '@angular/core';
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
import { CartItem } from "../../../../shared/models/cart-item";
import { CartCoupon } from "../../../../shared/models/cart-coupon";

declare var document, google;

@Component({
	selector: 'available-coupons-modal',
	templateUrl: './available-coupons-modal.component.html',
})
export class AvailableCouponsModalComponent extends BaseModal {
	LOG_TAG = 'AvailableCouponsModalComponent';

	cartItem: CartItem;
	coupons = new Array<CartCoupon>();

	resolve: any;
	busy = false;

	@Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();

	constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public eventsService: EventsService, public sharedDataService: SharedDataService, private zone: NgZone, private toastr: ToastsManager) {
		super(eventsService);
	}

	open = (data) => {
		this.openModal();

		this.init(data);

		return new Promise<any>((resolve, reject) => {
			this.resolve = resolve;
		});
	}

	init = (data) => {
		this.cartItem = data.cartItem;

		var appliedCouponsIDs = this.cartItem.appliedCoupons.map((c) => c.CouponID);

		this.coupons = this.cartItem.coupons.filter((c) => appliedCouponsIDs.indexOf(c.CouponID) == -1);
	}

	chooseCoupon = (coupon) => {
		this.close({
			coupon: coupon
		});
	}

	close = (data?) => {
		this.resolve(data);

		this.closeModal();
	}
}