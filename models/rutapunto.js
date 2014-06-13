// tipo {1 = origen, 2 = destino, 3 = parada, 4 = vuelta}
module.exports = function(sequelize, DataTypes) {
  var RutaPunto = sequelize.define('RutaPunto', {
    indice: DataTypes.INTEGER,
    descripcion: DataTypes.STRING,
    latitud: {type: DataTypes.FLOAT(14,10), allowNull: false, validate: { min: -90, max: 90 } },
    longitud: {type: DataTypes.FLOAT(14,10), allowNull: false, validate: { min: -180, max: 180 } },
    tipo: DataTypes.INTEGER,
    minutosparallegar: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0, max: 300 } }
  }, {
    timestamps: false,
    associate: function(models) {
      RutaPunto.belongsTo(models.Ruta, {foreignKey: 'RutaId'})
    },
    validate: {
      validateMinutosLlegar: function(){
        if( this.tipo == 1  && this.minutosparallegar > 0 ){
          throw new Error('El tiempo de trayecto esperado para el origen es de 0.');
        }
        else if( (this.tipo == 2 || this.tipo == 3) && this.minutosparallegar == 0 ){
          throw new Error('El tiempo de trayecto esperado para paradas o destino debe ser mayor a 0.');
        }
      }
    }
  })

  return RutaPunto
}
