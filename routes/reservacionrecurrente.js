var db = require('../models')
var constant = require('../config/constant.js');
var util = require('./utilities');
var constErrorTypes = {'ErrRsrX000': '', 'ErrRsrX000':''};

exports.list = function() { 
  return function(req, res){

  	var usr = req.user;
  	var paramsWhere = {};

    if('ruta' in req.query){      
      paramsWhere.RutaId = req.query.ruta;
    }

  	if(usr.role != 'ADMIN') paramsWhere.UsuarioId = usr.id;

  	db.ReservacionRecurrente.findAll({ where: paramsWhere, include: [
  		{model: db.Ruta},
  		{model: db.RutaCorrida},
  		{model: db.Usuario, attributes: ['nombre', 'email']},
  		] 
  	}).complete(function (err, result) {
  		if(err != null || result == null){
  			res.send(util.formatResponse('Ocurrieron errores al consultar las reservaciones compartidas', err, false, 'ErrRsrX001', constErrorTypes, null));
  			return;
  		}
  		res.send(util.formatResponse('', null, true, 'ErrRsrX002', constErrorTypes, result));
  	});

  }
};


exports.listUsuarios = function() { 
  return function(req, res){

  	var usr = req.user;
  	var paramsWhere = {};

    if('ruta' in req.query){      
      paramsWhere.RutaId = req.query.ruta;
    }
    if('corrida' in req.query){      
      paramsWhere.RutaCorridaId = req.query.corrida;
    }    
    if('empresa' in req.query){      
      paramsWhere["Rutum.CompanyownerID"] = req.query.empresa;
    }    

  	if(usr.role != 'ADMIN'){
	  	if(usr.role == 'EMPRESA'){
	  		paramsWhere["Rutum.CompanyownerID"] = req.query.empresa;
	  	}
	  	else{
	  		paramsWhere.UsuarioId = usr.id;	
	  	}  	   	 
  	}

  	db.ReservacionRecurrente.findAll({ where: paramsWhere, include: [
  		{model: db.Ruta, include: [{model: db.Empresa, as: 'companyowner'}]},
  		{model: db.RutaCorrida},
  		{model: db.Usuario, attributes: ['nombre', 'email']},
  		] 
  	}).complete(function (err, result) {
  		if(err != null || result == null){
  			res.send(util.formatResponse('Ocurrieron errores al consultar las reservaciones compartidas', err, false, 'ErrRsrX001', constErrorTypes, null));
  			return;
  		}
  		
  		var processedresult = [];
  		for (var i = 0; i < result.length; i++) {
  			var obj = result[i];
  			var persona = {id: obj.usuario.id, nombre: obj.usuario.nombre, email: obj.usuario.email, 
  				empresa: obj.rutum.companyowner.nombre, ruta: obj.rutum.nombre, rutaid: obj.rutum.id,
  				horaSalidaFmt: obj.rutaCorrida.horaSalidaFmt, horaLlegadaFmt: obj.rutaCorrida.horaLlegadaFmt,
  				origen: obj.rutum.origentxt, destino: obj.rutum.destinotxt}

  			for (var j = 1; j <= 7; j++) {
  				persona["dia" + j] = obj.rutaCorrida["dia" + j];
  			};

  			processedresult.push(persona);
  		};

  		res.send(util.formatResponse('', null, true, 'ErrRsrX002', constErrorTypes, processedresult));
  	});

  }
};

/*
 * GET ONE 
 */
exports.listOne = function() {
  return function(req, res) {

	var usr = req.user;
    var paramsWhere = {};
    paramsWhere.id = req.params.id;
  	if(usr.role != 'ADMIN') paramsWhere.UsuarioId = usr.id;

    db.ReservacionRecurrente.find( { where: paramsWhere, include: [
  		{model: db.Ruta},
  		{model: db.RutaCorrida},
  		{model: db.Usuario, attributes: ['nombre', 'email']},
  		] 
  	} ).success(function(rsvrec) {      
      res.send(util.formatResponse('', null, true, 'ErrRsrX003', constErrorTypes, rsvrec));
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al acceder a la reservación recurrente', err, false, 'ErrRsrX004', constErrorTypes, null));
    });
  }
}

