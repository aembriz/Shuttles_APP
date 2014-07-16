var db = require('../models')
var util = require('./utilities');
var fs = require('fs');
var constErrorTypes = {'ErrUplX000': '', 'ErrUplX000':''};

exports.uploadImage = function(type) {
  return function(req, res) {  		
  		if(!req.files){
  			res.send(util.formatResponse('No se adjuntó ninguna imágen', null, false, 'ErrUplX000', constErrorTypes, null));   
  			return;
  		}
  		if(!req.files.image){
  			res.send(util.formatResponse('No se adjuntó ninguna imágen', null, false, 'ErrUplX001', constErrorTypes, null));   
  			return;
  		}
console.log("Tamaño img-->" + req.files.image.size);
		if(req.files.image.size > 200000){
			res.send(util.formatResponse('La imágen debe ser menor a 200K [' + req.files.image.size + ']', null, false, 'ErrUplX002', constErrorTypes, null));
			return;  			
		}
		if(req.files.image.type.substring(0, 5) != "image"){
			res.send(util.formatResponse('Se espera un archivo de imágen ', null, false, 'ErrUplX002', constErrorTypes, null));
			return;  			
		}		

  		var param = type.toLowerCase();
  		var paramValue = req.query[param];
  		if(!req.query[param]){
			res.send(util.formatResponse('Se debe indicar el parámetro [' + param + ']', null, false, 'ErrUplX002', constErrorTypes, null));
			return;  			
  		}

	  	if(type.toLowerCase() == 'empresa'){
			db.Empresa.find({ where: { id: paramValue } }).complete(function(err, empresa) {
				if(err!=null || empresa == null){
					res.send(util.formatResponse('No se pudo acceder a la empressa [' + paramValue + ']', null, false, 'ErrUplX003', constErrorTypes, null));
					borraArchivo(req.files.image.path);
					return;
				}
				guardaArchivo(req.files.image.path, "empresa_" + paramValue, function(err, FileName){
					if(err!=null){
						res.send(util.formatResponse('No se pudo registrar la imágen', err, false, 'ErrUplX004', constErrorTypes, null));
						return;
					}
					empresa.updateAttributes({logo: FileName}).complete(function(err, empresa){
						if(err!=null){
							res.send(util.formatResponse('Error al actualizar la empresa', err, false, 'ErrUplX005', constErrorTypes, null));						
						}
						else{
							res.send(util.formatResponse('Se actualizó correctamente la foto', null, true, 'ErrUplX006', constErrorTypes, empresa));
						}
					})
				} );				
			});
	  	}
	  	else if(type.toLowerCase() == 'usuario'){
			db.Usuario.find({ where: { id: paramValue } }).complete(function(err, usuario) {
				if(err!=null || usuario == null){
					res.send(util.formatResponse('No se pudo acceder al usuario [' + paramValue + ']', err, false, 'ErrUplX007', constErrorTypes, null));
					borraArchivo(req.files.image.path);
					return;
				}
				guardaArchivo(req.files.image.path, "usuario_" + paramValue, function(err, FileName){
					if(err!=null){
						res.send(util.formatResponse('No se pudo registrar la imágen', err, false, 'ErrUplX008', constErrorTypes, null));
						return;
					}
					usuario.updateAttributes({foto: FileName}).complete(function(err, usuario){
						if(err!=null){
							res.send(util.formatResponse('Error al actualizar al usuario', err, false, 'ErrUplX009', constErrorTypes, null));						
						}
						else{
							res.send(util.formatResponse('Se actualizó correctamente la foto', null, true, 'ErrUplX006', constErrorTypes, usuario));
						}
					})
				} );
			});
	  	}
	  	else{
	  		res.send(util.formatResponse('Opción no válida', null, false, 'ErrUplX0010', constErrorTypes, null));
	  	}
	}
}

var guardaArchivo = function(originalFilePath, newName, callback){

 		var ext = originalFilePath.split(".");
  		ext = (ext.length > 1) ? ext[ext.length-1] : "";

		var newFileName = "/files/" + newName + "." + ext;
		var newPath = __dirname + "/../public" +  newFileName;

	fs.rename(originalFilePath, newPath, function(err){
		if(err!=null){
			console.log(err);
			borraArchivo(originalFilePath);
			callback(err, null);
		}
		else{
			borraArchivo(originalFilePath);
			callback(null, newFileName);
		}
	});

}

var borraArchivo = function(filePath){
	fs.unlink(filePath, function(err){
		if(err!=null){
			console.log(err);
		}
	})
}