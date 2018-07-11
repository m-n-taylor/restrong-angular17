import * as express from "express";
import * as http from "http";
import * as socketIo from "socket.io";
import * as sql from "mssql";

import { Constants } from './constants';
import { Util } from './util';

import { Message } from "./model";

/**
 * Controllers (route handlers).
 */
import * as pdfReaderController from "./controllers/pdf-reader";
import { ChatController } from "./controllers/chat.controller";

var constants = new Constants();
var util = new Util(this.constants);

/**
 * Create Express server.
 */
var app = express();
app.use(express.static('public'));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var port = process.env.PORT || constants.PORT;
var server = http.createServer(app);

/**
 * Create Socket connection.
 */
var io = socketIo(server);

/**
 * Connect to DB
 */
(<any>sql).connect(constants.DBConfig).then(() => {
    new ChatController(io, constants);
});

/**
 * API routes.
 */
app.get("/pdf-reader", pdfReaderController.readPDF);
// app.get("/test1", (req: Request, res: any) => {
//     console.log('public', process.cwd() + '/public');
//     var child = require('child_process');

//     var publicDir = process.cwd() + "\\public";

//     child.exec(`"C:\\Program Files (x86)\\gs\\gs9.22\\bin\\gs" -q -dQUIET -dSAFER -dBATCH -dNOPAUSE -dNOPROMPT -dMaxBitmap=500000000 -dAlignToPixels=0 -dGridFitTT=2 "-sDEVICE=pngalpha" -dTextAlphaBits=4 -dGraphicsAlphaBits=4 "-r100x100" -sOutputFile="${publicDir}\\Pic-%d.png" "${publicDir}\\food.pdf"`, (err, std, stderr) => {
//         var str =`${err} ${std} ${stderr}`;

//         res.send(str);
//     });

//     // var PDFImage = require("pdf-image").PDFImage;

//     // var pdfImage = new PDFImage("food.pdf");
//     // pdfImage.convertPage(0).then(function (imagePath) {
//     //     // 0-th page (first page) of the slide.pdf is available as slide-0.png 
//     //     // fs.existsSync("/tmp/slide-0.png") // => true 

//     //     console.log('imagePath', imagePath);

//     //     res.send({ test2: 12323423 });
//     // }, function (err) {
//     //   res.send({ test2: err });
//     // });


// });

/**
 * Start Express server.
 */
server.listen(port, () => {
    Util.log('Running server on port %s', port);
});

export = app;