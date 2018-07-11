import 'zone.js/dist/zone-node';
import 'reflect-metadata';
import { renderModuleFactory } from '@angular/platform-server';
import { enableProdMode } from '@angular/core';

import * as express from 'express';
import { join } from 'path';
import * as https from 'https';
import { readFileSync } from 'fs';

// Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();

// Express server
const app = express();

const PORT = process.env.PORT || 4000;
const DIST_FOLDER = join(process.cwd(), '.');

// Our index.html we'll use as our template
const template = readFileSync(join(DIST_FOLDER, 'browser', 'index.html')).toString();

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('./dist/server/main.bundle');

// Express Engine
import { ngExpressEngine } from '@nguniversal/express-engine';
// Import module map for lazy loading
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';
import { RequestOptions } from 'https';
import { Constants } from './src/app/shared/constants';
import { HelperService } from './src/app/shared/services/helper.service';
import { Util } from './src/app/shared/util';

// Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
// app.engine('html', ngExpressEngine({
// 	bootstrap: AppServerModuleNgFactory,
// 	providers: [
// 		provideModuleMap(LAZY_MODULE_MAP)
// 	]
// }));
app.engine('html', (_, options, callback) => {
	var host = options.req.get('host');
	var protocol = host.startsWith('localhost') ? 'http' : 'https';

	const engine = ngExpressEngine({
		bootstrap: AppServerModuleNgFactory,
		providers: [
			{ provide: 'APP_HOST_URL', useFactory: () => `${protocol}://${host}`, deps: [] },
			provideModuleMap(LAZY_MODULE_MAP)
		]
	});

	engine(_, options, callback);
});

app.set('view engine', 'html');
app.set('views', join(DIST_FOLDER, 'browser'));

/* - Example Express Rest API endpoints -
  app.get('/api/**', (req, res) => { });
*/

// Server static files from /browser
app.get('*.*', express.static(join(DIST_FOLDER, 'browser'), {
	maxAge: '1y'
}));

var fetch = (options: RequestOptions | string | URL) => {
	var data = '';

	return new Promise<any>((resolve, reject) => {
		https.request(options, function (res) {
			res.on("data", function (d) {
				data += d.toString();
			});

			res.on("error", function (e) {
				reject(e);
			});

			res.on("end", function (d) {
				resolve(data);
			});
		}).end();
	});
}

// All regular routes use the Universal engine
app.get('/', async (req, response) => {
	var constants = new Constants();
	var helperService = new HelperService(constants);

	var configFile = readFileSync(join(DIST_FOLDER, 'browser', 'config.json')).toString();
	var config = JSON.parse(configFile);

	if (config.APP_TYPE.indexOf(constants.APP_TYPE_CONSUMER) > -1) {
		var apiServer = config.ENV == 'ENV_LIVE' ? 'live' : 'dev';
		var apiPublicKey = config.PUBLIC_KEY;

		var apiLink = `https://${apiServer}.dishzilla.com/api/search_menus.aspx?key=API_TEST_KEY&pcpk=${apiPublicKey}&menuType=0&page=1&pageSize=2&qtype=menu`;

		var apiData = await fetch(apiLink);

		var apiDataJSON = JSON.parse(apiData);

		var hasMultiRests = apiDataJSON.Data && apiDataJSON.Data.length && apiDataJSON.Data.length > 1;

		if (!hasMultiRests) {
			var restaurant = apiDataJSON.Data[0];
			return response.redirect(`/restaurant/${helperService.getFirstAvailableServiceType(restaurant)}/${Util.replaceSpaceWithDash(restaurant.CuisineName)}/${Util.replaceSpaceWithDash(restaurant.RestaurantName)}-${Util.replaceSpaceWithDash(restaurant.Address)}/${restaurant.FFID}`);
		}
		else {
			return response.redirect('/search');
		}
	}
	else if (config.APP_TYPE.indexOf(constants.APP_TYPE_BACKOFFICE) > -1) {

		if (config.APP_TYPE.indexOf(constants.APP_TYPE_MOBILE) > -1) {
			return response.redirect('/backoffice/login');
		}
		else {
			return response.redirect('/backoffice');
		}
	}
});

app.get('/download', async (req, response) => {
	var configFile = readFileSync(join(DIST_FOLDER, 'browser', 'config.json')).toString();
	var config = JSON.parse(configFile);

	var apiServer = config.ENV == 'ENV_LIVE' ? 'live' : 'dev';
	var apiPublicKey = config.PUBLIC_KEY;

	var apiLink = `https://${apiServer}.dishzilla.com/api/b/gps.aspx?key=API_TEST_KEY&pcpk=${apiPublicKey}&IncludeSettings=true`;

	var apiData = await fetch(apiLink);

	var apiDataJSON = JSON.parse(apiData);

	if (apiDataJSON.Status == 'success') {
		var appStoreLink = apiDataJSON.Data.App_IOS_Store_Link;
		var playStoreLink = apiDataJSON.Data.App_Android_Store_Link;

		var script = `<script>
						window.onload = function () {
							if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
								window.location.href = '${appStoreLink}';
							}
							else if (/android/i.test(navigator.userAgent)) {
								window.location.href = '${playStoreLink}';
							}
							else {
								window.location.href = '/';
							}
						}		
					</script>
						`;

		response.end(script);
	}
	else {
		return response.redirect('/');
	}
});

app.get('*', (req, res) => {
	res.render('index', { req });
});

// Start up the Node server
app.listen(PORT, () => {
	console.log(`Node Express server listening on http://localhost:${PORT}`);
});
