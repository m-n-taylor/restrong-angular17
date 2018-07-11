import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Util } from '../../util'

@Component({
	selector: 'm-select',
	templateUrl: './select.component.html',
	providers: []
})
export class SelectComponent {
	LOG_TAG = 'SelectComponent =>';

	isOpen = false;

	searchText = '';
	// selectedText = '';

	@Input() placeholder = 'Select item(s)';
	@Input() items = [];
	@Input() itemLabelProp = 'label';

	constructor() {
	}

	ngOnInit() {
		this.makeSelectedText();
		
		Util.log(this.LOG_TAG, 'ngOnInit', this.items);
	}

	toggleOpen = () => {
		this.isOpen = !this.isOpen;
	}

	itemClicked = (item) => {
		item.isSelected = !item.isSelected;

		this.makeSelectedText();
	}

	makeSelectedText = () => {
		var selectedText = '';

		var list = this.items.filter(item => item.isSelected);

		var length = list.length;

		if (length > 0) {
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
}