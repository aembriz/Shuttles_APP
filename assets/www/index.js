//var servicesUrl = "http://54.201.26.22:8082";
var servicesUrl = "http://54.201.26.22:8083";
var watchLTLG = null;
var miLatitud, miLongitud;
var app = {

    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
    	//Llamamos la función de FastClick para todos los elementos que esten en el body 
    	 document.addEventListener("backbutton", onBackKeyDown, false);
    	 document.addEventListener("menubutton", onMenuKeyDown, false);
    	FastClick.attach(document.body);
    	window.localStorage.removeItem("rutas");
    	//navigator.geolocation.getCurrentPosition(onSuccess, onError);
    	
    	if(window.localStorage.getItem("usuario") != ""){
    		var usuario = window.localStorage.getItem("usuario");
    		var usuario = usuario.replace("\"","");
    		var usuario = usuario.replace("\"","");
    		$("#user")[0].value = usuario;
    	}
    	
    	$("#home").on("pageshow", function(event){
    		if(window.localStorage.getItem("login")=="true"){
    			$.mobile.changePage("#menuPrincipal");
    		}
    	});    	

    	$("#corridas").on("pagehide", function(){
    		$("#listCorrida").html("");
    		//$("#listCorrida").empty(); 
    		});
    	
    	$("#sugerencia").on("pagehide", function(){
    		$("#comentario").val("");
    		//$("#listCorrida").empty(); 
    		});
    	
    	$("#mapaPag").on("pageshow", function onPageShow() 
        {
    		initialize();
        });
    	
    	$("#credencial").on("pageshow", function onPagesShow()
    	{
    		document.getElementById('foto').src = window.localStorage.getItem("foto");
    		document.getElementById('nombreUsuario').innerText = window.localStorage.getItem("nombre");
    		document.getElementById('empresaUsuario').innerText = "Empresa: "+window.localStorage.getItem("empresa");
    		document.getElementById('emailUsuario').innerText = "Email: "+window.localStorage.getItem("email");
    		document.getElementById('fotoEmp').src = window.localStorage.getItem("logoEmp");
    		
    	});
    	
    	$("#nubeet").on("click", function(){
    		pagina();
    	});
       	
       	/***MAPA******/
       	$(document).on("pageinit", "#SugerenciaRuta", function () { 
       		cargando();
            //Definimos la función que calculara el alto
	function getRealContentHeight() {
		var header = $.mobile.activePage.find("div[data-role='header']:visible");
		var footer = $.mobile.activePage.find("div[data-role='footer']:visible");
		var content = $.mobile.activePage.find("div[data-role='content']:visible:visible");
		var viewport_height = $(window).height();
		
		var content_height = viewport_height - header.outerHeight() - footer.outerHeight();
		if((content.outerHeight() - header.outerHeight() - footer.outerHeight()) <= viewport_height) {
			content_height -= (content.outerHeight() - content.height());
		} 

		return content_height;
		
	}

            //en este caso el div con id "mapa es el elemento que queremos modificar su alto
	var mapa = $('#map_canvas');
            //En algunos casos no acaba de calcular bien los pixeles, con este valor corregimos le error
	var ajuste = 0; 

            //Creamos una función que hará los ajustes en la pagina
	function redimensionarMapa(){
		var calculaAlto = (getRealContentHeight()*76)/100;
		mapa.height(calculaAlto - ajuste);
	}

	//Añadimos el evento para que cada vez que se cambie de tamaño la pantalla se ejecute la funcion de ajuste
	$( window ).resize(function() {
		redimensionarMapa();

	});

           //ejecutamos la función por primera vez al cargar la pagina
           redimensionarMapa();
           obtienePocicion();

});
       	
       	$(document).on({
       	    'DOMNodeInserted': function() {
       	        $('.pac-item, .pac-item span', this).addClass('needsclick');
       	    }
       	}, '.pac-container');
    	
    }
};

function onBackKeyDown() {
	//if($.mobile.activePage.attr('id') != 'home'){
		//navigator.app.backHistory();
	//}
}

function onMenuKeyDown() {
    // Maneja el evento del botón menú
    //$("#menuOpcionalMap").popup("open");
   // $( "#menuOpcionalMap" ).popup( "open", options );
	//$("#popMenuPri").click();
}


