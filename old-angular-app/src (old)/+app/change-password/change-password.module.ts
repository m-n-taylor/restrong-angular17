import { NgModule } from '@angular/core';

import { InfiniteScrollModule } from 'angular2-infinite-scroll';

import { SharedModule } from '../shared/shared.module';
import { FiltersComponent } from '../shared/components/filters/filters.component';
import { ChangePasswordComponent } from './change-password.component';
import { ChangePasswordRoutingModule } from './change-password-routing.module';

@NgModule({
  imports: [
    InfiniteScrollModule,
    SharedModule,
    ChangePasswordRoutingModule
  ],
  declarations: [
    ChangePasswordComponent
  ]
})
export class ChangePasswordModule { }
