import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Util } from '../../util';

@Component({
	selector: 'm-radio',
	template: `	<div (click)="toggleValue()" [ngClass]="{ 'radio': !inline, 'radio-inline': inline, 'label-left': textAlign == 'left', 'disabled': disabled }">
					<label mStopEvent>
						<input type="radio" [name]="name" [(ngModel)]="value" [value]="defaultValue" (change)="onChange($event)" [disabled]="disabled" />
						<span class="icon"></span>
						<span *ngIf="text" class="text">{{ text }}</span>
					</label>
            	</div>`,
	
})
export class RadioComponent {
	LOG_TAG = 'RadioComponent =>';

	@Input() inline: boolean;
	@Input() disabled: boolean;
	@Input() name: string;
	@Input() text: string;
	@Input() textAlign: string;
	@Input() defaultValue: any;
	@Input() value: any;
	@Output() valueChange: EventEmitter<any>;

	constructor() {
		//Util.log(this.LOG_TAG, 'constructor', this.defaultValue);
		this.valueChange = new EventEmitter<any>();
	}

	ngOnInit() {
		//Util.log(this.LOG_TAG, 'ngOnInit', this.defaultValue);

		// if (typeof this.value === 'number') {
		// 	this.trueValue = 1;
		// 	this.falseValue = 0;
		// }
		// else {
		// 	this.trueValue = true;
		// 	this.falseValue = false;
		// }
	}

	toggleValue = () => {
		// if (!this.disabled) {
		// 	this.value == this.dvalue;

		// 	this.emitValue();
		// }
	}

	onChange = (event) => {
		// if (!this.disabled) {
		// 	this.value == this.dvalue;

			this.emitValue();

		// }

		//Util.log(this.LOG_TAG, 'onChange', this.value);
	}

	emitValue = () => {
		this.valueChange.emit(this.value);
	}

}