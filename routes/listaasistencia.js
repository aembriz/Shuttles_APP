var db = require('../models')
var mail = require('./mailing'); // used for sending mails
var constant = require('../config/constant.js');

//var rutacompartida = require('./rutacompartida'); // used for sending mails

var util = require('./utilities');
var constErrorTypes = {'ErrLasX000': '', 'ErrLasX000':''};
var config = require('./configuracion'); // configuración parametrizable
// -------------------------------------------------

/*
* Lista las reservaciones para asistencia (params: fecha & [empresaid | rutaid | corridaid])
*/
exports.reservationList = function() { 
  return function(req, res){
	exports.getReservationList(req, function(result){
		res.send(result);
	})
  }
};

exports.getReservationList = function(req, callback) { 

    if(!req.query.fecha){
    	callback(util.formatResponse('Se debe especificar la fecha a consultar', null, false, 'ErrLasX000', constErrorTypes, null));    	
    }

    if(!req.query.corridaid && !req.query.rutaid && !req.query.empresaid){
    	callback(util.formatResponse('Se debe especificar el id del contexto a consultar [corrida, ruta o empresa]', null, false, 'ErrLasX000', constErrorTypes, null));
    }    

    var usr = req.user;
    var fecha = req.query.fecha;


    //var paramsWhere = {};        
    //paramsWhere.estatus = constant.estatus.Reservacion.confirmed;
    //paramsWhere.fechaReservacion = {eq: fecha};    
    //paramsWhere.fechaReservacion = 'LIKE ' + fecha + '%';

	if(usr.role=='EMPRESA'){ // empresa
		req.query.empresaid = usr.EmpresaId;
    }
    else if(usr.role=='USUARIO'){ // usuario
		req.query.usuarioid = usr.id;
    }

    var paramsWhere = [];    
    var whereStr = " (Reservacions.estatus = " + constant.estatus.Reservacion.confirmed + " OR Reservacions.estatus = " + constant.estatus.Reservacion.assisted + ") ";
    whereStr += " AND Reservacions.fechaReservacion LIKE '" + fecha + "%'";

    if(req.query.corridaid){ // corrida
		whereStr += " AND Reservacions.RutaCorridaId = " + req.query.corridaid + "";
    }
    if(req.query.rutaid){ // ruta
    	whereStr += " AND Reservacions.RutaId = " + req.query.rutaid + "";
    }
    else if(req.query.empresaid){ // empresa
		whereStr += " AND Reservacions.RutaId IN (SELECT id FROM Ruta WHERE CompanyownerID = " + req.query.empresaid + ") ";
    }
    if(req.query.usuarioid){ // usuario 
    	whereStr += " AND Reservacions.UsuarioId = " + req.query.usuarioid + "";
    }    

    paramsWhere.push(whereStr);
	paramsOrder = 'RutaId DESC, RutaCorridaId DESC';

    includes = [
        {model: db.Ruta},
        {model: db.RutaCorrida},
        {model: db.Usuario}
    ];

    db.Reservacion.findAll({ where: paramsWhere, include: includes, order: paramsOrder }).success(function(reservacion){

    	if(reservacion!=null){
    		var result = [];
    		var lastRutaId = 0;
    		var lastCorridaId = 0;
    		for (var i = 0; i < reservacion.length; i++) {
    			var r = {};
    			var rsv = reservacion[i];

				r.id = rsv.id;
				r.estatus = rsv.estatus;
				r.EmpresaId = "";
				r.EmpresaNombre = "";
				r.RutaId  = rsv.RutaId;
				r.RutaNombre = rsv.rutum!=null ? rsv.rutum.nombre : "";
				r.RutaCorridaId = rsv.RutaCorridaId;
				r.horaSalidaFmt = rsv.rutaCorrida!=null ? rsv.rutaCorrida.horaSalidaFmt : "";
				r.horaLlegadaFmt = rsv.rutaCorrida!=null ? rsv.rutaCorrida.horaLlegadaFmt : "";
				r.UsuarioId = rsv.UsuarioId;
				r.UsuarioNombre = rsv.usuario!=null ? rsv.usuario.nombre : "";
				r.UsuarioEmail = rsv.usuario!=null ? rsv.usuario.email : "";

				r.cambiaRuta = false;
				if(lastRutaId != r.RutaId){
					r.cambiaRuta = true;	
					lastRutaId = r.RutaId;
				}
				r.cambiaCorrida = false;	
				if(lastRutaId != r.RutaId){
					r.cambiaCorrida = true;	
					lastCorridaId = r.RutaCorridaId;
				}												

				result.push(r);
    		};
    	}

      callback(util.formatResponse('', null, true, 'ErrLasX000', constErrorTypes, result));
    }).error(function(err){
      callback(util.formatResponse('Ocurrieron errores al acceder a las reservaciones', err, false, 'ErrLasX000', constErrorTypes, null));
    });  
};



exports.updateAsistencia = function() {
  return function(req, res) {

    var idToUpdate = req.params.id;

    if(!req.query.asistio){
        res.send(util.formatResponse('Debe especificar si asistió o no', null, false, 'ErrLasX000', constErrorTypes, null));
        return;
    }
    var asistio = req.query.asistio;

    db.Reservacion.find(idToUpdate).complete(function(err, reserv){
        if(err!=null || reserv==null){
            res.send(util.formatResponse('No se pudo acceder a la reservación', err, false, 'ErrLasX000', constErrorTypes, null));
            return;
        }
        var sts = asistio=='true' ? constant.estatus.Reservacion.assisted : constant.estatus.Reservacion.confirmed;

        reserv.updateAttributes({estatus: sts}).complete(function(err, reserv){
            if(err!=null || reserv==null){
                res.send(util.formatResponse('No se pudo asignar la asistencia', err, false, 'ErrLasX000', constErrorTypes, null));
                return;
            }
            res.send(util.formatResponse('Se asignó correctamente la asistencia', null, true, 'ErrLasX000', constErrorTypes, reserv));
        });

    });
  }
};