var listaResrRecurrentes, idCorrida;
function servReserRecurentes(id, idCorr, nombre, origen, destino, horaSalida, horaLlegada, idEmp){
	cargando();
	idCorrida = idCorr;
	var token = window.localStorage.getItem("token");
	var token = token.replace("\"","");
	var token = token.replace("\"","");
	var token = "Bearer " + token;
	$.ajax({
	    type: "GET",    //define the type of ajax call (POST, GET, etc)
	    url: servicesUrl+'/rutapunto/xoferta/'+id+'?paradas=true',   //The name of the script you are calling
	    headers: {Authorization: token},    //Your data you are sending to the script
	    success: function(dir){
	    	if(dir.success){
	    		listaResrRecurrentes = JSON.stringify(dir);
	    		creaListaResrRec(nombre, origen, destino, horaSalida, horaLlegada, idEmp);
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
}

function creaListaResrRec(nombre, origen, destino, horaSalida, horaLlegada, idEmp){
	var l, descripcion, tipo, horaEstimada,htmlReserRec = "", count = 1, boton, datosG; 
	if(window.localStorage.getItem("empresaId") == idEmp){
		boton = "<fieldset>"+
	    "<div class=\"ui-block-a\"><a onclick=\"generaReserRec('"+idCorrida+"')\" class=\"ui-btn ui-btn-c ui-icon-recycle ui-btn-icon-right\">Reservar permanente</a></div>"+
	    "</fieldset>";	
	}else{
		boton = "";
	}
		
	datosG = "<div id=\"titRecurrente\" align=\"left\"><h3>Ruta: "+nombre+"</h3><h4>Origen: "+origen+"<br>Destino: "+destino+"<br>Hora: "+horaSalida+" - "+horaLlegada+"</h4>"+
	lunes+martes+miercoles+jueves+viernes+sabado+domingo+"</div>";
	l = JSON.parse(listaResrRecurrentes);
	$.each(l.resultObject, function() {
		 $.each(this, function(name, value) {
			 switch(name) {
			 case 'descripcion':
				 descripcion = value;
				 break;
			 case 'tipo':
				 if(value == '1'){
					 tipo = 'Inicio';
				 }else if (value == '3'){
					 tipo = 'Parada'; 
				 }else if (value == '2'){
					tipo = 'Fin';
				 }
			 case 'horaEstimada':
				 if(value == ""){
					 horaEstimada = "00:00";
				 }else{
					 horaEstimada = value;
				 }
				 break;
			 }
		 });
		 htmlReserRec += "<tr>"+
		 					"<th>" + count         +"</th>"+ 
		   					"<td class=\"title\">" + descripcion +"</td>"+
		   					"<td>" + horaEstimada  +"</td>"+
		   					//"<td>" + tipo          +"</td>"+
		   				"</tr>";
		 count = count + 1
	});
	$("#infoReserRec").html("");
	$("#datospop").html("");
	$("#diaspop").html("");
	$("#infoReserRec").html(htmlReserRec);
	$("#datospop").html(boton);
	$("#diaspop").html(datosG);
	$( "#popupCloseRight" ).popup( "open");
	cierraCargando();
}

function generaReserRec(id_Corrida){
	cargando();
	alert(id_Corrida);
	var token = window.localStorage.getItem("token");
	var token = token.replace("\"","");
	var token = token.replace("\"","");
	var token = "Bearer " + token;
	var request_data = { RutaCorridaId : id_Corrida };
	$.ajax({
	    type: "POST",    //define the type of ajax call (POST, GET, etc)
	    url: servicesUrl+'/reservacionrecurrente',   //The name of the script you are calling
	    headers: {Authorization: token},    //Your data you are sending to the script
	    data: request_data,
	    success: function(dir){
	    	if(dir.success){
	    		showAlert(dir.msg, "Reservaci\u00f3n Recurrente", alertDismissed);
	    		$.mobile.changePage("#menuPrincipal");
	    		cierraCargando();
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
}

function prueba(id){
	
	$( "#popupCloseRight" ).popup( "open");
}