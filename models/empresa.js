module.exports = function(sequelize, DataTypes) {
  var Empresa = sequelize.define('Empresa', {
    nombre: DataTypes.STRING,
    razonsocial: DataTypes.STRING,
    rfc: DataTypes.STRING
  }, {
	timestamps: false
  })

  return Empresa
}
