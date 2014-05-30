var geocoder, origen, destino; 
function codeLatLng(lat, lng) {
	geocoder = new google.maps.Geocoder();
	var latlng = new google.maps.LatLng(lat, lng);
	
	geocoder.geocode({'latLng': latlng}, function(results, status) {
	if (status == google.maps.GeocoderStatus.OK) {
		if (results[1]) {
			document.getElementById('origen').value = results[1].formatted_address;
		} else {
			alert('No results found');
		}
	} else {
		alert('Geocoder failed due to: ' + status);
    }
	});
 }

function codeAddress(){	
	geocoder = new google.maps.Geocoder();
	var origenC = document.getElementById('origen').value;
	var origenRes = "";
	geocoder.geocode( { 'address': origenC}, function(results, status) {
	if (status == google.maps.GeocoderStatus.OK) {
		//alert(results[0].geometry.location);
		origenRes = String(results[0].geometry.location);
		origenRes = origenRes.replace("(","").replace(" ","");
		origenRes = origenRes.replace(")","").replace(" ","");
		origen = origenRes.split(",");
		obtieneDestino();
	} else {
		alert('Geocode was not successful for the following reason: ' + status);
	}	
	});
	
}

function obtieneDestino (){
	var destinoC = document.getElementById('destino').value;
	var destinoRes = "";
	geocoder.geocode( { 'address': destinoC}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			destinoRes= String(results[0].geometry.location);
			destinoRes = destinoRes.replace("(","").replace(" ","");
			destinoRes = destinoRes.replace(")","").replace(" ","");
			destino = destinoRes.split(",");
			enviaSolicitud();
		} else {
			alert('Geocode was not successful for the following reason: ' + status);
		}	
		});

}

var rutaSugerida;
function enviaSolicitud(){
	var token = window.localStorage.getItem("token");
	var token = token.replace("\"","");
	var token = token.replace("\"","");
	var token = "Bearer " + token;
	console.log("ORIGEN LAT: " + origen[0] + " ORGINE LNG: " + origen[1] + " DESTINO LAT: " + destino[0] + " DESTINO LNG: " + destino[0]);
	$.ajax({
	    type: "GET",    //define the type of ajax call (POST, GET, etc)
	    url: servicesUrl+'/compra/rutasugeridas?puntoALat='+origen[0]+"&puntoALng="+origen[1]+"&puntoBLat="+destino[0]+"&puntoBLng="+destino[1],   //The name of the script you are calling
	    headers: {Authorization: token},    //Your data you are sending to the script
	    success: function(dir){
	    	rutaSugerida = JSON.stringify(dir);
	    	listaRutSugerida();
	    },
		error: function(msg, estatus){
			alert(JSON.stringify(msg));
		}
	});
	//$.get(servicesUrl+'/compra/rutasugeridas?puntoALat='+origen[0]+"&puntoALng="+origen[1]+"&puntoBLat="+destino[0]+"&puntoBLng="+destino[1], function(dir,status) {
	//	if(status == "success"){
	//		alert(dir.lejania);
	//	}
}

function listaRutSugerida (){
	var lejania, id, nombre, descripcion, distanciaaprox, tiempoaprox, origentxt, destinotxt; 
	var listRutasSug = "";
	
	var rutasSug = JSON.parse(rutaSugerida);
	$.each(rutasSug, function(name, value) {
			switch(name){
			case "lejania":
				lejania = value;
				break;
			}
	  	  $.each(this.ruta, function(name, value) {
	  		switch(name) {
	  		case "id":
	  			id = value;
	  			break;
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
	  	tipoMenu = 1;
	  	listRutasSug += "<li class=\"ui-body ui-body-b\">"+
	  				 "<h2>Distancia: " + lejania +"</h2>"+
	  				 "<p><strong>Descripci&oacuten"+ 
	  				 descripcion+"</p></strong><p>Tiempo Aprox: "+ tiempoaprox+"</p>" + 
	  				 "<p>Origen: "+origentxt+" Destino: "+ destinotxt +"</p>"+
	  				 "<p class=\"ui-li-aside\"><strong>Distancia Aprox: "+distanciaaprox+"</p></strong>"+
	  				 "<fieldset class=\"ui-grid-a\">"+
	                 "<div class=\"ui-block-a\"><a onclick=\"cargaCorridas('"+id+"','"+tipoMenu+"')\"class=\"ui-btn ui-icon-clock ui-btn-icon-right\">Corrida</a></div>"+
	                 "<div class=\"ui-block-b\"><a onclick=\"+optienePuntos('"+id+"');\" class=\"ui-btn ui-icon-location ui-btn-icon-right\">Mapa</a></div>"+
	                 "</fieldset>"+
	  				 "</li>";
	  	}); 
	
	$("#listmenu").html(listRutasSug);
	$( "#listmenu" ).listview( "refresh" );
	$.mobile.changePage("#menuPrincipal");
}