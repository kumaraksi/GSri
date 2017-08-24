/**
 *Module dependencies
 */
var
    app = require('./app'),
    http = require('http'),
    server = http.createServer(app);

//==============================================================================
/**
 *Create socket instance
 */

var webSocket = require('./socket')(server);
//==============================================================================
/**
 *Module Variables
 */
//==============================================================================
var
    port = app.get('port'),
    env = app.get('env');
/**
 *Bind server to port
 */
//==============================================================================
server.listen(port, function() {
    return console.log('Xpress server listening on port:' + port + ' in ' + env +
        ' mode');
});
//==============================================================================