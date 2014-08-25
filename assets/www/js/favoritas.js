	var si = new Array();
function favorito (id){
	cargando();
	var token = window.localStorage.getItem("token");
	var token = token.replace("\"","");
	var token = token.replace("\"","");
	var token = "Bearer " + token;
	$.ajax({
	    type: "PUT",    //define the type of ajax call (POST, GET, etc)
	    url: servicesUrl+'/rutafavorita/add?rutaid='+id,   //The name of the script you are calling
	    headers: {Authorization: token},    //Your data you are sending to the script
	    success: function(dir){
	    	if(dir.success == false ){
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
	
	//$("#favorito"+id).addClass('ui-btn-c');
	//$("#favorito"+id).attr("disabled", true);
	$("#favoritoS"+id).css('display', 'none');
	$("#favoritoSR"+id).css('display', 'block');
	cierraCargando();
}

function removefavorito (id, cambList){
	cargando();
	var token = window.localStorage.getItem("token");
	var token = token.replace("\"","");
	var token = token.replace("\"","");
	var token = "Bearer " + token;
	$.ajax({
	    type: "PUT",    //define the type of ajax call (POST, GET, etc)
	    url: servicesUrl+'/rutafavorita/remove?rutaid='+id,   //The name of the script you are calling
	    headers: {Authorization: token},    //Your data you are sending to the script
	    success: function(dir){
	    	if(dir.success){
	    		if(cambList){
	    			listaFavoritas();
	    		}
	    		cierraCargando();
	    	}else{
	    		showAlert(dir.msg, "Error", alertDismissed);
	    	}
	    },
		error: function(msg, estatus){
			var err =JSON.stringify(msg);			
			if(err.indexOf("[ERR0001]")> 0){
				showAlert("Expir\u00f3 tiempo de usuario", "Aviso", logaout);
				cierraCargando();
			}else
			showAlert(JSON.stringify(msg.msg), "Remover Favorito", alertDismissed);
			cierraCargando();
		}
	});
	
	//$("#favorito"+id).addClass('ui-btn-c');
	//$("#favorito"+id).attr("disabled", true);
	$("#favoritoS"+id).css('display', 'block');
	$("#favoritoSR"+id).css('display', 'none');
}


function buscaFav(tipoMenu, inicio){
	cargando();
	var fine, fineP;
	while(si.length > 0) {
	    si.pop();
	}

	var token = window.localStorage.getItem("token");
	var token = token.replace("\"","");
	var token = token.replace("\"","");
	var token = "Bearer " + token;
	$.ajax({
	    type: "GET",    //define the type of ajax call (POST, GET, etc)
	    url: servicesUrl+'/rutafavorita',   //The name of the script you are calling
	    headers: {Authorization: token},    //Your data you are sending to the script
	    success: function(dir){
	    	fine = JSON.stringify(dir);
	    	fineP = JSON.parse(fine);
	    	if(fineP.success){
		    	$.each(fineP.resultObject, function() {
		    		$.each(this, function(name, value) {
		    		if(name == "RutaId"){
		    			si.push(value);
		    		}
		    		});
		  	  	});
		    	if(inicio){
		    	if (si.length > 0){
		    		listaFavoritas();
		    	}else{
		    		menurutas(tipoMenu);
		    	}
		    	}else{
		    		menurutas(tipoMenu);
		    	}
		    		
	    	}else{
	    		showAlert(fineP.msg, "Error", alertDismissed);
	    	}
	    },
		error: function(msg){
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

var rutafavorita;
function listaFavoritas (){
   cargando();
	var token = window.localStorage.getItem("token");
	var token = token.replace("\"","");
	var token = token.replace("\"","");
	var token = "Bearer " + token;
	$.ajax({
	    type: "GET",    //define the type of ajax call (POST, GET, etc)
	    url: servicesUrl+'/rutafavorita',   //The name of the script you are calling
	    headers: {Authorization: token},    //Your data you are sending to the script
	    success: function(dir){
	    	if(dir.success){
		    	rutafavorita = JSON.stringify(dir);
	    		creaListaFav ();
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

function creaListaFav (){
	var id, nombre, descripcion, distanciaAprox, tiempoAprox; 
	var origen, destino, listRutas="";
	
	var rutasFav = JSON.parse(rutafavorita);
	$.each(rutasFav.resultObject, function() {
	  	  $.each(this.rutum, function(name, value) {
	  		switch(name) {
	  		case "nombre":
	  			nombre = value;
	  			break;
	  		case "descripcion":
	  			descripcion = value;
	  			break;
	  		case "distanciaaprox":
	  			distanciaAprox = value;
	  			break;
	  		case "tiempoaprox":
	  			tiempoAprox = value;
	  			break;
	  		case "origentxt":
	  			origen = value;
	  			break;
	  		case "destinotxt":
	  			destino = value;
	  			break;
	  		case "id":
	  			id = value;
	  			break;
	  		}
	  	  });
	  	tipoMenu = 2;
	  	listRutas += 
	  		"<li class=\"ui-body ui-body-c\">"+
	  		"<div class=\"ui-grid-a gridLetra\" style=\"width: 100%\">"+
	  			"<div class=\"ui-block-a\" style=\"width: 62%\">"+
	  				"<div class=\"ui-bar ui-bar-c\" style=\"height:95px; border-width : 0\">"+
	  					"<table data-role=\"table\" id=\"movie-table-custom\" data-mode=\"reflow\" class=\"movie-list ui-responsive\">"+
		  					"<tr>"+
			  					"<th>"+
				  					"<img src=\"img/Star2.2.png\" style=\"display:block\" id='favoritoSR"+id+"' onClick=\"removefavorito('"+id+"', true)\">"+
			  					"</th>"+
			  					"<th>"+
			  						"<p><strong>" + nombre +"</strong></p>"+
			  					"</th>"+
		  					"</tr>"+
	  					"</table>"+
	  					"<p class=\"ajustaL\">"+ descripcion+"</p>"+ 
	  					"<p>"+origen+" - "+ destino +"</p>"+
	  				"</div>"+
	  			"</div>"+
	  			"<div class=\"ui-block-b\" style=\"width: 38%\">"+
	  				"<div class=\"ui-bar\" style=\"height:88px; border-width : 0\">"+
	  					"<button onclick=\"+optienePuntos('"+id+"');\"class=\"ui-btn ui-shadow ui-corner-all ui-btn-icon-left ui-icon-location ui-btn-icon-notext\">Mapa</button>"+
	  					"<button onclick=\"cargaCorridas('"+id+"','"+tipoMenu+"','"+nombre+"','"+origen+"','"+destino+"')\" class=\"ui-btn ui-mini\">Consultar</button>"+
	  				"</div>"+
	  			"</div>"+
	  		"</div>"+
	  	"</li>";
	  	}); 
	document.getElementById('shop').style.display = 'block';
	document.getElementById('corazon').style.display = 'none';
	$("#tit").html("Rutas Favoritas");
	$("#listmenu").html(listRutas);
	cierraCargando();
	$( "#listmenu" ).listview( "refresh" );
	$.mobile.changePage("#menuPrincipal");
	
}