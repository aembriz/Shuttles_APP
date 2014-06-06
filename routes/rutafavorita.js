var db = require('../models')
var constant = require('../config/constant.js');


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
      res.send(rutas);
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
      res.send(
        (err === null) ? { msg: '' } : { msg: err }
      );          
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
      return favorita.destroy().success(function (err){
        res.send((!err) ? { msg: '' } : { msg:'error: ' + err });
      });
    });

  }
};
