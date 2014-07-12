var db = require('../models')
var mail = require('./mailing');
var constant = require('../config/constant.js');
var util = require('./utilities');
var constErrorTypes = {'ErrEmpX000': '', 'ErrEmpX000':''};

var fs = require('fs');


/*
* Lista pública de empresas (clientes) para uso en el sitio público
*/
exports.empresalist = function() { 
  return function(req, res){

    db.Empresa.findAll({
      where: {EstatusId: constant.estatus.Empresa.authorized},
      attributes: ['nombre', 'logo']
    }).success(function(empresas) {
      res.send(util.formatResponse('', null, true, 'ErrEmpX027', constErrorTypes, empresas));
    }).error(function(err){
      res.send(util.formatResponse('Hubieron errores al acceder a las empresas', err, false, 'ErrEmpX028', constErrorTypes, null));
    });

  }
};

/*
* Envía correo pidiendo información
*/
exports.contactoSoyEmpresa = function(){
	return function(req, res){
		mail.notifyContactRequestEmpresa(req.body);
		res.send(util.formatResponse('Se envió tu solicitud. En breve te contactaremos', null, true, 'ErrEmpX027', constErrorTypes, null));
	}
}

/*
* Envía correo pidiendo información
*/
exports.contactoSoyEmpleado = function(){
	return function(req, res){
		mail.notifyContactRequestEmpleado(req.body);
		res.send(util.formatResponse('Se envió tu solicitud. En breve te contactaremos', null, true, 'ErrEmpX027', constErrorTypes, null));
	}
}

/*
* Envía correo pidiendo información
*/
exports.contactoGeneral = function(){
	return function(req, res){
		mail.notifyContactRequestGeneral(req.body);
		res.send(util.formatResponse('Se envió tu solicitud. En breve te contactaremos', null, true, 'ErrEmpX027', constErrorTypes, null));
	}
}