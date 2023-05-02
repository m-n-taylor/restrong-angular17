import 'zone.js/dist/zone';
import 'reflect-metadata';
import 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserAppModule } from './app/browser-app.module';

platformBrowserDynamic().bootstrapModule(BrowserAppModule);

// update: 2025-08-01T01:05:23.793592
