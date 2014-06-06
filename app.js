
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

// TODO: verificar cuestiones de seguridad (cuales se necesitan para el preregistro por parte del usuario)
app.get('/usuario', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), usuario.list());
app.get('/usuario/:id', usuario.listOne());
app.post('/usuario', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), usuario.add());
app.put('/usuario/:id', usuario.update()); 
app.put('/usuario/authorize/:id', usuario.authorize());
app.put('/usuario/reject/:id', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), usuario.reject());
app.delete('/usuario/:id', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), usuario.delete());

app.post('/preregister/usuario', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), usuario.addPre());
app.post('/preregister/usuariobulk', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), usuario.addPreBulk());
app.get('/roles', usuario.listRoles());


// --------------- Estatus ----------------
var estatus = require('./routes/estatus');
app.get('/estatus', usuario.authenticate, usuario.needsRole(['ADMIN']), estatus.list());
app.get('/estatus/:id', usuario.authenticate, usuario.needsRole(['ADMIN']), estatus.listOne());
app.post('/estatus', usuario.authenticate, usuario.needsRole(['ADMIN']), estatus.add());
app.put('/estatus/:id', usuario.authenticate, usuario.needsRole(['ADMIN']), estatus.update());
app.delete('/estatus/:id', usuario.authenticate, usuario.needsRole(['ADMIN']), estatus.delete());

// --------------- Empresa ----------------
var empresa = require('./routes/empresa');
app.get('/empresa', usuario.authenticate, usuario.needsRole(['ADMIN']), empresa.list());
app.get('/empresa/existe', usuario.authenticate, usuario.needsRole(['ADMIN']), empresa.alreadyExist());
app.get('/empresa/:id', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), empresa.listOne());
app.post('/empresa', usuario.authenticate, usuario.needsRole(['ADMIN']), empresa.add(false));
app.post('/preregister/empresa', empresa.add(true));
app.put('/empresa/:id', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), empresa.update());
app.put('/empresa/authorize/:id', usuario.authenticate, usuario.needsRole(['ADMIN']), empresa.authorize());
app.put('/empresa/reject/:id', usuario.authenticate, usuario.needsRole(['ADMIN']), empresa.reject());
app.delete('/empresa/:id', usuario.authenticate, usuario.needsRole(['ADMIN']), empresa.delete());

// --------------- Ruta ----------------
var ruta = require('./routes/ruta');
app.get('/ruta', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), ruta.list());
app.get('/ruta/:id', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), ruta.listOne());
app.post('/ruta', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), ruta.add());
app.put('/ruta/:id', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), ruta.update());
app.put('/ruta/authorize/:id', usuario.authenticate, usuario.needsRole(['ADMIN']), ruta.authorize());
app.put('/ruta/reject/:id', usuario.authenticate, usuario.needsRole(['ADMIN']), ruta.reject());
app.delete('/ruta/:id', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), ruta.delete());

// --------------- RutaPunto ---------------- // TODO: Incluir seguridad por rutas compartidas
var rutapunto = require('./routes/rutapunto');
app.get('/rutapunto', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), rutapunto.list());
app.get('/rutapunto/:id', usuario.authenticate, rutapunto.listOne());
app.post('/rutapunto', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), rutapunto.add());
app.put('/rutapunto/:id', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), rutapunto.update());
app.delete('/rutapunto/:id', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), rutapunto.delete());

// --------------- RutaCorrida ----------------  TODO: Incluir seguridad por rutas compartidas
var rutacorrida = require('./routes/rutacorrida');
app.get('/rutacorrida', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), rutacorrida.list());
app.get('/rutacorrida/:id', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), rutacorrida.listOne());
app.post('/rutacorrida', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), rutacorrida.add());
app.put('/rutacorrida/:id', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), rutacorrida.update());
app.delete('/rutacorrida/:id', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), rutacorrida.delete());

// --------------- Ruta Suggestions----------------
var rutasuggest = require('./routes/procesocompraruta');
app.get('/compra/ruta', usuario.authenticate, rutasuggest.listRoutes());
app.get('/compra/rutasugeridas', usuario.authenticate, rutasuggest.listSuggestions());
app.get('/compra/ruta/:rutaid/oferta', usuario.authenticate, rutasuggest.listOferta());
app.post('/compra/reservar/:ofertaid', usuario.authenticate, usuario.needsRole(['USUARIO', 'EMPRESA']), rutasuggest.reservationCreate()); // Crea la reservación
app.post('/compra/reservarbulk/', usuario.authenticate, usuario.needsRole(['USUARIO', 'EMPRESA']), rutasuggest.reservationCreateBulk()); // Crea varias reservaciones

