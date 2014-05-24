// Rutas favoritas de cada usuario
module.exports = function(sequelize, DataTypes) {
  var Favorita = sequelize.define('Favorita', {
    fechaUltimoUso: {type: DataTypes.DATE, defaultValue: '2014-01-01', allowNull: false},
    usos: {type: DataTypes.INTEGER, defaultValue: 0, allowNull: false}
  }, {
    timestamps: false,
    associate: function(models) {
      Favorita.belongsTo(models.Ruta, {foreignKey: 'RutaId'}),
      Favorita.belongsTo(models.Usuario, {foreignKey: 'UsuarioId'})
    }
  })

  return Favorita
}