/*
 * POST , alta de reservacion recurrente e incrementa valor de reservaciones recurrentes en la corrida
 */
exports.add = function() {
	return function(req, res) {		
		var usr = req.user;


		db.RutaCorrida.find( {where: {id: req.body.RutaCorridaId}, include: [{model: db.Ruta}] }  ).complete(function (err, rutacorrida) {
			if(err!=null || rutacorrida == null){
				res.send(util.formatResponse('Ocurrieron errores al acceder a la corrida', err, false, 'ErrRsrX005', constErrorTypes, null));
				return;
			}

			// valida modelo a insertar
			var rsvrec = db.ReservacionRecurrente.build( { estatus: constant.estatus.ReservacionRecurrente.active, 
				RutaId: rutacorrida.rutum.id, RutaCorridaId: rutacorrida.id, UsuarioId: usr.id} );
		    var valerr = rsvrec.validate();
		    if(valerr){      
		      res.send(util.formatResponse('Errores al validar la reservación recurrente', valerr, false, 'ErrRsrX006', constErrorTypes));
		      return;
		    } 

			// solo se pueden crear reservaciones recurrentes para rutas propias de tu empresa
			if(rutacorrida.rutum.CompanyownerID != usr.EmpresaId){
				res.send(util.formatResponse('Error, no se pueden generar reservaciones recurrentes para rutas que no son de su empresa.', null, false, 'ErrRsrX020', constErrorTypes, null));
				return;
			}

			// se verifica si aun hay capacidad para reservación recurrente
			if(rutacorrida.capacidadReservada <= rutacorrida.reservacionesRecurrentes){
				res.send(util.formatResponse('Disponibilidad agotada para reservaciones recurrentes.', null, false, 'ErrRsrX007', constErrorTypes, null));
				return;				
			}

			// suma a capacidad reservada de la corrida
			rutacorrida.increment('reservacionesRecurrentes', 1).complete(function (err){
				if(err!=null){
					res.send(util.formatResponse('Ocurrieron errores al crear la reservación recurrente.', null, false, 'ErrRsrX008', constErrorTypes, null));
					return;									
				}

			    rsvrec.save().complete(function (err, rsvrec) {
			      if(err==null){
			        res.send(util.formatResponse('Se creó correctamente la reservación recurrente', null, true, 'ErrRsrX009', constErrorTypes, rsvrec));
			      }
			      else{
			      	rutacorrida.decrement('reservacionesRecurrentes', 1); // regresa valor anterior
			        res.send(util.formatResponse('Ocurrieron errores al crear la reservación recurrente', err, false, 'ErrRsrX010', constErrorTypes, null));
			      }
			    });
			});


		});

	}
};


/*
 * DELETE one, decrementa el valor de reservaciones recurrentes en la corrida
 */
exports.delete = function() {
  return function(req, res) {
    
    var usr = req.user;
    var paramsWhere = {};
    paramsWhere.id = req.params.id;
  	if(usr.role != 'ADMIN') paramsWhere.UsuarioId = usr.id;


    db.ReservacionRecurrente.find( { where: paramsWhere } ).complete(function (err, rsvrec) {
    	if(err!=null || rsvrec == null){
    		res.send(util.formatResponse('Ocurrieron errores al eliminar la reservación recurrente', err, false, 'ErrRsrX011', constErrorTypes, null));
    		return;
    	}
    	db.RutaCorrida.find( {where: {id: rsvrec.RutaCorridaId} }  ).complete(function (err, rutacorrida) {
    		if(err!=null || rutacorrida==null){
	    		res.send(util.formatResponse('Ocurrieron errores al eliminar la reservación recurrente', err, false, 'ErrRsrX012', constErrorTypes, null));
	    		return;    			
    		}
    		rutacorrida.decrement('reservacionesRecurrentes', 1).complete(function (err){
    			if(err!=null){
		    		res.send(util.formatResponse('Ocurrieron errores al eliminar la reservación recurrente', err, false, 'ErrRsrX013', constErrorTypes, null));
		    		return;    			    				
    			}			
		    	rsvrec.destroy().complete(function (err){
		    		if(err!=null){
		    			rutacorrida.increment('reservacionesRecurrentes', 1)
			    		res.send(util.formatResponse('Ocurrieron errores al eliminar la reservación recurrente', err, false, 'ErrRsrX014', constErrorTypes, null));	    					    		
			    		return;
		    		}
		    		res.send(util.formatResponse('Se eliminó correctamente la reservación recurrente', null, true, 'ErrRsrX015', constErrorTypes, null));
		    	});
    		});

    	});


    })
  }
};


