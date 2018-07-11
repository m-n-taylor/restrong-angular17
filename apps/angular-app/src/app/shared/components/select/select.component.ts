import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { Util } from '../../util';

@Component({
	selector: 'm-select',
	templateUrl: './select.component.html',
	
})
export class SelectComponent {
	LOG_TAG = 'SelectComponent =>';

	isOpen = false;

	searchText = '';
	// selectedText = '';

	@Input() multiSelect: boolean = false;
	@Input() disabled: boolean;
	@Input() error: string;
	@Input() placeholder: string;
	@Input() items = [];
	@Input() itemLabelProp = 'label';
	@Input() theme = '';

	constructor(private elementRef: ElementRef) {
		this.placeholder = `Select item${this.multiSelect ? '(s)' : ''}`;
	}

	ngOnInit() {
		Util.log(this.LOG_TAG, 'ngOnInit', this.items);
	}

	toggleOpen = () => {
		if (!this.disabled) {
			this.isOpen = !this.isOpen;

			if (!this.isOpen) {
				this.searchText = '';
				this.searchTextChanged();
			}
		}
	}

	itemClicked = (selectedItem) => {
		selectedItem.isSelected = !selectedItem.isSelected;

		if (!this.multiSelect) {
			for (var i = 0; i < this.items.length; i++) {
				var item = this.items[i];
				item.isSelected = false;
			}

			selectedItem.isSelected = true;

			if (this.isOpen) {
				this.toggleOpen();
			}
		}

		Util.log(this.LOG_TAG, 'itemClicked');
	}

	makeSelectedText = () => {
		var selectedText = '';

		var list = this.items.filter(item => item.isSelected);

		var length = list.length;

		if (this.multiSelect && length > 0) {
			selectedText = `(${length}) `;
		}

		for (var i = 0; i < length; i++) {
			var item = list[i];

			selectedText += item[this.itemLabelProp];

			if (i < length - 1) {
				selectedText += ', ';
			}
		}

		return selectedText;
	}

	searchTextChanged = () => {
		for (var i in this.items) {
			var item = this.items[i];

			if (item[this.itemLabelProp].toLowerCase().indexOf(this.searchText.toLowerCase()) == -1) {
				item.isHidden = true;
			}
			else {
				item.isHidden = false;
			}
		}
	}

	clickOutside = (event) => {
		if (this.isOpen) {
			this.toggleOpen();
		}

		Util.log(this.LOG_TAG, 'clickOutside');
	}

	ngOnDestroy() {
		Util.log(this.LOG_TAG, 'ngOnDestroy');
	}
}