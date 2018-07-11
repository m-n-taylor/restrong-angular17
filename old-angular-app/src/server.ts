import * as express from 'express';
import * as path from 'path';
import { ROUTES } from './routes';

export var init = (app: any, port) => {

    app.set('view engine', 'html');
    app.set('views', 'src');

    app.use('/', express.static('dist', {
        index: false, setHeaders: (res: express.Response, path: string, stat: any) => {
            res.setHeader('Cache-Control', 'private, max-age=31536000'); // 1 year
        }
    }));

    // app.get('/', (req, res) => {
    //     res.sendFile(path.resolve('dist/placeholder.html'));
    // });

    ROUTES.forEach(route => {
        app.get(route, (req, res) => {
            console.time(`GET: ${req.originalUrl}`);
            res.render('../dist/index', {
                req: req,
                res: res
            });
            console.timeEnd(`GET: ${req.originalUrl}`);
        });
    });

    app.listen(port, () => {
        console.log(`Listening at ${port}`);
    });
}