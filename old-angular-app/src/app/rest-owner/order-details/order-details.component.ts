import { Component, OnInit, ViewChild } from '@angular/core';
import { Location, CurrencyPipe, DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// Shared Components
import { BreadcrumbService } from '../../shared/components/breadcrumb/breadcrumb.module';

// RO Shared Components
import { MapCustomerRouteModalComponent } from '../shared/components/map-customer-route-modal/map-customer-route-modal.component';

// RO Models
import { Restaurant } from '../shared/models/restaurant';
import { ROAPIRequestData } from '../shared/models/ro-api-request-data';

// Shared Services
import { PathService as Path } from '../../shared/services/path.service';

// RO Services
import { ROService } from '../shared/services/ro.service';
import { SharedDataService } from '../shared/services/shared-data.service';
import { HelperService } from '../shared/services/helper.service';

// Shared Pipes
import { PhonePipe } from '../../shared/pipes/phone';

// 3rd Party Libs
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

declare var pdfMake;

@Component({
	selector: 'ro-order-details',
	templateUrl: './order-details.component.html'
})
export class OrderDetailsComponent implements OnInit {
	LOG_TAG = 'OrderDetailsComponent => ';

	busy = false;
	busyAcceptOrder = false;
	busyRejectOrder = false;

	orderID: string;
	fireFlyID: string;

	restInfo = new Restaurant();

	order = {
		OrderDetail: <any>{},
		CustomerInfo: <any>{},
		MenuDetail: <any>[],
		deliverText: '',
	};

	@ViewChild('mapCustomerRouteModal') public mapCustomerRouteModal: MapCustomerRouteModalComponent;

	constructor(public constants: Constants, private ROService: ROService, private router: Router, private location: Location, private activatedRoute: ActivatedRoute, private breadcrumbService: BreadcrumbService, private toastr: ToastsManager, private currencyPipe: CurrencyPipe, private phonePipe: PhonePipe, private datePipe: DatePipe, private sharedDataService: SharedDataService, private helperService: HelperService) { }

	ngOnInit() {
		Util.log(this.LOG_TAG, 'Init()');

		this.activatedRoute.params.subscribe((params: any) => {
			Util.log(this.LOG_TAG, 'params', params);

			this.orderID = params.id;
			this.fireFlyID = params.fireFlyID;

			this.loadData();
		});
	}

	loadData = () => {
		Util.log(this.LOG_TAG, 'loadData()');

		this.busy = true;

		var restInfoPromise = this.loadRestInfo();
		var orderDetailsPromise = this.loadOrderDetails();

		Observable.forkJoin([restInfoPromise, orderDetailsPromise]).subscribe((response: any) => {
			var restInfoResponse: any = response[0];
			this.restInfo = restInfoResponse.Data;

			var orderDetailsResponse: any = response[1];
			this.order = orderDetailsResponse;

			this.breadcrumbService.addFriendlyNameForRoute(`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}/${this.fireFlyID}`, this.restInfo.Name);
			this.breadcrumbService.addFriendlyNameForRoute(`/${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}/${this.fireFlyID}/${Path.RO.ORDER_DETAILS}/${this.orderID}`, this.order.OrderDetail.OrderNumber);

			/**
			 * Deliver Text
			 */
			var deliverText = this.helperService.getDeliverText(this.order.OrderDetail.ServiceTypeID, this.order.OrderDetail.Owner_SubscriptionID);
			this.order.deliverText = `${deliverText} ${this.datePipe.transform(this.order.OrderDetail.OrderETA, 'short')}`;

			this.busy = false;

			Util.log(this.LOG_TAG, 'forkJoin', response);
		});
	}

	loadOrderDetails = () => {
		var requestData = new ROAPIRequestData();

		ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);
		ROAPIRequestData.fillOrderID(requestData, this.orderID);

		return this.ROService.getOrderInfo(requestData);
	}

	loadRestInfo = () => {
		var requestData = new ROAPIRequestData();

		ROAPIRequestData.fillFireFlyID(requestData, this.fireFlyID);

		return this.ROService.getRestInfo(requestData);
	}

	acceptOrder = (accept) => {
		Util.log(this.LOG_TAG, 'acceptOrder()', accept);

		var requestData = new ROAPIRequestData();

		requestData.ff = this.fireFlyID;
		requestData.oid = this.orderID;

		if (accept) {
			this.busyAcceptOrder = true;
			var apiCall = this.ROService.acceptOrder(requestData);
		}
		else {
			this.busyRejectOrder = true;
			var apiCall = this.ROService.rejectOrder(requestData);
		}

		apiCall.subscribe(response => {

			if (response.Status == this.constants.STATUS_SUCCESS) {

				this.order.OrderDetail.Status = response.Data.Status;
				this.order.OrderDetail.StatusID = response.Data.StatusID;

				this.busyAcceptOrder = false;
				this.busyRejectOrder = false;

				this.toastr.success(`Order ${accept ? 'accepted' : 'rejected'} successfully.`, 'Success!');
			}
			else {
				this.toastr.error('Unable to update item, Please try later.', 'Error!');
			}

			Util.log(this.LOG_TAG, 'acceptOrder', response);
		});
	}

	openMapCustomerRouteModal = () => {
		this.mapCustomerRouteModal.open({
			fireFlyID: this.fireFlyID,
			orderID: this.orderID,
		});
	}

	editOrder = () => {
		this.router.navigate([`${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`, this.fireFlyID, Path.RO.ORDER_DETAILS, this.orderID, 'edit']);
	}

	printOrder = () => {
		// Items table section body
		var itemsTableSectionBody: any = [
			[{ text: 'Qty', style: 'itemsTableHeader' }, { text: 'Item', style: 'itemsTableHeader' }, { text: 'Price', style: 'itemsTableHeader', alignment: 'right' }],
		];

		for (var menuItemIndex in this.order.MenuDetail) {
			var menuItem = this.order.MenuDetail[menuItemIndex];

			var itemsTableSectionBodyOptionItems = [];

			var OptionDetails = menuItem.OptionDetails || [];

			for (var optionDetailIndex in OptionDetails) {
				var optionDetail = OptionDetails[optionDetailIndex];

				var marginTop = (parseInt(optionDetailIndex) == 0 ? 9 : 4);

				var optionItemsText = '';

				for (var optionItemIndex in optionDetail.OptionItem) {
					var optionItem = optionDetail.OptionItem[optionItemIndex];

					optionItemsText += `${optionItem.OptionItemName} (${this.currencyPipe.transform(optionItem.Amount, 'USD', true)}) `;
				}

				itemsTableSectionBodyOptionItems.push([{ text: optionDetail.OptionItemName, margin: [0, marginTop, 0, 0], bold: true }, { text: optionItemsText, margin: [0, marginTop, 0, 0] }]);
			}

			var itemsTableSectionBodyStack: any = [
				{
					text: menuItem.ItemName,
				}
			];

			if (itemsTableSectionBodyOptionItems.length > 0) {

				itemsTableSectionBodyStack.push({
					table: {
						widths: ['*', '*'],
						body: itemsTableSectionBodyOptionItems,
					},
					layout: {
						defaultBorder: false,
					}
				});

			}

			itemsTableSectionBody.push([
				{ text: `${menuItem.Qty}x`, style: 'itemsTableRow' }, {
					style: 'itemsTableRow',
					stack: itemsTableSectionBodyStack
				},
				{ text: `$${menuItem.Price}`, style: 'itemsTableRow', alignment: 'right' }
			]);
		}

		// Items table section
		var itemsTableSection = {
			margin: [0, 36, 0, 24],
			table: {
				headerRows: 1,
				widths: ['auto', '*', 'auto'],
				body: itemsTableSectionBody
			},
			layout: {
				hLineWidth: function (i, node) {
					var length = node.table.body ? node.table.body.length : 0;

					return (i === 0 || i === length) ? 2 : 1;
				},
				vLineWidth: function (i, node) {
					return 0;
				},
				hLineColor: function (i, node) {
					var length = node.table.body ? node.table.body.length : 0;

					return (i === 0 || i === length) ? 'black' : 'gray';
				},
				vLineColor: function (i, node) {
					var length = node.table.widths ? node.table.widths.length : 0;

					return (i === 0 || i === length) ? 'black' : 'gray';
				}
			}
		};


		/**
		 * Calculations
		 */
		var totalIndex = 0;
		var calculationsBody: any = [
			['Subtotal:', this.currencyPipe.transform(this.order.OrderDetail.SubTotal, 'USD', true) + ' +'],
		];

		totalIndex++;

		if (this.order.OrderDetail.ServiceTypeID == this.constants.SERVICE_TYPE_ID_DELIVERY || this.order.OrderDetail.ServiceTypeID == this.constants.SERVICE_TYPE_ID_CATERING) {
			// Delivery Charge
			var label = 'Delivery Charge';

			if (this.order.OrderDetail.Owner_SubscriptionID == this.constants.RO_SUB_PRO) {
				label += ' by Customer';
			}

			calculationsBody.push([`${label}:`, this.currencyPipe.transform(this.order.OrderDetail.DeliveryCharge, 'USD', true) + ' +']);
			totalIndex++;

			// Driver Tip
			calculationsBody.push([`Driver Tip (${this.order.OrderDetail.Driver_Tip_Percent}%):`, this.currencyPipe.transform(this.order.OrderDetail.Driver_Tip, 'USD', true) + ' +']);
			totalIndex++;
		}

		// Tax
		calculationsBody.push([`Tax (${this.order.OrderDetail.Tax_Rate * 100}%):`, this.currencyPipe.transform(this.order.OrderDetail.Tax, 'USD', true) + ' +']);
		totalIndex++;

		// Total
		calculationsBody.push([
			{
				text: `Total (Customer Paid):`,
				fontSize: 14,
				bold: true,
			},
			{
				text: this.currencyPipe.transform(this.order.OrderDetail.Total, 'USD', true) + ' =',
				fontSize: 14,
				bold: true,
			}
		]);

		// Menus Service Charge
		calculationsBody.push([`Menus Service Charge:`, this.currencyPipe.transform(this.order.OrderDetail.ServiceFee, 'USD', true) + ' -']);

		if (this.order.OrderDetail.ServiceTypeID == this.constants.SERVICE_TYPE_ID_DELIVERY || this.order.OrderDetail.ServiceTypeID == this.constants.SERVICE_TYPE_ID_CATERING) {

			if (this.order.OrderDetail.Owner_SubscriptionID == this.constants.RO_SUB_PRO) {

				// Delivery Charge by Rest
				calculationsBody.push([`Delivery Charge by Rest:`, this.currencyPipe.transform(this.order.OrderDetail.Owner_DeliveryCharge_Restaurant, 'USD', true) + ' -']);

				// Driver Tip
				calculationsBody.push([`Driver Tip (${this.order.OrderDetail.Driver_Tip_Percent}%) (Paid to Driver):`, this.currencyPipe.transform(this.order.OrderDetail.Driver_Tip, 'USD', true) + ' -']);
			}

		}

		// Net Account Credit
		calculationsBody.push([
			{
				text: `Net Account Credit:`,
				fontSize: 18,
				bold: true,
			},
			{
				text: this.currencyPipe.transform(this.order.OrderDetail.Owner_NetAccountCredit, 'USD', true) + ' =',
				fontSize: 18,
				bold: true,
			}
		]);

		/**
		 * Print Object
		 */

		var dd = {
			content: [
				{
					alignment: 'justify',
					columns: [
						{
							image: this.constants.MENUS_LOGO_BASE64,
							width: 142,
							height: 29,
						},
						{
							alignment: 'right',
							fontSize: 14,
							stack: [
								{
									text: this.order.OrderDetail.Restaurant,
									bold: true,
								},
								{
									margin: [0, 4, 0, 0],
									text: this.order.OrderDetail.RestaurantAddress,
								},
								{
									margin: [0, 4, 0, 0],
									text: this.order.OrderDetail.RestPhone,
								},
								{
									margin: [0, 4, 0, 0],
									text: this.order.OrderDetail.RestEmail,
								},
							]
						}
					]
				},
				{
					margin: [0, 24, 0, 24],
					stack: [
						{
							fontSize: 15,
							bold: true,
							alignment: 'center',
							text: `Subscription: ${this.order.OrderDetail.Owner_SubscriptionName}`
						},
						{
							fontSize: 15,
							bold: true,
							alignment: 'center',
							text: this.order.deliverText
						},
						{
							canvas: [
								{
									type: 'rect',
									x: 0,
									y: -43,
									w: 500,
									h: 50,
									r: 4,
									lineColor: 'black',
								},
							]
						}
					],
				},
				{
					columns: [
						{
							margin: [16, 9, 16, 9],
							stack: [
								{
									relativePosition: { x: 0, y: 0 },
									canvas: [
										{

											type: 'rect',
											x: -16,
											y: -9,
											w: 230,
											h: 105,
											r: 4,
											lineColor: 'black',
										},
									]
								},
								{
									margin: [0, 4, 0, 0],
									text: this.order.CustomerInfo.FullName,
									bold: true,
								},
								{
									margin: [0, 4, 0, 0],
									text: this.order.CustomerInfo.Phone ? this.phonePipe.transform(this.order.CustomerInfo.Phone) : ' '
								},
								{
									margin: [0, 4, 0, 10],
									width: 10,
									text: this.order.OrderDetail.DeliveryAddress || 'N/A',
								},
							]
						},
						{
							margin: [16, 9, 16, 9],
							stack: [
								{
									text: 'Instructions:',
									bold: true,
								},
								{
									margin: [0, 4, 50, 0],
									text: this.order.OrderDetail.Instructions || 'N/A',
								},
							]
						}
					]
				},
				itemsTableSection,
				{
					alignment: 'justify',
					columns: [
						{
							width: '40%',
							stack: [
								{
									margin: [12, 2, 0, 0],
									fontSize: 18,
									text: this.order.OrderDetail.PaymentMethod.toUpperCase(),
									bold: true,
								},
								{
									canvas: [
										{
											type: 'rect',
											x: 0,
											y: -30,
											w: 135,
											h: 40,
											r: 4,
											lineColor: 'black',
										},
									]
								},
							]
						},
						{
							width: '60%',
							alignment: 'right',
							table: {
								widths: ['70%', '30%'],
								body: calculationsBody,
							},
							layout: {
								hLineWidth: function (i, node) {
									var length = node.table.body ? node.table.body.length : 0;

									return i === (totalIndex + 1) ? 2 : 0;
								},
								vLineWidth: function (i, node) {
									return 0;
								},
								hLineColor: function (i, node) {
									var length = node.table.body ? node.table.body.length : 0;

									return 'black';
								},
								vLineColor: function (i, node) {
									var length = node.table.widths ? node.table.widths.length : 0;

									return 'black';
								}
							}
						}
					]
				},
				{
					margin: [0, 24, 0, 0],
					canvas: [
						{
							type: 'line',
							x1: 0, y1: 0,
							x2: 510, y2: 0,
							lineWidth: 0,
							dash: { length: 3 },
						}
					]
				},
				// {
				//   relativePosition: { x: 0, y: 0 },
				//   canvas: [
				//     {
				//       type: 'line',
				//       x1: 255, y1: 0,
				//       x2: 255, y2: 85,
				//       lineWidth: 0,
				//       dash: { length: 3 },
				//     },
				//   ]
				// },
				{
					table: {
						widths: ['*', '*'],
						body: [
							[
								[
									{
										margin: [0, 18, 70, 0],
										text: 'If you need to reach Menus please feel free to call our restaurant customer service team at: ',
									},
									{
										text: this.sharedDataService.globalSettings.CustomerService.Phone,
										bold: true,
									}
								],
								[
									{
										margin: [0, 18, 0, 0],
										alignment: 'right',
										text: 'Order Number',
										bold: true,
									},
									{
										margin: [0, 0, 0, 18],
										alignment: 'right',
										fontSize: 24,
										text: this.order.OrderDetail.OrderNumber,
										bold: true,
									}
								]
							],
						],
					},
					layout: {
						defaultBorder: false,
					},
				},
				{
					canvas: [
						{
							type: 'line',
							x1: 0, y1: 0,
							x2: 510, y2: 0,
							lineWidth: 0,
							dash: { length: 3 },
						},
					]
				}
			], styles: {
				header: {
					fontSize: 18,
					bold: true
				},
				bigger: {
					fontSize: 15,
					italics: true,
				},
				itemsTableHeader: {
					bold: true,
					margin: [0, 14, 0, 14]
				},
				itemsTableRow: {
					margin: [0, 14, 0, 14]
				}
			},
			defaultStyle: {
				columnGap: 20,
			}
		}

		pdfMake.createPdf(dd).print();
	}

	goBack = () => {
		this.router.navigate([`${Path.RO.BASE}/${Path.RO.MANAGE_RESTAURANT}`, this.fireFlyID]);

		Util.log(this.LOG_TAG, 'goBack');
	}
}
