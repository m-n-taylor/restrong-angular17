import { Component, ViewChild, NgZone, EventEmitter, Output, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Shared Helpers
import { Util } from '../../../../shared/util';
import { Constants } from '../../../../shared/constants';

import { EventsService } from '../../../../shared/services/events.service';
import { BaseModal } from '../../../../shared/services/base-modal.service';
import { MenuItem } from '../../../../shared/models/menu-item';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { UserAddress } from '../../../../shared/models/user-address';
import { GMapOverlayView } from '../../../../shared/models/gmap-overlay';
import { HelperService } from '../../../../shared/services/helper.service';
import { OrderItemsDetailsAPIRequestData } from '../../../../shared/models/order-items-details-api-request-data';
import { UserService } from '../../services/user.service';
import { AppService } from '../../../../shared/services/app.service';
import { DomSanitizer } from '@angular/platform-browser';
import { OrderItemAPIRequestData } from '../../../../shared/models/order-item-api-request-data';
import { RateOrderItemAPIRequestData } from '../../../../shared/models/rate-order-item-api-request-data';
import { Observable } from 'rxjs/Observable';
import { ToastsManager } from 'ng2-toastr/src/toast-manager';

declare var document, google;

@Component({
	selector: 'write-review-modal',
	templateUrl: './write-review-modal.component.html',
})
export class WriteReviewModalComponent extends BaseModal {
	/**
	 * Properties
	 */
	LOG_TAG = 'WriteReviewModalComponent';

	activeReviewIcon: any;
	inActiveReviewIcon: any;

	pastOrder: any;
	pastOrderItems: Array<any>;

	canSubmit: boolean;
	busySubmitReview: boolean;
	busy: boolean;

	resolve: any;

	constructor( @Inject(PLATFORM_ID) private platformId: Object, public constants: Constants, public eventsService: EventsService, private zone: NgZone, private sharedDataService: SharedDataService, private helperService: HelperService, private userService: UserService, private appService: AppService, private sanitizer: DomSanitizer, private toastr: ToastsManager) {
		super(eventsService);

		this.activeReviewIcon = sanitizer.bypassSecurityTrustUrl(this.helperService.getForkMapIcon(this.constants.colors.brandSuccess));
		this.inActiveReviewIcon = sanitizer.bypassSecurityTrustUrl(this.helperService.getForkMapIcon(this.constants.colors.darkGray));
	}

	/**
	 * Methods
	 */
	open = (data) => {
		this.openModal();

		this.initVariables();
		this.init(data);

		return new Promise<any>((resolve, reject) => {
			this.resolve = resolve;
		});
	}

	initVariables = () => {
		this.pastOrderItems = new Array<any>();
		this.canSubmit = false;
		this.busySubmitReview = false;
		this.busy = false;
	}

	init = (data) => {
		this.pastOrder = data.pastOrder;

		this.loadData();
	}

	loadData = () => {
		// loadData
		this.busy = true;

		var requestData = new OrderItemsDetailsAPIRequestData();
		requestData.a = this.pastOrder.ID;
		OrderItemsDetailsAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

		this.appService.getPastOrderItemsDetails(requestData)
			.subscribe(response => {
				this.pastOrderItems = response;

				for (var orderItemIndex in this.pastOrderItems) {
					var orderItem = this.pastOrderItems[orderItemIndex];

					orderItem.orderImages = [];

					for (var i = 0; i < 5; i++) {
						var orderImage: any = {};

						var orderItemImageFound = false;
						for (var j in orderItem.CustomerMenuItemUploads) {
							var orderItemImage = orderItem.CustomerMenuItemUploads[j];

							if (orderItemImage.BoxIndex == i) {
								orderItemImageFound = true;

								orderImage.exist = true;
								Util.merge(orderImage, orderItemImage);
							}
						}

						if (!orderItemImageFound) {
							orderImage.exist = false;
						}

						orderItem.orderImages.push(orderImage);
					}

				}

				this.busy = false;

				Util.log(this.LOG_TAG, 'loadData', response);
			});
	}

	getForkRatingText = (orderItem) => {
		if (Util.isDefined(orderItem) && Util.isDefined(orderItem.CustomerRating)) {
			if (orderItem.CustomerRating == 1) {
				return 'Yikes';
			}
			else if (orderItem.CustomerRating == 2) {
				return 'Bites';
			}
			else if (orderItem.CustomerRating == 3) {
				return 'All right';
			}
			else if (orderItem.CustomerRating == 4) {
				return 'Worth a try';
			}
			else if (orderItem.CustomerRating == 5) {
				return 'Love it';
			}
			else {
				return '';
			}
		}
		else {
			return '';
		}
	};

	setRating = (pastOrderItem, rating) => {
		pastOrderItem.CustomerRating = rating;

		this.canSubmit = true;
	}

	onCustomerCommentChange = () => {
		this.canSubmit = true;
	}

	submitReview = () => {
		this.busySubmitReview = true;

		var reviewPromises = [];

		for (var i in this.pastOrderItems) {
			var orderItem = this.pastOrderItems[i];

			if (Util.isDefined(orderItem.CustomerRating) && orderItem.CustomerRating > 0) {
				var requestData = new RateOrderItemAPIRequestData();

				RateOrderItemAPIRequestData.fillOrderItem(requestData, orderItem);
				OrderItemsDetailsAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

				reviewPromises.push(this.appService.rateOrderItem(requestData));
			}
		}

		if (reviewPromises.length > 0) {
			Observable.forkJoin(reviewPromises)
				.subscribe((responseList: any) => {
					this.busySubmitReview = false;

					var totalPoints = 0;
					var allowReviewOrderCount = 0;

					// Add User Points
					for (var i in responseList) {
						var response = responseList[i];

						if (Util.isDefined(response.Code) && response.Code == 'ADD_CUSTOMER_FEEDBACK') {
							totalPoints += parseInt(response.AddedCustomerPoints);
							allowReviewOrderCount = response.AllowReviewOrderCount;
						}
					}

					this.userService.addPoints(totalPoints);
					this.userService.setAllowReviewOrderCount(allowReviewOrderCount);

					this.close({ totalPoints: totalPoints });

					Util.log(this.LOG_TAG, 'all reviews done', responseList);
				});
		}
		else {
			this.busySubmitReview = false;

			this.toastr.error('Rating is required.', 'Error!');
		}

		Util.log(this.LOG_TAG, 'submitReview');
	}

	uploadReviewImage = (orderItem, reviewImageInput, index) => {
		Util.log(this.LOG_TAG, 'uploadReviewImage', orderItem, reviewImageInput);

		orderItem.CustomerMenuItemUploads = orderItem.CustomerMenuItemUploads || [];

		let inputElement: HTMLInputElement = reviewImageInput;

		let fileCount: number = inputElement.files.length;

		let formData = new FormData();

		// a file was selected
		if (fileCount > 0) {
			var file = inputElement.files.item(0);

			if (this.constants.RO_ALLOWED_IMG_TYPES.indexOf(file.type) == -1) {
				inputElement.value = '';

				this.toastr.error('Invalid file format. Only PNG and JPG are allowed.', 'Sorry!');
			}
			else if (file.size > Util.getBytesByMb(this.constants.RO_MAX_IMG_SIZE)) {
				inputElement.value = '';

				this.toastr.error(`File size can't be greater then ${this.constants.RO_MAX_IMG_SIZE}MB.`, 'Sorry!');
			}
			else {
				formData.append('file[]', file);

				this.busy = true;

				var requestData = new RateOrderItemAPIRequestData();

				requestData.m = orderItem.ItemID;
				requestData.b = index;
				requestData.o = this.pastOrder.OrderNumber;

				RateOrderItemAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);

				this.appService.uploadReviewImage(requestData, formData).subscribe((response) => {

					if (Util.isDefined(response.Code) && response.Code == 'FILE_UPLOAD_SUCCESS') {
						var orderItemImage = response.Image;

						orderItem.orderImages[index] = orderItemImage;
						orderItem.orderImages[index].exist = true;

						orderItem.CustomerMenuItemUploads = orderItem.CustomerMenuItemUploads || [];
						orderItem.CustomerMenuItemUploads.push(orderItemImage);

						this.userService.addPoints(response.AddedCustomerPoints);

						this.toastr.success('Image uploaded successfully.', 'Success!');
					}
					else {
						inputElement.value = '';

						this.toastr.error('Unable to upload file.', 'Error!');
					}

					this.busy = false;

					Util.log(this.LOG_TAG, 'uploadRestImage', response);
				});

				Util.log(this.LOG_TAG, 'formData', formData);
			}
		}
	}

	deleteReviewImage = (orderItem, index) => {
		this.busy = true;

		var orderItemImage = orderItem.orderImages[index];

		var requestData = new RateOrderItemAPIRequestData();
		RateOrderItemAPIRequestData.fillLoginUser(requestData, this.userService.loginUser);
		requestData.a = orderItemImage.ID;

		this.appService.deleteReviewImage(requestData)
			.subscribe(response => {

				if (Util.isDefined(response.Code) && response.Code == 'DELETE_IMAGE') {
					orderItem.orderImages[index] = {
						exist: false
					};

					var foundIndex = null;

					for (var i in orderItem.CustomerMenuItemUploads) {
						var item = orderItem.CustomerMenuItemUploads[i];

						if (item.BoxIndex == index) {
							foundIndex = index;
							break;
						}
					}

					if (foundIndex) {
						orderItem.CustomerMenuItemUploads.splice(foundIndex, 1);
					}

					this.toastr.success('Image deleted successfully.', 'Success!');
				}
				else {
					this.toastr.error('Unable to delete image.', 'Error!');
				}

				this.busy = false;

				Util.log(this.LOG_TAG, 'deleteReviewImage', response);
			});
	}

	close = (data?: any) => {
		this.resolve(data);

		this.closeModal();
	}
}