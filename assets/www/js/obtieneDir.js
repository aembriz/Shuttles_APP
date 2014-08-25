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
	cargando();
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
	    	if(dir.success){
	    	rutaSugerida = JSON.stringify(dir);
	    	listaRutSugerida();
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

function listaRutSugerida (){
	var lejania, id, nombre, descripcion, distanciaaprox, tiempoaprox, origentxt, destinotxt; 
	var listRutasSug = "";
	
	var rutasSug = JSON.parse(rutaSugerida);
	$.each(rutasSug.resultObject, function() {
		 $.each(this, function(name, value) {
			switch(name){
			case "lejania":
				lejania = value;
				break;
			}
			});
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
	  	tipoMenu = 2;
	  	listRutasSug += 
	  		"<li class=\"ui-body ui-body-c\">"+
	  		"<div class=\"ui-grid-a gridLetra\" style=\"width: 100%\">"+
	  			"<div class=\"ui-block-a\" style=\"width: 62%\">"+
	  				"<div class=\"ui-bar ui-bar-c\" style=\"height:95px; border-width : 0\">"+
	  					"<table data-role=\"table\" id=\"movie-table-custom\" data-mode=\"reflow\" class=\"movie-list ui-responsive\">"+
		  					"<tr>"+
			  					"<th>"+
				  					"<img src=\"img/Star1.1.png\" style=\"display:block\" id='favoritoS"+id+"' onClick=\"favorito('"+id+"')\">"+
				  					"<img src=\"img/Star2.2.png\" style=\"display:none\" id='favoritoSR"+id+"' onClick=\"removefavorito('"+id+"', false)\">"+
			  					"</th>"+
			  					"<th>"+
			  						"<p><strong>" + nombre +"</strong></p>"+
			  					"</th>"+
		  					"</tr>"+
	  					"</table>"+
	  					"<p class=\"ajustaL\">"+ descripcion+"</p>"+ 
	  					"<p>"+origentxt+" - "+ destinotxt +"</p>"+
	  				"</div>"+
	  			"</div>"+
	  			"<div class=\"ui-block-b\" style=\"width: 38%\">"+
	  				"<div class=\"ui-bar\" style=\"height:88px; border-width : 0\">"+
	  					"<button onclick=\"+optienePuntos('"+id+"');\"class=\"ui-btn ui-shadow ui-corner-all ui-btn-icon-left ui-icon-location ui-btn-icon-notext\">Mapa</button>"+
	  					"<button onclick=\"cargaCorridas('"+id+"','"+tipoMenu+"','"+nombre+"','"+origentxt+"','"+destinotxt+"')\" class=\"ui-btn ui-mini\">Consultar</button>"+
	  				"</div>"+
	  			"</div>"+
	  		"</div>"+
	  	"</li>";
	  	}); 
	
	$("#listmenu").html("");
	$("#listmenu").html(listRutasSug);
	$( "#listmenu" ).listview( "refresh" );
	$.mobile.changePage("#menuPrincipal");
	cierraCargando();
}

function puntosEnMapa(){
	setTimeout(mapaSugerencia, 400);//mapaSugerencia();
}

function escribeDireccion(){
	
	document.getElementById('botonBMapa').style.display = 'block';
	document.getElementById('escribeDireccion').style.display = 'none';
	document.getElementById('escribeDir').style.display = 'block';
	document.getElementById('bMapa').style.display = 'none';
	
}