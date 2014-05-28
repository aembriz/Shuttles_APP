var puntos = [];
var marker;

function creapuntos(){
  var mapOptions = {
    zoom: 10,
    //Optenemos el centro del mapa
    center: new google.maps.LatLng(19.4338902, -99.1530205)
  };
  map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
  // esperamos el click en el mapa
  google.maps.event.addListener(map, 'click', addLatLng);
}

// empezamos el evento para obtener puntos
function addLatLng(event) {
  // introducimos cordenadas a las variables
  var Count = puntos.push(event.latLng);
  if (Count == 1) {
    // Agregamos el marker inicial
    marker = new google.maps.Marker({
      position: event.latLng,
      animation: google.maps.Animation.DROP,
      draggable:true,
      title: '#Origen',
      map: map,
      icon:"imgs/3.png"
    });
    angular.element($('.view-frame')).scope().puntoALat = marker.position.Lat();
    angular.element($('.view-frame')).scope().puntoALng = marker.position.Lng();
    angular.element($('.view-frame')).scope().$apply();
  } else if (Count == 2) {
    // Agregamos el marker final
    marker = new google.maps.Marker({
      position: event.latLng,
      animation: google.maps.Animation.DROP,
      draggable:true,
      title: '#Destino',
      map: map,
      icon:"imgs/1.png"
    });
    //window.location.href = "#/usuarioBuscarRutasList";
    angular.element($('.view-frame')).scope().puntoBLat = marker.position.Lat();
    angular.element($('.view-frame')).scope().puntoBLng = marker.position.Lng();
    angular.element($('.view-frame')).scope().$apply();
    angular.element($('.view-frame')).scope().sugerir(); 
    angular.element($('.view-frame')).scope().$apply();
  }

}
