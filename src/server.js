'use strict';

function sleep(ms) {
  var start = new Date().getTime(), expire = start + ms;
  while (new Date().getTime() < expire) { }
  return;
}

sleep(5000);

//Load express
var express = require('express');
var app = express();

//Load app config file
var config = require('./config/config.js');

//Load routes definition
var router = require('./controllers/index.js');

var mongo = require('./libraries/mongo.js');
console.log('Prepare database');
mongo.init().then(()=>console.log('ready'));

//Enable body parsing
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

//HTTP Method overwriter to set error response codes
var methodOverride = require('method-override');
var message = require('./models/message.js');
app.use(methodOverride());
app.use((err, req, res, next) => {
    res.status(500).json(message(0, 'ERR_SERVER_ERROR'));
});

//Set CORS handling
app.all('/*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//Define routes
app.use(router.routes);

//Provide webserver for static files on public dir
let path=require('path');
app.use(express.static(path.join(__dirname, 'public')));

//Strartup the services
function start() {
    //Load http service
    if (config.app.http.port != undefined && config.app.http.port != '') {
        app.listen(config.app.http.port, () => console.info('Blocktrack API server running on port ' + config.app.http.port));
    }
};

//Error handling
process.on('uncaughtException', (err) => {
    if (err.code == 'EADDRINUSE')
        console.error('Blocktrack API server could not start. Port already in use');
    else
        console.error('Blocktrack API server error: ' + err);
    process.exit('SIGTERM');
});

start();
