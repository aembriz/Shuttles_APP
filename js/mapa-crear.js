var puntos = [];
var markers = [];
var Lat = 19.4338902;
var Lng = -99.1530205;
var defaultZoom = 10;
var geocoder;
var map;
var infowindow;
var flightPath;
var msgNoAddressAtLocation = 'No se puede determinar la ubicaci&oacute;n.'; //Cannot determine address at this location.'

function creapuntos(){
  var mapOptions = {
    zoom: defaultZoom,
    //Optenemos el centro del mapa
//    center: new google.maps.LatLng(19.4338902, -99.1530205)
    center: new google.maps.LatLng(19.4338902, -99.1530205)
  };
  map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
  infowindow =  new google.maps.InfoWindow({
    content: ""
  });

  // esperamos el click en el mapa
  google.maps.event.addListener(map, 'click', addLatLng);
  geocoder = new google.maps.Geocoder();
  
  var defaultBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(19.3338902, -99.0530205),
    new google.maps.LatLng(19.5338902, -99.2530205));

  var inputNewPoint = document.getElementById('nuevoPunto');
  var options = {
    bounds: defaultBounds
  };

  // asignamos eventos drag a los markers
//  google.maps.event.addListener(marker0, 'dragend', dragendPunto);

  // asignamos eventos autofill a los inputs
  autoNewPoint = new google.maps.places.Autocomplete(inputNewPoint, options);
  google.maps.event.addListener(autoNewPoint, 'place_changed', autofillNewPoint);
}

// empezamos el evento para crear la polilinea
function addLatLng(event) {
  console.log(event);
  
  if (markers.length == 0) {
    // proponemos marker inicial
    var marker = new google.maps.Marker({
      position: event.latLng,
      draggable:true,
      title: 'Origen',
      animation: google.maps.Animation.DROP,
      map: map,
      icon:"imgs/1.png",
      anchorPoint: new google.maps.Point(Lat, Lng)
    });
  } else {
    // proponemos esquina
    var marker = new google.maps.Marker({
      position: event.latLng,
      draggable:true,
      title: 'Vuelta',
      animation: google.maps.Animation.DROP,
      map: map,
      icon:"imgs/Destino.png",
      anchorPoint: new google.maps.Point(Lat, Lng)
    });
  }
  markers.push(marker);

  // esperamos el drag del marker
  google.maps.event.addListener(marker, 'dragend', function(event) {
    console.log(event);
    // repintar la ruta al finalizar de mover un marker
    repintarRuta();
  });
  // asignamos el evento de click para el marker
  //bindInfoWindow(marker, map, marker.title);
  google.maps.event.addListener(marker, 'click', function() {
    /*if(strDescription != ""){
      infowindow.setContent(strDescription);
      infowindow.open(map, marker);
    }*/
    angular.element($('.view-frame')).scope().selectedMarker = marker;
    angular.element($('.view-frame')).scope().selectedMarkerIndex = markers.length - 1;
    angular.element($('.view-frame')).scope().$apply();
    $('#MarkerOptions').modal({
      show: true
    });
  });

  // repintamos la ruta con el nuevo punto agregado
  repintarRuta();
}

function savePunto(selectedMarker) {
  //markers[angular.element($('.view-frame')).scope().selectedMarkerIndex] = selectedMarker; 
  markers[angular.element($('.view-frame')).scope().selectedMarkerIndex].setIcon('imgs/2.png'/*selectedMarker.icon*/); 
  angular.element($('.view-frame')).scope().$apply();

  console.log('selectedMarker');
  console.log(selectedMarker);
  /*clearMarkers();
  showMarkers();*/
  //$scope.selectedMarker = selectedMarker;
};

// evento para predecir input origen
function autofillNewPoint() {
    var place = autoOrigen.getPlace();
    if (!place.geometry) {
      return;
    }
    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(defaultZoom);  
    }
    addLatLng(place.geometry.location)

    var address = '';
    if (place.address_components) {
      address = [
        (place.address_components[0] && place.address_components[0].short_name || ''),
        (place.address_components[1] && place.address_components[1].short_name || ''),
        (place.address_components[2] && place.address_components[2].short_name || '')
      ].join(' ');
    }
}

function repintarRuta() {
  if (flightPath != null) {
    flightPath.setMap(null);
  }

  var flightPlanCoordinates = [];
  for (var i = 0; i < markers.length; i++) {
    console.log(markers[i].title);
    flightPlanCoordinates.push(markers[i].position);
  }

  flightPath = new google.maps.Polyline({
    path: flightPlanCoordinates,
    geodesic: true,
    strokeColor: '#428bca',
    strokeOpacity: 1.0,
    strokeWeight: 3
  });

  flightPath.setMap(map);
}

function bindInfoWindow(marker, map, strDescription) {
  google.maps.event.addListener(marker, 'click', function() {
    if(strDescription != ""){
      infowindow.setContent(strDescription);
      infowindow.open(map, marker);
    }
  });
}

function consultapuntos() {
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

  var infowindow =  new google.maps.InfoWindow({
    content: ""
  });

  for (var i = 0; i < infoPuntos.length; i++) {
    console.log(infoPuntos[i].descripcion);
    flightPlanCoordinates.push(new google.maps.LatLng(parseFloat(infoPuntos[i].latitud), parseFloat(infoPuntos[i].longitud)));
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
    strokeColor: '#0000FF',
    strokeOpacity: 1.0,
    strokeWeight: 2
  });

  flightPath.setMap(map);
}

// Sets the map on all markers in the array.
function setAllMap(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setAllMap(null);
}

// Shows any markers currently in the array.
function showMarkers() {
  setAllMap(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
}
