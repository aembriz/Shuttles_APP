var db = require('../models')

var constEstatus = {'new': 1, 'authorized': 3, 'rejected': 4}

// -------------------------------------------------
/*
* Lista las rutas más cercanas a los puntos partida y destino proporcionados por el usuario
*/
exports.listSuggestions = function() {
  return function(req, res) {
    var puntoA = {lat: req.query.puntoALat, lng: req.query.puntoALng};
    var puntoB = {lat: req.query.puntoBLat, lng: req.query.puntoBLng};

    // TODO: obtener el usuario del token de acceso
    var usrid = 5;
    var usr = null;
    db.Usuario.find( 
      {
        where: { id: usrid }
      }      
    ).error(function(err){
      res.send({ msg: 'Problemas al acceder a su perfil de usuario.' });      
    }).success(function(usuario) {
      usr = usuario.values;
      console.log(usr);
      console.log(puntoA);
      console.log(puntoB);

      // busca las rutas que le corresponden al usuario
      var params = {};
      params.where = {};
      params.where.EstatusId = constEstatus.authorized;
      params.where.CompanyownerID = usr.EmpresaId; // TODO: por el momento solo se muestran las rutas de la compañía a la que pertenece

      db.Ruta.findAll( 
        {
          where: params.where,
          include: [
            {model: db.RutaPunto, as: 'RutaPuntos', where: {tipo: {lt: 4}} }
          ]
        }      
      ).success(function(rutas) {
        var suggests = []; // rutas sugeridas

        for (var i = 0; i < rutas.length; i++) {
          var ruta = rutas[i].values;
          var pCercanoIni = {distancia: 9999999, rutaPunto: null};
          var pCercanoFin = {distancia: 9999999, rutaPunto: null};
          for (var p = 0; p < ruta.rutaPuntos.length; p++) {
            var punto = ruta.rutaPuntos[p].values;            
            // calcula distancia de la parada (punto ruta) contra punto origen y destino pasados
            var parada = {lat: punto.latitud, lng: punto.longitud};
            var distIni = getDistance(puntoA, parada);
            var distFin = getDistance(puntoB, parada);
            // determina si es punto más cercano al punto de inicio
            if(distIni < pCercanoIni.distancia){
              pCercanoIni.distancia = distIni;
              pCercanoIni.rutaPunto = punto;
            }
            if(distFin < pCercanoFin.distancia){
              pCercanoFin.distancia = distFin;
              pCercanoFin.rutaPunto = punto;
            }
          } // for puntos

          // construye sugerencia
          delete ruta.rutaPuntos; // no incluye todos los puntos de la ruta en la sugerencia
          var suggest = {lejania: (pCercanoIni.distancia + pCercanoFin.distancia), ruta: ruta, 
            ascensoSugerido: pCercanoIni, descensoSugerido: pCercanoFin};
          suggests.push(suggest);

        } // for rutas

        res.send(suggests);    
      });

    });


    // calcula la distancia a las paradas de la ruta
    /*
    db.RutaPunto.findAll( {where: {tipo: 3}, order: 'indice' } ).success(function(rutapunto) {      
      res.send(rutapunto);    
    });
    */

  }
};


var rad = function(x) {
  return x * Math.PI / 180;
};

var getDistance = function(p1, p2) {
  var R = 6378137; // Earth’s mean radius in meter
  var dLat = rad(p2.lat - p1.lat);
  var dLong = rad(p2.lng - p1.lng);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d; // returns the distance in meter
};


/*
* Lista las corridas y su oferta de acuerdo al la ruta y fcha requerida especificada en el query
*/
exports.listCorridas = function() { 
  return function(req, res){
    var queryParams = {};
    var queryParamsOferta = {};
    if('rutaid' in req.query) {
      queryParams.where = {RutaId: req.query.rutaid};
    }
    else{
      res.send('{ msg: "Debe indicarse la ruta a consultar."}');
      return;
    }

    if('fecha' in req.query) {
      queryParamsOferta.where = {fechaOferta: req.query.fecha, RutaId: req.query.rutaid};
    }
    else{
      res.send('{ msg: "Debe indicarse la fecha a consultar."}');
      return;
    }    

    // lista todas las disponibilidades de las corridas de la ruta especificada
    db.Oferta.findAll(queryParamsOferta).success(function(rutacorridaoferta) {      
      // TODO : ligar datos de la corrida y de la ruta
      res.send(rutacorridaoferta);
    });        

  }
};


exports.reservation = function() { 
  return function(req, res){
    var reservation = {ruta: req.params.rutaid, corrida: req.params.corridaid, fecha: req.params.fecha};

    db.RutaCorrida.findAll(queryParams).success(function(rutacorrida) {
      res.send(rutacorrida);
    });    
  }
};