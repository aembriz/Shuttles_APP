// Rutas favoritas de cada usuario
module.exports = function(sequelize, DataTypes) {
  var Favorita = sequelize.define('Favorita', {
    fechaUltimoUso: {type: DataTypes.DATE, defaultValue: '2014-01-01', allowNull: false},
    usos: {type: DataTypes.INTEGER, defaultValue: 0, allowNull: false},
    complementarykey: {type: DataTypes.STRING, allowNull: false, unique: true}
  }, {
    timestamps: false,
    associate: function(models) {
      Favorita.belongsTo(models.Ruta, {foreignKey: 'RutaId'}),
      Favorita.belongsTo(models.Usuario, {foreignKey: 'UsuarioId'})
    },
    validate: {
      complementarykeyValidate: function(){        
        this.setDataValue('complementarykey', this.UsuarioId + "-" + this.RutaId)
        if( false ){
          throw new Error('Incorrecto');
        }
      }
    }                
  })

  return Favorita
}