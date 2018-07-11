import { Component, ChangeDetectionStrategy, ViewEncapsulation, Input } from '@angular/core';

import { Constants } from "../../../../shared/constants";

@Component({
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.Emulated,
    selector: 'dish-item',
    template: `
                <div class="dish-item">
                    <div class="dish-image">
                        <img class="obj-fit-cover" src="{{ constants.SERVER_URL + '/' + dish.FileName }}" alt="{{ dish.DishName }}" />
                    </div>
                    <div class="dish-overlay"></div>
                    <div class="dish-name">{{ dish.DishName }}</div>
                </div>
            `,
    providers: []
})
export class DishItemComponent {

    @Input() dish: any;

    constructor(public constants: Constants) {
        // if (!this.image || typeof this.image === 'undefined')
        //     this.image = 'https://dev.menus.com/d.aspx?s=3&i=3&f=59';
    }

}