var nodemailer = require("nodemailer");

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
    for(var i=0;i<usrs.length;i++){        
        var usr = usrs[i];
        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: "EmbarQ <servicios.administrativos@nubeet.com>", // sender address
            to: usr.email, // list of receivers
            subject: "Se le ha hecho una invitación para unirse a EmbarQ-Shuttles", // Subject line
            text: "Estimado " + usr.nombre + ", se le está invitando a unirse a la plataforma Shuttles por lo que debe completar el siguiente registro.", // plaintext body
            html: "Estimado <b>" + usr.nombre + "</b>, se le está invitando a unirse a la plataforma Shuttles por lo que debe completar el siguiente registro." // html body
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

}