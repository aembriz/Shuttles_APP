var db = require('../models')
var constant = require('../config/constant.js');
var util = require('./utilities');
var constErrorTypes = {'ErrSugX000': '', 'ErrSugX000':''};

// ----------------------Sugerencias---------------------------
/*
* Lista las sugerencias (si es usuario solo del usuario, si es empresa solo de la empresa)
*/
exports.list = function() { 
  return function(req, res){
    var paramWhere = {};    

    if(req.query.usuario){
      paramWhere.UsuarioId = req.query.usuario;      
    }    
    if(req.user.role == 'USUARIO') paramWhere.UsuarioId = req.user.id;

    if(req.query.ruta){
      paramWhere.RutaId = req.query.ruta;      
    }

    if(req.query.corrida){
      paramWhere.RutaCorridaId = req.query.corrida;
    }    

    if(req.query.empresa){
      paramWhere.EmpresaId = req.query.empresa;
    }
    if(req.user.role != 'ADMIN') paramWhere.EmpresaId = req.user.EmpresaId;

    db.Sugerencia.findAll({ where: paramWhere, include: [
        {model: db.Usuario }
      ]
    }).success(function(sugerencia) {
      res.send(util.formatResponse('', null, true, 'ErrSugX001', constErrorTypes, sugerencia));
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al acceder a las sugerencias/comentarios', err, false, 'ErrSugX002', constErrorTypes, null));
    });
  }
};

/*
* Lista la sugerencia con el id indicado (si es usuario solo del usuario, si es empresa solo de la empresa)
*/
exports.listOne = function() { 
  return function(req, res){
    var paramWhere = {};    

    if(req.query.usuario){
      paramWhere.UsuarioId = req.query.usuario;      
    }    
    if(req.user.role == 'USUARIO') paramWhere.UsuarioId = req.user.id;

    paramWhere.id = req.params.id;

    db.Sugerencia.find({ where: paramWhere, include: [
        {model: db.Usuario },
        {model: db.Empresa },
        {model: db.Ruta },
        {model: db.RutaCorrida }
      ]
    }).success(function(sugerencia) {
      res.send(util.formatResponse('', null, true, 'ErrSugX005', constErrorTypes, sugerencia));
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al acceder a las sugerencias/comentarios', err, false, 'ErrSugX006', constErrorTypes, null));
    });
  }
};

/*
 * Crear sugerencia
 */
exports.add = function() {
  return function(req, res) {
    var idUsr = req.user.id; 
    var obj = {UsuarioId: idUsr, comentario: req.body.comentario, EmpresaId: req.user.EmpresaId};
    var sugerencia = db.Sugerencia.build(obj);
    sugerencia.save().complete(function (err, sugerencia) {
      if(err==null){        
        res.send(util.formatResponse('Se creó correctamente la sugerencia/comentario', null, true, 'ErrSugX003', constErrorTypes, null));
      }
      else{
        res.send(util.formatResponse('Ocurrieron errores al crear la sugerencia/comentario', err, false, 'ErrSugX004', constErrorTypes, null));
      }
    });

  }
};
