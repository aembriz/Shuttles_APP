var db = require('../models')
var util = require('./utilities');
var constErrorTypes = {'ErrRucY000': '', 'ErrRucY000':''};


exports.list = function() { 
  return function(req, res){
    var queryParams = {};
    if('rutaid' in req.query) {
      queryParams.where = {RutaId: req.query.rutaid};
    }
    db.RutaCorrida.findAll(queryParams).success(function(rutacorrida) {
      //res.send(rutacorrida);
      if(rutacorrida!=null){
        res.send(util.formatResponse('', null, true, 'ErrRucY001', constErrorTypes, rutacorrida));
      }
      else{
        res.send(util.formatResponse('Ocurrieron errores al acceder a las corridas', null, false, 'ErrRucY015', constErrorTypes, null));   
      }
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al acceder a las corridas', err, false, 'ErrRucY002', constErrorTypes, null));
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
      //res.send(rutacorrida);    
      if(rutacorrida!=null){
        res.send(util.formatResponse('', null, true, 'ErrRucY003', constErrorTypes, rutacorrida));
      }
      else{
        res.send(util.formatResponse('Ocurrieron errores al acceder a la corrida', null, false, 'ErrRucY014', constErrorTypes, null));
      }
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al acceder a la corrida', err, false, 'ErrRucY004', constErrorTypes, null));
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
      //res.send((err === null) ? { msg: '', success: true} : { msg: err, success: false });          
      if(err == null){
        res.send(util.formatResponse('Se creó correctamente la corrida', null, true, 'ErrRucY005', constErrorTypes, rutacorrida));
      }
      else{
        res.send(util.formatResponse('Ocurrieron errores al crear la corrida', err, false, 'ErrRucY006', constErrorTypes, null));
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
      db.RutaCorrida.find(idToUpdate).success(function(rutacorrida) {
        if(rutacorrida!=null){        
          rutacorrida.updateAttributes(req.body).success(function(rutacorrida) {
            //res.send( { rutacorrida: rutacorrida} );
            res.send(util.formatResponse('Se modificó correctamente la corrida', null, true, 'ErrRucY007', constErrorTypes, rutacorrida));
          }).error(function(err){
              //res.send({ msg: 'Ocurrieron errores al modificar la corrida.', err: err});
              res.send(util.formatResponse('Ocurrieron errores al modificar la corrida', err, false, 'ErrRucY008', constErrorTypes, null));
          });
        }
        else{
          res.send(util.formatResponse('Ocurrieron errores al modificar la corrida', null, false, 'ErrRucY009', constErrorTypes, null));
        }
      }).error(function(err){
          //res.send({ msg: 'Ocurrieron errores al acceder a la corrida.', err: err})
          res.send(util.formatResponse('Ocurrieron errores al modificar la corrida', err, false, 'ErrRucY010', constErrorTypes, null));
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
    db.RutaCorrida.find(idToDelete).success(function(rutacorrida) {
      return rutacorrida.destroy().success(function (err){
        //res.send((!err) ? { msg: '' } : { msg:'error: ' + err });
        if(err==null){
          res.send(util.formatResponse('Se eliminó correctamente la corrida', null, true, 'ErrRucY011', constErrorTypes, null));
        }
        else{
          res.send(util.formatResponse('Ocurrieron errores al eliminar la corrida', err, false, 'ErrRucY012', constErrorTypes, null));
        }
      });
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al eliminar la corrida', err, false, 'ErrRucY013', constErrorTypes, null));
    });
  }
};