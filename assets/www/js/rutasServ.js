function cargaRutas(){
	cargando();
	//Cargamos rutas
	var token = window.localStorage.getItem("token");
	var token = token.replace("\"","");
	var token = token.replace("\"","");
	var token = "Bearer " + token;
	$.ajax({
	    type: "GET",    //define the type of ajax call (POST, GET, etc)
	    url: servicesUrl+'/compra/ruta',   //The name of the script you are calling
	    headers: {Authorization: token},
	    success: function(dir){
	    	if(dir.success){
	    		window.localStorage.setItem("rutas",JSON.stringify(dir));
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
			}else{
				showAlert(err, "Aviso", alertDismissed);
				cierraCargando();
			}
		}
	});
}

//Carga menu rutas
function menurutas(tipoMenu){
	cargaRutas();
	listRutas = "";
	var id, nombre, descripcion, distanciaAprox, tiempoAprox; 
	var origen, destino, listRutas="";
	var rutas = JSON.parse(window.localStorage.getItem("rutas"));

	$.each(rutas.resultObject, function() {
	  	  $.each(this, function(name, value) {
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
	  		$.each(this.companyowner, function(name, value) {
	  			if(name == "id"){
	  				//alert(value);
	  			}
	  		});
	  	listRutas += 
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
	document.getElementById('shop').style.display = 'none';
	document.getElementById('corazon').style.display = 'block';
	document.getElementById('sugRuta').style.display = 'block';
	$("#tit").html("Rutas Disponibles");
	if(tipoMenu == 1){
	//	capa = document.getElementById('auxBotonCompra');
		//capa.style.display = 'none';
		$("#listmenu").html(listRutas);
	} else if(tipoMenu == 2){
		//capa = document.getElementById('auxBotonCompra');
		//capa.style.display = 'block';
		$("#listmenu").html(listRutas);
	}
	
	$( "#listmenu" ).listview( "refresh" );
	$.each(si, function (ind, elem) {
		//$("#favorito"+(elem)).attr("disabled", true);
		//$("#favoritoS"+elem).attr("src", "img/Star2.2.png");
		$("#favoritoS"+elem).css('display', 'none');
		$("#favoritoSR"+elem).css('display', 'block');
	});
	cierraCargando();
}