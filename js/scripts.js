/* affix the navbar after scroll below header */
$('#nav').affix({
      offset: {
        top: $('header').height()-$('#nav').height()
      }
});	

/* highlight the top nav as scrolling occurs */
$('body').scrollspy({ target: '#nav' })

/* smooth scrolling for scroll to top */
$('.scroll-top').click(function(){
  //$('body,html').animate({scrollTop:0},1000);
  moveToSection("#section_0");
})

/* smooth scrolling for nav sections */
$('#nav .navbar-nav li>a').click(function(){
  var link = $(this).attr('href');
  /*
  var posi = $(link).offset().top+20;
  $('body,html').animate({scrollTop:posi},700);
  */
  moveToSection(link);
})

$('a.move2sec').click(function(){
  var link = $(this).attr('href');
  moveToSection(link);
});

var currentSection = "#section_0";
var moveToSection = function(section){
  //if ($('body,html').scrollTop <
  var menuPos = $('#menu').position().top;
  if (menuPos < 10) {
    var posi = $(section).offset().top-0;
  } else {
    var posi = $(section).offset().top-119;
  }
  
  $('body,html').animate({scrollTop:posi},700);
  currentSection = section;
}
var moveToPrevSection = function(){  
  var part = currentSection.split("_");
  var idx = part[1];  
  idx--;
  if(idx < 0) idx = 0;
  var newSection = part[0].split("-")[0] + "_" + idx;
  //console.log(currentSection + "-->" + newSection);
  moveToSection(newSection);
}
var moveToNextSection = function(){  
  var part = currentSection.split("_");
  var idx = part[1];
  idx++;
  if(idx >= 5) idx = 5;
  var newSection = part[0].split("-")[0] + "_" + idx;
  //console.log(currentSection + "-->" + newSection);
  moveToSection(newSection);
}
$(document).keydown(function(e) { // keypress ignores navigation keys
  //console.log("---->" + e.which);
  if(e.which==33){ // RePg
    moveToPrevSection();
  }
  else if(e.which==34){ // AvPg
    moveToNextSection();
  }
});

/* google maps */

/*
// enable the visual refresh
google.maps.visualRefresh = true;

var map;
function initialize() {
  var mapOptions = {
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
  	// try HTML5 geolocation
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);

      var infowindow = new google.maps.InfoWindow({
        map: map,
        position: pos,
        content: 'Location found using HTML5.'
      });

      map.setCenter(pos);
    }, function() {
      handleNoGeolocation(true);
    });
  } else {
    // browser doesn't support geolocation
    handleNoGeolocation(false);
  }
}

function handleNoGeolocation(errorFlag) {
  if (errorFlag) {
    var content = 'Error: The Geolocation service failed.';
  } else {
    var content = 'Error: Your browser doesn\'t support geolocation.';
  }

  var options = {
    map: map,
    position: new google.maps.LatLng(60, 105),
    content: content
  };

  var infowindow = new google.maps.InfoWindow(options);
  map.setCenter(options.position);
}
google.maps.event.addDomListener(window, 'load', initialize);
*/

