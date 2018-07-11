import { NgModule } from '@angular/core';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';

import { BrowserStateTransferModule, DEFAULT_STATE_ID } from '@ngx-universal/state-transfer';

@NgModule({
	imports: [
		// The AppServerModule should import your AppModule followed
		// by the ServerModule from @angular/platform-server.
		BrowserModule.withServerTransition({ appId: 'my-app' }),
		BrowserStateTransferModule.forRoot(),
		AppModule,
	],
	// Since the bootstrapped component is not inherited from your
	// imported AppModule, it needs to be repeated here.
	bootstrap: [AppComponent],
})
export class AppBrowserModule {

	constructor() {
		// get `STATE` value (injected by the server platform)
		let stateValue = undefined;
		
		const win: any = window;
		
		if (win && win[DEFAULT_STATE_ID])
		  stateValue = win[DEFAULT_STATE_ID];
	}
}
