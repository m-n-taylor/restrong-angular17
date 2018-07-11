import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Util } from '../../util';

@Component({
  selector: 'validation-messages',
  template: `<div *ngIf="input.errors && (input.dirty && input.touched || form.submitted)">
                <div *ngIf="input.errors.required" class="help-block f-bold">{{ label }} is required</div>
                <div *ngIf="input.errors?.number" class="help-block f-bold">{{ label }} must be a number</div>
                <div *ngIf="input.errors?.lt" class="help-block f-bold">{{ label }} must be less then {{ valueLT }}</div>
                <div *ngIf="input.errors?.lte" class="help-block f-bold">{{ label }} must be less then or equal to {{ valueLTE }}</div>
                <div *ngIf="input.errors?.gt" class="help-block f-bold">{{ label }} must be greater then {{ valueGT }}</div>
                <div *ngIf="input.errors?.gte" class="help-block f-bold">{{ label }} must be greater then or equal to {{ valueGTE }}</div>
                <div *ngIf="input.errors.mValidEmail" class="help-block f-bold">{{ label }} must be a valid email address</div>
                <div *ngIf="input.errors.mValidPassword" class="help-block f-bold">{{ label }} must be atleast 8 digits Alpha numeric</div>
                <div *ngIf="input.errors.mValidZipCode" class="help-block f-bold">{{ label }} must be a valid zip code</div>
                <div *ngIf="input.errors.mValidPhone" class="help-block f-bold">{{ label }} must be a valid phone number</div>
                <div *ngIf="input.errors.mValidateEqual" class="help-block f-bold">{{ label }} must be a equal to {{ labelEqual }}</div>
                <div *ngIf="input.errors.asyncInvalid" class="help-block f-bold">
                    {{ label }} {{ input.errors.asyncInvalidMsg ? input.errors.asyncInvalidMsg :' is not valid' }}
                </div>
            </div>`,
  providers: []
})
export class ValidationMessagesComponent {
  LOG_TAG = 'ValidationMessagesComponent =>';

  @Input() label: any;
  @Input() labelEqual: any;
  @Input() valueLT: string;
  @Input() valueLTE: string;
  @Input() valueGT: string;
  @Input() valueGTE: string;
  @Input() input: any;
  @Input() form: any;
}