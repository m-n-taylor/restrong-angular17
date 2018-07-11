import { Component, ChangeDetectionStrategy, ViewEncapsulation, Input } from '@angular/core';

import { Constants } from '../../constants';

@Component({
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
    
})
export class DishItemComponent {

    @Input() dish: any;

    constructor(public constants: Constants) {
    }

}