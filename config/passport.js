var db = require('../models');

var LocalStrategy = require('passport-local').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var jwt = require('jwt-simple');


module.exports = function(app, passport) {
	passport.use(new LocalStrategy(
		function(username, password, done) {
			db.Usuario.find({ where: { email: username }, include: [{model: db.Empresa, as: 'Empresa'}] }).success(function(user) {
				if (!user) {
					return done(null, false, { message: 'Incorrect username.', errType: 1 });
				}
				if (!user.validPassword(password)) {
					return done(null, false, { message: 'Incorrect password.', errType: 1 });
				}
				if(user.role && user.role != 'ADMIN'){				
					if (user.EstatusId != 3) {
						return done(null, false, { message: 'Su usuario no está activo.', errType: 2 });
					}												
					if (user.empresa.EstatusId == 99) {
						return done(null, false, { message: 'Su empresa ya no está dentro del sistema.', errType: 2 });
					}				
				}
				//var usr = user.dataValues; // because of the format sent back by sequelizee
				var usr = user;
				return done(null, usr);
		    });
		}
	));

	  /*
	   * Bearer strategy for token authentication when accessing API endpoints
	   */
	passport.use(new BearerStrategy(
	    function(token, done){
	    process.nextTick(function () {
	      try {      	
	        //we attempt to decode the token the user sends with his requests
	        var decoded = jwt.decode(token, app.get('jwtTokenSecret'));
	 	 		
	        //TODO: must check the token expiry and ensure the token is still valid
	        //if token is expired return 401! (throw an exception, will be caught by catch clause)
			if (decoded.exp <= Date.now()) {
				return done(null, false, { message: 'The AuthToken has expired. Log in again please. [ERR0001]' }); // token expired
			}        
	        
			//we find the user that has made the request
			db.Usuario.find({ where: { email: decoded.iss } }).success(function(user) {
				if (!user) {
					return done(null, false, { message: 'Username not associated with token.' }); //no such user
				}
				else {
					return done(null, user); //allows the call chain to continue to the intented route
				}
			});
	      }
	      catch(err){
	      	console.log(err);
	        return done(null, false, { message: 'Invalid AuthToken.' }); //returns a 401 to the caller
	      }
	    }); // tick
		}
	));
}