app.post('/compra/confirmar/:reservacionid', usuario.authenticate, usuario.needsRole(['USUARIO', 'EMPRESA']), rutasuggest.reservationConfirm()); 
app.put('/compra/confirmar/:reservacionid', usuario.authenticate, usuario.needsRole(['USUARIO', 'EMPRESA']), rutasuggest.reservationConfirm()); 
app.post('/compra/cancelar/:reservacionid', usuario.authenticate, usuario.needsRole(['USUARIO', 'EMPRESA']), rutasuggest.reservationCancel()); // cancela una reservación
app.put('/compra/cancelar/:reservacionid', usuario.authenticate, usuario.needsRole(['USUARIO', 'EMPRESA']), rutasuggest.reservationCancel()); // cancela una reservación
app.get('/compra/misreservaciones', usuario.authenticate, usuario.needsRole(['USUARIO', 'EMPRESA']), rutasuggest.reservationList());

app.post('/compra/esperar/:ofertaid', usuario.authenticate, usuario.needsRole(['USUARIO', 'EMPRESA']), rutasuggest.waitinglistCreate()); 
app.post('/compra/cancelarespera/:reservacionid', usuario.authenticate, usuario.needsRole(['USUARIO', 'EMPRESA']), rutasuggest.waitinglistCancel()); 
app.get('/compra/misesperas', usuario.authenticate, usuario.needsRole(['USUARIO', 'EMPRESA']), rutasuggest.waitinglistList());


// --------------- Rutas Favoritas----------------
var rutafavorita = require('./routes/rutafavorita');
//app.get('/rutafavorita', rutasuggest.favouriteList());
app.put('/rutafavorita/add', usuario.authenticate, usuario.needsRole(['USUARIO', 'EMPRESA']), rutafavorita.favouriteAdd());
app.put('/rutafavorita/remove', usuario.authenticate, usuario.needsRole(['USUARIO', 'EMPRESA']), rutafavorita.favouriteDel());
app.get('/rutafavorita', usuario.authenticate, usuario.needsRole(['USUARIO', 'EMPRESA']), rutafavorita.favouriteList());


// --------------- Oferta ----------------
var oferta = require('./routes/oferta');
app.get('/oferta', usuario.authenticate, oferta.list());
app.get('/oferta/:id', usuario.authenticate, oferta.listOne());
app.post('/oferta', usuario.authenticate, usuario.needsRole(['ADMIN']), oferta.add());
app.post('/oferta/generar/:rutaid', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), oferta.generaOfertaXRuta());
app.post('/oferta/generar', usuario.authenticate, usuario.needsRole(['ADMIN']), oferta.generaOfertaGlobalServ()); // genera de todas las rutas (autorizadas) de todo el sistema

app.put('/oferta/:id', usuario.authenticate, usuario.needsRole(['ADMIN']), oferta.update());
app.delete('/oferta/:id', usuario.authenticate, usuario.needsRole(['ADMIN']), oferta.delete());
app.put('/oferta/:id/plus', usuario.authenticate, usuario.needsRole(['ADMIN']), oferta.incrementOferta());
app.put('/oferta/:id/minus', usuario.authenticate, usuario.needsRole(['ADMIN']), oferta.decrementOferta());


// --------------- Ruta Compartida ----------------
var rutacompartida = require('./routes/rutacompartida');
app.get('/rutacompartida', usuario.authenticate, usuario.needsRole(['ADMIN']), rutacompartida.list());
app.get('/rutacompartida/:id', usuario.authenticate, usuario.needsRole(['ADMIN']), rutacompartida.listOne());
app.post('/rutacompartida', usuario.authenticate, usuario.needsRole(['ADMIN']), rutacompartida.add());
app.post('/rutacompartida/:rutaid/empresa/:empresaid', usuario.authenticate, usuario.needsRole(['ADMIN']), rutacompartida.share());
app.put('/rutacompartida/:id', usuario.authenticate, usuario.needsRole(['ADMIN']), rutacompartida.update());
app.put('/rutacompartida/authorize/:id', usuario.authenticate, usuario.needsRole(['ADMIN']), rutacompartida.authorize());
app.put('/rutacompartida/reject/:id', usuario.authenticate, usuario.needsRole(['ADMIN']), rutacompartida.reject());
app.delete('/rutacompartida/:id', usuario.authenticate, usuario.needsRole(['ADMIN']), rutacompartida.delete());

// ------------------INI Schedulers-------------------------

var routes = require('./routes/scheduled.js');

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