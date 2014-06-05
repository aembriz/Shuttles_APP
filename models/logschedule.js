// tipo = (1=oferta, 2=depura reservaiones, 3=depura esperas)
module.exports = function(sequelize, DataTypes) {
  var ScheduleLog = sequelize.define('ScheduleLog', {
    tipo: {type: DataTypes.INTEGER, allowNull: false },
    mensaje: {type: DataTypes.STRING, allowNull: true }
  }, {
	timestamps: true
  })

  return ScheduleLog
}
