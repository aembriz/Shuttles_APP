var db = require('../models')
var constant = require('../config/constant.js');
var util = require('./utilities');
var constErrorTypes = {'ErrRufX000': '', 'ErrRufX000':''};

// ----------------------RUTAS FAVORITAS---------------------------
/*
* Lista las ruta favoritas del usuario
*/
exports.favouriteList = function() { 
  return function(req, res){
    var sts = 0;
    var params = {};
    params.where = {};
    params.where.UsuarioId = req.user.id; 
    
    params.include = [
        {model: db.Ruta, where: {EstatusId: constant.estatus.Ruta.authorized } }
    ];

    db.Favorita.findAll(params).success(function(rutas) {
      //res.send(rutas);
      res.send(util.formatResponse('', null, true, 'ErrRufX001', constErrorTypes, rutas));
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al acceder a las rutas favoritas', err, false, 'ErrRufX002', constErrorTypes, null));
    });
  }
};

/*
 * Marcar ruta como favorita 
 */
exports.favouriteAdd = function() {
  return function(req, res) {
    var idUsr = req.user.id; // req.query.usrid; // TODO: obtenerlo del token de seguridad
    var idRuta = req.query.rutaid;
    var fav = {RutaId: idRuta, UsuarioId: idUsr};
    var favorita = db.Favorita.build(fav);
    favorita.save().complete(function (err, favorita) {
      //res.send( (err === null) ? { msg: '' } : { msg: err } );          
      if(err==null){
        res.send(util.formatResponse('Se agregó correctamente a favoritas', null, true, 'ErrRufX003', constErrorTypes, favorita));
      }
      else{
        res.send(util.formatResponse('Ocurrieron errores al agregar a favoritas', err, false, 'ErrRufX004', constErrorTypes, null));
      }
    });

  }
};

/*
 * DesMarcar ruta como favorita 
 */
exports.favouriteDel = function() {
  return function(req, res) {
    var idUsr = req.user.id; // req.query.usrid; // TODO: obtenerlo del token de seguridad
    var idRuta = req.query.rutaid;

    db.Favorita.find({ where: {RutaId: idRuta, UsuarioId: idUsr} }).success(function(favorita) {
      if(favorita!=null){
        return favorita.destroy().success(function (err){
          //res.send((!err) ? { msg: '' } : { msg:'error: ' + err });
          res.send(util.formatResponse('Se quitó correctamente de favoritas', null, true, 'ErrRufX005', constErrorTypes, null));
        }).error(function(err){
          res.send(util.formatResponse('Ocurrieron errores al quitar de favoritas', err, false, 'ErrRufX006', constErrorTypes, null));
        });        
      }
      else{
        res.send(util.formatResponse('Ocurrieron errores al quitar de favoritas', null, false, 'ErrRufX007', constErrorTypes, null));
      }
    });

  }
};
