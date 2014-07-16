var db = require('../models')
var util = require('./utilities');
var constErrorTypes = {'ErrRepX000': '', 'ErrRepX000':''};
var constant = require('../config/constant.js');
var sysconfig = require('../config/systemconfig.js');

exports.csvGeneral_bal = function(){
	return function(req, res){
		db.Reservacion.findAll({ 
			include: [{model: db.Usuario}],
			attributes: [
			'id', 'fechaReservacion', 'estatus', 'createdAt', 'RutaId', 'RutaCorridaId', 'UsuarioId'
			]}).complete(function(err, rsvs){
			if(err!=null || rsvs==null){
				res.send(util.formatResponse('Ocurrieron errores al generar el reporte', err, false, 'ErrRepX001', constErrorTypes, null));
				return;
			}
			var result = [];
			result.push(["ID Reserv.", "Reserv. para", "Estatus", "Creada el", 
			"ID Ruta", "ID Corrida", "ID Usuario", "Usuario"]);
			for (var i = 0; i < rsvs.length; i++) {
				rsv = rsvs[i].values
				rsv.fechaReservacion = formatoFecha(rsv.fechaReservacion);
				rsv.createdAt = formatoFecha(rsv.createdAt);
				rsv.usuario = rsvs[i].usuario.nombre;
				result.push(rsv);
			};
			console.log(result);
			res.csv(result);
		});
	}
};

/*
* Reporte General
* Filtros permitidos: 
* 		- fechareservacionini - fechareservacionfin (se espera formato yyyy-mm-dd)
* 		- fechacreacionini - fechacreacionfin (se espera formato yyyy-mm-dd)
*/
exports.csvGeneral = function(){
	return function(req, res){
		var query = "SELECT r.id, r.fechaReservacion, r.estatus, r.createdAt, \
		r.RutaId, t.nombre as 'RutaNombre', t.CompanyownerID as 'ID RutaEmpresa', m2.nombre as 'RutaEmpresa', t.descripcion, t.distanciaaprox, t.origentxt, t.destinotxt, \
    r.RutaCorridaId, i.horaSalida, i.horaLlegada, i.capacidadTotal, i.capacidadReservada, i.capacidadOfertada, i.reservacionesRecurrentes, i.tarifa, \
		r.UsuarioId, u.nombre as 'UsuarioNombre', u.email, \
		u.EmpresaId, m.nombre as 'EmpresaNombre' \
FROM Reservacions r \
LEFT OUTER JOIN Usuarioes u ON u.id = r.UsuarioId \
LEFT OUTER JOIN Ruta t ON t.id = r.RutaId \
LEFT OUTER JOIN RutaCorridas i ON i.id = r.RutaCorridaId \
LEFT OUTER JOIN Empresas m2 ON m2.id = t.CompanyownerID \
LEFT OUTER JOIN Empresas m ON m.id = u.EmpresaId"

		var queryWhere = ""
		if(req.query.fechareservacionini && req.query.fechareservacionfin){
			var fecIni = fecToUTC(req.query.fechareservacionini);
			var fecFin = fecToUTC(req.query.fechareservacionfin);			
			if(queryWhere.length > 0) queryWhere += " AND ";
			queryWhere += "r.fechaReservacion >= '" + fecIni + "' AND r.fechaReservacion <= '" + fecFin + "'";
		}
		if(req.query.fechacreacionini && req.query.fechacreacionfin){
			var fecIni = fecToUTC(req.query.fechacreacionini);
			var fecFin = fecToUTC(req.query.fechacreacionfin);			
			if(queryWhere.length > 0) queryWhere += " AND ";
			queryWhere += "r.createdAt >= '" + fecIni + "' AND r.createdAt <= '" + fecFin + "'";
		}
		if(queryWhere.length > 0) queryWhere = " WHERE " + queryWhere;

		query = query + queryWhere + ";"		


		db.sequelize.query(query).complete(function(err, rsvs){
			if(err!=null || rsvs==null){
				res.send(util.formatResponse('Ocurrieron errores al generar el reporte', err, false, 'ErrRepX002', constErrorTypes, null));
				return;
			}
			var result = [];
			result.push(["ID Reserv.", "Reserv. para", "Estatus", "Creada el", 
			"[Ruta]ID", "[Ruta]Nombre", "[Ruta]ID Empresa", "[Ruta]Empresa", "[Ruta]Desc.", "[Ruta]Dist. Aprox.", "[Ruta]Origen", " [Ruta]Destino",
			"[Corrida]ID", "[Corrida]Hr.Salida", "[Corrida]Hr.Llegada", "[Corrida]Cap. Tot.", "[Corrida]Cap. Reservada", "[Corrida]Cap. Ofertada", "[Corrida]Reserv. Recurrentes", "[Corrida]Tarifa",
			"[Usuario]ID", "[Usuario]Nombre", "[Usuario]Email", "[Usuario]ID Empresa", "[Usuario]Empresa"]);
			for (var i = 0; i < rsvs.length; i++) {
				rsv = rsvs[i];
				rsv.fechaReservacion = formatoFecha(rsv.fechaReservacion);
				rsv.createdAt = formatoFecha(rsv.createdAt);
				result.push(rsv);
			};			
			console.log(result);
			//res.csv(result);
			result = convertToCsv(result);
			createRptFile(result, function(err, partialUrl){
				if(err!=null){
					console.log(err);
					res.send(util.formatResponse('Hubieron errores al generar el reporte', err, false, 'ErrRepX007', constErrorTypes, null));
				}
				else{
					res.send(util.formatResponse('Reporte generado correctamente', null, true, 'ErrRepX008', constErrorTypes, {url: partialUrl}));
				}
			});			
		});
	}
};

