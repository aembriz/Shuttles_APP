// manejo de constantes del sistema

// Estatus de las instancias
var constEmpresaEstatus = {'new': 1, 'authorized': 3, 'rejected': 4, 'deleted': 99};
var constRutaEstatus = {'new': 1, 'authorized': 3, 'rejected': 4, 'deleted': 99};
var constRutaCorridaEstatus = {'new': 1, 'deleted': 99};
var constRutaCompartidaEstatus = {'new': 1, 'authorized': 3, 'rejected': 4};
var constReservEstatus = {'new': 1, 'confirmed': 2, 'canceled': 3};
var constEsperaEstatus = {'new': 1, 'assigned': 2, 'canceled': 3, 'deprecated': 4};
var constUsuarioEstatus = {'new': 1, 'authorized': 3, 'rejected': 4, 'deleted': 99};
var constReservRecurrenteEstatus = {'innactive': 1, 'active': 2};


module.exports.estatus = {};
module.exports.estatus.RutaCompartida = constRutaEstatus;
module.exports.estatus.Ruta = constRutaEstatus;
module.exports.estatus.RutaCorrida = constRutaCorridaEstatus;
module.exports.estatus.Empresa = constEmpresaEstatus;
module.exports.estatus.Reservacion = constReservEstatus;
module.exports.estatus.Espera = constEsperaEstatus;
module.exports.estatus.Usuario = constUsuarioEstatus;
module.exports.estatus.ReservacionRecurrente = constReservRecurrenteEstatus;


module.exports.DiaSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
