var db = require('../models')

exports.list = function() { 
  return function(req, res){
    if(req.query.type == 'bulk'){
      db.RutaPunto.find({where: {}}).success(function(rutapuntos) {
        res.send(rutapuntos);
      });
    }
    else{
      db.RutaPunto.findAll().success(function(rutapuntos) {
        res.send(rutapuntos);
      });
    }
  }
};

/*
 * GET ONE  by ID ruta
 */
exports.listOne = function() {
  return function(req, res) {
    var idToFind = req.params.id;
    db.RutaPunto.findAll( {where: {RutaId: idToFind}, order: 'indice' } ).success(function(rutapunto) {      
      res.send(rutapunto);    
    });
  }
};


/*
 * POST create New
 */

exports.add = function() {  
  return function(req, res) {
      if(req.query.type == 'bulk'){
          addBulk(req, res);
      }
      else{
          addOne(req, res);
      }
  }
};

addOne = function(req, res) {    
    var rutapunto = db.RutaPunto.build(req.body);
    rutapunto.save().complete(function (err, rutapunto) {
      res.send(
        (err === null) ? { msg: '' } : { msg: err }
      );          
    });
};

addBulk = function(req, res) {
    db.RutaPunto.bulkCreate(req.body.puntos).success(function(created) {
      res.send({ msg: created.length  + ' created'})
    });    
};

/*
 * UPDATE one
 */
exports.update = function() {
  return function(req, res) {
    if(!(req.body == null || req.body == undefined) ){
      var idToUpdate = req.params.id;
      db.RutaPunto.find(idToUpdate).success(function(rutapunto) {
        rutapunto.updateAttributes(req.body).success(function(rutapunto) {
          res.send(
            { rutapunto: rutapunto}
          );      
        });
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
    db.RutaPunto.find(idToDelete).success(function(rutapunto) {
      return rutapunto.destroy().success(function (err){
        res.send((!err) ? { msg: '' } : { msg:'error: ' + err });
      });
    });
  }
};