/*
* Reporte de Edo de Cta. S
* Filtros permitidos: 
* 		- usuarioid
* 		- empresaid
* 		- fechareservacionini - fechareservacionfin (se espera formato yyyy-mm-dd)
* 		- fechacreacionini - fechacreacionfin (se espera formato yyyy-mm-dd)
*/
exports.csvEdoCta = function(){
	return function(req, res){

		var query = "SELECT r.id, r.fechaReservacion, r.estatus, r.createdAt, \
		r.RutaId, t.nombre as 'RutaNombre', t.CompanyownerID as 'ID RutaEmpresa', m2.nombre as 'RutaEmpresa', t.descripcion, t.distanciaaprox, t.origentxt, t.destinotxt, \
    r.RutaCorridaId, i.horaSalida, i.horaLlegada, i.capacidadTotal, i.capacidadReservada, i.capacidadOfertada, i.reservacionesRecurrentes, i.tarifa, \
		r.UsuarioId, u.nombre as 'UsuarioNombre', u.email, \
		u.EmpresaId, m.nombre as 'EmpresaNombre' \
FROM Reservacions r \
LEFT OUTER JOIN Usuarioes u ON u.id = r.UsuarioId \
LEFT OUTER JOIN Ruta t ON t.id = r.RutaId \
LEFT OUTER JOIN RutaCorridas i ON i.id = r.RutaCorridaId \
LEFT OUTER JOIN Empresas m2 ON m2.id = t.CompanyownerID \
LEFT OUTER JOIN Empresas m ON m.id = u.EmpresaId"

		var queryWhere = ""
		if(req.query.usuarioid){
			queryWhere += " r.UsuarioId = " + req.query.usuarioid;
		}
		else if(req.query.empresaid){
			queryWhere += " u.EmpresaId = " + req.query.empresaid;
		}
		if(req.query.fechareservacionini && req.query.fechareservacionfin){
			var fecIni = fecToUTC(req.query.fechareservacionini);
			var fecFin = fecToUTC(req.query.fechareservacionfin);			
			if(queryWhere.length > 0) queryWhere += " AND ";
			queryWhere += "r.fechaReservacion >= '" + fecIni + "' AND r.fechaReservacion <= '" + fecFin + "'";
		}
		if(req.query.fechacreacionini && req.query.fechacreacionfin){
			var fecIni = fecToUTC(req.query.fechacreacionini);
			var fecFin = fecToUTC(req.query.fechacreacionfin);			
			if(queryWhere.length > 0) queryWhere += " AND ";
			queryWhere += "r.createdAt >= '" + fecIni + "' AND r.createdAt <= '" + fecFin + "'";
		}		
		if(queryWhere.length > 0) queryWhere = " WHERE " + queryWhere;

		query = query + queryWhere + ";"

		db.sequelize.query(query).complete(function(err, rsvs){
			if(err!=null || rsvs==null){
				res.send(util.formatResponse('Ocurrieron errores al generar el reporte', err, false, 'ErrRepX003', constErrorTypes, null));
				return;
			}
			var result = [];
			result.push(["ID Reserv.", "Reserv. para", "Estatus", "Creada el", 
			"[Ruta]ID", "[Ruta]Nombre", "[Ruta]ID Empresa", "[Ruta]Empresa", "[Ruta]Desc.", "[Ruta]Dist. Aprox.", "[Ruta]Origen", " [Ruta]Destino",
			"[Corrida]ID", "[Corrida]Hr.Salida", "[Corrida]Hr.Llegada", "[Corrida]Cap. Tot.", "[Corrida]Cap. Reservada", "[Corrida]Cap. Ofertada", "[Corrida]Reserv. Recurrentes", "[Corrida]Tarifa",
			"[Usuario]ID", "[Usuario]Nombre", "[Usuario]Email", "[Usuario]ID Empresa", "[Usuario]Empresa"]);
			for (var i = 0; i < rsvs.length; i++) {
				rsv = rsvs[i];
				rsv.fechaReservacion = formatoFecha(rsv.fechaReservacion);
				rsv.createdAt = formatoFecha(rsv.createdAt);
				result.push(rsv);
			};						
			//res.csv(result);
			result = convertToCsv(result);
			createRptFile(result, function(err, partialUrl){
				if(err!=null){
					console.log(err);
					res.send(util.formatResponse('Hubieron errores al generar el reporte', err, false, 'ErrRepX009', constErrorTypes, null));
				}
				else{
					res.send(util.formatResponse('Reporte generado correctamente', null, true, 'ErrRepX010', constErrorTypes, {url: partialUrl}));
				}
			});			
		});
	}
};

