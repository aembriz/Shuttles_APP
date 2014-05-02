var db = require('../models')

exports.list = function() { 
  return function(req, res){
    var queryParams = {};
    if('rutaid' in req.query) {
      queryParams.where = {RutaId: req.query.rutaid};
    }
    db.RutaCorrida.findAll(queryParams).success(function(rutacorrida) {
      res.send(rutacorrida);
    });    
  }
};

/*
 * GET ONE
 */
exports.listOne = function() {
  return function(req, res) {
    var idToFind = req.params.id;
    db.RutaCorrida.find(idToFind).success(function(rutacorrida) {      
      res.send(rutacorrida);    
    });
  }
};


/*
 * POST create New
 */

exports.add = function() {  
  return function(req, res) {
    var rutacorrida = db.RutaCorrida.build(req.body);
    rutacorrida.save().complete(function (err, rutacorrida) {
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
    db.RutaCorrida.find(idToUpdate).success(function(rutacorrida) {
      rutacorrida.updateAttributes(req.body).success(function(rutacorrida) {
        res.send(
          { rutacorrida: rutacorrida}
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
    db.RutaCorrida.find(idToDelete).success(function(rutacorrida) {
      return rutacorrida.destroy().success(function (err){
        res.send((!err) ? { msg: '' } : { msg:'error: ' + err });
      });
    });
  }
};