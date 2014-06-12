var db = require('../models');
var constant = require('../config/constant.js');
var util = require('./utilities');
var constErrorTypes = {'ErrRutX000': '', 'ErrRutX000':''};

exports.list = function() { 
  return function(req, res){
    var sts = 0;
    var params = {};

    if('estatus' in req.query){
      sts = constant.estatus.Ruta[req.query.estatus];
      if(!params.where) params.where = {};
      params.where.EstatusId = sts;      
    }
    if('empresa' in req.query){
      if(!params.where) params.where = {};
      params.where.CompanyownerID = req.query.empresa;
    }

    if(req.user.role != 'ADMIN') { if(!params.where) params.where = {}; params.where.CompanyownerID = req.user.EmpresaId; } // SEC: solo puede ver rutas de su empresa TODO: incluir rutas compartidas

    params.include = [
        {model: db.Empresa, as: 'companyowner'},
        {model: db.Estatus, as: 'Estatus', attributes: ['id', 'stsNombre']}
      ];

    db.Ruta.findAll(params).success(function(rutas) {
      //res.send(rutas);
      res.send(util.formatResponse('', null, true, 'ErrRutX001', constErrorTypes, rutas));
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al acceder a las rutas', err, false, 'ErrRutX002', constErrorTypes, null));
    });
  }
};

/*
 * GET ONE 
 */
exports.listOne = function() {
  return function(req, res) {
    var idToFind = req.params.id;
    var paramWhere  = {id: idToFind}

    if(req.user.role != 'ADMIN') { paramWhere.CompanyownerID = req.user.EmpresaId; } // SEC: No puede ver detalle de rutas de otras empresas TODO: que se puedan ver las compartidas

    db.Ruta.find( 
      {
        where: paramWhere,
        include: [
          {model: db.Empresa, as: 'companyowner'},
          {model: db.RutaPunto, as: 'RutaPuntos'},
          {model: db.Estatus, as: 'Estatus', attributes: ['id', 'stsNombre']},
          {model: db.RutaCorrida, as: 'Corridas'}
        ]
      }      
    ).success(function(ruta) {      
      //res.send(ruta);
      res.send(util.formatResponse('', null, true, 'ErrRutX003', constErrorTypes, ruta));
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al acceder a la ruta', err, false, 'ErrRutX004', constErrorTypes, null));
    });
  }
};


/*
 * POST create New
 */
exports.add = function() {
  return function(req, res) {
    if(req.user.role != 'ADMIN') { req.body.CompanyownerID = req.user.EmpresaId; } // SEC: solo puede crear rutas en su empresa

    req.body.EstatusId = 1; // inicia con estatus nueva y despues se autoriza
    var ruta = db.Ruta.build(req.body);
    ruta.save().complete(function (err, ruta) {
      //res.send( (err === null) ? { msg: '' } : { msg: err }  );          
      if(err==null){
        res.send(util.formatResponse('Se creó correctamente la ruta', null, true, 'ErrRutX005', constErrorTypes, ruta));
      }
      else{
        res.send(util.formatResponse('Ocurrieron errores al crear la ruta', err, false, 'ErrRutX006', constErrorTypes, null));
      }
    });
  }
};

/*
 * UPDATE one
 */
exports.update = function() {
  return function(req, res) {
    if(!(req.body == null || req.body == undefined) ){
      var idToUpdate = req.params.id;
      db.Ruta.find(idToUpdate).success(function(ruta) {
        if(ruta != null){
          if(req.user.role != 'ADMIN' && ruta.CompanyownerID != req.user.EmpresaId) { 
            //res.send({msg: 'No tiene permisos para modificar esta ruta, pertenece a otra empresa.', success: false})
            res.send(util.formatResponse('No tiene permisos para modificar la ruta', null, false, 'ErrRutX007', constErrorTypes, ruta));
            return;            
          }
          delete req.body.EstatusId // elimina el atributo estatus porque este solo se maneja internamente
          ruta.updateAttributes(req.body).success(function(ruta) {
            //res.send( { ruta: ruta} );      
            res.send(util.formatResponse('Se modificó correctamente la ruta', null, true, 'ErrRutX008', constErrorTypes, ruta));
          }).error(function(err){
            res.send(util.formatResponse('Ocurrieron errores al modifcar la ruta', err, false, 'ErrRutX009', constErrorTypes, null));
          });
        }
      }).error(function(err){
        res.send(util.formatResponse('Ocurrieron errores al modificar la ruta', err, false, 'ErrRutX010', constErrorTypes, null));
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
    db.Ruta.find(idToDelete).success(function(ruta) {
        if(ruta != null){
          if(req.user.role != 'ADMIN' && ruta.CompanyownerID != req.user.EmpresaId) { 
            //res.send({msg: 'No tiene permisos para borrar esta ruta, pertenece a otra empresa.', success: false})
            res.send(util.formatResponse('No tiene permisos sobre la ruta', null, false, 'ErrRutX011', constErrorTypes, ruta));
            return;            
          }        
          return ruta.destroy().success(function (err){
            //res.send((!err) ? { msg: '' } : { msg:'error: ' + err });
            if(err==null){
              res.send(util.formatResponse('Se eliminó correctamente la ruta', null, true, 'ErrRutX012', constErrorTypes, null));
            }
            else{
              res.send(util.formatResponse('Ocurrieron errores al eliminar la ruta', err, false, 'ErrRutX013', constErrorTypes, null));
            }
          });
        }
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al eliminar la ruta', err, false, 'ErrRutX014', constErrorTypes, null));
    });
  }
};


// *****************************************************

/*
 * Autorizar solicitud de ruta
 */
exports.authorize = function() {
  return function(req, res) {
    var idToUpdate = req.params.id;
    db.Ruta.find(idToUpdate).success(function(ruta) {      
      ruta.updateAttributes({ EstatusId: constant.estatus.Ruta.authorized }).success(function(ruta) {
        //res.send( { ruta: ruta} );
        res.send(util.formatResponse('Se autorizó correctamente la ruta', null, true, 'ErrRutX015', constErrorTypes, ruta));
      }).error(function(err){
        res.send(util.formatResponse('Ocurrieron errores al autorizar la ruta', err, false, 'ErrRutX016', constErrorTypes, null));
      });
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al autorizar la ruta', err, false, 'ErrRutX017', constErrorTypes, null));
    });
  }
};

/*
 * Rechazar solicitud de ruta
 */
exports.reject = function() {
  return function(req, res) {
    var idToUpdate = req.params.id;
    db.Ruta.find(idToUpdate).success(function(ruta) {      
      ruta.updateAttributes({ EstatusId: constant.estatus.Ruta.rejected }).success(function(ruta) {
        //res.send( { ruta: ruta} );
        res.send(util.formatResponse('Se rechazó correctamente la ruta', null, true, 'ErrRutX018', constErrorTypes, ruta));
      }).error(function(err){
        res.send(util.formatResponse('Ocurrieron errores al rechazar la ruta', err, false, 'ErrRutX019', constErrorTypes, null));
      });
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al rechazar la ruta', err, false, 'ErrRutX020', constErrorTypes, null));
    });
  }
};