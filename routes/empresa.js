var db = require('../models')
var mail = require('./mailing');

var constEstatus = {'new': 1, 'authorized': 3, 'rejected': 4}

exports.list = function() { 
	return function(req, res){
    var sts = 0;
    if('estatus' in req.query){
      sts = constEstatus[req.query.estatus];
    }

    if(sts > 0 ){
      db.Empresa.findAll({
        where: {EstatusId: sts},
        include: [{
          model: db.Estatus, as: 'Estatus', attributes: ['id', 'stsNombre']
        }]
      }).success(function(empresas) {
        res.send(empresas);
      });
    }
    else{
      db.Empresa.findAll({
        include: [{
          model: db.Estatus, as: 'Estatus', attributes: ['id', 'stsNombre']
        }]
      }).success(function(empresas) {
        res.send(empresas);
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
    db.Empresa.find({ where: { id: idToFind } }).success(function(empresa) {      
        res.send(empresa);
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
      res.send({msg: 'No se han especificado los datos del usuario.'});
      return;
    }

    // asignación de estatus de instancias
    var sts = constEstatus.new;
    if(!preregister) {      
      sts = constEstatus.authorized;
    }

    // validate Usuario
    var usrData = {nombre: req.body.usuarionombre, email: req.body.usuarioemail, password: req.body.usuariopassword, 
      EstatusId: sts, EmpresaId: 0}
    var usuario = db.Usuario.build(usrData);   
    var valerr = usuario.validate();
    if(valerr){
      console.log(valerr);  
      res.send({msg: 'Errores al validar al usuario administrador.', err: valerr});
      return;
    }
    
    // validate Empresa
    req.body.EstatusId = sts;
    var empresa = db.Empresa.build(req.body);  
    var valerr = empresa.validate();
    if(valerr){
      console.log(valerr);  
      res.send({msg: 'Errores al validar la empresa.', err: valerr});
      return;
    }    

    // persisting data
    db.Empresa.find({ where: db.Sequelize.or( {nombre: empresa.nombre}, {rfc: empresa.rfc} ) }).success(function(empresaTmp) {
      if(empresaTmp != null){
        res.send( {msg: 'Ya existe una empresa registrada con el mismo Nombre o RFC.'} )
      }
      else {
        empresa.save().success(function(emp){
          emp = emp.dataValues;
          usuario.setDataValue('EmpresaId', emp.id); // se asigna id de la empresa al usuario
          usuario.save().success(function(usr){            
            res.send({msg: ''});
            mail.notifyCompanyAuthorization(usr, emp, true);  // notificación
          }).error(function(err){
            emp.destroy(); // se elimina la empresa que había sido regstrada
            res.send({msg: 'Errores al registrar al usuario administrador.', err: err});
          });
        }).error(function(err){
          res.send({msg: 'Errores al registrar la empresa.', err: err});
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
      db.Empresa.find(idToUpdate).success(function(empresa) { 
      delete req.body.EstatusId // elimina el atributo estatus porque este solo se maneja internamente
  		empresa.updateAttributes(req.body).success(function(empresa) {
  			res.send(
  				{ empresa: empresa}
  			);      
  		});
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
      return empresa.destroy().success(function (err){
        res.send((!err) ? { msg: '' } : { msg:'error: ' + err });
      });
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
    db.Empresa.find(idToUpdate).success(function(empresa) {
    empresa.updateAttributes({ EstatusId: constEstatus.authorized }).success(function(empresa) {
      // autorizar al usuario administrador (el único regiostrado al momento)
      db.Usuario.find({where: {EmpresaId: empresa.id} }).success(function(usr){
        usr.updateAttributes({ EstatusId: constEstatus.authorized }).success(function(empresa) {
          res.send({ empresa: empresa} );
        });
        mail.notifyCompanyAuthorization(usr, empresa, true);  // notificación
      }).error(function(err){
        res.send({ empresa: empresa, msg: 'No se pudo autorizar al usuario administrador de la empresa.', err: err} );      
      });
    });
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
      empresa.updateAttributes({ EstatusId: constEstatus.rejected }).success(function(empresa) {
        // notifica el rechazo
        db.Usuario.find({where: {EmpresaId: empresa.id} }).success(function(usr){
          mail.notifyCompanyAuthorization(usr, empresa, false);  // notificación  
        });        

        // eliminar a los usuarios relacionados
        db.Usuario.destroy({EmpresaId: empresa.id}).success(function(affectedRows){
          res.send({ empresa: empresa});
        }).error(function(err){
          res.send({ empresa: empresa, msg: 'No se pudieron eliminar a los usuarios relacionados', err: err});
        });

      });
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
        res.send( {msg: 'Ya existe una empresa registrada con el mismo Nombre o RFC.', empresa: empresa} )
      }
      else {
        res.send( { msg: '' } );          
      }
    });
  }
};