/*
* Genera las reservaciones recurrentes para la oferta mandada (se espera objeto oferta de db)
*/
exports.generaRecurrentesXOferta = function(oferta){
	
	db.ReservacionRecurrente.findAll( { where: {RutaCorridaId: oferta.RutaCorridaId} } ).complete(function (err, rsvrecs) {
		if(err!=null || rsvrecs == null){
			console.log(util.formatResponse('No se pudieron acceder a las reservaciones recurrentes. -->' + oferta.RutaCorridaId, err, false, 'ErrRsrX016', constErrorTypes, null))
			return;
		}

		for (var i = 0; i < rsvrecs.length; i++) {
			var rsvrec = rsvrecs[i];

			var resv = {RutaId: oferta.RutaId, RutaCorridaId: oferta.RutaCorridaId, OfertaId: oferta.id, UsuarioId: rsvrec.UsuarioId, 
			fechaReservacion: oferta.fechaOferta, estatus: constant.estatus.Reservacion.confirmed}; // Se crea como confirmada
			var reservacion = db.Reservacion.build(resv);
		    var valerr = reservacion.validate();
		    if(valerr){      
		      console.log(util.formatResponse('Errores al validar la reservación recurrente', valerr, false, 'ErrRsrX017', constErrorTypes));
		      return;
		    } 			
			
			oferta.decrement('oferta', 1).success(function(oferta) {			
				reservacion.save().complete(function (err, reservacion) {
					if(err!=null){
						oferta.increment('oferta', 1); // regresa la oferta
						console.log(util.formatResponse('No se pudo crear la reservación recurrente', err, false, 'ErrRsrX018', constErrorTypes));
						return;
					}
					console.log(util.formatResponse('Se creó correctamente la reservación recurrente', null, true, 'ErrRsrX019', constErrorTypes));
				});
			});

		};
	});

};

/************************************************************************/
/************************************************************************/

exports.listCorridas = function() { 
  return function(req, res){

    var rutaid = req.params.rutaid;
    var usrid = req.user.id

    db.RutaCorrida.findAll({ where: {RutaId: rutaid, estatus: {lt: constant.estatus.RutaCorrida.deleted} } }).success(function(rutacorrida) {
      if(rutacorrida!=null){

      	db.ReservacionRecurrente.findAll({ where: {RutaId: rutaid, UsuarioId: usrid } }).complete(function (err, rsvrecs){  		
      		if(err==null && rsvrecs!=null){      			
				for (var i = 0; i < rutacorrida.length; i++) {
					for (var j = 0; j < rsvrecs.length; j++) {
						if(rsvrecs[j].RutaCorridaId == rutacorrida[i].id){
							rutacorrida[i].dataValues.recurrente = rsvrecs[j].values;
						}
					};					
				};
      		}
      		res.send(util.formatResponse('', null, true, 'ErrRsrX020', constErrorTypes, rutacorrida));      	
      	});        
      }
      else{
        res.send(util.formatResponse('Ocurrieron errores al acceder a las corridas', null, false, 'ErrRsrX021', constErrorTypes, null));   
      }
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al acceder a las corridas', err, false, 'ErrRsrX022', constErrorTypes, null));
    });    
  }
};
