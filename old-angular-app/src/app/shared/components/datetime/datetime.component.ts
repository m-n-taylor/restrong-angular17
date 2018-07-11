import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Util } from '../../util'

declare var Flatpickr;

export class DateTimeOptions {
  public mode?: string;
  public enableTime?: boolean;
  public enableSeconds?: boolean;
  public noCalendar?: boolean;
  public defaultDate?: any;
  public onChange?: any;
}

@Component({
  selector: 'm-datetime',
  template: `<div class="form-group has-error" [ngClass]="{ 'has-error' : error }">
              <input type="text" class="form-control" #datetime [disabled]="disabled" />
              <div *ngIf="error" class="help-block f-bold">{{ error }}</div>
            </div>`,
  providers: []
})
export class DateTimeComponent {
  LOG_TAG = 'DateTimeComponent =>';

  private instance = null;

  private defaultOptions = new DateTimeOptions();

  private DATE_FORMAT = 'Y-m-d';
  private TIME_FORMAT = 'H:i:S';

  private outputFormat: string;

  @Input() error: string;
  @Input() disabled: boolean;
  @Input() options: any;
  @Input() value: any;
  @Output() valueChange: EventEmitter<any>;

  @ViewChild('datetime') datetime;

  constructor() {
    // Util.log(this.LOG_TAG, 'constructor', this.value);

    this.valueChange = new EventEmitter<any>();
  }

  ngOnInit() {
    // Util.log(this.LOG_TAG, 'ngOnInit', this.value);
  }

  ngAfterViewInit() {
    // Util.log(this.LOG_TAG, 'ngAfterViewInit', this.datetime);

    this.defaultOptions = {
      enableSeconds: true,
      // dateFormat: "Y-m-d",
    };

    Util.merge(this.defaultOptions, this.options || {});

    if (Util.isDefined(this.defaultOptions.enableTime) && Util.isDefined(this.defaultOptions.noCalendar)) {
      this.outputFormat = `${this.TIME_FORMAT}`;
    }
    else if (Util.isDefined(this.defaultOptions.enableTime)) {
      this.outputFormat = `${this.DATE_FORMAT}T${this.TIME_FORMAT}`;
    }
    else {
      this.outputFormat = `${this.DATE_FORMAT}`;
    }

    this.defaultOptions.defaultDate = this.value;

    this.defaultOptions.onChange = this.onChange;

    this.instance = new Flatpickr(this.datetime.nativeElement, this.defaultOptions);
  }

  private onChange = (selectedDates, dateStr, instance) => {
    if (Util.isDefined(this.defaultOptions.mode) && this.defaultOptions.mode == 'range') {
      this.value = [];

      var length = instance.selectedDates.length;

      for (var index in instance.selectedDates) {
        this.value[index] = instance.formatDate(instance.selectedDates[index], this.outputFormat);
      }
    }
    else {
      this.value = instance.formatDate(instance.selectedDates[0], this.outputFormat);
    }

    this.valueChange.emit(this.value);

    // Util.log(this.LOG_TAG, 'onChange', selectedDates, dateStr, instance);
  }

  public clear = () => {
    if (this.instance) {
      this.instance.clear();
    }
  }

}