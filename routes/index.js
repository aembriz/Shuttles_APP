var db = require('../models')

exports.index = function(req, res){
  db.User.findAll({
    include: [ db.Task ]
  }).success(function(users) {
  	/*
    res.render('index', {
      title: 'Express',
      users: users
    })
	*/
    var template = {
      t1: 'usuarioinvitacion',
      t2: 'empresaautorizacion',
      t3: 'empresarechazo',
      t4: 'reservacionporautorizar',
      t5: 'reservacionconfirmacion',
      t6: 'reservacioncancelacion',
    }
    
    if(!req.query.template) req.query.template = 't1';

    res.render('mailer/' + template[req.query.template], {
      title: 'Shuttle Title',
      usuario: {id: 43, nombre: 'Nina Simone', email: 'nina.simone@mail.com', password: 'xxxxx'},
      config: {homeurl: 'http://nubeet.com/shuttles/'},
      empresa: {id: 26, nombre: 'Empresa Patito'},
      reservacion: reserv
    })

  })
}


var reserv =    {
      "id": 14,
      "fechaReservacion": new Date(),
      "estatus": 2,
      "createdAt": new Date(),
      "updatedAt": new Date(),
      "RutaId": 1,
      "RutaCorridaId": 1,
      "UsuarioId": 9,
      "OfertaId": 5,
      "rutum": {
        "id": 1,
        "nombre": "Ruta 1",
        "descripcion": "Descripcion 1",
        "distanciaaprox": 20,
        "tiempoaprox": 30,
        "origentxt": "Barranca del muerto",
        "destinotxt": "Indios verdes",
        "diasofertafuturo": 5,
        "CompanyownerID": 1,
        "EstatusId": 1
      },
      "rutaCorrida": {
        "horaSalidaFmt": "07:40",
        "horaLlegadaFmt": "08:20",
        "id": 1,
        "horaSalida": 460,
        "horaLlegada": 500,
        "capacidadTotal": 40,
        "capacidadReservada": 30,
        "capacidadOfertada": 5,
        "tarifa": 23,
        "idTransporte": "NA",
        "idChofer": "NA",
        "dia1": false,
        "dia2": true,
        "dia3": false,
        "dia4": true,
        "dia5": true,
        "dia6": false,
        "dia7": false,
        "RutaId": 1
      }
    }