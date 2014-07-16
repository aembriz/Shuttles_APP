var db = require('../models');
var util = require('./utilities');
var constErrorTypes = {'ErrRupX000': '', 'ErrRupX000':''};

var geo = require('../node_modules/geolib/geolib');

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
  console.log(req.body.puntos);
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

/**********************************************************/
/**********************************************************/

exports.puntosXOferta = function(idOferta, soloParadas, callback){

    db.Oferta.find({ where: {id: idOferta}, include: [{model: db.Ruta}, {model: db.RutaCorrida}]  }).complete(function (err, oferta){
      if(err!=null || oferta==null){
        callback(util.formatResponse('Ocurrieron errores al consultar los puntos geográficos [oferta]', err, false, 'ErrRupX017', constErrorTypes, null));
        return;
      }
      exports.puntosXCorrida(oferta.rutaCorrida, soloParadas, callback);
    });
};

exports.puntosXCorrida_bak = function(corrida, soloParadas, callback){

    var paramsWhere = {};
    paramsWhere.RutaId = corrida.RutaId;
    if(soloParadas) paramsWhere.tipo = {lt: 4};

    var corridaTrayecto = corrida.horaLlegada - corrida.horaSalida;

    db.RutaPunto.findAll( {where: paramsWhere, order: 'indice' } ).complete(function (err, puntos){
      if(err!=null || puntos==null){
        callback(util.formatResponse('Ocurrieron errores al consultar los puntos geográficos [puntos]', err, false, 'ErrRupX017', constErrorTypes, null));
        return;
      }        
      // genera hora estimada en parada
      var sumaTrayectos = 0;
      for (var i = 0; i < puntos.length; i++) {
        sumaTrayectos += puntos[i].minutosparallegar;
      };
      var horaEst = corrida.horaSalida;
      for (var i = 0; i < puntos.length; i++) {
        var trayectoAjustado = (puntos[i].minutosparallegar / sumaTrayectos) * corridaTrayecto;
        horaEst += trayectoAjustado;
        puntos[i].dataValues.minutosparallegar = Math.floor(trayectoAjustado);
        puntos[i].dataValues.horaEstimada = ("0" + Math.floor(horaEst/60)).slice(-2) + ":" + ("0" + Math.floor(horaEst % 60)).slice(-2);
      };      

      callback(util.formatResponse('', null, true, 'ErrRupX005', constErrorTypes, puntos));
    });

};

exports.puntosXCorrida = function(corrida, soloParadas, callback){

    var paramsWhere = {};
    paramsWhere.RutaId = corrida.RutaId;
    if(soloParadas) paramsWhere.tipo = {lt: 4};

    var corridaTrayecto = corrida.horaLlegada - corrida.horaSalida;

    db.RutaPunto.findAll( { where: paramsWhere, order: 'indice' } ).complete(function (err, puntos){
      if(err!=null || puntos==null){
        callback(util.formatResponse('Ocurrieron errores al consultar los puntos geográficos [puntos]', err, false, 'ErrRupX017', constErrorTypes, null));
        return;
      }

      db.RutaParada.findAll( { where: {RutaCorridaId: corrida.id}, order: 'RutaPuntoId' }).complete(function(err, paradas){
        if(err!=null || puntos==null){
          callback(util.formatResponse('Ocurrieron errores al consultar las paradas [puntos]', err, false, 'ErrRupX017', constErrorTypes, null));
          return;
        }        

        for (var i = 0; i < puntos.length; i++) {
          puntos[i].dataValues.horaEstimada = "";
          for (var j = 0; j < paradas.length; j++) {
            if(puntos[i].id == paradas[j].RutaPuntoId){
              puntos[i].dataValues.horaEstimada = paradas[j].horaestimada;
              break;
            }
          }        
        };      

        callback(util.formatResponse('', null, true, 'ErrRupX005', constErrorTypes, puntos));
      });

    });

};

exports.puntosXOfertaServ = function() {
  return function(req, res) {
    var soloParadas = false;
    if(req.query.paradas && req.query.paradas == 'true') soloParadas = true;

    exports.puntosXOferta(req.params.ofertaid, soloParadas, function(result){
      res.send(result);
    });    
  }
}

exports.puntosXCorridaServ = function() {
  return function(req, res) {
    var soloParadas = false;
    if(req.query.paradas && req.query.paradas == 'true') soloParadas = true;

    db.RutaCorrida.find(req.params.corridaid).complete(function (err, corrida){    
      if(err!=null || corrida==null){
        callback(util.formatResponse('Ocurrieron errores al consultar los puntos geográficos [corrida]', err, false, 'ErrRupX017', constErrorTypes, null));
        return;
      }      
      exports.puntosXCorrida(corrida, soloParadas, function(result){
        res.send(result);
      });    
    });
  }
}

/*
 * GET ONE  by ID ruta
 */
exports.distanciaPuntos = function() {
  return function(req, res) {
    var idToFind = req.params.rutaid;
    db.RutaPunto.findAll( {where: {RutaId: idToFind}, order: 'indice' } ).success(function(rutapunto) {

      var distance = computeDistance(rutapunto);
      var result = {distancia: distance, puntos: rutapunto}
      res.send(util.formatResponse('', null, true, 'ErrRupX005', constErrorTypes, result));
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al acceder a los puntos geográficos', err, false, 'ErrRupX006', constErrorTypes, null));
    });
  }
};


var computeDistance = function(puntos){
  var totalDistance=0;
  if(puntos!=null){
    var ptPrev = null;
    for (var i = 0; i < puntos.length; i++) {
      var pt = puntos[i];
      if(ptPrev!=null){
        var distance = geo.getDistance({latitude: ptPrev.latitud, longitude: ptPrev.longitud}, 
          {latitude: pt.latitud, longitude: pt.longitud}, 100);
        pt.values.distanceto = distance;
        totalDistance += distance;
      }
      ptPrev = pt;
    };
  }
  return totalDistance;
}
