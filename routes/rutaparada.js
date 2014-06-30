var db = require('../models')
var util = require('./utilities');
var constErrorTypes = {'ErrRpaX000': '', 'ErrRpaX000':''};


exports.list = function() { 
  return function(req, res){
    var queryParams = {};
    if('corridaid' in req.query) {
      queryParams.where = {RutaCorridaId: req.query.corridaid};
    }
    db.RutaParada.findAll(queryParams).success(function(rutaparada) {
      if(rutaparada!=null){
        res.send(util.formatResponse('', null, true, 'ErrRpaX000', constErrorTypes, rutaparada));
      }
      else{
        res.send(util.formatResponse('Ocurrieron errores al acceder a las paradas', null, false, 'ErrRpaX000', constErrorTypes, null));   
      }
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al acceder a las paradas', err, false, 'ErrRpaX000', constErrorTypes, null));
    });    
  }
};

/*
 * GET ONE
 */
exports.listOne = function() {
  return function(req, res) {
    var idToFind = req.params.id;
    db.RutaParada.find(idToFind).success(function(rutaparada) {            
      if(rutaparada!=null){
        res.send(util.formatResponse('', null, true, 'ErrRpaX000', constErrorTypes, rutaparada));
      }
      else{
        res.send(util.formatResponse('Ocurrieron errores al acceder a la parada', null, false, 'ErrRpaX000', constErrorTypes, null));
      }
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al acceder a la parada', err, false, 'ErrRpaX000', constErrorTypes, null));
    });
  }
};


/*
 * POST create New
 */

exports.add = function() {  
  return function(req, res) {
    var rutaparada = db.RutaParada.build(req.body);
    rutaparada.save().complete(function (err, rutaparada) {
      if(err == null){
        res.send(util.formatResponse('Se creó correctamente la parada', null, true, 'ErrRpaX000', constErrorTypes, rutaparada));
      }
      else{
        res.send(util.formatResponse('Ocurrieron errores al crear la parada', err, false, 'ErrRpaX000', constErrorTypes, null));
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
      db.RutaParada.find(idToUpdate).success(function(rutaparada) {
        if(rutaparada!=null){        
          rutaparada.updateAttributes(req.body).success(function(rutaparada) {
            res.send(util.formatResponse('Se modificó correctamente la parada', null, true, 'ErrRpaX000', constErrorTypes, rutaparada));
          }).error(function(err){
              res.send(util.formatResponse('Ocurrieron errores al modificar la parada', err, false, 'ErrRpaX000', constErrorTypes, null));
          });
        }
        else{
          res.send(util.formatResponse('Ocurrieron errores al modificar la parada', null, false, 'ErrRpaX000', constErrorTypes, null));
        }
      }).error(function(err){
          res.send(util.formatResponse('Ocurrieron errores al modificar la parada', err, false, 'ErrRpaX000', constErrorTypes, null));
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
    db.RutaParada.find(idToDelete).success(function(rutaparada) {
      return rutaparada.destroy().success(function (err){
        if(err==null){
          res.send(util.formatResponse('Se eliminó correctamente la parada', null, true, 'ErrRpaX000', constErrorTypes, null));
        }
        else{
          res.send(util.formatResponse('Ocurrieron errores al eliminar la parada', err, false, 'ErrRpaX000', constErrorTypes, null));
        }
      });
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al eliminar la parada', err, false, 'ErrRpaX000', constErrorTypes, null));
    });
  }
};