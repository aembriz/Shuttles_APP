module.exports = function(sequelize, DataTypes) {
  var Ruta = sequelize.define('Ruta', {
    nombre: DataTypes.STRING,
    descripcion: DataTypes.STRING,
    distanciaaprox: DataTypes.FLOAT,
    tiempoaprox: DataTypes.INTEGER,
	origentxt: DataTypes.STRING,
	destinotxt: DataTypes.STRING
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
