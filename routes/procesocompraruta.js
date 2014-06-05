var db = require('../models')
var mail = require('./mailing'); // used for sending mails

var constEstatus = {'new': 1, 'authorized': 3, 'rejected': 4}

// TODO revisar y manejar bien estatus de reservaciones y lista de espera
var constReservEstatus = {'new': 1, 'confirmed': 2, 'canceled': 3}
var constEsperaEstatus = {'new': 1, 'assigned': 2, 'canceled': 3, 'deprecated': 4}

// -------------------------------------------------

/*
* Lista las rutas disponibles para el usuario, que están autorizadas y tienen oferta
*/
exports.listRoutes = function() { 
  return function(req, res){
    console.log("LISTANDO RUTAS------------------------");
    console.log(req.user);
    var usrid = req.user.id;
    var sts = 0;
    var params = {};    

    // filtra rutas autorizadas
    params.where = {};
    params.where.EstatusId = constEstatus["authorized"];
    if(req.user.role!='ADMIN'){
      params.where.CompanyownerID = req.user.EmpresaId; // TODO: incorporar rutas compartidas
    }

    params.include = [
        {model: db.Empresa, as: 'companyowner'},
        {model: db.Estatus, as: 'Estatus', attributes: ['id', 'stsNombre']}
      ];

    db.Ruta.findAll(params).success(function(rutas) {
      res.send(rutas);
    });
  }
};

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
    var usrid = req.user.id;
    var result = {msg: 'No se pudo obtener la disponibilidad'};
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
      //res.send(rutacorridaoferta);

      // liga reservaciones que el usuario ya tiene para esas ofertas
      db.Reservacion.findAll({ where: {UsuarioId: usrid, estatus: {lte: 2} } }).success(function(reservacion){
        if(reservacion != null && reservacion.length > 0){
          var ofertas = [];
          for (var i = 0; i < rutacorridaoferta.length; i++) {          
            var of = rutacorridaoferta[i].values;
            of.rutaCorrida = of.rutaCorrida.values;
            var ox = of;
            for (var r = 0; r < reservacion.length; r++) {
              var rsv = reservacion[r];
              if(rsv.OfertaId == ox.id){
                ox['reservacion'] = rsv.values;              
              }
            };
            ofertas.push(ox);
          }
          result = ofertas;
        }
        else{
          result = rutacorridaoferta;
        }

        db.Espera.findAll({ where: {UsuarioId: usrid, estatus: 1 } }).success(function(espera){
          if(espera != null && espera.length > 0){            
            for (var i = 0; i < result.length; i++) {  
              for (var e = 0; e < espera.length; e++) {
                var esp = espera[e];
                if(esp.OfertaId == result[i].id){
                  result[i].espera = esp.values;
                }
              };
            }
          }          
          res.send(result);
          return;
        }).error(function(err){
          console.log('Error al obtener la lista de espera asociada a la consulta de oferta.')
          res.send(result);
          return;
        });

      }).error(function(err){
        result = rutacorridaoferta;
        res.send(result);
        return;
      });

    }).error(function(err){        
        res.send({msg: 'Error al consultar la oferta par la ruta: ' + req.params.rutaid });
        return;
    });        

  }
};

// *****************************RESERVACIONES ******************************************

