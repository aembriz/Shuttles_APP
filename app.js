
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


// *************** Authentication ***********************
app.set('jwtTokenSecret', 'turk3tshut1a'); //secret for encoding/decoding JWT tokens
var passport = require('passport');
require('./config/passport')(app, passport); // configure strategies for passport

// ******************************************************


// all environments
app.set('port', process.env.PORT || 8082);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(passport.initialize()); // initialize passport for authentication
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}




// global controller
/*
app.get('/*',function(req,res,next){
	res.set('Access-Control-Allow-Origin', '*');
	next(); // http://expressjs.com/guide.html#passing-route control
});
*/
app.all('/*',function(req,res,next){
	if (req.method === 'OPTIONS') { // preflight
	      console.log('!OPTIONS');
	      // IE8 does not allow domains to be specified, just the *
	      // headers["Access-Control-Allow-Origin', req.headers.origin);
	      res.header('Access-Control-Allow-Origin', '*');
	      res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
	      res.header('Access-Control-Allow-Credentials', false);
	      res.header('Access-Control-Max-Age', '86400'); // 24 hours
	      res.header('Access-Control-Allow-Headers', 'Access, Authorization, Origin, X-Requested-With, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
	}
	else{ // CORS
		res.set('Access-Control-Allow-Origin', '*');
	}	
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
//app.post('/users/login', user.login)

// --------------- Usuario ----------------
var usuario = require('./routes/usuario');
usuario.set(app, passport);
app.post('/login', usuario.login);

app.get('/usuario', usuario.list());
app.get('/usuario/:id', usuario.listOne());
app.post('/usuario', usuario.add());
app.put('/usuario/:id', usuario.update());
app.put('/usuario/authorize/:id', usuario.authorize());
app.put('/usuario/reject/:id', usuario.reject());
app.delete('/usuario/:id', usuario.delete());

app.post('/preregister/usuario', usuario.addPre());
app.post('/preregister/usuariobulk', usuario.addPreBulk());
app.get('/roles', usuario.listRoles());


// --------------- Estatus ----------------
var estatus = require('./routes/estatus');
app.get('/estatus', estatus.list());
app.get('/estatus/:id', estatus.listOne());
app.post('/estatus', estatus.add());
app.put('/estatus/:id', estatus.update());
app.delete('/estatus/:id', estatus.delete());

// --------------- Empresa ----------------
var empresa = require('./routes/empresa');
app.get('/empresa', empresa.list());
//app.get('/empresa', usuario.authenticate, usuario.needsRole('ROLE_ADMIN'), empresa.list());

app.get('/empresa/existe', empresa.alreadyExist());
app.get('/empresa/:id', empresa.listOne());
app.post('/empresa', empresa.add(false));
app.post('/preregister/empresa', empresa.add(true));
app.put('/empresa/:id', empresa.update());
app.put('/empresa/authorize/:id', empresa.authorize());
app.put('/empresa/reject/:id', empresa.reject());
app.delete('/empresa/:id', empresa.delete());

// --------------- Ruta ----------------
var ruta = require('./routes/ruta');
app.get('/ruta', ruta.list());
app.get('/ruta/:id', ruta.listOne());
app.post('/ruta', ruta.add());
app.put('/ruta/:id', ruta.update());
app.put('/ruta/authorize/:id', ruta.authorize());
app.put('/ruta/reject/:id', ruta.reject());
app.delete('/ruta/:id', ruta.delete());

// --------------- RutaPunto ----------------
var rutapunto = require('./routes/rutapunto');
app.get('/rutapunto', rutapunto.list());
app.get('/rutapunto/:id', rutapunto.listOne());
app.post('/rutapunto', rutapunto.add());
app.put('/rutapunto/:id', rutapunto.update());
app.delete('/rutapunto/:id', rutapunto.delete());

// --------------- RutaCorrida ----------------
var rutacorrida = require('./routes/rutacorrida');
app.get('/rutacorrida', rutacorrida.list());
app.get('/rutacorrida/:id', rutacorrida.listOne());
app.post('/rutacorrida', rutacorrida.add());
app.put('/rutacorrida/:id', rutacorrida.update());
app.delete('/rutacorrida/:id', rutacorrida.delete());

// --------------- Ruta Suggestions----------------
var rutasuggest = require('./routes/procesocompraruta');
app.get('/compra/rutasugeridas', usuario.authenticate, rutasuggest.listSuggestions());
app.get('/compra/ruta/:rutaid/oferta', usuario.authenticate, rutasuggest.listOferta());
app.post('/compra/reservar/:ofertaid', usuario.authenticate, usuario.needsRole('USUARIO'), rutasuggest.reservationCreate()); // Crea la reservación
app.post('/compra/cancelar/:reservacionid', usuario.authenticate, usuario.needsRole('USUARIO'), rutasuggest.reservationCancel()); // cancela una reservación
app.get('/compra/misreservaciones', usuario.authenticate, usuario.needsRole('USUARIO'), rutasuggest.reservationList());


// --------------- Rutas Favoritas----------------
var rutasuggest = require('./routes/rutafavorita');
//app.get('/rutafavorita', rutasuggest.favouriteList());
app.put('/rutafavorita/add', usuario.authenticate, usuario.needsRole('USUARIO'), rutasuggest.favouriteAdd());
app.put('/rutafavorita/remove', usuario.authenticate, usuario.needsRole('USUARIO'), rutasuggest.favouriteDel());
app.get('/rutafavorita', usuario.authenticate, usuario.needsRole('USUARIO'), rutasuggest.favouriteList());


// --------------- Oferta ----------------
var oferta = require('./routes/oferta');
app.get('/oferta', usuario.authenticate, oferta.list());
app.get('/oferta/:id', usuario.authenticate, oferta.listOne());
app.post('/oferta', usuario.authenticate, oferta.add());
app.put('/oferta/:id', usuario.authenticate, oferta.update());
app.delete('/oferta/:id', usuario.authenticate, oferta.delete());
app.put('/oferta/:id/plus', usuario.authenticate, oferta.incrementOferta());
app.put('/oferta/:id/minus', usuario.authenticate, oferta.decrementOferta());


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