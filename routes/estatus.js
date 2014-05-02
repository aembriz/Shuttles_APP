var db = require('../models')

exports.list = function() { 
  return function(req, res){
    if('for' in req.query){
      db.Estatus.findAll({ where: {stsPara: req.query.for} }).success(function(estatus) {
        res.send(estatus);
      });
    }
    else{
      db.Estatus.findAll().success(function(estatus) {
        res.send(estatus);
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
    db.Estatus.find( idToFind ).success(function(estatus) {      
      res.send(estatus);    
    });
  }
};


/*
 * POST create New
 */
exports.add = function() {
  return function(req, res) {
    var estatus = db.Estatus.build(req.body);
    estatus.save().complete(function (err, estatus) {
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
    db.Estatus.find(idToUpdate).success(function(estatus) {      
    estatus.updateAttributes(req.body).success(function(estatus) {
      res.send(
        { estatus: estatus}
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
    db.Estatus.find(idToDelete).success(function(estatus) {
      return estatus.destroy().success(function (err){
        res.send((!err) ? { msg: '' } : { msg:'error: ' + err });
      });
    });
  }
};