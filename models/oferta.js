// Lista de Oferta por día  por ruta-corrida 
// las ofertas se generan cada día para los 5 días siguientes de tal manera que
// cambios en el numero de lugares ofertados se aplicarán hasta el sexto día impidiendo que haya cambios de oferta en días ya reservados
// se debe considerar un proceso de generación de oferta automático
module.exports = function(sequelize, DataTypes) {
  var Oferta = sequelize.define('Oferta', {
    fechaOferta: {type: DataTypes.DATE, allowNull: false, isDate: true},
    oferta: {type: DataTypes.INTEGER, allowNull: false}
  }, {
    timestamps: false,
    associate: function(models) {
      Oferta.belongsTo(models.Ruta, {foreignKey: 'RutaId'}),
      Oferta.belongsTo(models.RutaCorrida, {foreignKey: 'RutaCorridaId'})
    },
    validate: {
      validateFecha: function(){
        var today = new Date();
        if( (this.fechaOferta ) < today ){
          throw new Error('La oferta no puede ser en fechas pasadas.');
        }
      }
      /*,
      validateDuplicados: function(){
        Oferta.find({where: {fechaOferta: this.fechaOferta, RutaCorridaId: this.RutaCorridaId} }).success(function(previo) {
          if(previo!=null){
            throw new Error('Ya existe un registro para la misma fecha y corrida.');  
          }
        });
      }
      */      
    }    
  })

  return Oferta
}
