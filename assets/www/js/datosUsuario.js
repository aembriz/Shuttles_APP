function datosUsuario(id){
	var token = window.localStorage.getItem("token");
	var token = token.replace("\"","");
	var token = token.replace("\"","");
	var token = "Bearer " + token;
	var request_data = {comentario: $("#comentario")[0].value};
	$.ajax({
	    type: "GET",    //define the type of ajax call (POST, GET, etc)
	    url: servicesUrl+'/usuario/'+id ,   //The name of the script you are calling
	    headers: {Authorization: token},
	    data: request_data,  //Your data you are sending to the script
	    success: function(msg){
	    	if(msg.success){
		    	$.each(msg.resultObject, function(name, value) {
		    		if(name == "email"){
		    			window.localStorage.setItem("email", value);
		    		}
		    		$.each(this, function(name, value) {
		    		if(name == "razonsocial"){
		    			window.localStorage.setItem("empresa",value);
		    		}
		    		});
		  	  	}); 
	    	}else{
	    		showAlert(msg.msg, "Error", alertDismissed);
	    	}
	    },
		error: function(msg, estatus){
			var err =JSON.stringify(msg);			
			if(err.indexOf("[ERR0001]")> 0){
				showAlert("Expir\u00f3 tiempo de usuario", "Aviso", logaout);
				cierraCargando();
			}else{
				showAlert(err, "Aviso", alertDismissed);
				cierraCargando();
			}
		}
	});
}