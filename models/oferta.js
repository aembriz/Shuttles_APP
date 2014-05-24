// Lista de Oferta por día  por ruta-corrida 
// las ofertas se generan cada día para los 5 días siguientes de tal manera que
// cambios en el numero de lugares ofertados se aplicarán hasta el sexto día impidiendo que haya cambios de oferta en días ya reservados
// se debe considerar un proceso de generación de oferta automático
module.exports = function(sequelize, DataTypes) {
  var Oferta = sequelize.define('Oferta', {
    fechaOferta: {type: DataTypes.STRING, allowNull: false},
    oferta: {type: DataTypes.INTEGER, allowNull: false}
  }, {
    timestamps: false,
    associate: function(models) {
      Oferta.belongsTo(models.Ruta, {foreignKey: 'RutaId'}),
      Oferta.belongsTo(models.RutaCorrida, {foreignKey: 'RutaCorridaId'})
    },
    validate: {
      validateFecha: function(){
        if( (this.fechaReservacion ) < today ){
          throw new Error('La oferta no puede ser en fechas pasadas.');
        }
      }
    },
  })

  return Oferta
}
