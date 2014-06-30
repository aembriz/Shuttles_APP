// Registros de Reservaciones efectuadas
// estatus de reservaciones: 1 = Pendiente, 2 = Confirmada, 3 = Cancelada
module.exports = function(sequelize, DataTypes) {
  var RutaParada = sequelize.define('RutaParada', {
    horaestimada: {type: DataTypes.STRING, allowNull: false, defaultValue: ''}
  }, {
    timestamps: false,
    associate: function(models) {
      RutaParada.belongsTo(models.Ruta, {foreignKey: 'RutaId'}),
      RutaParada.belongsTo(models.RutaCorrida, {foreignKey: 'RutaCorridaId'}),
      RutaParada.belongsTo(models.RutaPunto, {foreignKey: 'RutaPuntoId'})
    }
  })

  return RutaParada
}