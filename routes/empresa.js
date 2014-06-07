var db = require('../models')
var mail = require('./mailing');
var constant = require('../config/constant.js');
var util = require('./utilities');
var constErrorTypes = {'ErrEmpX000': '', 'ErrEmpX000':''};

exports.list = function() { 
	return function(req, res){
    var sts = 0;

    if('estatus' in req.query){
      sts = constant.estatus.Empresa[req.query.estatus];
    }

    if(sts > 0 ){
      db.Empresa.findAll({
        where: {EstatusId: sts},
        include: [{
          model: db.Estatus, as: 'Estatus', attributes: ['id', 'stsNombre']
        }]
      }).success(function(empresas) {
        res.send(util.formatResponse('', null, true, 'ErrEmpX000', constErrorTypes, empresas));
      }).error(function(err){
        res.send(util.formatResponse('Hubieron errores al acceder a las empresas', err, false, 'ErrEmpX001', constErrorTypes, null));
      });
    }
    else{
      db.Empresa.findAll({
        include: [{
          model: db.Estatus, as: 'Estatus', attributes: ['id', 'stsNombre']
        }]
      }).success(function(empresas) {
        res.send(util.formatResponse('', null, true, 'ErrEmpX000', constErrorTypes, empresas));
      }).error(function(err){
        res.send(util.formatResponse('Hubieron errores al acceder a las empresas', err, false, 'ErrEmpX002', constErrorTypes));
      });
    }
	}
};

/*
 * GET ONE 
 */
exports.listOne = function() {
  return function(req, res) {
    var idToFind = req.params.id;
    if(req.user.role != 'ADMIN') idToFind = req.user.EmpresaId;

    db.Empresa.find({ where: { id: idToFind } }).success(function(empresa) {      
        res.send(util.formatResponse('', null, true, 'ErrEmpX000', constErrorTypes, empresa));
    }).error(function(err){
      res.send(util.formatResponse('No se pudo acceder a la empresa', err, false, 'ErrEmpX003', constErrorTypes));
    });
  }
};


/*
 * POST preregistro de empresa (acepta datos del usuario administrador para darlo de alta)
 * en caso de ser preregistro debe venir la bandera preregister=true
 */
exports.add = function(preregister) {
  return function(req, res) {    
    // alta del usuario administrador de la empresa
    if(!(req.body.usuarionombre && req.body.usuarioemail && req.body.usuariopassword) ){
      //res.send({msg: 'No se han especificado los datos del usuario.'});
      res.send(util.formatResponse('No se especificaron los datos del usuario', null, false, 'ErrEmpX004', constErrorTypes));
      return;
    }

    // asignación de estatus de instancias
    var sts = constant.estatus.Empresa.new;
    if(!preregister) {      
      sts = constant.estatus.Empresa.authorized;
    }

    // validate Usuario
    var usrData = {nombre: req.body.usuarionombre, email: req.body.usuarioemail, password: req.body.usuariopassword, 
      EstatusId: sts, EmpresaId: 0, role: 'EMPRESA'}
    var usuario = db.Usuario.build(usrData);   
    var valerr = usuario.validate();
    if(valerr){
      console.log(valerr);  
      //res.send({msg: 'Errores al validar al usuario administrador.', err: valerr});
      res.send(util.formatResponse('Errores al validar al usuario administrador', null, false, 'ErrEmpX005', constErrorTypes));
      return;
    }

    // hay segundo usuario admin
    var usuario2 = null;
    if(req.body.usuario2nombre && req.body.usuario2email  && req.body.usuario2password){
      var usrData2 = {nombre: req.body.usuario2nombre, email: req.body.usuario2email, password: req.body.usuario2password, 
        EstatusId: sts, EmpresaId: 0, role: 'EMPRESA'}
      usuario2 = db.Usuario.build(usrData2);   
      var valerr = usuario2.validate();
      if(valerr){
        console.log(valerr);  
        //res.send({msg: 'Errores al validar al segundo usuario administrador.', err: valerr});
        res.send(util.formatResponse('Errores al validar al segundo usuario administrador', null, false, 'ErrEmpX006', constErrorTypes));
        return;
      }      
    }
    
    // validate Empresa
    req.body.EstatusId = sts;
    var empresa = db.Empresa.build(req.body);  
    var valerr = empresa.validate();
    if(valerr){      
      res.send(util.formatResponse('Errores al validar la empresa', valerr, false, 'ErrEmpX030', constErrorTypes));
      return;
    }    

    // persisting data
    db.Empresa.find({ where: db.Sequelize.or( {nombre: empresa.nombre}, {rfc: empresa.rfc} ) }).success(function(empresaTmp) {
      if(empresaTmp != null){
        //res.send( {msg: 'Ya existe una empresa registrada con el mismo Nombre o RFC.'} )
        res.send(util.formatResponse('Ya existe una empresa registrada con el mismo Nombre o RFC', null, false, 'ErrEmpX007', constErrorTypes));
      }
      else {
        empresa.save().success(function(emp){
          var empDb = emp;
          emp = emp.dataValues;
          usuario.setDataValue('EmpresaId', emp.id); // se asigna id de la empresa al usuario
          usuario.save().success(function(usr){
            if(usuario2 != null){
              usuario2.setDataValue('EmpresaId', emp.id); // se asigna id de la empresa al usuario
              usuario2.save().error(function(err){
                //res.send({msg: 'Errores al registrar al usuario administrador secundario.', err: err});
                if(err!=null){
                  res.send(util.formatResponse('Ocurrieron errores al registrar al administrador secundario', err, false, 'ErrEmpX009', constErrorTypes));
                }
              });
            }            
            if(sts == constant.estatus.Empresa.authorized){
              mail.notifyCompanyAuthorization(usr, emp, true);  // notificación
            }
            res.send(util.formatResponse('Se registró la empresa correctamente', null, true, 'ErrEmpX031', constErrorTypes));
          }).error(function(err){
            empDb.destroy(); // se elimina la empresa que había sido regstrada
            //res.send({msg: 'Errores al registrar al usuario administrador.', err: err});
            res.send(util.formatResponse('Ocurrienron errores al registrar al administrador', err, false, 'ErrEmpX008', constErrorTypes));
          });
        }).error(function(err){
          //res.send({msg: 'Errores al registrar la empresa.', err: err});
          res.send(util.formatResponse('Ocurrieron errores al registrar la empresa', err, false, 'ErrEmpX010', constErrorTypes));
        });

      }
    });

  }
};