/* ++++++++++++++++ NUESTROS CLIENTES +++++++++++++++++*/
var servicesUrl = "http://54.201.26.22:8083";
//var servicesUrl = "http://localhost:8082";
var cargarClientes = function(){
  var api = servicesUrl + "/public/empresas"  
  $.get( api, function( data ) {
    
    if(data==null || data.success==false){
      console.log("No se pudo acceder al servicio para obtener clientes")
    }
    
    var slideA1 = '<div class="item active">'
    var slideA2 = '<div class="item ">'
    var slideA = ''
    slideA += '<div class="container-fluid">'
    slideA += '<div class="col-md-10 col-md-offset-1">'
    slideA += '<div class="container-fluid">'
    var slideB = '</div>'
    slideB += '</div>'
    slideB += '</div>'
    slideB += '</div>';

    var imgs = data.resultObject;
    var num=0; numSets=0;
    var divset = "";
    for(x=0; x<imgs.length; x++){
      //console.log("---------------->" + imgs[x].logoUrl);
      var div = '<div class="col-xs-12 col-md-4">'
      div += '<a href="#" class="thumbnail">'
      div += '  <img src="' + imgs[x].logoUrl + '" title="' + imgs[x].nombre + '"" alt="..." class="imgcontent">'
      div += '</a>'
      div += '</div> '
      divset += div;
      num++; 
      if(num>=3) { // (agrega slide)            
        $( "#carousel-clientes" ).append((numSets==0?slideA1:slideA2) + slideA + divset + slideB );            
        num=0;
        divset="";
        numSets++;
      }          
    }

    if(divset != "") { // (agrega slide)
      $( "#carousel-clientes" ).append((numSets==0?slideA1:slideA2) + slideA + divset + slideB );
      divset="";
    }                  
    
  }, "json" );    
}
cargarClientes();


/*++++++++++++++++++++++++++++ CONTACTOS ++++++++++++++++++++++++++++++*/

/* --------------- CONTACTO - Soy Empresa ------------------- */

$.validate({
  form : '#form_contacto_soyempresa',
  onError : function() {
    alert('Favor de corregir los datos marcados en rojo.');
  },
  onSuccess : function() {
    enviarContactoSoyEmpresa();
    return false; // Will stop the submission of the form
  }
});


var enviarContactoSoyEmpresa = function(){
  var api = servicesUrl + "/public/contacto/empresa"

  var actividad = $('input[name=empresaActividad]:checked', '#form_contacto_soyempresa').val();

  var objSoyEmpresa = {};
  objSoyEmpresa.nombre = $('#empresaNombre').val();
  objSoyEmpresa.sede = $('#empresaSede').val();
  objSoyEmpresa.direccion = $('#empresaDireccion').val();
  objSoyEmpresa.calle = $('#empresaCalle').val();
  objSoyEmpresa.colonia = $('#empresaColonia').val();
  objSoyEmpresa.delegacion = $('#empresaDelegacion').val();
  objSoyEmpresa.ciudad = $('#empresaCiudad').val();
  objSoyEmpresa.empleadosnum = $('#empresaEmpleadosNum').val();
  objSoyEmpresa.trasladocomo = $('#empresaTrasladoComo').val();
  objSoyEmpresa.contactonombre = $('#empresaContactoNombre').val();
  objSoyEmpresa.contactocorreo = $('#empresaContactoCorreo').val();

  objSoyEmpresa.actividad = actividad;
  if(actividad=='otra'){
    objSoyEmpresa.actividad = $('#empresaActividadOtra').val();
  }  

  objSoyEmpresa.tunombre = $('#empresaTuNombre').val();
  objSoyEmpresa.tutelefono = $('#empresaTuTelefono').val();
  objSoyEmpresa.tucorreo = $('#empresaTuCorreo').val();
  objSoyEmpresa.tucomo = $('#empresaTuComo').val();


  // enviar solciitud
  $.post( api, objSoyEmpresa, function( data ) {
    if(data.success==true){
      alert("Se envió tu solicitud, en breve nos pondremos en contacto.");
    }
    else{
      alert("Lo sentimos, no se pudo enviar tu solicitud. Inténtalo más tarde."); 
      console.log(data);
    }
  }, "json");  
  
  //clear inputs
  $('input[type=text]', '#form_contacto_soyempresa').each(function(){
    $(this).val(""); // $(this).attr('id')
  })

};

/* ------------------ CONTACTO - Soy Empleado -------------------- */

$.validate({
  form : '#form_contacto_soyempleado',
  onError : function() {
    alert('Favor de corregir los datos marcados en rojo.');
  },
  onSuccess : function() {
    enviarContactoSoyEmpleado();
    return false; // Will stop the submission of the form
  }
});