/*
* Reporte exportar listado de empresas
*/
exports.csvEmpresas = function(){
	return function(req, res){

		var query = "SELECT id, nombre, razonsocial, rfc, direccion, sede, EstatusId FROM Empresas e;"

		db.sequelize.query(query).complete(function(err, rsvs){
			if(err!=null || rsvs==null){
				res.send(util.formatResponse('Ocurrieron errores al generar el reporte', err, false, 'ErrRepX004', constErrorTypes, null));
				return;
			}
			var result = [];
			result.push(["ID", "Nombre", "Razón Social", "RFC", "Dir.", "Sede", "Estatus"]);
			for (var i = 0; i < rsvs.length; i++) {
				rsv = rsvs[i];
				switch (rsv.EstatusId) {
				    case constant.estatus.Empresa.new:
				        rsv.EstatusId = "Nueva";
				        break;
				    case constant.estatus.Empresa.authorized:
				        rsv.EstatusId = "Autorizada";
				        break;
				    case constant.estatus.Empresa.rejected:
				        rsv.EstatusId = "Rechazada";
				        break;
				}
				result.push(rsv);
			};
			result = convertToCsv(result);
			createRptFile(result, function(err, partialUrl){
				if(err!=null){
					console.log(err);
					res.send(util.formatResponse('Hubieron errores al generar el reporte', err, false, 'ErrRepX005', constErrorTypes, null));
				}
				else{
					res.send(util.formatResponse('Reporte generado correctamente', null, true, 'ErrRepX006', constErrorTypes, {url: partialUrl}));
				}
			});
		});
	}
};


