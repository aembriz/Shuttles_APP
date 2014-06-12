// Lista de Oferta por día  por ruta-corrida 
// las ofertas se generan cada día para los 5 días siguientes de tal manera que
// cambios en el numero de lugares ofertados se aplicarán hasta el sexto día impidiendo que haya cambios de oferta en días ya reservados
// se debe considerar un proceso de generación de oferta automático
// complementary key se usa como copia de la rutacorrida para crear el índice único en conjunto con fecha
module.exports = function(sequelize, DataTypes) {
  var Oferta = sequelize.define('Oferta', {
    fechaOferta: {type: DataTypes.DATE, allowNull: false, isDate: true, unique: 'ofertaunica'},
    oferta: {type: DataTypes.INTEGER, allowNull: false},
    reserva: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    complementarykey: {type: DataTypes.INTEGER, allowNull: false, unique: 'ofertaunica'}
  }, {
    timestamps: false,
    associate: function(models) {
      Oferta.belongsTo(models.Ruta, {foreignKey: 'RutaId'}),
      Oferta.belongsTo(models.RutaCorrida, {foreignKey: 'RutaCorridaId'})
    },
    validate: {
      validateOferta: function(){
        if(this.oferta < this.reservada){
          throw new Error('La cantidad reservada no puede ser mayor a la ofertada.');
        }
      },
      validateFecha: function(){
        var today = new Date();
        this.setDataValue('complementarykey', this.RutaCorridaId)
        if( (this.fechaOferta ) < today ){
          throw new Error('La oferta no puede crearse en fechas pasadas.');
        }
      }
    }            
  })

  return Oferta
}
