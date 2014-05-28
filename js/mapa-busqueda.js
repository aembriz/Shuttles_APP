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

// empezamos el evento para crear la polilinea
function addLatLng(event) {
  // introducimos cordenadas a las variables
  var Count = puntos.push(event.latLng);
  if (Count == 1) {
    // Agregamos el marker inicial.
    marker = new google.maps.Marker({
      position: event.latLng,
      draggable:true,
      title: 'Origen',
      animation: google.maps.Animation.DROP,
      map: map,
      icon:"imgs/3.png"
    });
    angular.element($('.view-frame')).scope().PointCount = 1;
    angular.element($('.view-frame')).scope().OrigenLat = marker.position.lat();
    angular.element($('.view-frame')).scope().OrigenLng = marker.position.lng();
    angular.element($('.view-frame')).scope().$apply();
  } else if (Count == 2) {
    // Agregamos el marker final.
    marker = new google.maps.Marker({
      position: event.latLng,
      draggable:true,
      title: 'Destino',
      animation: google.maps.Animation.DROP,
      map: map,
      icon:"imgs/1.png"
    }); 
    angular.element($('.view-frame')).scope().PointCount = 2;
    angular.element($('.view-frame')).scope().DestinoLat = marker.position.lat();
    angular.element($('.view-frame')).scope().DestinoLng = marker.position.lng();
    angular.element($('.view-frame')).scope().$apply();
    angular.element($('.view-frame')).scope().sugerir();
    angular.element($('.view-frame')).scope().$apply();
    //angular.element($('.view-frame')).scope().cargarSugerencias(puntos[0].position, puntos[1].position);
  }

}