var enviarContactoSoyEmpleado = function(){
  var api = servicesUrl + "/public/contacto/empleado"

  var actividad = $('input[name=empleadoActividad]:checked', '#form_contacto_soyempleado').val();

  var contacto = {};
  contacto.nombre = $('#empleadoNombre').val();
  contacto.empresa = $('#empleadoEmpresa').val();
  contacto.sede = $('#empleadoSede').val();
  contacto.correo = $('#empleadoCorreo').val();
  contacto.telefono = $('#empleadoTelefono').val();
  contacto.como = $('#empleadoComo').val();
  contacto.porque = $('#empleadoPorque').val();

  contacto.contactonombre = $('#empleadoContactoNombre').val();
  contacto.contactotelefono = $('#empleadoContactoTelefono').val();
  contacto.contactocorreo = $('#empleadoContactoCorreo').val();

  contacto.actividad = actividad;
  if(actividad=='otra'){
    contacto.actividad = $('#empleadoActividadOtra').val();
  }  

  // enviar solciitud
  $.post( api, contacto, function( data ) {
    if(data.success==true){
      alert("Se envió tu solicitud, en breve nos pondremos en contacto.");
    }
    else{
      alert("Lo sentimos, no se pudo enviar tu solicitud. Inténtalo más tarde."); 
      console.log(data);
    }
  }, "json");  
  
  //clear inputs
  $('input[type=text]', '#form_contacto_soyempleado').each(function(){
    $(this).val(""); // $(this).attr('id')
  })

};

/* ------------------ CONTACTO - general -------------------- */

$.validate({
  form : '#form_contacto',
  onError : function() {
    alert('Favor de corregir los datos marcados en rojo.');
  },
  onSuccess : function() {
    enviarContacto();
    return false; // Will stop the submission of the form
  }
});


var enviarContacto = function(){
  var api = servicesUrl + "/public/contacto/general"

  var contacto = {};
  contacto.nombre = $('#contactoNombre').val();
  contacto.correo = $('#contactoCorreo').val();
  contacto.mensaje = $('#contactoMensaje').val();  

  if(contacto.mensaje.trim().length < 10){
    alert("Favor de proporcionar el mensaje.");
    return;
  }

  // enviar solciitud
  $.post( api, contacto, function( data ) {
    if(data.success==true){
      alert("Se envió tu solicitud, en breve nos pondremos en contacto.");
    }
    else{
      alert("Lo sentimos, no se pudo enviar tu solicitud. Inténtalo más tarde."); 
      console.log(data);
    }
  }, "json");  
  
  //clear inputs
  $('input[type=text]', '#form_contacto').each(function(){
    $(this).val(""); // $(this).attr('id')
  })
  $('textarea', '#form_contacto').each(function(){
    $(this).val(""); // $(this).attr('id')
  })  

};

/* Despliega el pop-up del detalle del proyecto*/
var showProyecto = function(idxProyecto){
  $("#popup-proyectos").show();
};

var hideProyecto = function(){
  $("#popup-proyectos").hide();
};

$('#enviar').click(function() {

   var nombre =  $('#contactoNombre').val();
   var email = $('#contactoCorreo').val();
   var mensaje = $('#contactoMensaje').val();

   if(nombre == ""){
    alert ("Favor de proporcionar nombre");
   }else if(email == ""){
    alert ("Favor de proporcionar email");
   }else if(mensaje == ""){
    alert ("Favor de proporcionar menaje");
  }else {

    if(validarEmail(email)){

    $.ajax({
        url: "php/correo.php",
       type: "post",
       data: "nombre="+nombre+"&email="+email+"&asunto="+mensaje,
       success: function(data){
           alert(data);
       }
    });
    }
  }
});

function validarEmail( email ) {
    expr = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if ( !expr.test(email) ){
        alert("Error: La dirección de correo " + email + " es incorrecta.");
      return false;
      }
      return true;
}