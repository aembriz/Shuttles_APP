var db = require('../models')

var constEstatus = {'new': 1, 'authorized': 3, 'rejected': 4}

exports.list = function() { 
	return function(req, res){
    var sts = 0;
    if('estatus' in req.query){
      sts = constEstatus[req.query.estatus];
    }

    if(sts > 0 ){
      db.Empresa.findAll({
        where: {EstatusId: sts},
        include: [{
          model: db.Estatus, as: 'Estatus', attributes: ['id', 'stsNombre']
        }]
      }).success(function(empresas) {
        res.send(empresas);
      });
    }
    else{
      db.Empresa.findAll({
        include: [{
          model: db.Estatus, as: 'Estatus', attributes: ['id', 'stsNombre']
        }]
      }).success(function(empresas) {
        res.send(empresas);
      });
    }
	}
};

/*
 * GET ONE 
 */
exports.listOne = function() {
  return function(req, res) {
    var idToFind = req.params.id;
    db.Empresa.find({ where: { id: idToFind } }).success(function(empresa) {      
        res.send(empresa);
    });
  }
};


/*
 * POST create New
 */
exports.add = function() {
  return function(req, res) {    
    req.body.EstatusId = 1; // inicia con estatus nueva y despues se autoriza
    var empresa = db.Empresa.build(req.body);

    db.Empresa.find({ where: db.Sequelize.or( {nombre: empresa.nombre}, {rfc: empresa.rfc} ) }).success(function(empresaTmp) {
      if(empresaTmp != null){
        res.send( {msg: 'Ya existe una empresa registrada con el mismo Nombre o RFC.'} )
      }
      else {
        empresa.save().complete(function (err, empresa) {
          res.send(
            (err === null) ? { msg: '' } : { msg: err }
          );          
        });        
      }
    });

  }
};


/*
 * UPDATE one
 */
exports.update = function() {
  return function(req, res) {
    var idToUpdate = req.params.id;
    db.Empresa.find(idToUpdate).success(function(empresa) { 
    delete req.body.EstatusId // elimina el atributo estatus porque este solo se maneja internamente
		empresa.updateAttributes(req.body).success(function(empresa) {
			res.send(
				{ empresa: empresa}
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
    db.Empresa.find(idToDelete).success(function(empresa) {
      return empresa.destroy().success(function (err){
        res.send((!err) ? { msg: '' } : { msg:'error: ' + err });
      });
    });
  }
};

// *****************************************************

/*
 * Autorizar solicitud de alta empresa
 */
exports.authorize = function() {
  return function(req, res) {
    var idToUpdate = req.params.id;
    db.Empresa.find(idToUpdate).success(function(empresa) {      
    empresa.updateAttributes({ EstatusId: constEstatus.authorized }).success(function(empresa) {
      res.send(
        { empresa: empresa}
      );      
    });
    });
  }
};

/*
 * Rechazar solicitud de alta empresa
 */
exports.reject = function() {
  return function(req, res) {
    var idToUpdate = req.params.id;
    db.Empresa.find(idToUpdate).success(function(empresa) {      
    empresa.updateAttributes({ EstatusId: constEstatus.rejected }).success(function(empresa) {
      res.send(
        { empresa: empresa}
      );      
    });
    });
  }
};


/*
 * Empresa ya existe
 */
exports.alreadyExist = function() {
  return function(req, res) {        
    db.Empresa.find({ where: db.Sequelize.or( {nombre: req.query.nombre}, {rfc: req.query.rfc} ) }).success(function(empresa) {
      if(empresa != null){
        res.send( {msg: 'Ya existe una empresa registrada con el mismo Nombre o RFC.', empresa: empresa} )
      }
      else {
        res.send( { msg: '' } );          
      }
    });
  }
};