# Angular app for Consumer Web and Rest Owner Backend

## Installation
* Install Node.js
* Install Angular cli `npm install -g @angular/cli`
* `npm install`

## Development (Client-side only rendering)
* run `npm run start`
* open `http://localhost:8003` in browser

## Development (Client-side with Server side Rendering)
* run `ng build --watch`
* run `ng build --prod --app 1 --output-hashing=false --watch`
* run `npm run webpack:server` (run each time server code is changed)
* run `cd dist && node server.js` (restart server, after 3rd (above) command)
* open `http://localhost:4000` in browser

## Production 
**`npm run build:dynamic && npm run serve:dynamic`** - Compiles your application and spins up a Node 
**`ng build --watch -o dist/`**
**`cd dist/`**
**`nodemon server.js`**
nodemon --ignore dist -e ts --exec 'npm run build:dynamic && npm run serve:dynamic'

ng build --prod

need to run SSR locally, and fix some issues.


Express to dynamically serve your Universal application on `http://localhost:4000`.

For more info https://github.com/angular/universal-starter