var db = require('../models')
var constant = require('../config/constant.js');
var util = require('./utilities');
var constErrorTypes = {'ErrRucX000': '', 'ErrRucX000':''};

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

    db.RutaCompartida.findAll({ where: paramWhere, include: [
          {model: db.Empresa, as: 'EmpresaCliente'},
          {model: db.Empresa, as: 'Empresa'},
          {model: db.Ruta}
      ] 
    }).success(function(rutacompartida) {
      //res.send(rutacompartida);
      res.send(util.formatResponse('', null, true, 'ErrRucX001', constErrorTypes, rutacompartida));
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al acceder a las rutas compartidas', err, false, 'ErrRucX002', constErrorTypes, null));
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
      //res.send(rutacompartida);    
      res.send(util.formatResponse('', null, true, 'ErrRucX003', constErrorTypes, rutacompartida));
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al acceder a la ruta compartida', err, false, 'ErrRucX004', constErrorTypes, null));
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
      //res.send( (err === null) ? { msg: '' } : { msg: err } );
      if(err==null){
        res.send(util.formatResponse('Se creó correctamente la ruta compartida', null, true, 'ErrRucX005', constErrorTypes, rutacompartida));
      }
      else{
        res.send(util.formatResponse('Ocurrieron errores al crear la ruta compartida', null, false, 'ErrRucX006', constErrorTypes, null));
      }
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
        //res.send({ rutacompartida: rutacompartida} );      
        res.send(util.formatResponse('Se modificó correctamente la ruta compartida', null, true, 'ErrRucX007', constErrorTypes, rutacompartida));
      }).error(function(err){
        res.send(util.formatResponse('Ocurrieron errores al modificar la ruta compartida', err, false, 'ErrRucX008', constErrorTypes, null));
      });
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al modificar la ruta compartida', err, false, 'ErrRucX009', constErrorTypes, null));
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
        //res.send((!err) ? { msg: '' } : { msg:'error: ' + err });
        if(err==null){
          res.send(util.formatResponse('Se eliminó correctamente la ruta compartida', null, true, 'ErrRucX010', constErrorTypes, null));
        }
        else{
          res.send(util.formatResponse('Ocurrieron errores al eliminar la ruta compartida', err, false, 'ErrRucX011', constErrorTypes, null));
        }
      }).error(function(err){
        res.send(util.formatResponse('Ocurrieron errores al eliminar la ruta compartida', err, false, 'ErrRucX012', constErrorTypes, null));
      });
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al eliminar la ruta compartida', err, false, 'ErrRucX013', constErrorTypes, null));
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
              //res.send({ msg: 'La ruta ya le pertenece a la empresa. No se puede compartir.', success: false});
              res.send(util.formatResponse('La ruta ya pertenece a la empresa, no se puede compartir.', null, false, 'ErrRucX014', constErrorTypes, empresa));
              return;
            }
            var rutacompartida = db.RutaCompartida.build({estatus: constant.estatus.RutaCompartida['authorized'], 
              EmpresaClienteId: empresa.id, RutaId: ruta.id, EmpresaId: ruta.CompanyownerID });
            rutacompartida.save().complete(function (err, rutacompartida) {
                //(err === null) ? { msg: '', success: true } : { msg: err, success: false }
                if(err == null){
                  res.send(util.formatResponse('Se compartió correctamente la ruta', null, true, 'ErrRucX015', constErrorTypes, rutacompartida));
                }                
                else{
                  res.send(util.formatResponse('Ocurrieron errores al compartir la ruta', err, false, 'ErrRucX016', constErrorTypes, null));
                }
            });
          }
          else{
            //res.send({ msg: 'Ocurrieron errores al compartir la ruta. No se encontró a la empresa destino', success: false});  
            res.send(util.formatResponse('Ocurrieron errores al compartir la ruta', null, false, 'ErrRucX017', constErrorTypes, null));
          }
        }).error(function(err){
          //res.send({ msg: 'Ocurrieron errores al compartir la ruta. No se pudo acceder a la empresa destino', success: false, err: err });
          res.send(util.formatResponse('Ocurrieron errores al compartir la ruta', err, false, 'ErrRucX018', constErrorTypes, null));
        });
      }
      else{
        //res.send({ msg: 'Ocurrieron errores al compartir la ruta. No se encontró la ruta.', success: false});
        res.send(util.formatResponse('Ocurrieron errores al compartir la ruta', null, false, 'ErrRucX019', constErrorTypes, null));
      }
    }).error(function(err){
      //res.send({ msg: 'Ocurrieron errores al compartir la ruta. No se pudo acceder a la ruta a compartir', success: false, err: err });
      res.send(util.formatResponse('Ocurrieron errores al compartir la ruta', err, false, 'ErrRucX020', constErrorTypes, null));
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
      if(rutacompartida!=null){    
        rutacompartida.updateAttributes({ estatus: constant.estatus.RutaCompartida.authorized }).success(function(rutacompartida) {
          //res.send( { rutacompartida: rutacompartida} );      
          res.send(util.formatResponse('Se autorizó correctamente la ruta compartida', null, true, 'ErrRucX021', constErrorTypes, rutacompartida));
        }).error(function(err){
          res.send(util.formatResponse('Ocurrieron errores al autorizar la ruta compartida', err, false, 'ErrRucX022', constErrorTypes, null));
        });
      }
      else{
        res.send(util.formatResponse('Ocurrieron errores al autorizar la ruta compartida', null, false, 'ErrRucX023', constErrorTypes, null));
      }
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al autorizar las ruta compartida', err, false, 'ErrRucX024', constErrorTypes, null));
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
      if(rutacompartida!=null){      
        rutacompartida.updateAttributes({ estatus: constant.estatus.RutaCompartida.rejected }).success(function(rutacompartida) {          
          //res.send( { rutacompartida: rutacompartida} );      
          res.send(util.formatResponse('Se rechazó correctamente la ruta compartida', null, true, 'ErrRucX025', constErrorTypes, null));
        }).error(function(err){
          res.send(util.formatResponse('Ocurrieron errores al rechazar la ruta compartida', err, false, 'ErrRucX026', constErrorTypes, null));
        });
      }
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al rechazar la ruta compartida', err, false, 'ErrRucX027', constErrorTypes, null));
    });
  }
};

