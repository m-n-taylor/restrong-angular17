import 'zone.js/dist/zone-node';
import 'reflect-metadata';
import 'rxjs/Rx';

import { enableProdMode } from '@angular/core';
import { platformServer, renderModuleFactory } from '@angular/platform-server';

import * as http from 'http';
import * as express from 'express';
// import * as socketIo from 'socket.io';
// var socketIo  = require("socket.io");

import { ServerAppModule } from './app/server-app.module';
import { ngExpressEngine } from './modules/ng-express-engine/express-engine';

import * as server from './server';

enableProdMode();

const app = express();
// const httpServer = http.createServer(app);
// const io = socketIo(httpServer);

app.engine('html', ngExpressEngine({
  bootstrap: ServerAppModule
}));

server.init(app, 8003);
