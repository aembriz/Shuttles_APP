function optienePuntos(id){
	//Cargamos rutas

	console.log(servicesUrl+'/ruta/'+id);
	/*$.get(servicesUrl+'/ruta/'+id, function(dir,status) {
		if(status == "success"){
			window.localStorage.setItem("puntos",JSON.stringify(dir));
			puntos();
		}
			
	});*/
	
	var token = window.localStorage.getItem("token");
	var token = token.replace("\"","");
	var token = token.replace("\"","");
	var token = "Bearer " + token;
	$.ajax({
	    type: "GET",    //define the type of ajax call (POST, GET, etc)
	    url: servicesUrl+'/rutapunto/'+id,   //The name of the script you are calling
	    headers: {Authorization: token},    //Your data you are sending to the script
	    success: function(dir){
	    	if(dir.success){
	    	window.localStorage.setItem("puntos",JSON.stringify(dir));
			puntos();
	    	}else{
	    		showAlert(dir.msg, "Error", alertDismissed);
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

var latlng="";
var lat = [], long = [], descripcion=[], tipo=[];
function puntos(){
	var puntos = JSON.parse(window.localStorage.getItem("puntos"));
	lat = [];
	long = [];
	descripcion=[];
	tipo=[];
	$.each(puntos.resultObject, function() {
		$.each(this, function(name, value) {
			switch(name) {
	  		case "latitud":
	  			lat.push(value);
	  			break;
	  		case "longitud":
	  			long.push(value);
	  			break;
	  		case "descripcion":
	  			descripcion.push(value);
	  			break;
	  		case "tipo":
	  			tipo.push(value);
	  			break;
			}
		});
	});
	$.mobile.changePage("#mapaPag");
}