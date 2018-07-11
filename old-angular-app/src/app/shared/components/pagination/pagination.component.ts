import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Util } from '../../../shared/util';

@Component({
	selector: 'm-bs-pagination',
	templateUrl: './pagination.component.html',
	providers: []
})
export class PaginationComponent {
	LOG_TAG = 'PaginationComponent =>';

	totalPagesList = [];

	@Input() page: number;
	@Output() pageChange: EventEmitter<any>;

	@Input() pageSize: number;
	@Output() pageSizeChange: EventEmitter<any>;

	@Input() totalPages: number;
	@Input() totalRows: number;

	@Input() baseUrl: string;

	@Output() valueChange: EventEmitter<any>;

	@Input() pageSizeList: Array<number>;

	constructor() {
		Util.log(this.LOG_TAG, 'constructor', this.page, this.pageSize, this.totalPages);

		this.pageChange = new EventEmitter<any>();
		this.pageSizeChange = new EventEmitter<any>();
		this.valueChange = new EventEmitter<any>();
	}

	ngOnInit() {
		if (!this.pageSizeList) {
			this.pageSizeList = [25, 50, 75, 100];
		}

		Util.log(this.LOG_TAG, 'ngOnInit', this.page, this.pageSize, this.totalPages, this.totalPagesList);
	}

	ngOnChanges() {
		if (this.totalPagesList.length != this.totalPages) {
			this.totalPagesList = new Array(this.totalPages);
		}

		Util.log(this.LOG_TAG, 'ngOnChanges', this.page, this.pageSize, this.totalPages, this.totalPagesList);
	}

	getPageNo = (offset) => {
		return parseInt(this.page.toString()) + offset;
	}

	// changePage = (page) => {
	// 	var newPage = this.page + page;

	// 	if (newPage > 0 && newPage <= this.totalPages) {
	// 		this.page = newPage;

	// 		this.pageChange.emit(this.page);

	// 		this.emitChange();
	// 	}
	// }

	// onPageSizeChanged = () => {
	// 	this.page = 1;

	// 	this.pageSizeChange.emit(this.pageSize);

	// 	this.emitChange();
	// }

	// emitChange = () => {
	// 	var data = {
	// 		page: this.page,
	// 		pageSize: this.pageSize,
	// 	};

	// 	this.pageChange.emit(this.page);
	// 	this.pageSizeChange.emit(this.pageSize);
	// 	this.valueChange.emit(data);

	// 	Util.log(this.LOG_TAG, 'emitChange', data);
	// }
}