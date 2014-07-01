var db = require('../models')
var constant = require('../config/constant.js');
var util = require('./utilities');
var constErrorTypes = {'ErrConfX000': '', 'ErrConfX000':''};


exports.list = function() { 
  return function(req, res){
    db.Configuracion.findAll().success(function(config) {
      res.send(util.formatResponse('', null, true, 'ErrConfX001', constErrorTypes, config));
    });
  }
};

/*
 * GET ONE 
 */
exports.listOne = function() {
  return function(req, res) {
    var idToFind = req.params.id;
    db.Configuracion.find( idToFind ).success(function(config) {      
      res.send(util.formatResponse('', null, true, 'ErrConfX002', constErrorTypes, config));
    });
  }
};


/*
 * POST create New
 */
exports.add = function() {
  return function(req, res) {
    db.Configuracion.findAll().complete(function(err, confs){
      if(err!=null){
        res.send(util.formatResponse('Ocurrieron errores al acceder a la configuración', err, false, 'ErrConfX011', constErrorTypes));
      }
      else{
        if(confs!=null && confs.length > 0){
          var config = confs[0];
          updateRecord(config, req, res);
        }
        else{        
          var config = db.Configuracion.build(req.body);
          config.save().complete(function (err, config) {
            if(err==null){
              res.send(util.formatResponse('Se creó correctamente la configuración', null, true, 'ErrConfX003', constErrorTypes, config));
            }
            else{
              res.send(util.formatResponse('Ocurrieron errores al crear la configuración', err, false, 'ErrConfX004', constErrorTypes));
            }
          });
        }
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
    db.Configuracion.find(idToUpdate).success(function(config) {      
      if(config != null){
        updateRecord(config, req, res);
      }
      else{
        res.send(util.formatResponse('Ocurrieron errores al modificar la configuración', null, false, 'ErrConfX006', constErrorTypes));
      }
    });
  }
};

var updateRecord = function(config, req, res){
  config.updateAttributes(req.body).success(function(config) {
    res.send(util.formatResponse('Se modificó correctamente la configuración', null, true, 'ErrConfX012', constErrorTypes, config));
  }).error(function(err){
    res.send(util.formatResponse('No se pudo actualizar la configuración', err, false, 'ErrConfX013', constErrorTypes, null));
  });
}

/*
 * DELETE one
 */
exports.delete = function() {
  return function(req, res) {
    var idToDelete = req.params.id;
    db.Configuracion.find(idToDelete).success(function(config) {
      if(config!=null){      
        return config.destroy().success(function (err){
          if(err==null){
            res.send(util.formatResponse('Se eliminó correctamente la configuración', null, true, 'ErrConfX007', constErrorTypes, null));
          }
          else{
            res.send(util.formatResponse('Ocurrieron errores eliminar la configuración', err, false, 'ErrConfX008', constErrorTypes, null));
          }          
        });
      }
      else{
        res.send(util.formatResponse('Ocurrieron errores eliminar la configuración', null, false, 'ErrConfX009', constErrorTypes, null));
      }
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores eliminar la configuración', err, false, 'ErrConfX010', constErrorTypes, null));
    });
  }
};

// ***************************************

// regresa el objeto de configuración o en su defecto los valores por default
// manda llamar la función callback(err, conf) 
exports.getConf = function(callback){

  db.Configuracion.findAll().complete(function(err, confs){
    if(err!=null && confs==null && confs.length == 0){
      var conf = {
        reservMinParaCancelar: 60,
        esperaMinParaConfirmar: 30,
        ofertaMinCaducaReservados: 60,
        correoCuentaOrigen: "servicios.administrativos@nubeet.com",
        correoCuentaOrigenPwd: "teebun",
        correoCopiaComentarios: "william.lithgow@nubeet.com"
      }
      callback(err, conf);
    }
    else{
      var conf = confs[0];
      callback(null, conf);
    }    
  });
}