var db = require('../models')
var constant = require('../config/constant.js')

exports.list = function() { 
  return function(req, res){
    var paramWhere = {};

    if(req.query.empresa){
      paramWhere.EmpresaId = req.query.empresa;
      if(req.user.role != 'ADMIN') paramWhere.EmpresaId = req.user.EmpresaId;
    }    
    if(req.query.empresacliente){
      paramWhere.EmpresaClienteId = req.query.empresacliente;
      if(req.user.role != 'ADMIN') paramWhere.EmpresaClienteId = req.user.EmpresaId;
    }
    if(req.query.ruta){
      paramWhere.RutaId = req.query.ruta;
    }    
    if(req.query.estatus){
      paramWhere.estatus = constant.estatus.RutaCompartida[req.query.estatus];
    }        

    if(req.user.role != 'ADMIN') paramWhere.EmpresaClienteId = req.user.EmpresaId;

    db.RutaCompartida.findAll({ where: paramWhere }).success(function(rutacompartida) {
      res.send(rutacompartida);
    });
  }
};

/*
 * GET ONE 
 */
exports.listOne = function() {
  return function(req, res) {
    var idToFind = req.params.id;
    db.RutaCompartida.find( idToFind ).success(function(rutacompartida) {      
      res.send(rutacompartida);    
    });
  }
};


/*
 * POST create New
 */
exports.add = function() {
  return function(req, res) {
    var rutacompartida = db.RutaCompartida.build(req.body);
    rutacompartida.save().complete(function (err, rutacompartida) {
      res.send(
        (err === null) ? { msg: '' } : { msg: err }
      );          
    });
  }
};

/*
 * UPDATE one
 */
exports.update = function() {
  return function(req, res) {
    var idToUpdate = req.params.id;
    db.RutaCompartida.find(idToUpdate).success(function(rutacompartida) {      
    rutacompartida.updateAttributes(req.body).success(function(rutacompartida) {
      res.send(
        { rutacompartida: rutacompartida}
      );      
    });
    });
  }
};

/*
 * DELETE one
 */
exports.delete = function() {
  return function(req, res) {
    var idToDelete = req.params.id;
    db.RutaCompartida.find(idToDelete).success(function(rutacompartida) {
      return rutacompartida.destroy().success(function (err){
        res.send((!err) ? { msg: '' } : { msg:'error: ' + err });
      });
    });
  }
};


// *****************************************************

/*
 * POST Comparte la ruta indicada con la empresa indicada
 */
exports.share = function() {
  return function(req, res) {

    var empresaid = req.params.empresaid;
    var rutaid = req.params.rutaid;

    db.Ruta.find(rutaid).success(function(ruta){
      if(ruta!=null){
        db.Empresa.find(empresaid).success(function(empresa){  
          if(empresa!=null){
            if(ruta.CompanyownerID == empresa.id){
              res.send({ msg: 'La ruta ya le pertenece a la empresa. No se puede compartir.', success: false});
              return;
            }
            var rutacompartida = db.RutaCompartida.build({estatus: constant.estatus.RutaCompartida['authorized'], 
              EmpresaClienteId: empresa.id, RutaId: ruta.id, EmpresaId: ruta.CompanyownerID });
            rutacompartida.save().complete(function (err, rutacompartida) {
              res.send(
                (err === null) ? { msg: '', success: true } : { msg: err, success: false }
              );          
            });
          }
          else{
            res.send({ msg: 'Ocurrieron errores al compartir la ruta. No se encontró a la empresa destino', success: false});  
          }
        }).error(function(err){
          res.send({ msg: 'Ocurrieron errores al compartir la ruta. No se pudo acceder a la empresa destino', success: false, err: err });
        });
      }
      else{
        res.send({ msg: 'Ocurrieron errores al compartir la ruta. No se encontró la ruta.', success: false});
      }
    }).error(function(err){
      res.send({ msg: 'Ocurrieron errores al compartir la ruta. No se pudo acceder a la ruta a compartir', success: false, err: err });
    });

  }
};

/*
 * Autorizar solicitud de compartir
 */
exports.authorize = function() {
  return function(req, res) {
    var idToUpdate = req.params.id;
    db.RutaCompartida.find(idToUpdate).success(function(rutacompartida) {      
    rutacompartida.updateAttributes({ estatus: constant.estatus.RutaCompartida.authorized }).success(function(rutacompartida) {
      res.send(
        { rutacompartida: rutacompartida}
      );      
    });
    });
  }
};

/*
 * Rechazar solicitud de compartir
 */
exports.reject = function() {
  return function(req, res) {
    var idToUpdate = req.params.id;
    db.RutaCompartida.find(idToUpdate).success(function(rutacompartida) {      
    rutacompartida.updateAttributes({ estatus: constant.estatus.RutaCompartida.rejected }).success(function(rutacompartida) {
      res.send(
        { rutacompartida: rutacompartida}
      );      
    });
    });
  }
};
