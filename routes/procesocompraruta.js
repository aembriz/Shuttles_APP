var db = require('../models')
var mail = require('./mailing'); // used for sending mails
var constant = require('../config/constant.js');

//var rutacompartida = require('./rutacompartida'); // used for sending mails

var util = require('./utilities');
var constErrorTypes = {'ErrPcrX000': '', 'ErrPcrX000':''};
var config = require('./configuracion'); // configuración parametrizable
// -------------------------------------------------

/*
* Lista las rutas disponibles para el usuario, que están autorizadas y tienen oferta
*/
exports.listRoutes = function() { 
  return function(req, res){
    var usrid = req.user.id;
    var sts = 0;
    var params = {};    


    // -------------------
    var paramWhere = { EmpresaClienteId: req.user.EmpresaId, estatus: constant.estatus.RutaCompartida.authorized
      , 'Rutum.EstatusId': constant.estatus.Ruta.authorized };
    
    db.RutaCompartida.findAll({ where: paramWhere, 
      include: [{model: db.Ruta}] 
    }).success(function(rutacompartida) {
      var rutaids = [];
      if(rutacompartida!=null){
        for (var i = 0; i < rutacompartida.length; i++) {
          rutaids.push(rutacompartida[i].RutaId);
        };    
        console.log(rutaids);      
      }

      db.Ruta.findAll({where: db.Sequelize.or(
          db.Sequelize.and({CompanyownerID: req.user.EmpresaId}, {EstatusId: constant.estatus.Ruta.authorized} ),
          {id: rutaids}
        ), 
        include: [
          {model: db.Empresa, as: 'companyowner'},
          {model: db.Estatus, as: 'Estatus', attributes: ['id', 'stsNombre']}
        ]
      }).success(function(rutas) {
          //res.send(rutas);
          res.send(util.formatResponse('', null, true, 'ErrPcrX001', constErrorTypes, rutas));
      }).error(function(err){
        //res.send({msg: 'No se pudo consultar las rutas del usuario, error.', err: err, success: false});
        res.send(util.formatResponse('Ocurrieron errores al acceder a las rutas que puede ver el usuario', err, false, 'ErrPcrX002', constErrorTypes, null));
      });

      return rutaids;
    }).error(function(err){      
      //res.send({msg: 'No se pudo consultar las rutas compartidas, error.', err: err, success: false});
      res.send(util.formatResponse('Ocurrieron errores al acceder a las rutas compartidas que puede ver el usuario', err, false, 'ErrPcrX003', constErrorTypes, null));
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
      //res.send({ msg: 'Problemas al acceder a su perfil de usuario.' });      
      res.send(util.formatResponse('Ocurrieron al acceder al perfil del usuario', err, false, 'ErrPcrX004', constErrorTypes, null));
    }).success(function(usuario) {
      usr = usuario.values;
      console.log(usr);
      console.log(puntoA);
      console.log(puntoB);

      // busca las rutas que le corresponden al usuario
      var params = {};
      params.where = {};
      params.where.EstatusId = constant.estatus.Ruta.authorized;
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

          if(pCercanoIni.rutaPunto!=null && pCercanoFin.rutaPunto!=null){ // sólo si se pudo determinar paradas sugeridas
            // construye sugerencia
            delete ruta.rutaPuntos; // no incluye todos los puntos de la ruta en la sugerencia
            var suggest = {lejania: (pCercanoIni.distancia + pCercanoFin.distancia), ruta: ruta, 
              ascensoSugerido: pCercanoIni, descensoSugerido: pCercanoFin};

            // Sólo inclye las rutas en que la ruta sugerida vaya en el mismo sentido que el expresado por el usuario
            if(suggest.ascensoSugerido.rutaPunto.indice < suggest.descensoSugerido.rutaPunto.indice){
              suggests.push(suggest);
            }
          }

        } // for rutas

        //res.send(suggests);    
        res.send(util.formatResponse('', null, true, 'ErrPcrX005', constErrorTypes, suggests));
      }).error(function(err){
        res.send(util.formatResponse('Ocurrieron errores al acceder a las rutas que puede ver el usuario', err, false, 'ErrPcrX006', constErrorTypes, null));
      });

    });

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
* En caso de una ruta de la misma empresa del usuario consultante, se incluye oferta total en caso de un usuario visitante se resta
* la reserva hasta X horas antes de la hora de la fecha ofertada
*/
exports.listOferta = function() { 
  return function(req, res){
    var usrid = req.user.id;
    var usr = req.user;
    var ahora = new Date()
    var result = {msg: 'No se pudo obtener la disponibilidad'};
    var queryParams = {};
    queryParams.where = {};
    if('rutaid' in req.params) {
      queryParams.where.RutaId = req.params.rutaid;
    }
    else{
      //res.send('{ msg: "Debe indicarse la ruta a consultar."}');
      res.send(util.formatResponse('Debe indicarse la ruta a consultar', null, false, 'ErrPcrX007', constErrorTypes, null));
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
      hoy = hoy.getFullYear() + "-" + ("0"+(hoy.getMonth()+1)).slice(-2) + "-" + ("0"+hoy.getDate()).slice(-2);
      //hoy = new Date(hoy.toISOString().slice(0, 10) + 'T00:00:00.000-05:00');

      //hoy = hoy.getFullYear() + '-' + (hoy.getMonth() + 1) + '-' + hoy.getDate() +  ' 00:00:00';
      queryParams.where.fechaOferta = {gte: hoy};
    }

    // incluye el objeto corrida dentro de la oferta
    queryParams.include = [
        {model: db.RutaCorrida},
        {model: db.Ruta, attributes: ['id', 'nombre', 'CompanyownerID']}
    ];    

    queryParams.order = 'fechaOferta';

    // lista todas las disponibilidades de las corridas de la ruta especificada
    db.Oferta.findAll(queryParams).success(function(rutacorridaoferta) {
      //res.send(rutacorridaoferta);

      if(rutacorridaoferta==null){
        res.send(util.formatResponse('Ocurrieron errores al listar la oferta para el usuario', null, false, 'ErrPcrX008', constErrorTypes, null));
        return;
      }

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
                  if(result[i].values != null){
                    result[i].values.espera = esp.values;
                  }
                  else{
                    result[i].espera = esp.values; 
                  }
                }
              };
            }
          }        

          // manejo de reservas de acuerdo a usuario consultante (a usuarios no de la empresa se descuentan lugares reservados)
          var fechaAnt = null;
          for (var i = 0; i < result.length; i++) {
            var fecOf = result[i].fechaOferta.toISOString().slice(0, 10) + 'T' + result[i].rutaCorrida.horaSalidaFmt + ':00.000-05:00';
            //fecOf = new Date(fecOf.getUTCFullYear(), fecOf.getUTCMonth(), fecOf.getUTCDate())
            //result[i].fechaOferta = fecOf;
            fecOf = new Date(fecOf)


            var minsToOferta = ((fecOf.getTime() - ahora.getTime())/60000 );
            if(usr.EmpresaId!=result[i].rutum.CompanyownerID && minsToOferta > result[i].rutaCorrida.caducaCapacidadReservada){
              result[i].oferta = result[i].oferta - result[i].reserva;
            }

            // se asigna atributo para que canal web pueda seccionar ofertas
            if(result[i].values){
              result[i].dataValues.cambiaFecha = (result[i].fechaOferta != fechaAnt);
            }
            else{
              result[i].cambiaFecha = (result[i].fechaOferta != fechaAnt);
            }
            fechaAnt = result[i].fechaOferta;
            // --------------------
            

          };

          //res.send(result);
          res.send(util.formatResponse('', null, true, 'ErrPcrX009', constErrorTypes, result));          
          return;
        }).error(function(err){
          console.log('Error al obtener la lista de espera asociada a la consulta de oferta.')
          //res.send(result);
          res.send(util.formatResponse('Ocurrieron errores al acceder a la lista de espera del usuario', err, true, 'ErrPcrX010', constErrorTypes, result));
          return;
        });

      }).error(function(err){
        result = rutacorridaoferta;
        //res.send(result);
        res.send(util.formatResponse('Ocurrieron errores al acceder a la lista de reservaciiones del usuario', err, true, 'ErrPcrX011', constErrorTypes, result));
        return;
      });

    }).error(function(err){        
        //res.send({msg: 'Error al consultar la oferta par la ruta: ' + req.params.rutaid });
        res.send(util.formatResponse('Ocurrieron errores al acceder a la oferta para el usuario', err, false, 'ErrPcrX012', constErrorTypes, null));
        return;
    });        

  }
};

