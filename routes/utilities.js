
var constErrorTypes = {'ERR00': 1, 'authorized': 3, 'rejected': 4};
module.exports.errorTypes = constErrorTypes;

/*
* Regresa mensaje de respuesta a un servicio
* msg = String, error = Object, success = [true/false]
*/
exports.formatResponse = function(msg, error, success, errorCode, errorTypes, resultObject) {
	if(!success) msg = msg + " [" + errorCode + "]"; // debugging
	return({msg: msg, err: error, success: success, msgCode: errorCode, resultObject: resultObject});
};