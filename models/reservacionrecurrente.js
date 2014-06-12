// Registros de Reservaciones efectuadas
// estatus de reservaciones: 1 = Pendiente, 2 = Confirmada, 3 = Cancelada
module.exports = function(sequelize, DataTypes) {
  var ReservacionRecurrente = sequelize.define('ReservacionRecurrente', {    
    estatus: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 2},
    complementarykey: {type: DataTypes.STRING, allowNull: false, unique: true}
  }, {
    timestamps: true,
    associate: function(models) {
      ReservacionRecurrente.belongsTo(models.Ruta, {foreignKey: 'RutaId'}),
      ReservacionRecurrente.belongsTo(models.RutaCorrida, {foreignKey: 'RutaCorridaId'}),
      ReservacionRecurrente.belongsTo(models.Usuario, {foreignKey: 'UsuarioId'})
    },
    validate: {
      validateDumb: function(){
        this.setDataValue('complementarykey', this.UsuarioId +  "-" + this.RutaCorridaId)
      }
    }
  })

  return ReservacionRecurrente
}
