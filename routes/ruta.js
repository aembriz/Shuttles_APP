var db = require('../models')

exports.list = function() { 
  return function(req, res){
    db.Ruta.findAll({
      include: [{
        model: db.Empresa, as: 'companyowner'
      }]
    }).success(function(rutas) {
      res.send(rutas);
    });
  }
};

/*
 * GET ONE 
 */
exports.listOne = function() {
  return function(req, res) {
    var idToFind = req.params.id;
    /*
    db.Ruta.find(idToFind).success(function(ruta) {      
ruta.getCompanyowner().success(function(empresa) {  
  res.send({ruta: ruta, owner: empresa});
})    
    */    
    db.Ruta.find( 
      {
        where: { id: idToFind },
        include: [
          {model: db.Empresa, as: 'companyowner'},
          {model: db.RutaPunto, as: 'RutaPuntos'}
        ]
      }      
    ).success(function(ruta) {      
      res.send(ruta);    

        //res.send(ruta);
    });
  }
};


/*
 * POST create New
 */
exports.add = function() {
  return function(req, res) {
    var ruta = db.Ruta.build(req.body);
    ruta.save().complete(function (err, ruta) {
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
    db.Ruta.find(idToUpdate).success(function(ruta) {      
    ruta.updateAttributes(req.body).success(function(ruta) {
      res.send(
        { ruta: ruta}
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
    db.Ruta.find(idToDelete).success(function(ruta) {
      return ruta.destroy().success(function (err){
        res.send((!err) ? { msg: '' } : { msg:'error: ' + err });
      });
    });
  }
};