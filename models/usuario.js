module.exports = function(sequelize, DataTypes) {
  var Usuario = sequelize.define('Usuario', {
    nombre: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: {isEmail: true} },
    password: { type: DataTypes.STRING },
    role: {type: DataTypes.ENUM, values: ['ADMIN', 'EMPRESA', 'USUARIO'], defaultValue: 'USUARIO' }
  }, {
	timestamps: true,
    associate: function(models) {
      Usuario.belongsTo(models.Estatus, {as: 'Estatus', foreignKey: 'EstatusId'}),
      Usuario.belongsTo(models.Empresa, {as: 'Empresa', foreignKey: 'EmpresaId'})
    },
    instanceMethods: {
      validPassword: function(pwd) { 
        return ((this.password == pwd));
      }
    }    		
  })

  return Usuario;
}
