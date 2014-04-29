// tipo {1 = origen, 2 = destino, 3 = parada, 4 = vuelta}
module.exports = function(sequelize, DataTypes) {
  var RutaPunto = sequelize.define('RutaPunto', {
    indice: DataTypes.INTEGER,
    descripcion: DataTypes.STRING,
    latitud: DataTypes.FLOAT,
    longitud: DataTypes.FLOAT,
    tipo: DataTypes.INTEGER
  }, {
    timestamps: false,
    associate: function(models) {
      RutaPunto.belongsTo(models.Ruta, {foreignKey: 'RutaId'})
    }	
  })

  return RutaPunto
}
