var markers = [];
var Lat = 19.4338902;
var Lng = -99.1530205;
var defaultZoom = 10;
var geocoder;
var map;
var infowindow;
var flightPath;
var msgNoAddressAtLocation = 'No se puede determinar la ubicación.'; //Cannot determine address at this location.'
var arrPuntos = new Array();

function creapuntos(){
  var mapOptions = {
    zoom: defaultZoom,
    //Optenemos el centro del mapa
    //center: new google.maps.LatLng(19.4338902, -99.1530205)
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
}

function getAddress(pos, callback) {
  geocoder.geocode({
    latLng: pos
  }, function(responses, status) {
    console.log('getting address...');
    console.log(responses);
    
    if (status == google.maps.GeocoderStatus.OK) {
      if (responses && responses.length > 0) {
        console.log(responses[0].formatted_address);
        callback(responses[0].formatted_address);
      } else {
        console.log(msgNoAddressAtLocation);
        callback(msgNoAddressAtLocation);
      }
    }
  });
}

// empezamos el evento para crear la polilinea
function addLatLng(event) {
  console.log(event);
  getAddress(event.latLng, function(AdressFormatted) { 
    var MyAddress = AdressFormatted;
    console.log('MyAddress');
    console.log(MyAddress);
    if (markers.length == 0) {
      // proponemos marker inicial
      var marker = new google.maps.Marker({
        position: event.latLng,
        draggable:true,
        title: MyAddress,
        animation: google.maps.Animation.DROP,
        map: map,
        icon:"imgs/1.png",
        anchorPoint: new google.maps.Point(Lat, Lng),
        tiempo: 0
      });
    } else {
      // proponemos esquina
      var marker = new google.maps.Marker({
        position: event.latLng,
        draggable:true,
        title: MyAddress,
        animation: google.maps.Animation.DROP,
        map: map,
        icon:"imgs/None.png",
        anchorPoint: new google.maps.Point(Lat, Lng),
        tiempo: 0
      });
    }
    marker.index = markers.length;
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
      angular.element($('.view-frame')).scope().selectedMarkerIndex = marker.index;
      angular.element($('.view-frame')).scope().$apply();
      console.log('selectedMarker javascript ' + angular.element($('.view-frame')).scope().selectedMarkerIndex);
      console.log(angular.element($('.view-frame')).scope().selectedMarker);    
      $('#MarkerOptions').modal({
        show: true
      });
    });

    // repintamos la ruta con el nuevo punto agregado
    repintarRuta();
  });

}

function saveSelectedPunto() {
  var newPoint = angular.element($('.view-frame')).scope().selectedMarker;
  console.log('selectedMarker javascript');
  console.log(angular.element($('.view-frame')).scope().selectedMarker);
  //markers[angular.element($('.view-frame')).scope().selectedMarkerIndex] = angular.element($('.view-frame')).scope().selectedMarker;
  //markers[angular.element($('.view-frame')).scope().selectedMarkerIndex] = selectedMarker; 
  markers[angular.element($('.view-frame')).scope().selectedMarkerIndex].setIcon(newPoint.icon); 
  markers[angular.element($('.view-frame')).scope().selectedMarkerIndex].setTitle(newPoint.title); 
  markers[angular.element($('.view-frame')).scope().selectedMarkerIndex].setPosition(newPoint.position);
  markers[angular.element($('.view-frame')).scope().selectedMarkerIndex].tiempo = newPoint.tiempo; 
//  angular.element($('.view-frame')).scope().$apply();

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

// evento para cambiar origen de punto
function changePoint() {
    var place = autoNewPoint.getPlace();
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
    console.log('cambiando pos...');
    console.log(markers[angular.element($('.view-frame')).scope().selectedMarkerIndex].position);
    markers[angular.element($('.view-frame')).scope().selectedMarkerIndex].position = place.geometry.location;
    angular.element($('.view-frame')).scope().$apply();
    console.log(markers[angular.element($('.view-frame')).scope().selectedMarkerIndex].position);
    repintarRuta();
    //addLatLng(place.geometry.location)

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
    if (markers[i].map != null) {
      console.log(markers[i].title);
      flightPlanCoordinates.push(markers[i].position);
    }
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

function deleteSelectedPunto() {
  if ((angular.element($('.view-frame')).scope().selectedMarkerIndex >= 0)&&
      (angular.element($('.view-frame')).scope().selectedMarkerIndex < markers.length)) {
    //markers.splice(angular.element($('.view-frame')).scope().selectedMarkerIndex, 1);
    markers[angular.element($('.view-frame')).scope().selectedMarkerIndex].setMap(null);
    repintarRuta();
  }
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

function saveRutaPuntos() {
  console.log('Obteniendo puntos...');
  var counter = 0;
  var mytipo = 1; // Inicio
  var minutosAparada = 0;
  for (var x=0;x<markers.length;x++){
    console.log('INDICE: ' + x);
    if (markers[x].map != null) {
      console.log('Agregando punto... ' + counter + '/' + markers.length);
      console.log('minutosparallegar' + markers[x].tiempo);
      if (markers[x].icon == 'imgs/None.png') {
        mytipo = 4; // vuelta
        minutosAparada = 0;
      } else if (markers[x].icon == 'imgs/3.png') {
        console.log(markers[x]);
        mytipo = 3; // Parada
        minutosAparada = markers[x].tiempo;
      } 

      if (x == markers.length - 1) {
        mytipo = 2; // Fin
        minutosAparada = 0;
      } else if (x == 0) {
        mytipo = 1; // Inicio
        minutosAparada = 0;
      }
      var punto = {
        indice: parseInt(counter), 
        latitud: markers[x].position.lat(), 
        longitud: markers[x].position.lng(), 
        descripcion: markers[x].title,
        RutaId: idm,
        tipo: mytipo,
        minutosparallegar: minutosAparada
      };
      /*
      punto['indice'] = parseInt(x);
      punto['latitud'] = markers[x].position.Lat();
      punto['longitud'] = markers[x].position.Lng();
      punto['descripcion'] = markers[x].title;
      punto['RutaId'] = idm;*/
      console.log(punto);
//      arrPuntos[counter] = punto;
      arrPuntos.push(punto);
      counter += 1;
    } else {
      console.log('Negando punto... ' + counter + '/' + markers.length);      
    }
    console.log('FIN INDICE: ' + x + '/' + markers.length);
  };
  var tmp = {puntos: arrPuntos};
  console.log(tmp);
  console.log('Salvando puntos...');
  angular.element($('.view-frame')).scope().saveMapa(tmp);
  console.log('Salvado exitoso.');
}