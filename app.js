
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes/index.js');
routes.console = require('./routes/console.js');
routes.dashboard = require('./routes/dashboard.js');

var config = require('./config.js');
var mail = require('./mail');
var db = require('./db');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.bodyParser());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.post('/console/run', routes.console.run);
app.get('/console/refresh', routes.console.refresh);
app.get('/dashboard/getTotalNum.json', routes.dashboard.getTotalNum);
app.get('/dashboard/getMails.json', routes.dashboard.getMails);
app.get('/dashboard/clearOldMails.json', routes.dashboard.clearOldMails);
app.get('/dashboard/getLastThreeMonthSubjects.json', routes.dashboard.getLastThreeMonthSubjects);
app.get('/dashboard/mail', routes.dashboard.mail);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

db.connect(config.db.url);
mail.start();
