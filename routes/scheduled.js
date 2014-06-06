var db = require('../models');
var oferta = require('./oferta');

console.log("Iniciando scheduler...");
iniScheduleOfertas(60, 22);

function iniScheduleOfertas(everyXMins, runAfterXHours){
	setInterval(function(){
		var hoy = new Date();
		if(hoy.getHours() >= runAfterXHours){ // solo corre despues de las ??? horas		
			hoy.setHours(0,0,0,0);

			db.ScheduleLog.find({where: {tipo: 1, createdAt: {gte: hoy} } }).success(function(logg){
				if(logg != null){
					console.log("Ya se ejecutó la generación automática de ofertas el día de hoy: " + hoy);
					return;
				}
				console.log("Ejecutando generacion de ofertas automática.");
				oferta.generaOfertaGlobal(function(result){				
					var logg = db.ScheduleLog.build({tipo: 1, mensaje: 'Se generó oferta: ' + result.success + " ["  + result.msg +  "]" });
					logg.save().complete(function (err, logg) {
						if(err != null){
							console.log('Error al registrar el proceso scheduled. ');
							console.log(err);
						}			
					});
				});
			}).error(function(err){

			});
		}

	}, everyXMins * 60 * 1000);
}