// *****************************RESERVACIONES ******************************************

exports.reservationCreate = function() { 
  return function(req, res){
    var usrid = req.user.id; 
    db.Oferta.find( { where: {id: req.params.ofertaid}, include: [{model: db.RutaCorrida}] } ).success(function(oferta){    
      if(oferta==null){
        res.send(util.formatResponse('Ocurrieron errores al crear la reservación', null, false, 'ErrPcrX013', constErrorTypes, null));
        return;
      }
      if(oferta.values.oferta > 0){
        oferta.decrement('oferta', 1).success(function(oferta) {
          var of = oferta.values;
          var fecRsv = of.fechaOferta.toISOString().slice(0, 10) + 'T' + oferta.rutaCorrida.horaSalidaFmt + ':00.000-05:00';

          var resv = {RutaId: of.RutaId, RutaCorridaId: of.RutaCorridaId, OfertaId: of.id, UsuarioId: usrid, 
            fechaReservacion: fecRsv, estatus: constant.estatus.Reservacion.confirmed}; // Se crea como confirmada

          var reservacion = db.Reservacion.build(resv);
          reservacion.save().complete(function (err, reservacion) {
            //res.send(
            //  (err === null) ? { msg: 'Su reservación has sido registrada.', reservacion: reservacion } : 
            //  { msg: 'Existieron errores al registrar su reservación. Por favor vuelva a intentarlo.',  err: err }
            //);
            if(err==null){
              mail.notifyReservationChange(reservacion);
              res.send(util.formatResponse('Su reservación fue registrada correctamente.', null, true, 'ErrPcrX014', constErrorTypes, reservacion));
            }
            else{
              res.send(util.formatResponse('Ocurrieron errores al crear la reservación', err, false, 'ErrPcrX015', constErrorTypes, null));
            }
          });

        }).error(function(err){
          res.send(util.formatResponse('Ocurrieron errores al crear la reservación', err, false, 'ErrPcrX016', constErrorTypes, null));
        });
      }
      else{
        //res.send({msg: 'Sentimos informarle que los lugares disponibles ya fueron reservados.'});
        res.send(util.formatResponse('Sentimos informarle que los lugares disponibles ya fueron reservados',  null, false, 'ErrPcrX017', constErrorTypes, null));
      }
    }).error(function(err){
      //res.send({msg: 'Existieron problemas al acceder a la oferta.', err: err});      
      res.send(util.formatResponse('Ocurrieron errores al crear la reservación', err, false, 'ErrPcrX018', constErrorTypes, null));
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

      db.Oferta.find(ofertaid).success(function(oferta){
        if(oferta == null){
          res.send(util.formatResponse('Ocurrieron errores al crear las reservaciones', null, false, 'ErrPcrX019', constErrorTypes, null));
          return;
        }
        if(oferta.values.oferta > 0){
          oferta.decrement('oferta', 1).success(function(oferta) {            
            var of = oferta.values;
            var resv = {RutaId: of.RutaId, RutaCorridaId: of.RutaCorridaId, OfertaId: of.id, UsuarioId: usrid, 
              fechaReservacion: of.fechaOferta, estatus: constant.estatus.Reservacion.confirmed}; // Se crea como confirmada

            var reservacion = db.Reservacion.build(resv);
            reservacion.save().complete(function (err, reservacion) {
              result[oferta.id] =
                (err === null) ? {msg: 'Su reservación has sido creada correctamente.', reservacion: reservacion } : 
                {msg: 'Existieron errores al registrar su reservación. Por favor vuelva a intentarlo.',  err: err }
              ;
              porProcesar--;
              if(porProcesar <= 0) {
                //res.send({msg:'', resultado: result});
                res.send(util.formatResponse('Se crearon correctamente las reservaciones', null, false, 'ErrPcrX020', constErrorTypes, result));
              }
            });
          }).error(function(err){
            result[oferta.id] = {msg: 'Ocurrieron errores al crear la reservación.'};
          });
        }
        else{
          result[oferta.id] = {msg: 'Sentimos informarle que los lugares disponibles ya fueron reservados.'};
          porProcesar--;
          if(porProcesar <= 0) {
            //res.send({msg:'', resultado: result});
            res.send(util.formatResponse('Se crearon correctamente las reservaciones', null, false, 'ErrPcrX021', constErrorTypes, result));
          }
        }
      }).error(function(err){
        result[0] = {msg: 'Existieron problemas al acceder a la oferta.', err: err};
        porProcesar--;
        if(porProcesar <= 0) {
          //res.send({msg:'', resultado: result});
          res.send(util.formatResponse('Se crearon correctamente las reservaciones', null, false, 'ErrPcrX022', constErrorTypes, result));
        }
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
          //res.send('msg: La reservación que pretende confirmar no le pertenece.');
          res.send(util.formatResponse('No tiene permisos sobre esta reservación', null, false, 'ErrPcrX023', constErrorTypes, null));
          return;
        }
        // confirma la reservación
        reservacion.updateAttributes({estatus: constant.estatus.Reservacion.confirmed}).success(function(reservacion) {
          //res.send({msg: 'Reservacion confirmada', reservacion: reservacion});      
          mail.notifyReservationChange(reservacion);
          res.send(util.formatResponse('Se confirmó correctamente la reservación', null, false, 'ErrPcrX024', constErrorTypes, reservacion));
        }).error(function(err){
          //res.send({msg: 'Existieron errores al confirmar la reservación.', err: err});
          res.send(util.formatResponse('Ocurrieron errores al confirmar la reservación', err, false, 'ErrPcrX025', constErrorTypes, null));
        });        
      }
      else{
        res.send(util.formatResponse('Ocurrieron errores al confirmar las reservaciones', null, false, 'ErrPcrX026', constErrorTypes, null));
      }
    }).error(function(err){
      //res.send({msg: 'Existieron problemas al acceder a la reservación.', err: err});      
      res.send(util.formatResponse('Ocurrieron errores al confirmar la reservación', err, false, 'ErrPcrX027', constErrorTypes, null));
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
          //res.send({msg: 'La reservación que pretende cancelar no le pertenece.'});
          res.send(util.formatResponse('No tiene permisos sobre la reservación', null, false, 'ErrPcrX028', constErrorTypes, null));
          return;
        }
        policyCanCancel(reservacion, function(canCancel){
          if(!canCancel){
            res.send(util.formatResponse('De acuerdo a las políticas, no se puede cancelar la reservación', null, false, 'ErrPcrX050', constErrorTypes, null));
            return;
          }
          // cancela la reservación
          reservacion.updateAttributes({estatus: constant.estatus.Reservacion.canceled}).success(function(reservacion) {          
            // procesa lista de espera y actualización de la oferta
            processWaitingList(reservacion);
            //res.send({msg: 'Reservación ha sido cancelada exitosamente.', reservacion: reservacion})
            mail.notifyReservationChange(reservacion);
            res.send(util.formatResponse('Se canceló correctamente la reservación', null, true, 'ErrPcrX029', constErrorTypes, reservacion));
          }).error(function(err){
            //res.send({msg: 'Existieron errores al cancelar la reservación.', err: err});
            res.send(util.formatResponse('Ocurrieron errores al cancelar la reservación', err, false, 'ErrPcrX030', constErrorTypes, null));
          });        
        });
      }
      else{
        res.send(util.formatResponse('Ocurrieron errores al cancelar la reservación', null, false, 'ErrPcrX031', constErrorTypes, null));
      }
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al cancelar la reservación', err, false, 'ErrPcrX032', constErrorTypes, null));
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
      paramsWhere.estatus = constant.estatus.Reservacion[req.query.estatus];
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
      //res.send(reservacion);
      res.send(util.formatResponse('', null, true, 'ErrPcrX033', constErrorTypes, reservacion));
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al acceder a las reservaciones', err, false, 'ErrPcrX034', constErrorTypes, null));
    });
  }
};

