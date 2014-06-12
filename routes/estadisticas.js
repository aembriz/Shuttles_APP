var db = require('../models')
var constant = require('../config/constant.js');
var util = require('./utilities');
var constErrorTypes = {'ErrEstX000': '', 'ErrEstX000':''};

var constReservacionesEstatus = ['', 'Por confirmar', 'Confirmadas', 'Canceladas'];


exports.getStatistics = function(){
	return function(req, res){
		if(req.query.tipo){
			if(req.query.tipo == 'ReservacionesXEstatus'){
				reservacionesXEstatus(req, res, false);
			}
			else if(req.query.tipo == 'ReservacionesXEstatusHistorico'){
				reservacionesXEstatus(req, res, true);	
			}			
			else if(req.query.tipo == 'reservacionesXUltimaSemana'){
				reservacionesXUltimaSemana(req, res);	
			}		
			else if(req.query.tipo == 'numerosGlobales'){
				numerosGlobales(req, res);	
			}					
			else{
				res.send(util.formatResponse('Tipo de estadística incorrecto', null, false, 'ErrOfeX001', constErrorTypes, null));
			}				
			
		}
		else{
			res.send(util.formatResponse('Se debe especificar el tipo de estadística', null, false, 'ErrOfeX001', constErrorTypes, null));
		}
	}
}

var reservacionesXEstatus = function(req, res, historico) { 

  	var query = 'SELECT estatus, count(r.id) as \'count\' from Reservacions r where fechaReservacion';
  	query += ((historico) ? ' < ' : ' >= ');
  	query += 'now() group by estatus';

	db.sequelize.query(query).success(function(result) {
		if(result == null){
			res.send(util.formatResponse('Error al obtener estadísticas globales', err, false, 'ErrOfeX001', constErrorTypes, null));	
			return;
		}
		for (var i = 0; i < result.length; i++) {
			result[i].estatus = constReservacionesEstatus[result[i].estatus];
		};
		res.send(util.formatResponse('', null, true, 'ErrOfeX001', constErrorTypes, result));
	}).error(function(err){
		res.send(util.formatResponse('Error al obtener estadísticas globales', err, false, 'ErrOfeX001', constErrorTypes, null));
	})

};

var reservacionesXUltimaSemana = function(req, res) { 

  	var query = 'SELECT fechaReservacion, count(r.fechaReservacion) as \'count\' from Reservacions r ';
	query += 'where fechaReservacion > ADDDATE(CURDATE(), -7) and fechaReservacion < CURDATE() ';
	query += 'group by fechaReservacion';

	db.sequelize.query(query).success(function(result) {
		if(result == null){
			res.send(util.formatResponse('Error al obtener estadísticas reservacionesXUltimaSemana', err, false, 'ErrOfeX001', constErrorTypes, null));	
			return;
		}
		for (var i = 0; i < result.length; i++) {
			result[i].fechaReservacion = constant.DiaSemana[result[i].fechaReservacion.getUTCDay()].substring(0,3) + ' ' +  result[i].fechaReservacion.toISOString().substring(0,10);
		};		
		res.send(util.formatResponse('', null, true, 'ErrOfeX001', constErrorTypes, result));
	}).error(function(err){
		res.send(util.formatResponse('Error al obtener estadísticas reservacionesXUltimaSemana', err, false, 'ErrOfeX001', constErrorTypes, null));
	})

};


var numerosGlobales = function(req, res) { 

  	var query = 'Select \'dato\', 0 as \'count\'  FROM Empresas'
  	query += ' UNION ';
  	query += 'Select \'empresas\', Count(*) as \'count\'  FROM Empresas Where EstatusId = ' + constant.estatus.Empresa.authorized;
	query += ' UNION ';
	query += 'Select \'usuarios\', Count(*) as \'count\'  FROM Usuarioes Where EstatusId = ' + constant.estatus.Usuario.authorized;
	query += ' UNION ';
	query += 'Select \'reservaciones\', Count(*) as \'count\'  FROM Reservacions Where estatus != ' + constant.estatus.Reservacion.canceled;
	query += ' UNION ';
	query += 'Select \'cancelaciones\', Count(*) as \'count\' FROM Reservacions Where estatus = ' + constant.estatus.Reservacion.canceled;
	query += ' UNION ';
	query += 'Select \'esperas\', Count(*) as \'count\' FROM Esperas Where estatus = ' + constant.estatus.Espera.new;
	query += ' UNION ';
	query += 'Select \'rutas\', Count(*) as \'count\' FROM Ruta Where EstatusId = ' + constant.estatus.Ruta.authorized;
	query += ' UNION ';
	query += 'Select \'rutascompartidas\', Count(*) as \'count\' FROM RutaCompartidas Where estatus = ' + constant.estatus.RutaCompartida.authorized;


	db.sequelize.query(query).success(function(result) {
		if(result == null){
			res.send(util.formatResponse('Error al obtener estadísticas numerosGlobales', err, false, 'ErrOfeX001', constErrorTypes, null));	
			return;
		}	
		var resultArr = {};
		for (var i = 0; i < result.length; i++) {
			resultArr[result[i].dato] = result[i].count;			
		};		
		res.send(util.formatResponse('', null, true, 'ErrOfeX001', constErrorTypes, resultArr));
	}).error(function(err){
		res.send(util.formatResponse('Error al obtener estadísticas numerosGlobales', err, false, 'ErrOfeX001', constErrorTypes, null));
	})

};