/*
 * UPDATE one
 */
exports.update = function() {
  return function(req, res) {
    if(!(req.body == null || req.body == undefined) ){
      var idToUpdate = req.params.id;
      if(req.user.role != 'ADMIN' && idToUpdate != req.user.EmpresaId){
        //res.send({msg: 'No tiene permisos para modificar otra empresa', success: false})
        res.send(util.formatResponse('No tiene permisos para modificar esta empresa', null, false, 'ErrEmpX011', constErrorTypes));
        return;
      }

      db.Empresa.find(idToUpdate).success(function(empresa) { 
        if(empresa!=null){
          delete req.body.EstatusId // elimina el atributo estatus porque este solo se maneja internamente
      		empresa.updateAttributes(req.body).success(function(empresa) {
            res.send(util.formatResponse('', null, true, 'ErrEmpX000', constErrorTypes, empresa));
      		}).error(function(err){
            res.send(util.formatResponse('Ocurrieron errores al actualizar la empresa', err, false, 'ErrEmpX012', constErrorTypes));
          });
        }
        else{
          res.send(util.formatResponse('Ocurrieron errores al actualizar la empresa', null, false, 'ErrEmpX027', constErrorTypes));
        }
      }).error(function(err){
        res.send(util.formatResponse('No se pudo acceder a la empresa', err, false, 'ErrEmpX013', constErrorTypes));
      });
    }

  }
};

/*
 * DELETE one
 */
exports.delete = function() {
  return function(req, res) {
    var idToDelete = req.params.id;
    db.Empresa.find(idToDelete).success(function(empresa) {
      if(empresa!=null){
        return empresa.destroy().success(function (err){
          //res.send((!err) ? { msg: '' } : { msg:'error: ' + err });
          if(err!=null){
            res.send(util.formatResponse('Ocurrieron errores al eliminar la empresa', err, false, 'ErrEmpX014', constErrorTypes));
          }
          else{
            res.send(util.formatResponse('Se eliminó la empresa correctamente', null, true, 'ErrEmpX015', constErrorTypes));
          }        
        });
      }
      else{
        res.send(util.formatResponse('Ocurrieron errores al eliminar la empresa', null, false, 'ErrEmpX028', constErrorTypes));
      }
    });
  }
};

// *****************************************************

/*
 * Autorizar solicitud de alta empresa
 */
