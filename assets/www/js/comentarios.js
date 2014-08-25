function altaComentario (){
	cargando();
	var token = window.localStorage.getItem("token");
	var token = token.replace("\"","");
	var token = token.replace("\"","");
	var token = "Bearer " + token;
	var request_data = {comentario: $("#comentario")[0].value};
	$.ajax({
	    type: "POST",    //define the type of ajax call (POST, GET, etc)
	    url: servicesUrl+'/sugerencia' ,   //The name of the script you are calling
	    headers: {Authorization: token},
	    data: request_data,  //Your data you are sending to the script
	    success: function(dir){
	    	if(dir.success){
	    		showAlert(dir.msg, "Alta de Comentario", alertDismissed);
	    		$.mobile.changePage("#menuPrincipal");
	    	}else{
	    		showAlert(dir.msg, "Error", alertDismissed);
	    		cierraCargando();
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
	cierraCargando();
}