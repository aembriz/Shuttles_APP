var db = require('../models')

exports.list = function() { 
	return function(req, res){
    var sts = 1;
    if(req.query.estatus == 'new') sts = 1;  
    else if(req.query.estatus == 'authorized') sts = 3;
    else sts = 0;

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
    empresa.save().complete(function (err, empresa) {
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
 * Autorizar empresa
 */
exports.authorize = function() {
  return function(req, res) {
    var idToUpdate = req.params.id;
    db.Empresa.find(idToUpdate).success(function(empresa) {      
    empresa.updateAttributes({ EstatusId: 3 }).success(function(empresa) {
      res.send(
        { empresa: empresa}
      );      
    });
    });
  }
};