/*
* Reporte exportar listado de usuarios
*/
exports.csvUsuarios = function(){
	return function(req, res){

		var query = "SELECT u.id, u.nombre, u.email, u.role, u.area, u.telefono, u.createdAt, \
		u.EstatusId, e.nombre as 'Empresa' FROM Usuarioes u \
		LEFT OUTER JOIN Empresas e ON e.id = u.EmpresaId;"

		db.sequelize.query(query).complete(function(err, rsvs){
			if(err!=null || rsvs==null){
				res.send(util.formatResponse('Ocurrieron errores al generar el reporte', err, false, 'ErrRepX011', constErrorTypes, null));
				return;
			}
			var result = [];
			result.push(["ID", "Nombre", "Email", "Role", "Área", "Teléfono", "Creado el", "Estatus", "Empresa"]);
			for (var i = 0; i < rsvs.length; i++) {
				rsv = rsvs[i];
				rsv.createdAt = formatoFecha(rsv.createdAt);
				switch (rsv.EstatusId) {
				    case constant.estatus.Usuario.new:
				        rsv.EstatusId = "Nuevo";
				        break;
				    case constant.estatus.Usuario.authorized:
				        rsv.EstatusId = "Autorizado";
				        break;
				    case constant.estatus.Usuario.rejected:
				        rsv.EstatusId = "Rechazado";
				        break;
				}
				result.push(rsv);
			};
			result = convertToCsv(result);
			createRptFile(result, function(err, partialUrl){
				if(err!=null){
					console.log(err);
					res.send(util.formatResponse('Hubieron errores al generar el reporte', err, false, 'ErrRepX012', constErrorTypes, null));
				}
				else{
					res.send(util.formatResponse('Reporte generado correctamente', null, true, 'ErrRepX013', constErrorTypes, {url: partialUrl}));
				}
			});
		});		

	}
};

/*
* Reporte exportar listado de rutas
*/
exports.csvRutas = function(){
	return function(req, res){

		var query = "SELECT r.nombre as 'Ruta_Nombre', r.descripcion as 'Ruta_Descripcion', \
		r.origentxt as 'Ruta_Origen', r.destinotxt as 'Ruta_Destino', r.EstatusId as 'Ruta_Estatus', e.nombre as 'Ruta_Empresa', \
		co.horaSalida as 'Corrida_HoraSalida', co.horaLlegada as 'Corrida_HoraLlegada', \
		co.capacidadTotal as 'Corrida_CapacidadTotal', co.capacidadReservada as 'Corrida_CapacidadReservada', \
		co.capacidadOfertada as 'Corrida_CapacidadOfertada', co.tarifa as 'Corrida_Puntos', \
		co.caducaCapacidadReservada as 'Corrida_CaducaCapacidadReservada', \
		co.dia1 as 'Corrida_Lunes', co.dia2 as 'Corrida_Martes', co.dia3 as 'Corrida_Miercoles', \
		co.dia4 as 'Corrida_Jueves', co.dia5 as 'Corrida_Viernes', co.dia6 as 'Corrida_Sabado', co.dia7 as 'Corrida_Domingo', \
		pt.descripcion as 'Parada_Descripcion', pa.horaestimada as 'Parada_HoraEstimada', pt.id as 'Parada_id' \
		FROM RutaPuntoes pt \
		LEFT OUTER JOIN RutaParadas pa ON pa.RutaPuntoId = pt.id \
		LEFT OUTER JOIN RutaCorridas co ON co.RutaId = pt.RutaId \
		LEFT OUTER JOIN Ruta r ON r.id = pt.RutaId \
		LEFT OUTER JOIN Empresas e ON e.id = r.CompanyownerID \
		WHERE pt.tipo < 4 AND r.id <> '' AND co.id <> '';"

		db.sequelize.query(query).complete(function(err, rsvs){
			if(err!=null || rsvs==null){
				res.send(util.formatResponse('Ocurrieron errores al generar el reporte', err, false, 'ErrRepX014', constErrorTypes, null));
				return;
			}
			var result = [];
			result.push(["Ruta_Nombre", "Ruta_Descripcion", "Ruta_Origen", "Ruta_Destino", "Ruta_Estatus", 
				"Ruta_Empresa", "Corrida_HoraSalida", "Corrida_HoraLlegada", "Corrida_CapacidadTotal", 
				"Corrida_CapacidadReservada", "Corrida_CapacidadOfertada", "Corrida_Puntos", "Corrida_CaducaCapacidadReservada", 
				"Corrida_Lunes", "Corrida_Martes", "Corrida_Miercoles", "Corrida_Jueves", "Corrida_Viernes", "Corrida_Sabado", 
				"Corrida_Domingo", "Parada_Descripcion", "Parada_HoraEstimada", "Parada_id"]);
			for (var i = 0; i < rsvs.length; i++) {
				rsv = rsvs[i];	
				rsv.Corrida_HoraSalida = fmtMinToHour(rsv.Corrida_HoraSalida);
				rsv.Corrida_HoraLlegada = fmtMinToHour(rsv.Corrida_HoraLlegada);
				switch (rsv.EstatusId) {
				    case constant.estatus.Usuario.new:
				        rsv.EstatusId = "Nueva";
				        break;
				    case constant.estatus.Usuario.authorized:
				        rsv.EstatusId = "Autorizada";
				        break;
				    case constant.estatus.Usuario.rejected:
				        rsv.EstatusId = "Rechazada";
				        break;
				}
				result.push(rsv);
			};
			result = convertToCsv(result);
			createRptFile(result, function(err, partialUrl){
				if(err!=null){
					console.log(err);
					res.send(util.formatResponse('Hubieron errores al generar el reporte', err, false, 'ErrRepX015', constErrorTypes, null));
				}
				else{
					res.send(util.formatResponse('Reporte generado correctamente', null, true, 'ErrRepX016', constErrorTypes, {url: partialUrl}));
				}
			});
		});		

	}
};

