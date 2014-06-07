// Rutas favoritas de cada usuario
module.exports = function(sequelize, DataTypes) {
  var Sugerencia = sequelize.define('Sugerencia', {
    comentario: {type: DataTypes.STRING, allowNull: false},
    tipo: {type: DataTypes.INTEGER, defaultValue: 1, allowNull: false}
  }, {
    timestamps: true,
    associate: function(models) {
      Sugerencia.belongsTo(models.Ruta, {foreignKey: 'RutaId'}),
      Sugerencia.belongsTo(models.RutaCorrida, {foreignKey: 'RutaCorridaId'}),
      Sugerencia.belongsTo(models.Usuario, {foreignKey: 'UsuarioId'}),
      Sugerencia.belongsTo(models.Empresa, {foreignKey: 'EmpresaId'})
    }
  })

  return Sugerencia;
}