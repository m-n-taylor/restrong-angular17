/**
 * External Library Code: https://github.com/gmostert/ng2-breadcrumb
 */

import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { BreadcrumbComponent } from './breadcrumb.component';
import { BreadcrumbService } from './breadcrumb.service';

export * from './breadcrumb.component';
export * from './breadcrumb.service';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
    ],
    declarations: [
        BreadcrumbComponent
    ],
    exports: [
        BreadcrumbComponent
    ]
})
export class Ng2BreadcrumbModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: Ng2BreadcrumbModule,
            providers: [BreadcrumbService]
        };
    }
}