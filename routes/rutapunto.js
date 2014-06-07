var db = require('../models');
var util = require('./utilities');
var constErrorTypes = {'ErrRupX000': '', 'ErrRupX000':''};

exports.list = function() { 
  return function(req, res){
    if(req.query.type == 'bulk'){
      db.RutaPunto.find({where: {}}).success(function(rutapuntos) {
        //res.send(rutapuntos);
        res.send(util.formatResponse('', null, true, 'ErrRupX001', constErrorTypes, rutapuntos));
      }).error(function(err){
        res.send(util.formatResponse('Ocurrieron errores al acceder a los puntos geográficos', err, false, 'ErrRupX002', constErrorTypes, null));
      });
    }
    else{
      db.RutaPunto.findAll().success(function(rutapuntos) {
        //res.send(rutapuntos);
        res.send(util.formatResponse('', null, true, 'ErrRupX003', constErrorTypes, rutapuntos));
      }).error(function(err){
        res.send(util.formatResponse('Ocurrieron errores al acceder a los puntos geográficos', err, false, 'ErrRupX004', constErrorTypes, null));
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
      //res.send(rutapunto);    
      res.send(util.formatResponse('', null, true, 'ErrRupX005', constErrorTypes, rutapunto));
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al acceder a los puntos geográficos', err, false, 'ErrRupX006', constErrorTypes, null));
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
      //res.send( (err === null) ? { msg: '' } : { msg: err } );          
      if(err==null){
        res.send(util.formatResponse('Se crearon correctamente los puntos geográficos', null, true, 'ErrRupX007', constErrorTypes, rutapunto));
      }
      else{
        res.send(util.formatResponse('Ocurrieron errores al crear los puntos geográficos', err, false, 'ErrRupX008', constErrorTypes, null));
      }
    });
};

addBulk = function(req, res) {
    db.RutaPunto.bulkCreate(req.body.puntos).success(function(created) {
      //res.send({ msg: created.length  + ' created'})
      res.send(util.formatResponse('Se crearon correctamente ' + created.length + ' puntos geográficos', null, true, 'ErrRupX009', constErrorTypes, created));
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al crear los puntos geográficos', err, false, 'ErrRupX010', constErrorTypes, null));
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
        if(rutapunto != null){
          rutapunto.updateAttributes(req.body).success(function(rutapunto) {
            //res.send( { rutapunto: rutapunto} );      
            res.send(util.formatResponse('Se actualizaron correctamente los puntos geográficos', null, true, 'ErrRupX011', constErrorTypes, rutapunto));
          }).error(function(err){
            res.send(util.formatResponse('Ocurrieron errores al actualizar los puntos geográficos', err, false, 'ErrRupX012', constErrorTypes, null));
          });
        }
        else{
          res.send(util.formatResponse('Ocurrieron errores al actualizar los puntos geográficos', null, false, 'ErrRupX013', constErrorTypes, null));
        }
      }).error(function(err){
        res.send(util.formatResponse('Ocurrieron errores al actualizar los puntos geográficos', err, false, 'ErrRupX014', constErrorTypes, null));
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
      if(rutapunto != null){
        return rutapunto.destroy().success(function (err){
          //res.send((!err) ? { msg: '' } : { msg:'error: ' + err });
          if(err == null){
            res.send(util.formatResponse('Se eliminaron correctamente los puntos geográficos', null, true, 'ErrRupX015', constErrorTypes, null));
          }
          else{
            res.send(util.formatResponse('Ocurrieron errores al eliminar los puntos geográficos', err, false, 'ErrRupX016', constErrorTypes, null));
          }
        }).error(function(err){
          res.send(util.formatResponse('Ocurrieron errores al eliminar los puntos geográficos', err, false, 'ErrRupX017', constErrorTypes, null));
        });        
      }
    });
  }
};