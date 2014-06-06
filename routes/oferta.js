var db = require('../models')
var constant = require('../config/constant.js');

var constDiaSem = ['dia7', 'dia1', 'dia2', 'dia3', 'dia4', 'dia5', 'dia6'];

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

/*
 * Genera la oferta para una ruta 
 */
exports.generaOfertaXRuta = function() {
  return function(req, res) {
    var idRuta = req.params.rutaid;
    var hoy = new Date();

    db.Ruta.find({ where: {id: idRuta}, include: [{model: db.RutaCorrida, as: 'Corridas'}] }).success(function(ruta){
      var result = generaOfertaRuta(ruta, hoy);
      if(result.success){
        res.send(result);
      }
      else{
        res.send(result);
      }
    }).error(function(err){
      res.send({msg: "No se pudo acceder a la ruta para generar la oferta ruta: " + idRuta, success: false, err: err});
    });

  }
};

/*
 * Genera la oferta para todas las rutas de todas las empresas 
 */
exports.generaOfertaGlobalServ = function() {
  return function(req, res) {
    exports.generaOfertaGlobal(function(result){
      res.send(result);
    });
  }
};


exports.generaOfertaGlobal = function(resultCallback){
  console.log("Generando OFEEEEERTAS");
  var hoy = new Date();
  var num = 0;

  db.Ruta.findAll({ where: { EstatusId: constant.estatus.Ruta['authorized'] }, include: [{model: db.RutaCorrida, as: 'Corridas'}] }).success(function(rutas){
    if(rutas!=null){
      for (var i = 0; i < rutas.length; i++) {
        var ruta = rutas[i];
        var result = generaOfertaRuta(ruta, hoy);
        if(result.success) num++;
        console.log(result);
      };
      resultCallback({msg: "Se generó exitosamente la oferta para " + num + " rutas.", success: true});
    }
    else{
      resultCallback({msg: "No se pudo generar la oferta global, no se encontraron rutas.", success: false});
    }
  }).error(function(err){
      resultCallback({msg: "No se pudo generar la oferta global, no se encontraron rutas.", success: false, err: err});
  });  
}

/*
* Generación de ofertas para todas las corridas de una ruta (la ruta debe estar en estatus autorizada)... 
* tomando en cuenta configuración de días de la semana de cada corrida y oferta futura de la ruta
*/
var generaOfertaRuta = function(ruta, hoy){    
  if(ruta!=null){
    var dias = ruta.diasofertafuturo;

    if(ruta.EstatusId != constant.estatus.Ruta['authorized']) {
      return ({msg: "No se puede generar la oferta, la ruta: " + ruta.id + " no está autorizada.", success: false});
    }

    var i = 1;
    while(dias > 0){          
      var fechaoper = new Date(hoy);
      fechaoper.setDate(hoy.getDate() + i);
      dias--;
      if(ruta.corridas != null){
        for (var j = 0; j < ruta.corridas.length; j++) {
          var corrida = ruta.corridas[j];
          if( corrida != null && corrida[constDiaSem[fechaoper.getDay()]] == true){ // si la corrida aplica en el día de la semana
            var oferta = {fechaOferta: utcCerosToDB(fechaoper), oferta: corrida.capacidadOfertada, RutaId: ruta.id, RutaCorridaId: corrida.id };            
            var ofertadb = db.Oferta.build(oferta);
            console.log(ofertadb.values.fechaOferta);
            ofertadb.save().complete(function (err, oferta) {
              if(err!=null){console.log(err)}
            });
          }
        };
      }
      i++;
    }              

    return ({msg: "Generación de oferta exitosa para la ruta: " + ruta.id, success: true});
  }
  else{
    return({msg: "No se pudo generar la oferta, no se encontró la ruta.", success: false});
  }

};


function addMinutes(date, minutes) {
    return new Date(date.getTime() + (minutes*60000));
}

/*
* Modifica la fecha antes de insertarla en la bd para que vaya con hora 00:00 en UTC
*/
function utcCerosToDB(date) {  
    date.setHours(0,0,0,0);  
    var offset = -1 * date.getTimezoneOffset(); // reversing offset    

    return new Date(date.getTime() + (offset*60000));
}