import { NgModule, ApplicationRef, APP_BOOTSTRAP_LISTENER } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { ModuleMapLoaderModule } from '@nguniversal/module-map-ngfactory-loader';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';

import { ServerStateTransferModule, StateTransferService } from '@ngx-universal/state-transfer';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/first';

export function bootstrapFactory(appRef: ApplicationRef, stateTransfer: StateTransferService): () => Subscription {
	console.log('AppServerModule => bootstrapFactory');
	
	return () => appRef.isStable
			 	.filter(stable => stable)
				.first()
				.subscribe(() => {
					console.log('AppServerModule => subscribe');

					stateTransfer.inject();
				});
}

@NgModule({
	imports: [
		// The AppServerModule should import your AppModule followed
		// by the ServerModule from @angular/platform-server.
		BrowserModule.withServerTransition({ appId: 'my-app' }),
		ServerStateTransferModule.forRoot(),
		AppModule,
		ServerModule,
		ModuleMapLoaderModule,
	],
	providers: [
		{
			provide: APP_BOOTSTRAP_LISTENER,
			useFactory: bootstrapFactory,
			multi: true,
			deps: [
				ApplicationRef,
				StateTransferService
			]
		}
	],
	// Since the bootstrapped component is not inherited from your
	// imported AppModule, it needs to be repeated here.
	bootstrap: [AppComponent],
})
export class AppServerModule {

	constructor(private readonly stateTransfer: StateTransferService) {
		console.log('AppServerModule => constructor');
	}
}