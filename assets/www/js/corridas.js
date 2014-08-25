var listaCorridas = "", horaSalida, horaLlegada, capacidad, capacidadReservada, capacidadOfertada, tarifa, idTransporte, chofer, id;
var fechaOferta;
var lunes, martes, miercoles, jueves, viernes, sabado, domingo;
var miReserva = new Array();
var miEspera = new Array();
var oferta;

function cargaCorridas(id, tipo, nombre, origen, destino){
	//Cargamos rutas
	cargando();
	$("#listCorridas").html("");
	console.log("CREA LA CORRIDA CON ID------> " + id);
	console.log("URL ------> " + servicesUrl+'/compra/ruta/'+id+'/oferta');
	var token = window.localStorage.getItem("token");
	var token = token.replace("\"","");
	var token = token.replace("\"","");
	var token = "Bearer " + token;
	$.ajax({
	    type: "GET",    //define the type of ajax call (POST, GET, etc)
	    url: servicesUrl+'/compra/ruta/'+id+'/oferta',   //The name of the script you are calling
	    headers: {Authorization: token},    //Your data you are sending to the script
	    success: function(dir){
	    	if(dir.success){
		    	window.localStorage.setItem("corrida",JSON.stringify(dir));
		    	corridas(tipo, nombre, origen, destino);
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
var lunes, martes, miercoles, jueves, viernes, sabado, domingo, idEmp;
function corridas(tipo, nombre, origen, destino){
	var dias_semana = new Array("Domingo","Lunes","Martes","Miercoles","Jueves","Viernes","Sabado");
	var meses = new Array ("Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre", "Diciembre");
	console.log("CREA LA CORRIDA");
	//var lunes, martes, miercoles, jueves, viernes, sabado, domingo;
	var idR, idLE, idCorr = "";
	listaCorridas = "";
	var corrida = JSON.parse(window.localStorage.getItem("corrida"));
	$.each(corrida.resultObject, function() {
		lunes ="", martes=""; miercoles = "", jueves = "", viernes = "", sabado = "", domingo = "",idR = "", idLE = "";
		 $.each(this, function(name, value) {
			 switch(name) {
			 case "fechaOferta":
				 fechaOferta = value.substring(0,10);
				 break;
			 case "id":
				 id = value;
				 break;
			 case "oferta":
			 	oferta = value;
			 	break;
			 case "RutaCorridaId":
				 idCorr = value;
				 break;
			 }
		 });
			 $.each(this.rutaCorrida, function(name, value) {
				 switch(name){
			 case "horaSalidaFmt":
				 horaSalida = value;
				 break;
			 case "horaLlegadaFmt":
				 horaLlegada = value;
				 break;
			 case "capacidadTotal":
				 capacidad = value;
				 break;
			 case "capacidadReservada":
				 capacidadReservada = value;
				 break;
			 case "capacidadOfertada":
				 capacidadOfertada = value;
				 break;
			 case "tarifa":
				 tarifa = value;
				 break;
			 case "idTransporte":
				 idTransporte = value;
				 break;
			 case "idChofer":
				 chofer = value;
				 break;
			 case "dia1":
			 	if(value){
			 		lunes = "<a class=\"ui-btn ui-btn-b ui-btn-inline ui-mini\" >Lun</a>";
			 		//lunes = "Lunes, ";
			 	}
			 	break;
			 case "dia2":
				 if(value){
					 	martes = "<a class=\"ui-btn ui-btn-b ui-btn-inline ui-mini\" >Mar</a>";
				 		//martes = "Martes, ";
				 	}
				 break;
			 case "dia3":
				 if(value){
					 	miercoles = "<a class=\"ui-btn ui-btn-b ui-btn-inline ui-mini\" >Mie</a>";
				 		//miercoles = "Miercoles, ";
				 	}
				 break;
			 case "dia4":
				 if(value){
					 	jueves ="<a class=\"ui-btn ui-btn-b ui-btn-inline ui-mini\" >Jue</a>";
				 		//jueves = "Jueves, ";
				 	}
				 break;
			 case "dia5":
				 if(value){
				 		viernes = "<a class=\"ui-btn ui-btn-b ui-btn-inline ui-mini\" >Vie</a>";
					 	//viernes = "Viernes, ";
				 	}
				 break;
			 case "dia6":
					 if(value){
						 	sabado = "<a class=\"ui-btn ui-btn-b ui-btn-inline ui-mini\" >Lun</a>";
					 		//sabado = "Sabado, ";
					 	}
				 break;
			 case "dia7":
					 if(value){
						 	domingo = "<a class=\"ui-btn ui-btn-b ui-btn-inline ui-mini\" >Lun</a>";
					 		//domingo = "Domingo ";
					 	}
					 break;
				 }
			 });
			 $.each(this.rutum, function(name, value) {
				if(name == "CompanyownerID"){
					idEmp = value;
				} 
			 });
			 for(var i in this.reservacion) {
				idR= this.reservacion.id; 
				 }
			 
			 for(var i in this.espera) {
				 idLE= this.espera.id; 
					 }
			 var fecha_actual = new Date (Date.parse(fechaOferta));
				 if(idR != "" || idLE != ""){
					 if(idR != ""){
					 idR = ("00000" + idR).slice (-6);
					 listaCorridas += 
						 "<div class=\"ui-block-a\">"+
							"<div class=\"ui-bar ui-bar-c\" style=\"height:5em; border-top-width : 0 ;\">"+
								dias_semana[fecha_actual.getUTCDay()] + " " + (fecha_actual.getUTCDate()) + " de " + meses[fecha_actual.getUTCMonth()] + " de " + fecha_actual.getUTCFullYear()+
								"<br>Hora : " + horaSalida + " - " + horaLlegada +
								"<br>Lugares: " + oferta + ", Puntos: " + tarifa +
								"</div>"+
						"</div>"+
						"<div class=\"ui-block-b\">"+
							"<div class=\"ui-bar\" style=\"height:5em; border-top-width : 0 ; background-color: #d9edf7; color: black;\">"+
								"<div class=\"ui-block-a\">Folio de Reservaci&oacute;n: "+ idR+"</div>"+
							"</div>"+
						"</div>";
					 }else if(idLE != ""){
						 idLE = ("00000" + idLE).slice (-6);
						 listaCorridas += 
							 "<div class=\"ui-block-a\">"+
								"<div class=\"ui-bar ui-bar-c\" style=\"height:5em; border-top-width : 0 ;\">"+
									dias_semana[fecha_actual.getUTCDay()] + " " + (fecha_actual.getUTCDate()) + " de " + meses[fecha_actual.getUTCMonth()] + " de " + fecha_actual.getUTCFullYear()+
									"<br>Hora : " + horaSalida + " - " + horaLlegada +
									"<br>Lugares: " + oferta + ", Puntos: " + tarifa +
									"</div>"+
							"</div>"+
							"<div class=\"ui-block-b\">"+
								"<div class=\"ui-bar\" style=\"height:5em; border-top-width : 0 ; background-color: #d9edf7;\">"+
									"<div class=\"ui-block-a\">Folio de Lista de Espera: "+ idLE+"</div>"+
								"</div>"+
							"</div>";
					 }
					 
				 }else if(oferta > 0){
					 if(idR == ""){
						 listaCorridas +=
							    "<div class=\"ui-block-a\">"+
									"<div class=\"ui-bar ui-bar-c\" style=\"height:5em; border-top-width : 0 ;\">"+
										dias_semana[fecha_actual.getUTCDay()] + " " + (fecha_actual.getUTCDate()) + " de " + meses[fecha_actual.getUTCMonth()] + " de " + fecha_actual.getUTCFullYear()+
										"<br>Hora : " + horaSalida + " - " + horaLlegada +
										"<br>Lugares: " + oferta + ", Puntos: " + tarifa +
										"</div>"+
								"</div>"+
								"<div class=\"ui-block-b\">"+
									"<div class=\"ui-bar\" style=\"height:5em; border-top-width : 0 ; background-color: #d9edf7;\">"+
										"<div class=\"ui-block-a\"><a onclick=\"servReserRecurentes('"+id+"','"+idCorr+"','"+nombre+"','"+origen+"','"+destino+"','"+horaSalida+"','"+horaLlegada+"','"+idEmp+"')\" id='favorito"+id+"' class=\"ui-shadow ui-btn ui-corner-all ui-icon-action ui-btn-icon-notext ui-btn-inline\">heart</a></div>"+
										"<div class=\"ui-block-b\"><a id='R"+id+"' onclick=\"cargaReservas('"+id+"','"+nombre+"','"+fechaOferta+"','"+horaSalida+"')\"class=\"ui-shadow ui-btn ui-corner-all ui-icon-calendar ui-btn-icon-notext ui-btn-inline\">Reservar</a></div>"+
									"</div>"+
								"</div>";
					 }else{
						 idR = ("00000" + idR).slice (-6);
						 listaCorridas += 
							 "<div class=\"ui-block-a\">"+
								"<div class=\"ui-bar ui-bar-c\" style=\"height:5em; border-top-width : 0 ;\">"+
									dias_semana[fecha_actual.getUTCDay()] + " " + (fecha_actual.getUTCDate()) + " de " + meses[fecha_actual.getUTCMonth()] + " de " + fecha_actual.getUTCFullYear()+
									"<br>Hora : " + horaSalida + " - " + horaLlegada +
									"<br>Lugares: " + oferta + ", Puntos: " + tarifa +
									"</div>"+
							"</div>"+
							"<div class=\"ui-block-b\">"+
								"<div class=\"ui-bar\" style=\"height:5em; border-top-width : 0 ; background-color: #d9edf7;\">"+
									"<div class=\"ui-block-a\">Folio de Reservaci&oacute;n: "+ idR+"</div>"+
								"</div>"+
							"</div>";
					 }
				 } else{
					 if(idLE == ""){
						 listaCorridas += 
							 "<div class=\"ui-block-a\">"+
								"<div class=\"ui-bar ui-bar-c\" style=\"height:5em; border-top-width : 0 ;\">"+
									dias_semana[fecha_actual.getUTCDay()] + " " + (fecha_actual.getUTCDate()) + " de " + meses[fecha_actual.getUTCMonth()] + " de " + fecha_actual.getUTCFullYear()+
									"<br>Hora : " + horaSalida + " - " + horaLlegada +
									"<br>Lugares: " + oferta + ", Puntos: " + tarifa +
									"</div>"+
							"</div>"+
							"<div class=\"ui-block-b\">"+
								"<div class=\"ui-bar\" style=\"height:5em; border-top-width : 0 ; background-color: #d9edf7;\">"+
									"<div class=\"ui-block-a\"><a onclick=\"servReserRecurentes('"+id+"','"+idCorr+"','"+nombre+"','"+origen+"','"+destino+"','"+horaSalida+"','"+horaLlegada+"','"+idEmp+"')\" id='favorito"+id+"' class=\"ui-shadow ui-btn ui-corner-all ui-icon-action ui-btn-icon-notext ui-btn-inline\">heart</a></div>"+
									"<div class=\"ui-block-b\"><a id='L"+id+"' onclick=\"cargaLista('"+id+"','"+nombre+"','"+fechaOferta+"','"+horaSalida+"')\"class=\"ui-shadow ui-btn ui-corner-all ui-icon-tag ui-btn-icon-notext ui-btn-inline\">Reservar</a></div>"+
								"</div>"+
							"</div>";
					 }else{
						 idLE = ("00000" + idLE).slice (-6);
						 listaCorridas += 
							 "<div class=\"ui-block-a\">"+
								"<div class=\"ui-bar ui-bar-c\" style=\"height:5em; border-top-width : 0 ;\">"+
									dias_semana[fecha_actual.getUTCDay()] + " " + (fecha_actual.getUTCDate()) + " de " + meses[fecha_actual.getUTCMonth()] + " de " + fecha_actual.getUTCFullYear()+
									"<br>Hora : " + horaSalida + " - " + horaLlegada +
									"<br>Lugares: " + oferta + ", Puntos: " + tarifa +
									"</div>"+
							"</div>"+
							"<div class=\"ui-block-b\">"+
								"<div class=\"ui-bar\" style=\"height:5em; border-top-width : 0 ; background-color: #d9edf7;\">"+
									"<div class=\"ui-block-a\">Folio de Lista de Espera: "+ idLE+"</div>"+
								"</div>"+
							"</div>";
					 }
				 }
	});
	cierraCargando();
	$("#listCorrida" ).listview();
	$("#listCorrida").html(listaCorridas);
	$("#listmenu").listview("refresh");
	$.mobile.changePage("#corridas");
	
}

function cargaReservas(id, nombre, fecha, horasalida){
	//miReserva.push(id);
	//var envia = document.getElementById('reserva');
	//desa.style.display = 'block';
	if (confirm("\u00bfDesea reservar para la ruta " + nombre + " ["+fecha+" Salida: "+horasalida+"]?") == true) {
		enviadatos(id);
		var desa = document.getElementById('R'+ id);
		desa.style.display = 'none';
    } else {
        return;
    }
	//enviadatos(id);
}

function cargaLista(id, nombre, fecha, horasalida){
	//miEspera.push(id);
	//var envia = document.getElementById('reserva');
	//desa.style.display = 'block';
	if (confirm("\u00bfDesea apuntarse en lista de espera para la ruta " + nombre + " ["+fecha+" Salida: "+horasalida+"]?") == true) {
		enviaListaEspera(id);
		var desa = document.getElementById('L'+ id);
		desa.style.display = 'none';
    } else {
        return;
    }
}

function enviaListaEspera(id){
	cargando();
	var token = window.localStorage.getItem("token");
	var token = token.replace("\"","");
	var token = token.replace("\"","");
	var token = "Bearer " + token;
	$.ajax({
	    type: "POST",    //define the type of ajax call (POST, GET, etc)
	    url: servicesUrl+'/compra/esperar/'+id,   //The name of the script you are calling
	    headers: {Authorization: token},    //Your data you are sending to the script
	    success: function(msg, e){
	    	if(msg.success){
	    		showAlert(JSON.stringify(msg.msg), "Lista de Espera", alertDismissed);
	    	}else{
	    		showAlert(JSON.stringify(msg.msg), "Error", alertDismissed);
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

function enviadatos(id){
	cargando();
	var token = window.localStorage.getItem("token");
	var token = token.replace("\"","");
	var token = token.replace("\"","");
	var token = "Bearer " + token;
	$.ajax({
	    type: "POST",    //define the type of ajax call (POST, GET, etc)
	    url: servicesUrl+'/compra/reservar/'+id,   //The name of the script you are calling
	    headers: {Authorization: token},    //Your data you are sending to the script
	    success: function(msg, e){
	    	if(msg.success){
	    		showAlert(JSON.stringify(msg.msg), "Reservaci\u00f3n", alertDismissed);	
	    	}else{
	    		showAlert(JSON.stringify(msg.msg), "Error", alertDismissed);
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
