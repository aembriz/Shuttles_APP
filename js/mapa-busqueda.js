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

  // esperamos el click en el mapa
  google.maps.event.addListener(map, 'click', addLatLng);
  geocoder = new google.maps.Geocoder();
  
  /*
  var input = (document.getElementById('origentxt'));
  var autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);  

  var infowindow = new google.maps.InfoWindow();
*/
  var defaultBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(19.3338902, -99.0530205),
    new google.maps.LatLng(19.5338902, -99.2530205));

  var inputOrigen = document.getElementById('origentxt');
  var inputDestino = document.getElementById('destinotxt');
  var options = {
    bounds: defaultBounds
  };

  autoOrigen = new google.maps.places.Autocomplete(inputOrigen, options);
  autoDestino = new google.maps.places.Autocomplete(inputDestino, options);
  if (marker0 == null) {
    marker0 = new google.maps.Marker({
      //position: event.latLng,
      draggable:true,
      title: 'Origen',
      animation: google.maps.Animation.DROP,
      map: map,
      icon:"imgs/3.png",
      anchorPoint: new google.maps.Point(Lat, Lng)
    });
  }
  marker0.setVisible(false);
  // esperamos el drag del marker
  google.maps.event.addListener(marker0, 'dragend', dragendOrigen);

  if (marker1 == null) {
    marker1 = new google.maps.Marker({
      //position: event.latLng,
      draggable:true,
      title: 'Origen',
      animation: google.maps.Animation.DROP,
      map: map,
      icon:"imgs/1.png",
      anchorPoint: new google.maps.Point(Lat, Lng)
    });
  }
  marker1.setVisible(false);
  // esperamos el drag del marker
  google.maps.event.addListener(marker1, 'dragend', dragendDestino);  

  google.maps.event.addListener(autoOrigen, 'place_changed', function() {
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
  });

  google.maps.event.addListener(autoDestino, 'place_changed', function() {
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
  });
}

// empezamos el evento para crear la polilinea
function addLatLng(event) {
  /*
  // introducimos cordenadas a las variables
  var Count = puntos.push(event.latLng);
  if (Count == 1) {
    // Agregamos el marker inicial.
    marker0 = new google.maps.Marker({
      position: event.latLng,
      draggable:true,
      title: 'Origen',
      animation: google.maps.Animation.DROP,
      map: map,
      icon:"imgs/3.png"
    });
    // esperamos el drag del marker
    google.maps.event.addListener(markerO, 'dragend', dragendOrigen);
*/
  if (!marker0.visible) {
    setOrigenAddress(event.latLng);
    marker0.setPosition(event.latLng);
    marker0.setVisible(true);

    //angular.element($('.view-frame')).scope().PointCount = 1;
    angular.element($('.view-frame')).scope().OrigenLat = marker0.position.lat();
    angular.element($('.view-frame')).scope().OrigenLng = marker0.position.lng();
    angular.element($('.view-frame')).scope().$apply();
  } else if (!marker1.visible) {
    /*
    // Agregamos el marker final.
    marker1 = new google.maps.Marker({
      position: event.latLng,
      draggable:true,
      title: 'Destino',
      animation: google.maps.Animation.DROP,
      map: map,
      icon:"imgs/1.png"
    }); 
    // esperamos el drag del marker
    google.maps.event.addListener(marker1, 'dragend', dragendDestino);
    */
    //angular.element($('.view-frame')).scope().PointCount = 2;
    setDestinoAddress(event.latLng);
    marker1.setPosition(event.latLng);
    marker1.setVisible(true);

    angular.element($('.view-frame')).scope().DestinoLat = marker1.position.lat();
    angular.element($('.view-frame')).scope().DestinoLng = marker1.position.lng();
    angular.element($('.view-frame')).scope().$apply();
    angular.element($('.view-frame')).scope().sugerir();
    angular.element($('.view-frame')).scope().$apply();
    //angular.element($('.view-frame')).scope().cargarSugerencias(puntos[0].position, puntos[1].position);
  }

}

// evento para mover el marker origen
function dragendOrigen(event) {
  angular.element($('.view-frame')).scope().OrigenLat = event.latLng.lat();
  angular.element($('.view-frame')).scope().OrigenLng = event.latLng.lng();
  angular.element($('.view-frame')).scope().$apply();
}

// evento para mover el marker destino
function dragendDestino(event) {
  angular.element($('.view-frame')).scope().DestinoLat = event.latLng.lat();
  angular.element($('.view-frame')).scope().DestinoLng = event.latLng.lng();
  angular.element($('.view-frame')).scope().$apply();
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