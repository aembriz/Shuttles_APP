var RlistEspera;

function cargaListaEspera(){
	cargando();
	var token = window.localStorage.getItem("token");
	var token = token.replace("\"","");
	var token = token.replace("\"","");
	var token = "Bearer " + token;
	$.ajax({
	    type: "GET",    //define the type of ajax call (POST, GET, etc)
	    url: servicesUrl+'/compra/misesperas',   //The name of the script you are calling
	    headers: {Authorization: token},    //Your data you are sending to the script
	    success: function(dir){
	    	if(dir.success){
		    	RlistEspera = JSON.stringify(dir);
	    		listaEspera();
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

function removeListaEspera (id){
	var token = window.localStorage.getItem("token");
	var token = token.replace("\"","");
	var token = token.replace("\"","");
	var token = "Bearer " + token;
	$.ajax({
	    type: "POST",    //define the type of ajax call (POST, GET, etc)
	    url: servicesUrl+'/compra/cancelarespera/'+id,   //The name of the script you are calling
	    headers: {Authorization: token},    //Your data you are sending to the script
	    success: function(dir){
	    	if(JSON.stringify(dir.success)){
	    		showAlert(String(JSON.stringify(dir.msg)), "Remover Favorito", alertDismissed);
	    		cargaListaEspera();
	    	}else{
	    		showAlert(JSON.stringify(dir.msg), "Remover Favorito", alertDismissed);
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
	
	//$("#favorito"+id).addClass('ui-btn-c');
	$("#favorito"+id).attr("disabled", true);
}

function listaEspera(){
	var fechaReservacion, createdAt, nombre, descripcion, horaSalidaFmt, id;
	var L, listaEspera = "";
	
	L = JSON.parse(RlistEspera);
	$.each(L.resultObject, function() {
		 $.each(this, function(name, value) {
			 switch(name) {
			 case "fechaReservacion":
				 fechaReservacion = value.substring(0,10);
				 break;
			 case"createdAt":
				 createdAt = value.substring(0,10);
				 break;
			 case"id":
				 id = value;
				 break;
			 }
		 });
		 $.each(this.rutum, function(name, value) {
			 switch(name) {
		 case "nombre":
			 nombre = value;
			 break;
		 case"descripcion":
			 descripcion = value;
			 break;
			 }
		 });
		 $.each(this.rutaCorrida, function(name, value) {
			 switch(name) {
		 case "horaSalidaFmt":
			 horaSalidaFmt = value;
			 break;
			 }
		 });
		 listaEspera += "<li id=\"Lcorrida\" class=\"ui-body ui-body-c ui-field-contain\">"+
		   "<button onclick=\"removeListaEspera('"+id+"')\" id='favorito"+id+"' class=\"ui-btn ui-mini\">Cancelar</button>"+
		   "<h2>Reservado Para: " + fechaReservacion + "</h2>"+
		   "<h2>Nombre de Ruta: " + nombre +"</h2>"+
		   "<h2>Descripci&oacuten: " +descripcion + "</h2>"+
		   "<p><strong>"+
		   "Fecha de Alta: " + createdAt +
		   "<br>Hora de salida: "+horaSalidaFmt+
         "</p>"+
		   "</li>";
	});

	//$.mobile.changePage("#LEspera");
	//$("#listEspera").html("");
	//$("#listEspera").html(listaEspera);
	//$("#listEspera").listview( "refresh" );
	//$.mobile.changePage("#LEspera");
	$("#listmenu").html("");
	$("#listmenu").html(listaEspera);
	$("#listmenu").listview( "refresh" );
	document.getElementById('shop').style.display = 'none';
	document.getElementById('corazon').style.display = 'none';
	document.getElementById('sugRuta').style.display = 'none';
	cierraCargando();
}