exports.authorize = function() {
  return function(req, res) {
    var idToUpdate = req.params.id;
    db.Empresa.find({where: {id: idToUpdate, EstatusId: constant.estatus.Empresa.new }  }).success(function(empresa) {
      if(empresa != null){      
        empresa.updateAttributes({ EstatusId: constant.estatus.Empresa.authorized }).success(function(empresa) {
          // autorizar al usuario administrador (el único regiostrado al momento)
          db.Usuario.findAll({where: ['EmpresaId=? and role=?', empresa.id, 'EMPRESA'] }).success(function(usrs){
            if(usrs != null){
              for (var i = 0; i < usrs.length; i++) {
                var usr = usrs[i];
                usr.updateAttributes({ EstatusId: constant.estatus.Empresa.authorized }).success(function(usr) {
                  mail.notifyCompanyAuthorization(usr, empresa, true);  // notificación
                });
              };
              //res.send({ msg: 'Se autorizó correctamente la empresa y los usuarios administradores.'} );
              res.send(util.formatResponse('Se autorizó correctamente la empresa y los usuarios administradores', null, true, 'ErrEmpX016', constErrorTypes));
            }
            else{
              //res.send({ msg: 'Se autorizó correctamente la empresa y pero ocurrieron errores al autorizar a los usuarios administradores.'} );
              res.send(util.formatResponse('Se autorizó correctamente la empresa pero ocurrieron errores al autorizar a los usuarios administradores', null, false, 'ErrEmpX017', constErrorTypes));
            }
          }).error(function(err){
            //res.send({ empresa: empresa, msg: 'No se pudo autorizar al usuario administrador de la empresa.', err: err} );
            res.send(util.formatResponse('Se autorizó la empresa pero ocurrieron errores al autorizar a los usuarios administradores', err, false, 'ErrEmpX018', constErrorTypes));
          });
        }).error(function(err){
          //res.send({msg: 'No se pudo autorizar la empresa, error al actualizar el registro la empresa.', err: err});
          res.send(util.formatResponse('Ocurrieron errores al autorizar la empresa', err, false, 'ErrEmpX019', constErrorTypes));
        });
      }
      else{
        //res.send({msg: 'No se pudo autorizar la empresa, posiblemente la empresa ya esté autorizada.'});
        res.send(util.formatResponse('No se pudo autorizar la empresa, posiblemente ya esté autorizada', null, false, 'ErrEmpX020', constErrorTypes));
      }
    }).error(function(err){
      //res.send({msg: 'No se pudo autorizar la empresa, error al acceder a la empresa.', err: err});
      res.send(util.formatResponse('Ocurrieron errores al acceder a la empresa', err, false, 'ErrEmpX021', constErrorTypes));
    });
  }
};

/*
 * Rechazar solicitud de alta empresa
 */
exports.reject = function() {
  return function(req, res) {
    var idToUpdate = req.params.id;
    db.Empresa.find(idToUpdate).success(function(empresa) {      
      if(empresa!=null){
        empresa.updateAttributes({ EstatusId: constant.estatus.Empresa.rejected }).success(function(empresa) {
          // notifica el rechazo
          db.Usuario.find({where: ['EmpresaId=? and role=?', empresa.id, 'EMPRESA'] }).success(function(usr){
            mail.notifyCompanyAuthorization(usr, empresa, false);  // notificación  
          }).error(function(err){
            res.send(util.formatResponse('Se rechazó correctamente a la empresa pero ocurrieron errores al notificar a los administradore', err, false, 'ErrEmpX022', constErrorTypes));
          });        

          // eliminar a los usuarios relacionados
          db.Usuario.destroy({EmpresaId: empresa.id}).success(function(affectedRows){            
            res.send(util.formatResponse('', null, true, 'ErrEmpX000', constErrorTypes, empresa));
          }).error(function(err){
            //res.send({ empresa: empresa, msg: 'No se pudieron eliminar a los usuarios relacionados', err: err});
            res.send(util.formatResponse('Se rechazó correctamente a la empresa pero ocurrieron errores al eliminar a los usuarios administradores', err, false, 'ErrEmpX023', constErrorTypes));
          });

        }).error(function(err){
          res.send(util.formatResponse('Ocurrieron errores al rechazar a la empresa', err, false, 'ErrEmpX023', constErrorTypes));
        });
      }
      else{
        res.send(util.formatResponse('Ocurrieron errores al rechazar la empresa', err, false, 'ErrEmpX029', constErrorTypes));
      }
    }).error(function(err){
      res.send(util.formatResponse('Ocurrieron errores al rechazar a la empresa', err, false, 'ErrEmpX024', constErrorTypes));
    });
  }
};


/*
 * Empresa ya existe
 */
exports.alreadyExist = function() {
  return function(req, res) {        
    db.Empresa.find({ where: db.Sequelize.or( {nombre: req.query.nombre}, {rfc: req.query.rfc} ) }).success(function(empresa) {
      if(empresa != null){
        //res.send( {msg: 'Ya existe una empresa registrada con el mismo Nombre o RFC.', empresa: empresa} )
        res.send(util.formatResponse('Ya existe una empresa registrada con el mismo Nombre o RFC', null, false, 'ErrEmpX025', constErrorTypes));
      }
      else {
        //res.send( { msg: '' } );          
        res.send(util.formatResponse('', null, true, 'ErrEmpX026', constErrorTypes));
      }
    });
  }
};