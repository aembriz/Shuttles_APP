var puntos = [];
var marker0;
var marker1;
var Lat = 19.4338902;
var Lng = -99.1530205;
var defaultZoom = 10;
var geocoder;
var msgNoAddressAtLocation = 'No se puede determinar la ubicaci&oacute;n.'; //Cannot determine address at this location.'

function creapuntos(){
  var mapOptions = {
    zoom: defaultZoom,
    //Optenemos el centro del mapa
//    center: new google.maps.LatLng(19.4338902, -99.1530205)
    center: new google.maps.LatLng(19.4338902, -99.1530205)
  };
  map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
  var polyOptions = {
    strokeColor: '#000000',
    strokeOpacity: 1.0,
    strokeWeight: 3
  };
  poly = new google.maps.Polyline(polyOptions);
  poly.setMap(map);

  // esperamos el click en el mapa
  google.maps.event.addListener(map, 'click', addLatLng);
  geocoder = new google.maps.Geocoder();
  
  var defaultBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(19.3338902, -99.0530205),
    new google.maps.LatLng(19.5338902, -99.2530205));

  var inputOrigen = document.getElementById('origentxt');
  var inputDestino = document.getElementById('destinotxt');
  var options = {
    bounds: defaultBounds
  };

  // initialize marker origen
  marker0 = new google.maps.Marker({
    //position: event.latLng,
    draggable:true,
    title: 'Origen',
    animation: google.maps.Animation.DROP,
    map: map,
    icon:"imgs/Origen.png",
    anchorPoint: new google.maps.Point(Lat, Lng),
    visible: false
  });

  // initialize marker destino
  marker1 = new google.maps.Marker({
    //position: event.latLng,
    draggable:true,
    title: 'Destino',
    animation: google.maps.Animation.DROP,
    map: map,
    icon:"imgs/Destino.png",
    anchorPoint: new google.maps.Point(Lat, Lng),
    visible: false
  });

  // asignamos eventos drag a los markers
  google.maps.event.addListener(marker0, 'dragend', dragendOrigen);
  google.maps.event.addListener(marker1, 'dragend', dragendDestino);  

  // asignamos eventos autofill a los inputs
  autoOrigen = new google.maps.places.Autocomplete(inputOrigen, options);
  autoDestino = new google.maps.places.Autocomplete(inputDestino, options);
  google.maps.event.addListener(autoOrigen, 'place_changed', autofillOrigen);
  google.maps.event.addListener(autoDestino, 'place_changed', autofillDestino);
}

// empezamos el evento para crear la polilinea
function addLatLng(event) {
  if (marker0 == null) {
    marker0 = new google.maps.Marker({
      //position: event.latLng,
      draggable:true,
      title: 'Origen',
      animation: google.maps.Animation.DROP,
      map: map,
      icon:"imgs/Origen.png",
      anchorPoint: new google.maps.Point(Lat, Lng)
    });
    marker0.setVisible(false);
    // esperamos el drag del marker
    google.maps.event.addListener(marker0, 'dragend', dragendOrigen);
  }
  if (marker1 == null) {
    marker1 = new google.maps.Marker({
      //position: event.latLng,
      draggable:true,
      title: 'Destino',
      animation: google.maps.Animation.DROP,
      map: map,
      icon:"imgs/Destino.png",
      anchorPoint: new google.maps.Point(Lat, Lng)
    });
    marker1.setVisible(false);
    // esperamos el drag del marker
    google.maps.event.addListener(marker1, 'dragend', dragendDestino);
  }  

  if (!marker0.visible) {
    setOrigenAddress(event.latLng);
    marker0.setPosition(event.latLng);
    marker0.setVisible(true);

    angular.element($('.view-frame')).scope().OrigenLat = marker0.position.lat();
    angular.element($('.view-frame')).scope().OrigenLng = marker0.position.lng();
    angular.element($('.view-frame')).scope().$apply();
  } else if (!marker1.visible) {
    setDestinoAddress(event.latLng);
    marker1.setPosition(event.latLng);
    marker1.setVisible(true);

    angular.element($('.view-frame')).scope().DestinoLat = marker1.position.lat();
    angular.element($('.view-frame')).scope().DestinoLng = marker1.position.lng();
    angular.element($('.view-frame')).scope().$apply();
    angular.element($('.view-frame')).scope().sugerir();
    angular.element($('.view-frame')).scope().$apply();
  }
}

// evento para mover el marker origen
function dragendOrigen(event) {
  setOrigenAddress(event.latLng);
  angular.element($('.view-frame')).scope().OrigenLat = event.latLng.lat();
  angular.element($('.view-frame')).scope().OrigenLng = event.latLng.lng();
  angular.element($('.view-frame')).scope().$apply();
}

// evento para predecir input origen
function autofillOrigen() {
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

    marker0.setPosition(place.geometry.location);
    angular.element($('.view-frame')).scope().OrigenLat = marker0.position.lat();
    angular.element($('.view-frame')).scope().OrigenLng = marker0.position.lng();
    angular.element($('.view-frame')).scope().$apply();      
    marker0.setVisible(true);

    var address = '';
    if (place.address_components) {
      address = [
        (place.address_components[0] && place.address_components[0].short_name || ''),
        (place.address_components[1] && place.address_components[1].short_name || ''),
        (place.address_components[2] && place.address_components[2].short_name || '')
      ].join(' ');
    }

    if (marker1.getVisible() == true) {
      angular.element($('.view-frame')).scope().sugerir();
      angular.element($('.view-frame')).scope().$apply();
    }
}

// evento para mover el marker destino
function dragendDestino(event) {
  setDestinoAddress(event.latLng);
  angular.element($('.view-frame')).scope().DestinoLat = event.latLng.lat();
  angular.element($('.view-frame')).scope().DestinoLng = event.latLng.lng();
  angular.element($('.view-frame')).scope().$apply();
}

// evento para predecir input destino
function autofillDestino() {
    var place = autoDestino.getPlace();
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

    marker1.setPosition(place.geometry.location);
    angular.element($('.view-frame')).scope().OrigenLat = marker1.position.lat();
    angular.element($('.view-frame')).scope().OrigenLng = marker1.position.lng();
    angular.element($('.view-frame')).scope().$apply();    
    marker1.setVisible(true);

    var address = '';
    if (place.address_components) {
      address = [
        (place.address_components[0] && place.address_components[0].short_name || ''),
        (place.address_components[1] && place.address_components[1].short_name || ''),
        (place.address_components[2] && place.address_components[2].short_name || '')
      ].join(' ');
    }
    if (marker0.getVisible() == true) {
      angular.element($('.view-frame')).scope().sugerir();
      angular.element($('.view-frame')).scope().$apply();
    }
}

function setOrigenAddress(pos) {
  geocoder.geocode({
    latLng: pos
  }, function(responses, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      if (responses && responses.length > 0) {
        document.getElementById('origentxt').value = responses[0].formatted_address;
      } else {
        document.getElementById('origentxt').value = msgNoAddressAtLocation;
      }
    }
  });
}

function setDestinoAddress(pos) {
  geocoder.geocode({
    latLng: pos
  }, function(responses, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      if (responses && responses.length > 0) {
        document.getElementById('destinotxt').value = responses[0].formatted_address;
      } else {
        document.getElementById('destinotxt').value = msgNoAddressAtLocation;
      }
    }
  });
}

function bindInfoWindow(marker, map, infowindow, strDescription) {
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

