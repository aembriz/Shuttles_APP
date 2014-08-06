// Registros de Reservaciones efectuadas
// estatus de reservaciones: 1 = Pendiente, 2 = Confirmada, 3 = Cancelada
module.exports = function(sequelize, DataTypes) {
  var Reservacion = sequelize.define('Reservacion', {
    fechaReservacion: {type: DataTypes.DATE, allowNull: false, isDate: true},
    estatus: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 1}
  }, {
    timestamps: true,
    associate: function(models) {
      Reservacion.belongsTo(models.Ruta, {foreignKey: 'RutaId'}),
      Reservacion.belongsTo(models.RutaCorrida, {foreignKey: 'RutaCorridaId'}),
      Reservacion.belongsTo(models.Usuario, {foreignKey: 'UsuarioId'}),
      Reservacion.belongsTo(models.Oferta, {foreignKey: 'OfertaId'})
    },
    validate: {
      validateFecha: function(){
        /*
        var hoy = new Date();        
        hoy.setUTCHours(0,0,0,0); // TODO: corregir problemas con las fechas y horarios UTC
        console.log(hoy);
        if( (this.fechaReservacion ) < hoy ){
          throw new Error('La reservación no puede ser en fechas pasadas.');
        }
        */
      }
    }
  })

  return Reservacion
}
