'use strict';

let debug = require('debug')('client-settings:server');
let http = require('http');

let app = require('./lib/app');

// Make sure uncaught exceptions are logged on exit
process.on('uncaughtException', err => {
    debug("Uncaught exception", err, err.stack);
    process.exit(1);
});

let server = http.createServer(app);
server.app = app;
server.start = () => {
    let port = process.env.PORT || 3000;
    server.listen(port, () => {
        debug('URL:', 'http://localhost:' + port);
    });
};

module.exports = server;

// Start the app if called directly
if(require.main === module)
    server.start();


