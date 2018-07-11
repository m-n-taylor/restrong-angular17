import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Util } from '../../util'

@Component({
	selector: 'm-checkbox',
	template: `<div (click)="toggleValue()" [ngClass]="{ 'checkbox': !inline, 'checkbox-inline': inline, 'toggle-btn': toggle, 'label-left': textAlign == 'left' }">
                <label mStopEvent>
                    <input type="checkbox" [checked]="value == trueValue" [disabled]="disabled" (change)="onChange($event)" />
                    <span class="icon"></span>
                    <span *ngIf="text" class="text">{{ text }}</span>
                </label>
            </div>`,
	providers: []
})
export class CheckboxComponent {
	LOG_TAG = 'CheckboxComponent =>';

	trueValue: any;
	falseValue: any;

	@Input() inline: boolean;
	@Input() toggle: boolean;
	@Input() disabled: boolean;
	@Input() text: any;
	@Input() textAlign: string;
	@Input() value: any;
	@Output() valueChange: EventEmitter<any>;

	constructor() {
		//Util.log(this.LOG_TAG, 'constructor', this.value);
		this.valueChange = new EventEmitter<any>();
	}

	ngOnInit() {
		//Util.log(this.LOG_TAG, 'ngOnInit', this.value);

		if (typeof this.value === 'number') {
			this.trueValue = 1;
			this.falseValue = 0;
		}
		else {
			this.trueValue = true;
			this.falseValue = false;
		}
	}

	toggleValue = () => {
		if (!this.disabled) {
			this.value == this.trueValue ? (this.value = this.falseValue) : (this.value = this.trueValue);

			this.emitValue();

			//Util.log(this.LOG_TAG, 'toggleValue', this.value);
		}
	}

	onChange = (event) => {
		if (!this.disabled) {
			event.target.checked ? (this.value = this.trueValue) : (this.value = this.falseValue);

			this.emitValue();

			//Util.log(this.LOG_TAG, 'onChange', this.value);
		}
	}

	emitValue = () => {
		this.valueChange.emit(this.value);
	}

}