function login() {
	var user = $("#user")[0].value;
	var pass = $("#password")[0].value;

	if(pass == "" || user == ""){
		showAlert("Usuario o Password sin Llenar", "Error Login!!", alertDismissed);
	}else{
		var request_data = {username: user, password: pass};
		$.ajax({
		    type: "POST",    //define the type of ajax call (POST, GET, etc)
		    url: servicesUrl+'/login',   //The name of the script you are calling
		    data: request_data,    //Your data you are sending to the script
		    success: function(msg, e){
		    	if(msg.role == "USUARIO"){
		    		$.each(msg, function(name, value) {
			    			switch(name) {
			    			case "token":
			    				window.localStorage.setItem("token",value);
			    				break;
			    			case "nombre":
			    				window.localStorage.setItem("nombre",value);
			    				break;
			    			case "fotoUrl":
			    				window.localStorage.setItem("foto",value);
			    			break;
			    			case "logoUrl":
			    				window.localStorage.setItem("logoEmp",value);
			    				break;
			    			case "empresa":
			    				window.localStorage.setItem("empresaId",value);
			    				break;
			    			}
		    		});
		    	window.localStorage.setItem("usuario",JSON.stringify(user));
		    	window.localStorage.setItem("login","true");
		    	datosUsuario(JSON.stringify(msg.id));
		    	document.getElementById('logoEmp').src = window.localStorage.getItem("logoEmp");
		    	document.getElementById('logoEmp2').src = window.localStorage.getItem("logoEmp");
		    	document.getElementById('logoEmp3').src = window.localStorage.getItem("logoEmp");
		    	document.getElementById('logoEmp4').src = window.localStorage.getItem("logoEmp");
		    	document.getElementById('logoEmp5').src = window.localStorage.getItem("logoEmp");
		    	document.getElementById('logoEmp6').src = window.localStorage.getItem("logoEmp");
		    	cargaRutas();
		    	$.mobile.changePage("#menuPrincipal");
		    	buscaFav(2, true);
		    	//alert(si.length);
		    	//if (si.length >= 0){
		    	//	listaFavoritas();
		    	//}
		    	//listaFavoritas();
		    	}else{
		    		showAlert("Usted no tiene rol de Usuario", "Error Login!!", alertDismissed);
		    	}
		    },
			error: function(msg, estatus){
				showAlert("Usuario o Password Incorrecto", "Error Login!!", alertDismissed);
			}
		});
	}
}

function validarUsuario( email ) {
    expr = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if ( !expr.test(email) )
        alert("Error: El usuario " + email + " no es valido.");
}

function obtienePocicion(){
	navigator.geolocation.getCurrentPosition(onSuccess, onError,{timeout: 4000});
}

function onSuccess(position) {
	 miLatitud = position.coords.latitude;
	 miLongitud = position.coords.longitude;
	 mapaSugerencia();
	 //setTimeout(mapaSugerencia, 400);
		
}

function onError(error) {
	if(error.code == "3" || error.code == "2"){
		ltlnFija = false;
		miLatitud = 19.4338902;
		miLongitud = -99.1530205;
		mapaSugerencia();
		//setTimeout(mapaSugerencia, 400);
		
	}else{
    alert('codigo: '    + error.code    + '\n' +
          'mensaje: ' + error.message + '\n');
	}
}

function showAlert(msg, title, callback) {
    navigator.notification.alert(
        msg,  			// message
        callback,       // callback
        title,        // title
        'Done'          // buttonName
    );
}

function alertDismissed() {
    // do something
}

function logaout(){
	window.localStorage.setItem("login","false");
	$("#user")[0].value = null;
	$("#password")[0].value = null;
	$.mobile.navigate.history.stack[0];
	$.mobile.changePage("#home", {reverse: false, changeHash: false});
}
function salir(){
	navigator.app. exitApp();
}

function cargando(){
	$.mobile.loading( "show", {
        text: "CARGANDO!!",
        textVisible: true,
        theme: "c",
        textonly: false,
        html: ""
	});
}

function cierraCargando(){
	$.mobile.loading( "hide" );
}