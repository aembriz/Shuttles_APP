// horas {almacenadas en minutos 0 = 00:00, 1440 = 24:00}
// se puede asignar valor entero directamente a la propiedad horaLlegada u horaSalida, o valor con formato a las correspondientes horaSalidaFmt
module.exports = function(sequelize, DataTypes) {
  var RutaCorrida = sequelize.define('RutaCorrida', {
    horaSalida: {type: DataTypes.INTEGER, allowNull: false, validate: { min: 0, max: 1440 }}, 
    horaLlegada: {type: DataTypes.INTEGER, allowNull: false, validate: { min: 0, max: 1440 } },
    capacidadTotal: {type: DataTypes.INTEGER, allowNull: false, validate: { min: 0, max: 300 } },
    capacidadReservada: {type: DataTypes.INTEGER, allowNull: false, validate: { min: 0, max: 300 } },
    capacidadOfertada: {type: DataTypes.INTEGER, allowNull: false, validate: { min: 0, max: 300 } },
    tarifa: {type: DataTypes.DECIMAL(10,2), allowNull: false, validate: { min: 0 }},
    idTransporte: DataTypes.STRING,
    idChofer: DataTypes.STRING,
    dia1: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    dia2: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    dia3: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    dia4: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    dia5: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    dia6: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    dia7: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  }, {
    timestamps: false,
    associate: function(models) {
      RutaCorrida.belongsTo(models.Ruta, {foreignKey: 'RutaId'})
    },
    validate: {
      validateCapacidad: function(){
        if( (this.capacidadReservada + this.capacidadOfertada) > this.capacidadTotal ){
          throw new Error('La suma de capacidad reservada y ofertada no puede ser mayor a la total.');
        }
      },
      validateHoras: function(){
        if( this.horaSalida >= this.horaLlegada ){
          throw new Error('La hora de llegada debe ser mayor a la de salida.');
        }
      }      
    },
    getterMethods   : {
      horaSalidaFmt : function()  { 
        var hrs = "" + Math.floor(this.getDataValue('horaSalida') / 60);
        var min = "" + this.getDataValue('horaSalida') % 60;
        return ((hrs.length < 2)? "0"+hrs : hrs) + ':' + ((min.length < 2)? "0"+min : min); 
      },
      horaLlegadaFmt : function()  { 
        var hrs = "" + Math.floor(this.getDataValue('horaLlegada') / 60);
        var min = "" + this.getDataValue('horaLlegada') % 60;
        return ((hrs.length < 2)? "0"+hrs : hrs) + ':' + ((min.length < 2)? "0"+min : min); 
      }
    },
    setterMethods   : {
      horaSalidaFmt : function(v)  { 
        var parts = v.split(":");
        var mins = (parseInt(parts[0]) * 60) + parseInt(parts[1]);
        return this.setDataValue('horaSalida', mins);
      },
      horaLlegadaFmt : function(v)  { 
        var parts = v.split(":");
        var mins = (parseInt(parts[0]) * 60) + parseInt(parts[1]);
        return this.setDataValue('horaLlegada', mins);
      }      
    }
  })

  return RutaCorrida
}
