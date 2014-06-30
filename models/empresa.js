var sysconfig = require('../config/systemconfig.js');

module.exports = function(sequelize, DataTypes) {
  var Empresa = sequelize.define('Empresa', {
    nombre: DataTypes.STRING,
    razonsocial: DataTypes.STRING,
    rfc: DataTypes.STRING,
    direccion: {type: DataTypes.STRING, allowNull: true},
    sede: {type: DataTypes.STRING, allowNull: true},
    logo: {type: DataTypes.STRING}
  }, {
	timestamps: false,
    associate: function(models) {
      Empresa.belongsTo(models.Estatus, {as: 'Estatus', foreignKey: 'EstatusId'})
    },
    getterMethods   : {
      logoUrl : function()  { 
        var gUrl = sysconfig.server.url; 
        var img = this.getDataValue('logo');
        if(img==null || img.length == 0){
          img = "/images/nologo.png";
        }
        return gUrl + img;       
      }
    }	
  })

  return Empresa
}
