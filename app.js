
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var db = require('./models');

var http = require('http');
var path = require('path');

// Database
/* Using MongoSkin as mongodb handler
var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/muuk", {native_parser:true});
*/
/* Using Mongoose as mogodb handler
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/muuk');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("Conectado correctamente");
});
*/

var app = express();

// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


// global controller
app.get('/*',function(req,res,next){
	res.set('Access-Control-Allow-Origin', '*');
	next(); // http://expressjs.com/guide.html#passing-route control
});


app.get('/', routes.index);
//app.get('/users', user.list);
// --------------- USER ----------------
/*
app.get('/userlist', user.userlist(db));
app.post('/adduser', user.adduser(db));
app.delete('/deleteuser/:id', user.deleteuser(db));
*/


var routes  = require('./routes')
var user    = require('./routes/user')
var task    = require('./routes/task')
app.get('/', routes.index)
app.post('/users/create', user.create)
app.post('/users/:user_id/tasks/create', task.create)
app.get('/users/:user_id/tasks/:task_id/destroy', task.destroy)


// --------------- Empresa ----------------
var empresa = require('./routes/empresa');
app.get('/empresa', empresa.list());
app.get('/empresa/:id', empresa.listOne());
app.post('/empresa', empresa.add());
app.put('/empresa/:id', empresa.update());
app.delete('/empresa/:id', empresa.delete());

// -------------------------------------------
/*
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
*/

db
  .sequelize
  .sync({ force: false })
  .complete(function(err) {
	if (err) {
	  throw err
	} else {
	  http.createServer(app).listen(app.get('port'), function(){
		console.log('Express server listening on port ' + app.get('port'))
	  })
	}
  });