exports.reservationCreate = function() { 
  return function(req, res){
    var usrid = req.user.id; //5; // TODO: se debe extraer del token de acceso
    db.Oferta.find(req.params.ofertaid).success(function(oferta){    
      if(oferta.values.oferta > 0){
        oferta.decrement('oferta', 1).success(function(oferta) {
          var of = oferta.values;
          var resv = {RutaId: of.RutaId, RutaCorridaId: of.RutaCorridaId, OfertaId: of.id, UsuarioId: usrid, 
            fechaReservacion: of.fechaOferta, estatus: constReservEstatus.confirmed}; // Se crea como confirmada

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

exports.reservationCreateBulk = function() { 
  return function(req, res){
    var usrid = req.user.id;
    var ofertas = req.body.ofertaids;
    var result = {};    
    var porProcesar = ofertas.length;

    for (var i = 0; i < ofertas.length; i++) {
      ofertaid = ofertas[i];

      console.log('Procesando -->' + ofertaid);
      db.Oferta.find(ofertaid).success(function(oferta){    
        if(oferta.values.oferta > 0){
          oferta.decrement('oferta', 1).success(function(oferta) {
            console.log('Procesando -->' + oferta.id + '-->Decrementado');
            var of = oferta.values;
            var resv = {RutaId: of.RutaId, RutaCorridaId: of.RutaCorridaId, OfertaId: of.id, UsuarioId: usrid, 
              fechaReservacion: of.fechaOferta, estatus: constReservEstatus.confirmed}; // Se crea como confirmada

            var reservacion = db.Reservacion.build(resv);
            reservacion.save().complete(function (err, reservacion) {
              console.log('Procesando -->' + oferta.id + '-->Reservado');
              result[oferta.id] =
                (err === null) ? {msg: 'Su reservación has sido registrada.', reservacion: reservacion } : 
                {msg: 'Existieron errores al registrar su reservación. Por favor vuelva a intentarlo.',  err: err }
              ;
              porProcesar--;
              if(porProcesar <= 0) {res.send({msg:'', resultado: result});}
            });

          });
        }
        else{
          result[oferta.id] = {msg: 'Sentimos informarle que los lugares disponibles ya fueron reservados.'};
          porProcesar--;
          if(porProcesar <= 0) {res.send({msg:'', resultado: result});}
        }
      }).error(function(err){
        result[0] = {msg: 'Existieron problemas al acceder a la oferta.', err: err};
        porProcesar--;
        if(porProcesar <= 0) {res.send({msg:'', resultado: result});}
      });
    };
    
  }
};

/*
* Confirma una reservación pendiente ?reservacionid=[]
*/
exports.reservationConfirm = function() { 
  return function(req, res){
    var usrid = req.user.id; //5; // TODO: se debe extraer del token de acceso
    var reservid = req.params.reservacionid;    
    db.Reservacion.find(reservid).success(function(reservacion){    
      if(reservacion != null){
        if(reservacion.UsuarioId != usrid){
          res.send('msg: La reservación que pretende confirmar no le pertenece.');
          return;
        }
        // cancela la reservación
        reservacion.updateAttributes({estatus: constReservEstatus.confirmed}).success(function(reservacion) {
          res.send({msg: 'Reservacion confirmada', reservacion: reservacion});      
        }).error(function(err){
          res.send({msg: 'Existieron errores al confirmar la reservación.', err: err});
        });        
      }      
    }).error(function(err){
      res.send({msg: 'Existieron problemas al acceder a la reservación.', err: err});      
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
          res.send({msg: 'La reservación que pretende cancelar no le pertenece.'});
          return;
        }
        // cancela la reservación
        reservacion.updateAttributes({estatus: constReservEstatus.canceled}).success(function(reservacion) {          
          // procesa lista de espera y actualización de la oferta
          processWaitingList(reservacion);
          res.send({msg: 'Reservación ha sido cancelada exitosamente.', reservacion: reservacion})
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
    var paramsWhere = {};    
    paramsWhere.UsuarioId = usrid;

    if('estatus' in req.query){
      paramsWhere.estatus = constReservEstatus[req.query.estatus];
    }
    if('vigente' in req.query){
      if(req.query.vigente == 'true'){
        var hoy = new Date();
        hoy.setUTCHours(0,0,0,0);        
        paramsWhere.fechaReservacion = {gte: hoy};
      }      
    }    

    includes = [
        {model: db.Ruta},
        {model: db.RutaCorrida}
    ];    

    // TODO: tomar en cuenta estatus de las reservaciones a mostrar
    db.Reservacion.findAll({ where: paramsWhere, include: includes }).success(function(reservacion){
      res.send(reservacion);
    });
  }
};

// *****************************LISTA DE ESPERA ******************************************

exports.waitinglistCreate = function() { 
  return function(req, res){
    var usrid = req.user.id; //5; // TODO: se debe extraer del token de acceso
    db.Oferta.find(req.params.ofertaid).success(function(oferta){              
      var of = oferta.values;
      var resv = {RutaId: of.RutaId, RutaCorridaId: of.RutaCorridaId, OfertaId: of.id, UsuarioId: usrid, 
        fechaReservacion: of.fechaOferta};

      var espera = db.Espera.build(resv);
      espera.save().complete(function (err, espera) {
        res.send(
          (err === null) ? { msg: 'Se ha agregado a la lista de espera.', reservacion: espera } : 
          { msg: 'Existieron errores al registrarlo en la lista de espera. Por favor vuelva a intentarlo.',  err: err }
        );
      });
    }).error(function(err){
      res.send({msg: 'Existieron problemas al acceder a la oferta.', err: err});      
    });

  }
};

exports.waitinglistCancel = function() { 
  return function(req, res){    
    // TODO faltan aplicar las validaciones de políticas de cancelación
    var usrid = req.user.id; //5 // TODO: validar que la reservación corresponda al usuario extraido del Token de acceso
    db.Espera.find(req.params.reservacionid).success(function(espera){
      if(espera != null){
        if(espera.UsuarioId != usrid){
          res.send('msg: La reservación en lista de espera que pretende cancelar no le pertenece.');
          return;
        }
        // cancela la reservación
        espera.updateAttributes({estatus: constEsperaEstatus.canceled}).success(function(espera) {
          res.send({msg: 'Reservacion de lista de espera cancelada', reservacion: espera});      
        }).error(function(err){
          res.send({msg: 'Existieron errores al cancelar la reservación.', err: err});
        });        
      }
    });
  }
};

/*
* Lista las reservaciones de lista de espera del usuario (solo muestra Esperas vigentes => NO pasadas o tomadas)
*/
exports.waitinglistList = function() { 
  return function(req, res){    
    var usrid = req.user.id;  //5 // TODO: validar que la reservación corresponda al usuario extraido del Token de acceso

    // filtros
    var paramsWhere = {};    
    paramsWhere.UsuarioId = usrid;
    if('estatus' in req.query){
      paramsWhere.estatus = constEsperaEstatus[req.query.estatus];
    }
    else{
      paramsWhere.estatus = constEsperaEstatus.new;
    }
    if('vigente' in req.query){
      if(req.query.vigente == 'true'){
        var hoy = new Date();
        hoy.setUTCHours(0,0,0,0);        
        paramsWhere.fechaReservacion = {gte: hoy};
      }      
    }

    includes = [
        {model: db.Ruta},
        {model: db.RutaCorrida}
    ];    

    db.Espera.findAll({ where: paramsWhere, include: includes }).success(function(reservacion){
      res.send(reservacion);
    });
  }
};

/*
* Proceso de asignación de listas de espera pendientes
* En caso de no haber lista de espera --> incrementa la oferta si proviene de una cancelación (canceledPlaces)
*/
var processWaitingList = function(canceledReservation){
  // TODO: verifica si hay usrs en espera y obtiene a quién le toca  
  // TODO: procesa reservación para el usuario usando los datos de lista de espera y dejando Reservación en estatus PENDIENTE = new

  var hoy = new Date();
  hoy.setUTCHours(0,0,0,0);
  if(canceledReservation.fechaReservacion < hoy){ // si la fecha ya es pasada no se procesa lista de espera
    return false;
  }

  var queryWhere = {};

  queryWhere.OfertaId = canceledReservation.OfertaId;
  queryWhere.fechaReservacion = canceledReservation.fechaReservacion;  
  queryWhere.estatus = constEsperaEstatus.new; // esperas vigentes

  db.Espera.findAll({ where: queryWhere, order: 'id' }).success(function(espera){
    if(espera != null && espera.length > 0){
      var e = espera[0].values; // sólo tomo el primer valor
      // proceso reservación
      var resv = {RutaId: e.RutaId, RutaCorridaId: e.RutaCorridaId, OfertaId: canceledReservation.OfertaId, 
        UsuarioId: e.UsuarioId, fechaReservacion: e.fechaReservacion, estatus: constReservEstatus.new}; // Se crea como pendiente

      var reservacion = db.Reservacion.build(resv);
      reservacion.save().complete(function (err, reservacion) {
        if(err == null){
          db.Espera.find({where: {id: e.id} }).success(function(esp){
            esp.updateAttributes({estatus: constEsperaEstatus.assigned, ReservacionId: reservacion.id}).success(function(e) {
              console.log('[COMPRA] Lista de espera convertida a reservación.');
            }).error(function(err){
              console.error('No se pudo actualizar la lista de espera [' + e.id + ']');
            });        
          }).error(function(err){
            console.error('No se pudo acceder y actualizar la lista de espera [' + e.id + ']');
          });

          mail.notifyWaitingListAssigned(reservacion);
        }
        else{
          // TODO: Log de proceso lista de espera fallida. Notificar a EmbarQ
          console.log("Ocurrieron errores al tratar de procesar la siguiente entrada en lista de espera");
          console.error("Ocurrieron errores al tratar de procesar la siguiente entrada en lista de espera idOferta [" + objOferta.id + "]");
        }
      });    
    }
    else{ // No hay lista de espera --> se incrementan lugares
      db.Oferta.find(canceledReservation.OfertaId).success(function(objOferta){
        objOferta.increment('oferta', 1).success(function(oferta) {
          console.log('Se reasignaron lugares cancelados a la oferta [' + objOferta.id + '] ');
        });
      }).error(function(err){
        console.error('No se pudo actualizar la oferta al cancelar la reservación');
      });
    }

  });

};

