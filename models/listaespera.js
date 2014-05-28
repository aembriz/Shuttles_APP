// Registros de lista de espera
// estatus de reservaciones: 1 = En espera, 2 = Asignado, 3 = cancelada, 4 = Obsoleta (ya pasó la fecha de reservación, o el usuario no la tomo)
module.exports = function(sequelize, DataTypes) {
  var Espera = sequelize.define('Espera', {
    fechaReservacion: {type: DataTypes.DATE, allowNull: false, isDate: true},
    estatus: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 1}
  }, {
    timestamps: true,
    associate: function(models) {
      Espera.belongsTo(models.Ruta, {foreignKey: 'RutaId'}),
      Espera.belongsTo(models.RutaCorrida, {foreignKey: 'RutaCorridaId'}),
      Espera.belongsTo(models.Usuario, {foreignKey: 'UsuarioId'}),
      Espera.belongsTo(models.Oferta, {foreignKey: 'OfertaId'}),
      Espera.belongsTo(models.Reservacion, {foreignKey: 'ReservacionId'})
    },
    validate: {
      validateFecha: function(){
        var hoy = new Date();
        hoy.setUTCHours(0,0,0,0); // TODO: corregir problemas con las fechas y horarios UTC
        console.log(hoy);
        if( (this.fechaReservacion ) < hoy ){
          throw new Error('La reservación no puede ser en fechas pasadas.');
        }
      }
    }
  })

  return Espera
}
