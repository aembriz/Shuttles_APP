module.exports = function(sequelize, DataTypes) {
  var Ruta = sequelize.define('Ruta', {
    nombre: {type: DataTypes.STRING, allowNull: false},
    descripcion: {type: DataTypes.STRING, allowNull: false, defaultValue: ''},
    distanciaaprox: {type: DataTypes.FLOAT, allowNull: false, defaultValue: 0},
    tiempoaprox: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
  	origentxt: {type: DataTypes.STRING, allowNull: false},
  	destinotxt: {type: DataTypes.STRING, allowNull: false},
    diasofertafuturo: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 7}
  }, {
	timestamps: false,
    associate: function(models) {
      Ruta.belongsTo(models.Empresa, {as: 'companyowner', foreignKey: 'CompanyownerID'}),
      Ruta.hasMany(models.RutaPunto, {as: 'RutaPuntos', foreignKey: 'RutaId'}),
      Ruta.belongsTo(models.Estatus, {as: 'Estatus', foreignKey: 'EstatusId'}),
      Ruta.hasMany(models.RutaCorrida, {as: 'Corridas', foreignKey: 'RutaId'})
    }	
  })

  return Ruta
}
