// tipo {1 = origen, 2 = destino, 3 = parada, 4 = vuelta}
module.exports = function(sequelize, DataTypes) {
  var RutaPunto = sequelize.define('RutaPunto', {
    indice: DataTypes.INTEGER,
    descripcion: DataTypes.STRING,
    latitud: {type: DataTypes.FLOAT(14,10), allowNull: false, validate: { min: -90, max: 90 } },
    longitud: {type: DataTypes.FLOAT(14,10), allowNull: false, validate: { min: -180, max: 180 } },
    tipo: DataTypes.INTEGER
  }, {
    timestamps: false,
    associate: function(models) {
      RutaPunto.belongsTo(models.Ruta, {foreignKey: 'RutaId'})
    }	
  })

  return RutaPunto
}