// *****************************LISTA DE ESPERA ******************************************

exports.waitinglistCreate = function() { 
  return function(req, res){
    var usrid = req.user.id; //5; // TODO: se debe extraer del token de acceso
    db.Oferta.find(req.params.ofertaid).success(function(oferta){
      if(oferta==null){
        res.send(util.formatResponse('Ocurrieron errores al crear la solicitud de espera', null, false, 'ErrPcrX035', constErrorTypes, null));
        return;
      }
      var of = oferta.values;
      var resv = {RutaId: of.RutaId, RutaCorridaId: of.RutaCorridaId, OfertaId: of.id, UsuarioId: usrid, 
        fechaReservacion: of.fechaOferta};

      var espera = db.Espera.build(resv);
      espera.save().complete(function (err, espera) {
        //res.send(
        //  (err === null) ? { msg: 'Se ha agregado a la lista de espera.', reservacion: espera } : 
        //  { msg: 'Existieron errores al registrarlo en la lista de espera. Por favor vuelva a intentarlo.',  err: err }
        //);
        if(err==null){
          res.send(util.formatResponse('Se creó correctamente la solicitud de espera', null, true, 'ErrPcrX036', constErrorTypes, espera));
        }
        else{
          res.send(util.formatResponse('Ocurrieron errores al crear la solicitud de espera', err, false, 'ErrPcrX037', constErrorTypes, null));
        }
      });
    }).error(function(err){
      //res.send({msg: 'Existieron problemas al acceder a la oferta.', err: err});      
      res.send(util.formatResponse('Ocurrieron errores al crear la solicitud de espera', err, false, 'ErrPcrX038', constErrorTypes, null));
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
          //res.send('msg: La reservación en lista de espera que pretende cancelar no le pertenece.');
          res.send(util.formatResponse('No tiene permisos sobre la solicitud de espera', null, false, 'ErrPcrX039', constErrorTypes, null));
          return;
        }
        // cancela la reservación
        espera.updateAttributes({estatus: constant.estatus.Espera.canceled}).success(function(espera) {
          //res.send({msg: 'Reservacion de lista de espera cancelada', reservacion: espera});      
          res.send(util.formatResponse('Se canceló correctamente la solicitud de espera', null, true, 'ErrPcrX040', constErrorTypes, espera));
        }).error(function(err){
          //res.send({msg: 'Existieron errores al cancelar la reservación.', err: err});
          res.send(util.formatResponse('Ocurrieron errores al cancelar la solicitud de espera', err, false, 'ErrPcrX041', constErrorTypes, null));
        });        
      }
      else{
        res.send(util.formatResponse('Ocurrieron errores al cancelar la solicitud de espera', null, false, 'ErrPcrX042', constErrorTypes, null));
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
      paramsWhere.estatus = constant.estatus.Espera[req.query.estatus];
    }
    else{
      paramsWhere.estatus = constant.estatus.Espera.new;
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
      //res.send(reservacion);
      res.send(util.formatResponse('', null, true, 'ErrPcrX043', constErrorTypes, reservacion));
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al acceder a las solicitudes de espera', err, false, 'ErrPcrX044', constErrorTypes, null));
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
  queryWhere.estatus = constant.estatus.Espera.new; // esperas vigentes

  db.Espera.findAll({ where: queryWhere, order: 'id' }).success(function(espera){
    if(espera != null && espera.length > 0){
      var e = espera[0].values; // sólo tomo el primer valor
      // proceso reservación
      var resv = {RutaId: e.RutaId, RutaCorridaId: e.RutaCorridaId, OfertaId: canceledReservation.OfertaId, 
        UsuarioId: e.UsuarioId, fechaReservacion: canceledReservation.fechaReservacion, estatus: constant.estatus.Reservacion.new}; // Se crea como pendiente

      var reservacion = db.Reservacion.build(resv);
      reservacion.save().complete(function (err, reservacion) {
        if(err == null){
          db.Espera.find({where: {id: e.id} }).success(function(esp){
            esp.updateAttributes({estatus: constant.estatus.Espera.assigned, ReservacionId: reservacion.id}).success(function(e) {
              console.log('[COMPRA] Lista de espera convertida a reservación.');
            }).error(function(err){
              console.error('No se pudo actualizar la lista de espera [' + e.id + ']');
            });        
          }).error(function(err){
            console.error('No se pudo acceder y actualizar la lista de espera [' + e.id + ']');
          });

          mail.notifyReservationChange(reservacion);
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

// regresa true si se permite cancelar la reservación de acuerdo a la política
// como resultado invoca callback(canCancel)
var policyCanCancel = function(reservation, callback){
  if(reservation==null){
    return false;
  }
  var fecRsv = reservation.fechaReservacion.toISOString(); //.slice(0, 10) + 'T' + result[i].rutaCorrida.horaSalidaFmt + ':00.000-05:00';
  fecRsv = new Date(fecRsv);
  var ahora = new Date();

  var minsTo = ((fecRsv.getTime() - ahora.getTime())/60000 );

  config.getConf(function(err, conf){
    if(err!=null) console.log(err);
    callback( (minsTo > conf.reservMinParaCancelar) );
  });

}