var nodemailer = require("nodemailer");
var db = require('../models');
var constant = require('../config/constant.js');
var config = require('./configuracion'); // configuración parametrizable

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Zoho",
    auth: {
        user: "servicios.administrativos@nubeet.com",
        pass: "teebun"
    }
});

// ***********************************************************************
// OTRO
jade = require('jade');
sys = require('sys');
path = require('path');
// ***********************************************************************

var configuration = {from: 'EmbarQ <servicios.administrativos@nubeet.com>', homeurl: 'http://nubeet.com/shuttles'}; // sin slash al final

emails = {
  send: function(template, mailOptions, templateOptions) {    
    templateOptions.config = configuration; // incluye configuración
    jade.renderFile(path.join(path.resolve(__dirname, '..'), 'views', 'mailer', template), templateOptions, function(err, text) {

        if(err!=null){
            console.log('[SENDING MAIL::Error]', sys.inspect(err));
            return;
        }

        // Add the rendered Jade template to the mailOptions
        // agrega el template procesado a mailOptions
        mailOptions.from = configuration.from
        mailOptions.to = mailOptions.to;
        //mailOptions.body = text;
        //mailOptions.text = text;
        mailOptions.html = text;

        console.log('[SENDING MAIL]', sys.inspect(mailOptions));

        // envía el correo
        smtpTransport.sendMail(mailOptions,
            function(err, result) {
                if (err) {
                    console.log(err);
                }
            }
        );
    });
  },

  sendWelcome: function(user) {
    this.send('welcomeHtml.jade', { to: user.email, subject: 'Welcome to Nodepad' }, { user: user } );
  }
};

exports.notifyUserInvitations = function(usrs) {
    console.log('Notifiying user invitations');
    for(var i=0;i<usrs.length;i++){        
        var usr = usrs[i];
        emails.send('usuarioinvitacion.jade', { to: usr.email, 
            subject: 'Invitación para unirse a Optimo Shuttles' }, 
            { usuario: usr } 
        );        
    }    
};

exports.notifyCompanyAuthorization = function(usuario, empresa, authorized){
    console.log('Notifiying company authorization');

    if(authorized){
        emails.send('empresaautorizacion.jade', { to: usuario.email, 
            subject: 'Optimo Shuttles - Su registro de empresa ha sido autorizado' }, 
            { usuario: usuario, empresa: empresa } 
        );
    }
    else{
        emails.send('empresarechazo.jade', { to: usuario.email, 
            subject: 'Optimo Shuttles - Su registro de empresa ha sido rechazado' }, 
            { usuario: usuario, empresa: empresa } 
        );
    }    

};

exports.notifyReservationChange = function(reservacion) {
    console.log('Notifiying reservaction change');

    db.Reservacion.find({where: {id: reservacion.id}, 
        include: [{model: db.Ruta}, {model: db.RutaCorrida}, {model: db.Usuario} ] }
    ).success( function(reserv){
        if(reserv==null){
            console.log("notifyReservationChange::No se pudo acceder a la reservación");
            return;
        }
        
        var template = 'reservacionporautorizar';
        var subject = 'Optimo Shuttles - Se ha liberado un espacio';
        if(reserv.estatus == constant.estatus.Reservacion.confirmed){
            var subject = 'Optimo Shuttles - Confirmación de reservación';
            template = 'reservacionconfirmacion';            
        }
        else if(reserv.estatus == constant.estatus.Reservacion.canceled){
            var subject = 'Optimo Shuttles - Cancelación de reservación';
            template = 'reservacioncancelacion';
        }

        var usuario = reserv.usuario.values;
        emails.send(template + '.jade', { to: usuario.email, 
            subject: subject }, 
            { usuario: usuario, reservacion: reserv.values }
        );
           
    }).error(function(err){
        console.log("notifyReservationChange::No se pudo acceder a la reservación 2");
    });

};


exports.notifySuggestion = function(sugerencia){
    console.log('Notifiying suggestion');

    db.Sugerencia.find( { where: {id: sugerencia.id}, include: [{model: db.Usuario}, {model: db.Empresa}] } ).complete(function(err, sugerencia){
        if(err!=null && sugerencia == null){
            console.log("Error al enviar la sugerencia");
            console.log(err);
            return;
        }
        config.getConf(function(err, conf){
            if(err!=null) console.log(err);        
            emails.send('sugerencia.jade', { to: conf.correoCopiaComentarios, 
                subject: 'Optimo Shuttles - Se generó un comentario' }, 
                { usuario: sugerencia.usuario, empresa: sugerencia.empresa, sugerencia: sugerencia } 
            );        
        });        
    });
};