/*
 * Lista las empresas con las que se puede compartir la ruta indicada 
 * (empresas autorizadas, que no sean la misma que la dueña de la ruta y que no esten compartidas con la ruta)
 */
exports.listEmpresaToShare = function() { 
  return function(req, res){
    var rutaid = req.params.rutaid;    

    db.Ruta.find(rutaid).error(function(err){
      res.send(util.formatResponse('No se pudo acceder a la ruta.', err, false, 'ErrRucX028', constErrorTypes, null));
    }).success(function(ruta){
      if(ruta==null){
        res.send(util.formatResponse('No se pudo acceder a la ruta.', null, false, 'ErrRucX029', constErrorTypes, null));
        return;
      }
      var empresaOwnerId = ruta.CompanyownerID;
      db.RutaCompartida.findAll({ where: {RutaId: ruta.id} }).error(function(err){
        res.send(util.formatResponse('No se pudo verificar las empresas con las que ya se comparte.', err, false, 'ErrRucX030', constErrorTypes, null));
      }).success(function(rutacompartida){
        if(rutacompartida==null){
          res.send(util.formatResponse('No se pudo verificar las empresas con las que ya se comparte.', null, false, 'ErrRucX031', constErrorTypes, null));
          return;
        }
        var excludeEmps = [];
        excludeEmps.push(empresaOwnerId); // se excluye la empresa dueña de la ruta
        for (var i = 0; i < rutacompartida.length; i++) {
          excludeEmps.push(rutacompartida[i].EmpresaClienteId); // recopila las empresas con las que ya se comparte la ruta
        };

        // busca las empresas a mostrar
        db.Empresa.findAll({
          where: {id: {not: excludeEmps}, EstatusId: constant.estatus.Empresa.authorized }
        }).success(function(empresas) {
          res.send(util.formatResponse('', null, true, 'ErrRucX032', constErrorTypes, empresas));
        }).error(function(err){
          res.send(util.formatResponse('Ocurrieron errores al acceder a las empresas', err, false, 'ErrRucX033', constErrorTypes, null));
        });

      });
    })

  }
};