var formatoFecha = function(fec){	
	var fmt = ("0" + fec.getDate()).slice(-2);
	fmt += "/" 
	fmt += ("0" + (fec.getMonth()+1)).slice(-2);
	fmt += "/"
	fmt += fec.getFullYear()
	fmt += " "
	fmt += ("0" + fec.getHours()).slice(-2);
	fmt += ":"
	fmt += ("0" + fec.getMinutes()).slice(-2);
	return fmt; 
};

var fecToUTC = function(strFec){
	var fec = new Date(strFec);
	var fecFmt = fec.getUTCFullYear() + "-" + ("0" + (fec.getUTCMonth() +1)).slice(-2) + "-" + ("0"  + fec.getUTCDate()).slice(-2);
	return fecFmt;
}

var createRptFile = function(content, callback){
	
	var d = new Date();
	var random = ~~(Math.random() * 10000);
	//var newFileName = d.getUTCFullYear() + ("0" + (d.getUTCMonth()+1)).slice(-2) + ("0" + d.getUTCDate()).slice(-2) + "_";
	var newFileName = d.getTime() + "_" + random + ".csv";
	var publicPath = "/rpts/" +  newFileName;
	var newPath = __dirname + "/../public" +  publicPath;
	var gUrl = sysconfig.server.url; 

	var fs = require('fs');
	fs.writeFile(newPath, content, "ascii", function(err) {
	    if(err) {
	        console.log(err);
	    } else {
	        console.log("The file was saved!");
	    }
		callback(err, gUrl + publicPath);
	}); 
}

var convertToCsv = function(array){
	var separator = ",";
	var body = "";
	array.forEach(function(item) {
		if (!(item instanceof Array)) item = objToArray(item);
		body += item.map(escape).join(separator) + '\r\n';
	});
	return body;
}

function objToArray(obj) {
  var result = [];
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      result.push(obj[prop]);
    }
  }
  return result;
}

function escape(field) {
	var ignoreNullOrUndefined = true;
	var preventCast = false;
	if (ignoreNullOrUndefined && field == undefined) {
		return '';
	}
	if (preventCast) {
		return '="' + String(field).replace(/\"/g, '""') + '"';
	}
	return '"' + String(field).replace(/\"/g, '""') + '"';
}

var fmtMinToHour = function(minutes){
    var hrs = "" + Math.floor(minutes / 60);
    var min = "" + minutes % 60;
    return ((hrs.length < 2)? "0"+hrs : hrs) + ':' + ((min.length < 2)? "0"+min : min); 	
}
