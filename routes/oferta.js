var db = require('../models')

exports.list = function() { 
  return function(req, res){
    db.Oferta.findAll().success(function(oferta) {
      res.send(oferta);
    });
  }
};

/*
 * GET ONE 
 */
exports.listOne = function() {
  return function(req, res) {
    var idToFind = req.params.id;
    db.Oferta.find( idToFind ).success(function(oferta) {      
      res.send(oferta);    
    });
  }
};


/*
 * POST create New
 */
exports.add = function() {
  return function(req, res) {
    var oferta = db.Oferta.build(req.body);
    oferta.save().complete(function (err, oferta) {
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
    db.Oferta.find(idToUpdate).success(function(oferta) {      
    oferta.updateAttributes(req.body).success(function(oferta) {
      res.send(
        { oferta: oferta}
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
    db.Oferta.find(idToDelete).success(function(oferta) {
      return oferta.destroy().success(function (err){
        res.send((!err) ? { msg: '' } : { msg:'error: ' + err });
      });
    });
  }
};


// ************************************************
/*
 * Incrementa la oferta en 1
 */
exports.incrementOferta = function() {
  return function(req, res) {
    var idToUpdate = req.params.id;
    var places = 1;
    if(req.body.lugares){
      places = req.body.lugares;
    }
    db.Oferta.find(idToUpdate).success(function(oferta) {
    oferta.increment('oferta', places).success(function(oferta) {
      res.send(
        { oferta: oferta}
      );      
    });
    });
  }
};

/*
 * Decrementa la oferta en 1
 */
exports.decrementOferta = function() {
  return function(req, res) {
    var idToUpdate = req.params.id;
    var places = 1;
    if(req.body.lugares){
      places = req.body.lugares;
    }    
    db.Oferta.find(idToUpdate).success(function(oferta) {
    oferta.decrement('oferta', places).success(function(oferta) {
      res.send(
        { oferta: oferta}
      );      
    });
    });
  }
};