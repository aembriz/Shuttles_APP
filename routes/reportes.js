var db = require('../models')
var util = require('./utilities');
var constErrorTypes = {'ErrRepX000': '', 'ErrRepX000':''};

exports.csvGeneral_bal = function(){
	return function(req, res){
		db.Reservacion.findAll({ 
			include: [{model: db.Usuario}],
			attributes: [
			'id', 'fechaReservacion', 'estatus', 'createdAt', 'RutaId', 'RutaCorridaId', 'UsuarioId'
			]}).complete(function(err, rsvs){
			if(err!=null || rsvs==null){
				res.send(util.formatResponse('Ocurrieron errores al generar el reporte', err, false, 'ErrRepX000', constErrorTypes, null));
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
			if(queryWhere.length > 0) queryWhere += " AND ";
			queryWhere += "r.fechaReservacion >= '" + req.query.fechareservacionini + "' AND r.fechaReservacion <= '" + req.query.fechareservacionfin + "'";
		}
		if(req.query.fechacreacionini && req.query.fechacreacionfin){
			if(queryWhere.length > 0) queryWhere += " AND ";
			queryWhere += "r.createdAt >= '" + req.query.fechacreacionini + "' AND r.createdAt <= '" + req.query.fechacreacionfin + "'";
		}
		if(queryWhere.length > 0) queryWhere = " WHERE " + queryWhere;

		query = query + queryWhere + ";"		


		db.sequelize.query(query).complete(function(err, rsvs){
			if(err!=null || rsvs==null){
				res.send(util.formatResponse('Ocurrieron errores al generar el reporte', err, false, 'ErrRepX000', constErrorTypes, null));
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
			res.csv(result);
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
			if(queryWhere.length > 0) queryWhere += " AND ";
			queryWhere += "r.fechaReservacion >= '" + req.query.fechareservacionini + "' AND r.fechaReservacion <= '" + req.query.fechareservacionfin + "'";
		}
		if(req.query.fechacreacionini && req.query.fechacreacionfin){
			if(queryWhere.length > 0) queryWhere += " AND ";
			queryWhere += "r.createdAt >= '" + req.query.fechacreacionini + "' AND r.createdAt <= '" + req.query.fechacreacionfin + "'";
		}		
		if(queryWhere.length > 0) queryWhere = " WHERE " + queryWhere;

		query = query + queryWhere + ";"

		db.sequelize.query(query).complete(function(err, rsvs){
			if(err!=null || rsvs==null){
				res.send(util.formatResponse('Ocurrieron errores al generar el reporte', err, false, 'ErrRepX000', constErrorTypes, null));
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
			res.csv(result);
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