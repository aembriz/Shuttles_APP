var nodemailer = require("nodemailer");
var db = require('../models')

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Zoho",
    auth: {
        user: "servicios.administrativos@nubeet.com",
        pass: "teebun"
    }
});


exports.notifyUserInvitations = function(usrs) {
    console.log('Notifiying user invitations');
    console.log("Entra a hababababababa---------------->2");
    for(var i=0;i<usrs.length;i++){        
        console.log("Entra a hababababababa---------------->3");
        var usr = usrs[i];
        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: "EmbarQ <servicios.administrativos@nubeet.com>", // sender address
            to: usr.email, // list of receivers
            subject: "Se le ha hecho una invitación para unirse a EmbarQ-Shuttles", // Subject line
            text: "Estimado " + usr.nombre + ", se le está invitando a unirse a la plataforma Shuttles por lo que debe completar el siguiente registro.", // plaintext body
            html: "Estimado <b>" + usr.nombre + "</b>, se le está invitando a unirse a la plataforma Shuttles por lo que debe completar el siguiente registro: <a href='http://nubeet.com/shuttles/#/registro/" + usr.id + "'> Activar </a>"  // html body
        }

        console.log(mailOptions);
        //registro/id --> http://nubeet.com/shuttles/registro/[id]

        // send mail with defined transport object
        smtpTransport.sendMail(mailOptions, function(error, response){
            if(error){
                console.log(error);
            }else{
                console.log("Message sent: " + response.message);
            }

            // if you don't want to use this transport object anymore, uncomment following line
            //smtpTransport.close(); // shut down the connection pool, no more messages
        });
    }

}

exports.notifyCompanyAuthorization = function(usuario, empresa, authorized) {
    console.log('Notifiying Company authorization process');
    

    var mailOptions = null;
    if(authorized){
        var mailOptions = {
            from: "EmbarQ <servicios.administrativos@nubeet.com>", // sender address
            to: usuario.email, // list of receivers
            subject: "Registro de empresa Autorizado",
            text: "La solicitud de registro de la empresa " + empresa.nombre + " ha sido aceptado.", // plaintext body
            html: "La solicitud de registro de la empresa <b>" + empresa.nombre + "</b> ha sido aceptado." // html body
        }
    }
    else{
        var mailOptions = {
            from: "EmbarQ <servicios.administrativos@nubeet.com>", // sender address
            to: usuario.email, // list of receivers
            subject: "Registro de empresa Rechazado", 
            text: "Sentimos informarle que la solicitud de registro de la empresa " + empresa.nombre + " ha sido rechazado.", // plaintext body
            html: "Sentimos informarle que la solicitud de registro de la empresa <b>" + empresa.nombre + "</b> ha sido rechazado." // html body
        }        
    }

    // send mail with defined transport object
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
        }

        // if you don't want to use this transport object anymore, uncomment following line
        //smtpTransport.close(); // shut down the connection pool, no more messages
    });

}


/*
* Notificaciones a los usuarios que estaban en lista de espera y se les ha asignado un lugar disponible
*/
exports.notifyWaitingListAssigned = function(reservacion) {
    // TODO: revisar mensaje a informar
    console.log('Notifiying user WaitingList assigned');        

    db.Reservacion.find({where: {id: reservacion.id}, include: [{model: db.Ruta}, {model: db.RutaCorrida}, {model: db.Usuario} ] }).success(
        function(reserv){
        reserv = reserv.values;        
        console.log(reserv);
        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: "EmbarQ <servicios.administrativos@nubeet.com>", // sender address
            to: reserv.usuario.values.email, // list of receivers
            subject: "Se ha liberado un espacio en la lista de espera." , // Subject line
            text: "Estimado " + reserv.usuario.values.nombre + ", " +
            "se le informa que se liberó un espacio para la ruta [" + reserv.rutum.values.nombre + "] el día " + reserv.fechaReservacion +
            " a las [" + reserv.rutaCorrida.horaSalidaFmt + "] y por ser usted el siguiente " +
            "asignado en la lista de espera, se le ha generado un reservación. Deberá confirmar la reservación a la brevedad " +
            "de lo contrario será cancelada.", // plaintext body
            html: "Estimado <b>" + reserv.usuario.values.nombre + "</b>, " +
            "se le informa que se liberó un espacio para la ruta [" + reserv.rutum.values.nombre + "] el día " + reserv.fechaReservacion +
            " a las [" + reserv.rutaCorrida.horaSalidaFmt + "] y por ser usted el siguiente " + 
            "asignado en la lista de espera, se le ha generado un reservación. Deberá confirmar la reservación a la brevedad " +
            "de lo contrario será cancelada. <br> <br> <a href='#'>Ir a reservación</a>"  // html body
        }

        // send mail with defined transport object
        smtpTransport.sendMail(mailOptions, function(error, response){
            if(error){
                console.log(error);
            }else{
                console.log("Message sent: " + response.message);
            }

            // if you don't want to use this transport object anymore, uncomment following line
            //smtpTransport.close(); // shut down the connection pool, no more messages
        });    
    });

}