import { Component, ChangeDetectionStrategy, ViewEncapsulation, Input } from '@angular/core';

@Component({
	changeDetection: ChangeDetectionStrategy.Default,
	encapsulation: ViewEncapsulation.Emulated,
	selector: 'page-loader',
	template: `<div class="page-loader-container">
              <div *ngIf="center" class="page-loader-overlay" [ngClass]="{ 'page': center == 'page', 'parent': center == 'parent' }"></div>
              <div class="page-loader" [ngClass]="{ 'page-center': center == 'page', 'parent-center': center == 'parent' }">
                <svg class="page-loader-circular" viewBox="25 25 50 50">
                  <circle class="page-loader-path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10" />
                </svg>
              </div>
            </div>`,
	providers: []
})
export class PageLoaderComponent {
	@Input() center: string; // Center ('page', 'parent')

	constructor() {

	}

}