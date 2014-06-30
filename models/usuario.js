var sysconfig = require('../config/systemconfig.js');
var url = require('url');

module.exports = function(sequelize, DataTypes) {
  var Usuario = sequelize.define('Usuario', {
    nombre: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: {isEmail: true} },
    password: { type: DataTypes.STRING },
    role: {type: DataTypes.ENUM, values: ['ADMIN', 'EMPRESA', 'USUARIO'], defaultValue: 'USUARIO' },
    area: {type: DataTypes.STRING},
    telefono: {type: DataTypes.STRING},
    foto: {type: DataTypes.STRING},
    saldo: {type: DataTypes.DECIMAL(10,2), allowNull: false, validate: { min: 0 }, defaultValue: 0}
  }, {
	timestamps: true,
    associate: function(models) {
      Usuario.belongsTo(models.Estatus, {as: 'Estatus', foreignKey: 'EstatusId'}),
      Usuario.belongsTo(models.Empresa, {as: 'Empresa', foreignKey: 'EmpresaId'})
    },
    instanceMethods: {
      validPassword: function(pwd) { 
        return ((this.password == pwd));
      }
    },
    getterMethods   : {
      fotoUrl : function()  { 
        var gUrl = sysconfig.server.url; 
        var img = this.getDataValue('foto');
        if(img==null || img.length == 0){
          img = "/images/nofoto.png";
        }        
        return gUrl + img;       
      }
    }    		
  })

  return Usuario;
}
