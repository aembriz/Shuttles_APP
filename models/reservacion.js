// Registros de Reservaciones efectuadas
// estatus de reservaciones: 1 = Reservada, 2 = Cancelada
module.exports = function(sequelize, DataTypes) {
  var Reservacion = sequelize.define('Reservacion', {
    fechaReservacion: {type: DataTypes.STRING, allowNull: false},
    estatus: {type: DataTypes.INTEGER, allowNull: false}
  }, {
    timestamps: true,
    associate: function(models) {
      Reservacion.belongsTo(models.Ruta, {foreignKey: 'RutaId'}),
      Reservacion.belongsTo(models.RutaCorrida, {foreignKey: 'RutaCorridaId'}),
      Reservacion.belongsTo(models.Usuario, {foreignKey: 'UsuarioId'})
    },
    validate: {
      validateFecha: function(){
        if( (this.fechaReservacion ) < today ){
          throw new Error('La reservación no puede ser en fechas pasadas.');
        }
      }
    },
  })

  return Reservacion
}
