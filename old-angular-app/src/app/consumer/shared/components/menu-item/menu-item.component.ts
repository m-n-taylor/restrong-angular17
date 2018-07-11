import { Component, Input, Output, EventEmitter } from '@angular/core';

// Shared Helpers
import { Util } from '../../../../shared/util';
import { Constants } from '../../../../shared/constants';

// Shared Services
import { SharedDataService } from '../../../../shared/services/shared-data.service';

@Component({
    selector: 'menu-item',
    templateUrl: './menu-item.component.html',
    providers: []
})
export class MenuItemComponent {
    public static ACTION_VIEW_MENU = 'ACTION_VIEW_MENU';
    public static ACTION_VIEW_ADD_CART = 'ACTION_VIEW_ADD_CART';
    public static ACTION_VIEW_MORE_DISHES = 'ACTION_VIEW_MORE_DISHES';

    ACTION_VIEW_MENU = MenuItemComponent.ACTION_VIEW_MENU;
    ACTION_VIEW_ADD_CART = MenuItemComponent.ACTION_VIEW_ADD_CART;
    ACTION_VIEW_MORE_DISHES = MenuItemComponent.ACTION_VIEW_MORE_DISHES;

    sharedData = {};

    @Input() config: any = {};
    @Input() item: any;
    @Output() menuItemClicked: EventEmitter<any> = new EventEmitter<any>();

    constructor(public constants: Constants, public sharedDataService: SharedDataService) {
    }

    ngOnInit() {
    }

    doAction = (action) => {
        this.menuItemClicked.emit({
            action: action,
            menuItem: this.item
        });
    }

    replaceSpaceWithDash = (value: string): string => {
        return Util.replaceSpaceWithDash(value);
    }
}