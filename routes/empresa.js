var db = require('../models')

exports.list = function() { 
	return function(req, res){
	  db.Empresa.findAll().success(function(empresas) {
	  	res.send(empresas);
	  });
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