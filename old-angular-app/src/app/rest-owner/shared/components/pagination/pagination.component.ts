import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Util } from '../../../../shared/util';

// RO Services
import { SharedDataService } from '../../services/shared-data.service';

@Component({
	selector: 'm-pagination',
	templateUrl: './pagination.component.html',
	providers: []
})
export class PaginationComponent {
	LOG_TAG = 'PaginationComponent =>';

	@Input() id: string;

	@Input() page: number;
	@Output() pageChange: EventEmitter<any>;

	@Input() pageSize: number;
	@Output() pageSizeChange: EventEmitter<any>;

	@Input() totalPages: number;
	@Input() totalRows: number;

	@Output() valueChange: EventEmitter<any>;

	@Input() pageSizeList: Array<number>;

	constructor(private sharedDataService: SharedDataService) {
		Util.log(this.LOG_TAG, 'constructor', this.page, this.pageSize);

		this.pageChange = new EventEmitter<any>();
		this.pageSizeChange = new EventEmitter<any>();
		this.valueChange = new EventEmitter<any>();
	}

	ngOnInit() {
		if (!this.pageSizeList) {
			this.pageSizeList = [25, 50, 75, 100];
		}

		Util.log(this.LOG_TAG, 'ngOnInit', this.page, this.pageSize);
	}

	changePage = (page) => {
		var newPage = parseInt(<any>this.page) + parseInt(page);

		if (newPage > 0 && newPage <= this.totalPages) {
			this.page = newPage;

			this.pageChange.emit(this.page);

			this.emitChange();
		}

		Util.log(this.LOG_TAG, 'changePage', page, newPage, this.page);
	}

	onPageSizeChanged = () => {
		this.page = 1;

		this.pageSizeChange.emit(this.pageSize);

		this.emitChange();
	}

	emitChange = () => {
		Util.log(this.LOG_TAG, 'emitChange');

		var data = {
			page: this.page,
			pageSize: this.pageSize,
		};

		this.pageChange.emit(this.page);
		this.pageSizeChange.emit(this.pageSize);
		this.valueChange.emit(data);

		// Saving in `SharedData`
		this.sharedDataService.pageSizeList[this.id] = this.pageSize;
		this.sharedDataService.save();

		Util.log(this.LOG_TAG, 'emitChange', data);
	}
}