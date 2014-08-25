var res;
function cargaCancelar (){
	cargando();
	var token = window.localStorage.getItem("token");
	var token = token.replace("\"","");
	var token = token.replace("\"","");
	var token = "Bearer " + token;
	$.ajax({
	    type: "GET",    //define the type of ajax call (POST, GET, etc)
	    url: servicesUrl+'/compra/misreservaciones?estatus=confirmed&vigente=true&order=RutaId',   //The name of the script you are calling
	    headers: {Authorization: token},    //Your data you are sending to the script
	    success: function(dir){
	    	res = JSON.stringify(dir);
	    	if(dir.success){
	    		listaCancelar();
	    	} else{
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

function listaCancelar(){
	var lista, listCancel = "";
	var fechaReservacion, nombre, descripcion, distanciaaprox, tiempoaprox, origentxt, destinotxt, RutaId, idC, estatus;
	var horaSalida, horaLlegada, compara;
	var dias_semana = new Array("Lunes","Martes","Miercoles","Jueves","Viernes","Sabado","Domingo");
	var meses = new Array ("Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre", "Diciembre");

	lista = JSON.parse(res);
	$.each(lista.resultObject, function() {
		 $.each(this, function(name, value) {
			 switch(name) {
			 case "estatus":
				 estatus = value;
				 break;
			 case "id":
				 idC = value;
				 break;
			 case "fechaReservacion":
				 fechaReservacion = value.substring(0,10);
				 break;
			 case "RutaId":
				 RutaId = value;
				 break;
		}
		 });
	  	  $.each(this.rutum, function(name, value) {
	  		switch(name) {
	  		case "nombre":
	  			nombre = value;
	  			break;
	  		case "descripcion":
	  			descripcion = value;
	  			break;
	  		case "distanciaaprox":
	  			distanciaaprox = value;
	  			break;
	  		case "tiempoaprox":
	  			tiempoaprox = value;
	  			break;
	  		case "origentxt":
	  			origentxt = value;
	  			break;
	  		case "destinotxt":
	  			destinotxt = value;
	  			break;
	  		} 
	  	  });
	  		$.each(this.rutaCorrida, function(name, value) {
	  			switch(name) {
	  			case "horaSalidaFmt":
	  				horaSalida = value;
	  				break;
	  			case "horaLlegadaFmt":
	  				horaLlegada = value;
	  				break;
	  			}
	  		});
	  		var fecha_actual = new Date (Date.parse(fechaReservacion));
	  		if(compara == ""){
	  			listCancel +=
	  				"<li data-role=\"list-divider\">"+ 
	  				"<button onclick=\"+optienePuntos('"+RutaId+"');\"class=\"ui-btn ui-shadow ui-corner-all ui-btn-icon-left ui-icon-location ui-btn-icon-notext\">Mapa</button>"+
	  				nombre.toUpperCase() + "</li>"+
	  				"<li class=\"ui-body ui-body-c\">"+
	  					"<div class=\"ui-grid-a gridLetra\">"+
	  						"<div class=\"ui-block-a\" style=\"width: 60%\">"+
	  							"<div class=\"ui-bar ui-bar-c\" style=\"height:3em; border-width : 0\">"+
	  							"<p><h3><strong>"+ dias_semana[fecha_actual.getDay()]+ " " + fechaReservacion +"</strong></h3></p>"+
  								"<p>Folio Reservaci&oacute;n: "+ ("0000" + idC).slice (-5) + "</p>" +
	  							"</div>"+
	  						"</div>"+
	  						"<div class=\"ui-block-b\" style=\"width: 40%\">"+
	  							"<div class=\"ui-bar\" style=\"height:3em; border-width : 0\">"+
	  								"<button onclick=\"cancelaRuta('"+idC+"')\" id='favorito"+idC+"' class=\"ui-btn ui-mini\">Cancelar</button>"+
	  							"</div>"+
	  						"</div>"+
	  					"</div>"+
	  				"</li>";
	  			
	  		}else if(compara == RutaId){
	  			listCancel +=
	  				"<li class=\"ui-body ui-body-c\">"+
	  				"<div class=\"ui-grid-a\">"+
	  					"<div class=\"ui-block-a gridLetra\" style=\"width: 60%; border-width : 0\">"+
	  						"<div class=\"ui-bar ui-bar-c\" style=\"height:3em; border-width : 0\">"+
	  							"<p><h3><strong>"+ dias_semana[fecha_actual.getDay()]+ " " + fechaReservacion +"</strong></h3></p>"+
  								"<p>Folio Reservaci&oacute;n: "+ ("0000" + idC).slice (-5) + "</p>" +  
	  						"</div>"+
	  					"</div>"+
	  					"<div class=\"ui-block-b\" style=\"width: 40%\">"+
	  						"<div class=\"ui-bar\" style=\"height:3em; border-width : 0\">"+
	  							"<button onclick=\"cancelaRuta('"+idC+"')\" id='favorito"+idC+"' class=\"ui-btn ui-mini\">Cancelar</button>"+
	  						"</div>"+
	  					"</div>"+
	  				"</div>"+
	  			"</li>";
	  		}else if (compara != RutaId){
	  			compara = RutaId;
	  			listCancel +=
	  				"<li data-role=\"list-divider\">"+ 
	  				"<button onclick=\"+optienePuntos('"+RutaId+"');\"class=\"ui-btn ui-shadow ui-corner-all ui-btn-icon-left ui-icon-location ui-btn-icon-notext\">Mapa</button>"+
	  				nombre.toUpperCase() +"<br>"+
	  				origentxt +" - "+ destinotxt + "<br>"+
	  				horaSalida+" - "+horaLlegada+
	  				"</li>"+
	  				"<li class=\"ui-body ui-body-c\">"+
	  					"<div class=\"ui-grid-a\">"+
	  						"<div class=\"ui-block-a gridLetra\" style=\"width: 60%\">"+
	  							"<div class=\"ui-bar ui-bar-c\" style=\"height:3em; border-width : 0\">"+
	  							"<p><h3><strong>"+ dias_semana[fecha_actual.getDay()]+ " " + fechaReservacion +"</strong></h3></p>"+
  								"<p>Folio Reservaci&oacute;n: "+ ("0000" + idC).slice (-5) + "</p>" +
	  							"</div>"+
	  						"</div>"+
	  						"<div class=\"ui-block-b\" style=\"width: 40%\">"+
	  							"<div class=\"ui-bar\" style=\"height:3em; border-width : 0\">"+
	  								"<button onclick=\"cancelaRuta('"+idC+"')\" id='favorito"+idC+"' class=\"ui-btn ui-mini\">Cancelar</button>"+
	  							"</div>"+
	  						"</div>"+
	  					"</div>"+
	  				"</li>";
	  			
	  		}
		  	
	});
	$("#listmenu").html("");
	$("#tit").html("Mis Reservaciones");
	capa = document.getElementById('corazon');
	capa.style.display = 'none';
	document.getElementById('sugRuta').style.display = 'none';
	document.getElementById('shop').style.display = 'none';
	$("#listmenu").html(listCancel);
	$( "#listmenu" ).listview( "refresh" );
	$.mobile.loading( "hide" );
}


function cancelaRuta(idCa){
	
	var token = window.localStorage.getItem("token");
	var token = token.replace("\"","");
	var token = token.replace("\"","");
	var token = "Bearer " + token;
	$.ajax({
	    type: "POST",    //define the type of ajax call (POST, GET, etc)
	    url: servicesUrl+'/compra/cancelar/'+idCa,   //The name of the script you are calling
	    headers: {Authorization: token},    //Your data you are sending to the script
	    success: function(dir){
	    	if(dir.success){
	    	showAlert(JSON.stringify(dir.msg), "Proceso de Cancelaci\u00f3n", alertDismissed);
	    	cargaCancelar();
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