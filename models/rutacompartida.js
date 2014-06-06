/*
* Relación de empresa-cliente ruta para el manejo de rutas compartidas.
* Las relaciones tendrán un estatus = {'new': 1, 'authorized': 3, 'rejected': 4}
*/
module.exports = function(sequelize, DataTypes) {
  var RutaCompartida = sequelize.define('RutaCompartida', {
    estatus: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 1},
    complementarykey: {type: DataTypes.STRING, allowNull: false, unique: true}
  }, {
    timestamps: true,
    associate: function(models) {
      RutaCompartida.belongsTo(models.Empresa, {as: 'EmpresaCliente', foreignKey: 'EmpresaClienteId'}),      
      RutaCompartida.belongsTo(models.Ruta, {foreignKey: 'RutaId'}),
      RutaCompartida.belongsTo(models.Empresa, {as: 'Empresa', foreignKey: 'EmpresaId'})
    },
    validate: {
      estatusValidate: function(){        
        this.setDataValue('complementarykey', this.EmpresaClienteId + "-" + this.RutaId)
        if( (this.estatus ) < 1 ){
          throw new Error('El estatus debe ser entre 1-3.');
        }
      }
    }            
  })

  return RutaCompartida
}