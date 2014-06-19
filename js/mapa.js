var puntos = [];
var path;
var marker;
var ArrDatos = [];
var arrPuntos = new Array();

function creapuntos(){
  /*
$('#Botpuntos').attr("disabled", true);
$('#limpia').attr("disabled", true);
$('#carga').attr("disabled", true);
*/
  var mapOptions = {
    zoom: 10,
    //Optenemos el centro del mapa
    center: new google.maps.LatLng(19.4338902, -99.1530205)
  };
console.log("EL ID ES -----> " + idm);
  map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

  var polyOptions = {
    strokeColor: '#000000',
    strokeOpacity: 1.0,
    strokeWeight: 3
    //editable: true,
    //draggable: true
  };
  poly = new google.maps.Polyline(polyOptions);
  poly.setMap(map);

  // esperamos el click en el mapa
  google.maps.event.addListener(map, 'click', addLatLng);
}

function consultapuntos(){
var flightPlanCoordinates = [];
infoPuntos = angular.element($('.view-frame')).scope().pMapa;
console.log("DATOS DE CONSULTA ----> " + infoPuntos[0].latitud);
  var infowindow =  new google.maps.InfoWindow({
      content: ""
  });
  var mapOptions = {
    zoom: 10,
    center:  new google.maps.LatLng(19.4338902, -99.1530205)
  };
  map = new google.maps.Map(document.getElementById('map_canvas'),
      mapOptions);
  var infowindow =  new google.maps.InfoWindow({
      content: ""
  });

  for (var i = 0; i < infoPuntos.length; i++) {
    console.log(infoPuntos[i].descripcion);
    flightPlanCoordinates.push(new google.maps.LatLng(
        parseFloat(infoPuntos[i].latitud),
            parseFloat(infoPuntos[i].longitud)));
  var latLng = new google.maps.LatLng( parseFloat(infoPuntos[i].latitud), parseFloat(infoPuntos[i].longitud)); 

  var marker = new google.maps.Marker({
      position: latLng,
      map: map,
      icon:"imgs/"+infoPuntos[i].tipo+".png"
  });
  
  bindInfoWindow(marker, map, infowindow, infoPuntos[i].descripcion);
}

var flightPath = new google.maps.Polyline({
      path: flightPlanCoordinates,
      geodesic: true,
      strokeColor: '#428bca',
      strokeOpacity: 1.0,
      strokeWeight: 2
       });

flightPath.setMap(map);
}

// empezamos el evento para crear la polilinea
function addLatLng(event) {
  /*$('#Botpuntos').attr("disabled", false);
$('#limpia').attr("disabled", false);*/
  path = poly.getPath();

  // introducimos cordenadas a las variables
  path.push(event.latLng);
  puntos.push(event.latLng);

  // Agregamos el marker.
  marker = new google.maps.Marker({
    position: event.latLng,
    //draggable:true,
    title: '#' + path.getLength(),
    map: map
  });
    }

var infoPuntos;
var flightPlanCoordinates = [];
function checkInfoMap(){
  infoPuntos = angular.element($('.view-frame')).scope().pMapa;
  var infowindow =  new google.maps.InfoWindow({
      content: ""
  });
  for (var i = 0; i < infoPuntos.length; i++) {
    console.log(infoPuntos[i].descripcion);
    flightPlanCoordinates.push(new google.maps.LatLng(
        parseFloat(infoPuntos[i].latitud),
            parseFloat(infoPuntos[i].longitud)));
  var latLng = new google.maps.LatLng( parseFloat(infoPuntos[i].latitud), parseFloat(infoPuntos[i].longitud)); 

  var marker = new google.maps.Marker({
      position: latLng,
      map: map,
      icon:"imgs/"+infoPuntos[i].tipo+".png"
  });
  
  bindInfoWindow(marker, map, infowindow, infoPuntos[i].descripcion);

}

var flightPath = new google.maps.Polyline({
      path: flightPlanCoordinates,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
       });

flightPath.setMap(map);

}
  
function bindInfoWindow(marker, map, infowindow, strDescription) {
    google.maps.event.addListener(marker, 'click', function() {
      if(strDescription != ""){
        infowindow.setContent(strDescription);
        infowindow.open(map, marker);
      }
    });
}

// hacemos el arreglo de la lista de cordenadas a llenar datos   
/*$("#Botpuntos").click(function(){
  for (x=0;x<puntos.length;x++){
        $('#puntos').append('<label for=\"cord\">Cordenada '+(x+1)+'</label><br>'+
          '<input type=\"text\" name=\"cordenada\" id=\"cord'+x+'\" value=\"'+puntos[x]+'\" size=\"45\" disabled><br>'+
          '<label for=\"Etiqueta\">Etiqueta</label><br>'+
           '<input type=\"text\" name=\"descripcion\" id=\"cord'+x+'\" size=\"45\"><br>'+
           '<label for=\"tipo\">Tipo</label><br>'+
           '<select name=\"tipo\" id=\"cord'+x+'\">'+
              '<option  value="1">Inicio</option>'+
              '<option  value="4">Esquina</option>'+
              '<option  value="3">Parada</option>'+
              '<option  value="2">Fin</option>'+
          '</select><br>'
          );
}
// desabilita boton de puntos
$('#Botpuntos').attr("disabled", true);
$('#limpia').attr("disabled", false);
$('#carga').attr("disabled", false);
});
*/

function setAllMap(map) {
  for (var i = 0; i < puntos.length; i++) {
    puntos[i].setMap(map);
  }
}
/*
// limpiamos los markers y lineas.
$("#limpia").click(function(){
  if ($('table.table td').length == 0){
    console.log ( "Noooooo hay filas en la tabla!! ----> " + $("table.table td").length );
  }
  $('#puntos').html("");
  puntos = [];
  creapuntos();

$('#Botpuntos').attr("disabled", true);
$('#limpia').attr("disabled", true);
$('#carga').attr("disabled", true);
});

//Cargamos los datos en un arrglo.
$("#carga").click(function(){
  for (x=0;x<puntos.length;x++){
    var punto = {};
    punto['indice'] = parseInt(x);
    $("#puntos").find(':input[id=cord'+x+']').each(function() {
      var elemento= this;
      //ArrDatos.push(elemento.name + ":" + elemento.value)
      if(elemento.name == 'cordenada'){
        var latlon = elemento.value.split(',');
        var latitud = latlon[0].replace("(","");
        var longitud = latlon[1].replace(")","");
        punto['latitud'] = parseFloat(latitud.trim());
          punto['longitud'] = parseFloat(longitud.trim());
      }else if(elemento.name == "descripcion"){
        punto[elemento.name] = elemento.value;
      }else{
      punto[elemento.name] = parseInt(elemento.value);
    }
    });
    console.log(idm);
    punto['RutaId'] = idm;
    arrPuntos[x] = punto;
  };
  var tmp = {puntos: arrPuntos};
  console.log(tmp);
angular.element($('.view-frame')).scope().save(tmp);
});
*/