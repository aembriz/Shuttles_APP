var db = require('../models')

var constEstatus = {'new': 1, 'authorized': 3, 'rejected': 4}

exports.list = function() { 
  return function(req, res){
    var sts = 0;
    if('estatus' in req.query){
      sts = constEstatus[req.query.estatus];
    }

    var params = {};

    params.include = [
        {model: db.Empresa, as: 'companyowner'},
        {model: db.Estatus, as: 'Estatus', attributes: ['id', 'stsNombre']}
      ];

    if(sts > 0) {
      params.where = {EstatusId: sts};
    }

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
    /*
    db.Ruta.find(idToFind).success(function(ruta) {      
ruta.getCompanyowner().success(function(empresa) {  
  res.send({ruta: ruta, owner: empresa});
})    
    */    
    db.Ruta.find( 
      {
        where: { id: idToFind },
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
    var idToUpdate = req.params.id;
    db.Ruta.find(idToUpdate).success(function(ruta) {
      delete req.body.EstatusId // elimina el atributo estatus porque este solo se maneja internamente
      ruta.updateAttributes(req.body).success(function(ruta) {
        res.send(
          { ruta: ruta}
        );      
      });
    });
  }
};

/*
 * DELETE one
 */
exports.delete = function() {
  return function(req, res) {
    var idToDelete = req.params.id;
    db.Ruta.find(idToDelete).success(function(ruta) {
      return ruta.destroy().success(function (err){
        res.send((!err) ? { msg: '' } : { msg:'error: ' + err });
      });
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