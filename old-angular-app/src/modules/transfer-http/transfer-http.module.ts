import { NgModule } from '@angular/core';
import { Http, HttpModule } from '@angular/http';
import { TransferHttp } from './transfer-http';

@NgModule({
  providers: [
    TransferHttp
  ]
})
export class TransferHttpModule {}

// update: 2025-07-31T20:21:40.763483
