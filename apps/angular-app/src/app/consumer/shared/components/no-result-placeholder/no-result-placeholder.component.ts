import { Component, ChangeDetectionStrategy, ViewEncapsulation, Input } from '@angular/core';

@Component({
  selector: 'no-result-placeholder',
  template: `<div class="no-result-placeholder-section">
                <div class="empty-result">
                    <div class="empty-result-icon {{ config.icon }}"></div>
                    <div class="empty-result-title">{{ config.title }}</div>
                    <div class="empty-result-subtitle">{{ config.subtitle }}</div>
                    <div *ngIf="config.buttons && config.buttons.length" class="no-result-action-buttons"><button class="btn btn-success btn-lg empty-result-action {{ button.type }}" *ngFor="let button of config.buttons" (click)="button.action()">{{ button.title }}</button></div>
                </div>
            </div>`,
  
})
export class NoResultPlaceholderComponent {

  @Input() config: any = {};

  constructor() {
  }

}