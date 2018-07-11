import { Component, ChangeDetectionStrategy, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';

import { Util } from "../../util";

@Component({
    selector: 'menu-item-options-list',
    templateUrl: './menu-item-options-list.component.html',
})
export class MenuItemOptionListComponent {
    LOG_TAG = 'MenuItemOptionListComponent';

    @Input() title: string;
    @Input() required: boolean;
    @Input() disabled: boolean;
    @Input() isSingleSelect: boolean;
    @Input() optionItems: Array<any>;

    @Output() onOptionItemClick: EventEmitter<any>;

    constructor() {
        this.onOptionItemClick = new EventEmitter<any>();
    }

    ngOnInit() {
        Util.log(this.LOG_TAG, 'ngOnInit', this.optionItems);

        for (var i in this.optionItems) {
            var item = this.optionItems[i];

            if (item.Is_Default) {
                item.isSelected = true;

                if (this.isSingleSelect) {
                    break;
                }
            }
        }
    }

    chooseOptionItem = (optionItem) => {
        if (!this.disabled) {
            
            if (this.isSingleSelect) {
                for (var i in this.optionItems) {
                    var item = this.optionItems[i];
                    item.isSelected = false;
                }
            }

            optionItem.isSelected = !optionItem.isSelected;

            this.onOptionItemClick.emit(optionItem);
        }
    }
}