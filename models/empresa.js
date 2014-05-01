module.exports = function(sequelize, DataTypes) {
  var Empresa = sequelize.define('Empresa', {
    nombre: DataTypes.STRING,
    razonsocial: DataTypes.STRING,
    rfc: DataTypes.STRING
  }, {
	timestamps: false,
    associate: function(models) {
      Empresa.belongsTo(models.Estatus, {as: 'Estatus', foreignKey: 'EstatusId'})
    }		
  })

  return Empresa
}
