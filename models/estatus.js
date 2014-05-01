module.exports = function(sequelize, DataTypes) {
  var Estatus = sequelize.define('Estatus', {
    stsNombre: {type: DataTypes.STRING, validate: {notNull: true, isAlphanumeric: true} },
    stsNumero: {type: DataTypes.INTEGER, validate: {notNull: true, isInt: true, min: 1, max:10} },
    stsPara: DataTypes.STRING
  }, {
	timestamps: false
  })

  return Estatus
}
