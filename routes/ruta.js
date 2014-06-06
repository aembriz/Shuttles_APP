var db = require('../models')

var constEstatus = {'new': 1, 'authorized': 3, 'rejected': 4}

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
      params.where.CompanyownerID = req.query.empresa;
    }

    if(req.user.role != 'ADMIN') { if(!params.where) params.where = {}; params.where.CompanyownerID = req.user.EmpresaId; } // SEC: solo puede ver rutas de su empresa TODO: incluir rutas compartidas

    params.include = [
        {model: db.Empresa, as: 'companyowner'},
        {model: db.Estatus, as: 'Estatus', attributes: ['id', 'stsNombre']}
      ];

    db.Ruta.findAll(params).success(function(rutas) {
      res.send(rutas);
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
      res.send(ruta);    

        //res.send(ruta);
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
      res.send(
        (err === null) ? { msg: '' } : { msg: err }
      );          
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
            res.send({msg: 'No tiene permisos para modificar esta ruta, pertenece a otra empresa.', success: false})
            return;            
          }
          delete req.body.EstatusId // elimina el atributo estatus porque este solo se maneja internamente
          ruta.updateAttributes(req.body).success(function(ruta) {
            res.send(
              { ruta: ruta}
            );      
          });
        }
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
            res.send({msg: 'No tiene permisos para borrar esta ruta, pertenece a otra empresa.', success: false})
            return;            
          }        
          return ruta.destroy().success(function (err){
            res.send((!err) ? { msg: '' } : { msg:'error: ' + err });
          });
        }
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
    ruta.updateAttributes({ EstatusId: constEstatus.authorized }).success(function(ruta) {
      res.send(
        { ruta: ruta}
      );      
    });
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
    ruta.updateAttributes({ EstatusId: constEstatus.rejected }).success(function(ruta) {
      res.send(
        { ruta: ruta}
      );      
    });
    });
  }
};