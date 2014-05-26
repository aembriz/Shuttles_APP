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
    
    var usrid = req.user.id; //5; // TODO: obtener el usuario del token de acceso
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
* Lista la oferta disponible para la ruta y la fecha especificada, si no se indica fecha regresa todas las ofertas futuras de la ruta
* /[rutaid]/oferta/?fecha=[fecha buscada]
*/
exports.listOferta = function() { 
  return function(req, res){
    var queryParams = {};
    queryParams.where = {};
    if('rutaid' in req.params) {
      queryParams.where.RutaId = req.params.rutaid;
    }
    else{
      res.send('{ msg: "Debe indicarse la ruta a consultar."}');
      return;
    }
    if('fecha' in req.query) {       
      /*
      var fecVar = req.query.fecha.split('-');
      var dia = new Date(fecVar[0], (parseInt(fecVar[1]) - 1) , fecVar[2]);
      dia.setHours(0,0,0,0);
      */
      queryParams.where.fechaOferta = req.query.fecha + ' 00:00:00';
    }
    else{
      var hoy = new Date();
      hoy = hoy.toISOString().slice(0, 10); + ' 00:00:00';
      //hoy = hoy.getFullYear() + '-' + (hoy.getMonth() + 1) + '-' + hoy.getDate() +  ' 00:00:00';
      queryParams.where.fechaOferta = {gte: hoy};
    }

    // incluye el objeto corrida dentro de la oferta
    queryParams.include = [
        {model: db.RutaCorrida}
    ];    

    // lista todas las disponibilidades de las corridas de la ruta especificada
    db.Oferta.findAll(queryParams).success(function(rutacorridaoferta) {
      res.send(rutacorridaoferta);
    });        

  }
};


exports.reservationCreate = function() { 
  return function(req, res){
    var usrid = 5; // TODO: se debe extraer del token de acceso
    db.Oferta.find(req.params.ofertaid).success(function(oferta){    
      if(oferta.values.oferta > 0){
        oferta.decrement('oferta', 1).success(function(oferta) {
          var of = oferta.values;
          var resv = {RutaId: of.RutaId, RutaCorridaId: of.RutaCorridaId, OfertaId: of.id, UsuarioId: usrid, 
            fechaReservacion: of.fechaOferta};

          var reservacion = db.Reservacion.build(resv);
          reservacion.save().complete(function (err, reservacion) {
            res.send(
              (err === null) ? { msg: 'Su reservación has sido registrada.', reservacion: reservacion } : 
              { msg: 'Existieron errores al registrar su reservación. Por favor vuelva a intentarlo.',  err: err }
            );
          });

        });
      }
      else{
        res.send({msg: 'Sentimos informarle que los lugares disponibles ya fueron reservados.'});
      }
    }).error(function(err){
      res.send({msg: 'Existieron problemas al acceder a la oferta.', err: err});      
    });

  }
};

exports.reservationCancel = function() { 
  return function(req, res){    
    // TODO faltan aplicar las validaciones de políticas de cancelación
    var usrid = req.user.id; //5 // TODO: validar que la reservación corresponda al usuario extraido del Token de acceso
    db.Reservacion.find(req.params.reservacionid).success(function(reservacion){
      if(reservacion != null){
        if(reservacion.UsuarioId != usrid){
          res.send('msg: La reservación que pretende cancelar no le pertenece.');
          return;
        }
        // cancela la reservación
        reservacion.updateAttributes({estatus: 2}).success(function(reservacion) {
          db.Oferta.find(reservacion.OfertaId).success(function(oferta) {
            oferta.increment('oferta', 1).success(function(oferta) {
              res.send({msg: 'Reservacion cancelada', reservacion: reservacion});      
            });
          });          
        }).error(function(err){
          res.send({msg: 'Existieron errores al cancelar la reservación.', err: err});
        });        
      }
    });
  }
};

/*
* Lista las reservaciones del usuario
*/
exports.reservationList = function() { 
  return function(req, res){    
    var usrid = req.user.id;  //5 // TODO: validar que la reservación corresponda al usuario extraido del Token de acceso

    includes = [
        {model: db.Ruta},
        {model: db.RutaCorrida}
    ];    

    db.Reservacion.findAll({ where: {UsuarioId: usrid}, include: includes }).success(function(reservacion){
      res.send(reservacion);
    });
  }
};