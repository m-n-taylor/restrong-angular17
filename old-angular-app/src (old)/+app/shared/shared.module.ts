import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from './api.service';
import { ShoppingCart } from './services/shopping-cart.service';
import { ModelService } from './services/model.service';

import { AlertComponent } from './components/alert/alert.component';
import { FiltersComponent } from './components/filters/filters.component';
//import { MenuItemOptionsModalComponent } from './components/menu-item-options-modal/menu-item-options-modal.component';
//import { MenuItemOptionsModalModule } from './components/menu-item-options-modal/menu-item-options-modal.module';


const MODULES = [
  // Do NOT include UniversalModule, HttpModule, or JsonpModule here
  CommonModule,
  RouterModule,
  FormsModule,
  ReactiveFormsModule,
  //MenuItemOptionsModalModule
];

const PIPES = [
  // put pipes here
];

const COMPONENTS = [
  // put shared components here
  AlertComponent,
  FiltersComponent,
  //MenuItemOptionsModalComponent
];

const PROVIDERS = [
  ModelService,
  ApiService,
  ShoppingCart
]

@NgModule({
  imports: [
    ...MODULES
  ],
  declarations: [
    ...PIPES,
    ...COMPONENTS
  ],
  exports: [
    ...MODULES,
    ...PIPES,
    ...COMPONENTS
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [
        ...PROVIDERS
      ]
    };
  }
}
