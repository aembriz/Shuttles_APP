var db = require('../models');
var jwt = require('jwt-simple');
var mail = require('./mailing'); // used for sending mails
var app = null;
var passport = null;

var constEstatus = {'new': 1, 'authorized': 3, 'rejected': 4}

exports.set = function(appx, passportx){
	app = appx;
	passport = passportx;
};

// ********************** SECURITY ************************************

/*
* Login function, if successful generates the AuthToken (JWT)
*/
exports.login = function(req, res, next){
		passport.authenticate('local', function(err, user, info) {
			if (err) { return next(err) }
			if (!user) {
				return res.json(401, { error: 'User or password are incorrect' });
			}

			//user has authenticated correctly thus we create a JWT token			
			var expires = Date.now() + ( 1 * 3600 * 1000 );
			var pretoken = 	{iss: user.email, exp: expires};
			var token = jwt.encode(pretoken , app.get('jwtTokenSecret'));
			res.json({ token : token, role: user.role, empresa: user.EmpresaId, nombre: user.nombre, id: user.id });
		})(req, res, next);
	
};

/*
* Authenticate fucntion that relies on a JWT token generated on the Login. To be used on the request mapping 
* Example: app.get('/empresa', usuario.authenticate, usuario.needsRole('ROLE_ADMIN'), empresa.list());
*/
exports.authenticate = function(req, res, next){
		passport.authenticate('bearer', function(err, user, info) {
			var detail = '';
			if(info){
				if(info.length>0){
					info = info.replace(/["']/g, "");
					var chunks = info.split(',');
					for(var j=0; j<chunks.length; j++){
						var parts = chunks[j].split('=');
						if(parts.length==2 && parts[0].trim() == 'error_description'){
							detail = '[' +  parts[1] + ']';
						}
					}
				}
			}

			if (err) { return next(err) }
			if (!user) {
				return res.json(401, { error: 'The security token is invalid. ' + detail });
			}

			// pass user obj to request chain
			user = user.dataValues;
			user.role = 'ROLE_ADMIN'; //TODO: se debe cargar role dinámicamente
			req.user = user;
			next();
		})(req, res, next);
	
};


exports.needsRole = function(role) {
  return function(req, res, next) {
    if (req.user && req.user.role === role)
      next();
    else
      res.send(401, 'Unauthorized');
  };
};


// ******************************* REST Servs **********************

exports.list = function() { 
  return function(req, res){
    var sts = 0;
    var params = {};

    if('estatus' in req.query){
      sts = constEstatus[req.query.estatus];
      if(!params.where) params.where = {};
      params.where.EstatusId = sts;      
    }
    if('empresa' in req.query){
      if(!params.where) params.where = {};
      params.where.EmpresaId = req.query.empresa;
    }        

    params.include = [
        {model: db.Empresa, as: 'Empresa'},
        {model: db.Estatus, as: 'Estatus', attributes: ['id', 'stsNombre']}
      ];

    db.Usuario.findAll(params).success(function(usuario) {
      res.send(usuario);
    });
  }
};

/*
 * GET ONE 
 */
exports.listOne = function() {
  return function(req, res) {
    var idToFind = req.params.id;

    db.Usuario.find( 
      {
        where: { id: idToFind },
        include: [
          {model: db.Empresa, as: 'Empresa'},
          {model: db.Estatus, as: 'Estatus', attributes: ['id', 'stsNombre']}
        ]
      }      
    ).success(function(usuario) {      
      res.send(usuario);    

    });
  }
};


/*
 * POST create New
 */
exports.add = function() {
  return function(req, res) {
    req.body.EstatusId = 1; // inicia con estatus nueva y despues se autoriza
    var usuario = db.Usuario.build(req.body);
    usuario.save().complete(function (err, usuario) {
      
      	if(err == null) {res.send({ msg: '' })}
      	else{
      		var msg = {err: err};
      		if(err.code == 'ER_DUP_ENTRY'){
      			msg.msg = 'Ya existe un usuario registrado con el mismo correo, no se puede crear el registro.';
      		}
      		res.send( msg );
      	}      
    });
  }
};

/*
 * POST create Pre-Registro usuario
 */
exports.addPre = function() {
  return function(req, res) {
    req.body.EstatusId = 1; // inicia con estatus nueva y despues se autoriza
    req.body.role = 'USUARIO';
    var usuario = db.Usuario.build(req.body);
    usuario.save(['nombre', 'email', 'EmpresaId', 'role', 'EstatusId']).complete(function (err, usuario) {
      	if(err == null) {res.send({ msg: '' })}
      	else{
      		var msg = {err: err};
      		if(err.code == 'ER_DUP_ENTRY'){
      			msg.msg = 'Ya existe un usuario registrado con el mismo correo, no se puede crear el registro.';
      		}
      		res.send( msg );
      	}      
    });
  }
};

exports.addPreBulk = function() {
  return function(req, res) {  
  	var empresa = req.body.empresa;
  	var invs = req.body.invitaciones;
  	var bulkObj = [];

  	if(invs && empresa && invs.length > 0 && !isNaN(empresa) ) {
  		invsArr = invs.trim().split('|');
  		for(var i=0; i<invsArr.length; i++){
  			var inv = invsArr[i].split(',');
  			if(inv.length == 2){
  				var obj = {nombre: inv[0].trim() , email: inv[1].trim() , EmpresaId: empresa, EstatusId: 1, role: 'USUARIO' };  				
  				bulkObj.push(obj);
  			}
  		}
  		
  		// creating users  		
		db.Usuario.bulkCreate(bulkObj).success(function(created) {
			mail.notifyUserInvitations(bulkObj);
			res.send({ msg: created.length  + ' created'})
		});    
				
  	}
  	else{
  		res.send({ msg: 'The request is not properly formed.'});
  	}
  }
};


/*
 * UPDATE one
 */
exports.update = function() {
  return function(req, res) {
    if(!(req.body == null || req.body == undefined) ){
      var idToUpdate = req.params.id;
      db.Usuario.find(idToUpdate).success(function(usuario) {
        delete req.body.EstatusId // elimina el atributo estatus porque este solo se maneja internamente
        usuario.updateAttributes(req.body).success(function(usuario) {
          res.send(
            { usuario: usuario}
          );      
        });
      });
    }
  }
};

/*
 * DELETE one
 */
exports.delete = function() {
  return function(req, res) {
    var idToDelete = req.params.id;
    db.Usuario.find(idToDelete).success(function(usuario) {
      return usuario.destroy().success(function (err){
        res.send((!err) ? { msg: '' } : { msg:'error: ' + err });
      });
    });
  }
};

/*
 * LIST the roles allowed for the user
 */
exports.listRoles = function() { 
  return function(req, res){

  	var roles = ['ADMIN', 'EMPRESA', 'USUARIO'];
	res.send(roles);

  }
};

// *****************************************************

/*
 * Autorizar solicitud
 */
exports.authorize = function() {
  return function(req, res) {
    var idToUpdate = req.params.id;
    db.Usuario.find(idToUpdate).success(function(usuario) {      
    usuario.updateAttributes({ EstatusId: constEstatus.authorized }).success(function(usuario) {
      res.send(
        { usuario: usuario}
      );      
    });
    });
  }
};

/*
 * Rechazar solicitud 
 */
exports.reject = function() {
  return function(req, res) {
    var idToUpdate = req.params.id;
    db.Usuario.find(idToUpdate).success(function(usuario) {      
    usuario.updateAttributes({ EstatusId: constEstatus.rejected }).success(function(usuario) {
      res.send(
        { usuario: usuario}
      );      
    });
    });
  }
};