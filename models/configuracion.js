// Objeto de configuración general del sistema
module.exports = function(sequelize, DataTypes) {
  var Configuracion = sequelize.define('Configuracion', {
    reservMinParaCancelar: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 60},
    esperaMinParaConfirmar: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 30},
    ofertaMinCaducaReservados: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 60},
    correoCuentaOrigen: {type: DataTypes.STRING, allowNull: false, defaultValue: "rutas@embarqmexico.org"},
    correoCuentaOrigenPwd: {type: DataTypes.STRING, allowNull: false, defaultValue: "xxx"},
    correoCopiaComentarios: {type: DataTypes.STRING, allowNull: false, defaultValue: "rutas@embarqmexico.org"}
  }, {
    timestamps: true
  })

  return Configuracion;
}