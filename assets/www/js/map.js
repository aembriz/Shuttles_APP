var markers = [];
var Lat = 19.4338902;
var Lng = -99.1530205;
var path = new google.maps.MVCArray();
var path1 = new google.maps.MVCArray();
var poly = new google.maps.Polyline({
    strokeColor: '#F3443C'
});
var poly1 = new google.maps.Polyline({
    strokeColor: '#F3443C'
}); 
var service = new google.maps.DirectionsService();  
var infowindow =  new google.maps.InfoWindow({
    content: ""
});
function initialize() {
	//var flightPlanCoordinates = [];
	while(markers.length > 0) {
		markers.pop();
	}
	var myLatlng = new google.maps.LatLng(parseFloat(lat[0]), parseFloat(long[0]));
  var mapOptions = {
    zoom: 14,
    center: myLatlng,
	//disableDefaultUI: true,
	styles: styleArray
  };
  map = new google.maps.Map(document.getElementById('map'),
      mapOptions);
  var homeControlDiv = document.createElement('div');
	var homeControl = new HomeControl2(homeControlDiv, map, myLatlng);

	homeControlDiv.index = 1;
	map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(homeControlDiv);
  

  for (var i = 0; i < lat.length; i++) {
	  
  var latLng = new google.maps.LatLng(parseFloat(lat[i]), parseFloat(long[i])); 
  
  addStoredPoint(latLng, (i == lat.length - 1), tipo[i], descripcion[i]);

} 

}
  
function bindInfoWindow(marker, map, infowindow, strDescription) {
    google.maps.event.addListener(marker, 'click', function() {
    	if(strDescription != ""){
        infowindow.setContent(strDescription);
        infowindow.open(map, marker);
    	}
    });
}

/****************************************************************************************/
var puntosB = new Array(1);
var markerO, markerD;
var direccionDePunto = "";
var infowindowSO = new google.maps.InfoWindow();
var infowindowSD = new google.maps.InfoWindow();
var ltlnFija = true;
var miUb ;
function mapaSugerencia(){
	while(puntosB.length > 0) {
		puntosB.pop();
	}
	 miUb = new google.maps.LatLng(miLatitud, miLongitud);
	 var mapOptions = {
			    zoom: 14,
			    //Optenemos el centro del mapa
			    center: new google.maps.LatLng(miLatitud, miLongitud),
	 			dragend: true,
	 			//disableDefaultUI: true,
	 			mapTypeControl: false,
	 			streetViewControl: false,
	 			styles: styleArray
			  };
	 		var Tabla = /** @type {HTMLInputElement}*/ (document.getElementById("tablacampos"));
	 		Bmap = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
	 		Bmap.controls[google.maps.ControlPosition.TOP_CENTER].push(Tabla);
	 		
	 		var homeControlDiv = document.createElement('div');
	 		var homeControl = new HomeControl(homeControlDiv, Bmap);

	 		homeControlDiv.index = 1;
	 		Bmap.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(homeControlDiv);
	 		  
	 		 var yo = "img/yo.png"; 
	 		 if(ltlnFija){
	 		 var markerYo = new google.maps.Marker({
				    position: new google.maps.LatLng(miLatitud, miLongitud),
				    map: Bmap,
				    animation: google.maps.Animation.DROP,
				    icon: yo
				  });
	 		 }
			  
			  var inputO =document.getElementById('origen');
			  var autoOrigen = new google.maps.places.Autocomplete(inputO);
			  google.maps.event.addListener(autoOrigen, 'place_changed', function() {

				    var place = autoOrigen.getPlace();
				    if (!place.geometry) {
				      return;
				    }
				 // If the place has a geometry, then present it on a map.
				    if (place.geometry.viewport) {
				    	Bmap.fitBounds(place.geometry.viewport);
				    } else {
				    	Bmap.setCenter(place.geometry.location);
				    	Bmap.setZoom(14);  // Why 17? Because it looks good.
				    }
				    //Aquiva lo que quite
			    	Picon = "img/1.png";
			    	if(markerO !== undefined){
				    	markerO.setMap(null);	
				    }
			    	puntosB[0]=place.geometry.location;
			    	markerO = new google.maps.Marker({
					    position: place.geometry.location,
					    map: Bmap,
					    animation: google.maps.Animation.DROP,
					    icon: Picon,
					    draggable: true
					  });
			    	//direccion(puntosB[0]);
				    google.maps.event.addListener(markerO, 'dragend', dragendOrigen);

				    var address = '';
				    if (place.address_components) {
				      address = [
				        (place.address_components[0] && place.address_components[0].short_name || ''),
				        (place.address_components[1] && place.address_components[1].short_name || ''),
				        (place.address_components[2] && place.address_components[2].short_name || '')
				      ].join(' ');
				    }
				    
			  });
			  
			  var inputD =document.getElementById('destino');
			  var autoDestino = new google.maps.places.Autocomplete(inputD);
			  google.maps.event.addListener(autoDestino, 'place_changed', function() {
				    var place = autoDestino.getPlace();
				    if (!place.geometry) {
				      return;
				    }
				 // If the place has a geometry, then present it on a map.
				    if (place.geometry.viewport) {
				    	Bmap.fitBounds(place.geometry.viewport);
				    } else {
				    	Bmap.setCenter(place.geometry.location);
				    	Bmap.setZoom(14);  // Why 17? Because it looks good.
				    }
				    //Aqui va lo que quite
				    
				    if(markerD !== undefined){
				    	markerD.setMap(null);	
				    }
				    markerD="";
				    puntosB[1]=place.geometry.location;
			    	Picon = "img/2.png";
			    	markerD = new google.maps.Marker({
					    position: place.geometry.location,
					    map: Bmap,
					    animation: google.maps.Animation.DROP,
					    icon: Picon,
					    draggable: true
					  });
					google.maps.event.addListener(markerD, 'dragend', dragendDestino);

				    var address = '';
				    if (place.address_components) {
				      address = [
				        (place.address_components[0] && place.address_components[0].short_name || ''),
				        (place.address_components[1] && place.address_components[1].short_name || ''),
				        (place.address_components[2] && place.address_components[2].short_name || '')
				      ].join(' ');
				    }
				    
			  });
			  cierraCargando();
			  google.maps.event.addListener(Bmap, 'click', puntosMapa);
}

function puntosMapa(event) {
	  // introducimos cordenadas a las variables
	var Picon="";
	  puntosB.push(event.latLng);
	  if(puntosB.length > 2){
		  if(document.getElementById('origen').value == ""){
			  puntosB[0] = event.latLng;
			  markerO.setMap(null);
			  Picon = "img/1.png";
			  
			  markerO = new google.maps.Marker({
				    position: event.latLng,
				    map: Bmap,
				    animation: google.maps.Animation.DROP,
				    icon: Picon,
				    draggable: true
				  });
			  direccion(puntosB[0]);
		  }else if(document.getElementById('destino').value == ""){
			  puntosB[1] = event.latLng;
			  markerD.setMap(null);
			  Picon = "img/2.png";
			  
			  markerD = new google.maps.Marker({
				    position: event.latLng,
				    map: Bmap,
				    animation: google.maps.Animation.DROP,
				    icon: Picon,
				    draggable: true
				  });
			  
			  direccion2(puntosB[1]);
		  }
		  return;
	  }
	  // Agregamos el marker.
	  if(puntosB.length == 1){
		  Picon = "img/1.png";
		  
		  markerO = new google.maps.Marker({
			    position: event.latLng,
			    map: Bmap,
			    animation: google.maps.Animation.DROP,
			    icon: Picon,
			    draggable: true
			  });
		  direccion(puntosB[0]);
		  
	  }else if(puntosB.length == 2){
		  Picon = "img/2.png";
		  
		  markerD = new google.maps.Marker({
			    position: event.latLng,
			    map: Bmap,
			    animation: google.maps.Animation.DROP,
			    icon: Picon,
			    draggable: true
			  });
		  
		  direccion2(puntosB[1]);
	  }
	  
	  google.maps.event.addListener(markerO, 'dragend', dragendOrigen);
	  google.maps.event.addListener(markerD, 'dragend', dragendDestino);
	  
}

function dragendOrigen(event) {
	puntosB[0] = event.latLng;
	direccion(puntosB[0]);
	}

function dragendDestino(event) {
	puntosB[1] = event.latLng;
	direccion2(puntosB[1]);
	}

function enviarPuntosDeMapa(){
    if(puntosB.length < 2){
    	showAlert("Se necesitan datos de origen y destino.", "Datos Insuficientes", alertDismissed);	    	
    }else{
		origenRes = String(puntosB[0]);
		origenRes = origenRes.replace("(","").replace(" ","");
		origenRes = origenRes.replace(")","").replace(" ","");
		origen = origenRes.split(",");
		
		destinoRes= String(puntosB[1]);
		destinoRes = destinoRes.replace("(","").replace(" ","");
		destinoRes = destinoRes.replace(")","").replace(" ","");
		destino = destinoRes.split(",");
		enviaSolicitud();
    }
}

function direccion(coord){
	geocoder = new google.maps.Geocoder();
	geocoder.geocode({'latLng': coord}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			if (results[1]) {
				document.getElementById('origen').value=results[0].formatted_address;
			} else {
				alert('No results found');
			}
		} else {
			alert('Geocoder failed due to: ' + status);
	    }
		});
	//$('#search-control-group').val(null);
}

function direccion2(coord){
	
	geocoder = new google.maps.Geocoder();
	geocoder.geocode({'latLng': coord}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			if (results[1]) {
				document.getElementById('destino').value=results[0].formatted_address;
			} else {
				alert('No results found');
			}
		} else {
			alert('Geocoder failed due to: ' + status);
	    }
		});
	//$('#search-control-group').val(null);
}

function addStoredPoint(latLng, mustRepaint, tipo, direction) {
	  console.log(mustRepaint);
	  var MyAddress = direction;
	  var iconName = '';
	  if (tipo == 1) {
	    iconName = 'img/3.png';
	  } else if (tipo == 2) {
	    iconName = 'img/2.png';
	  } else if (tipo == 3) {
	    iconName = 'img/3.png';
	  } else if (tipo == 4) {
	    iconName = 'img/None.png';
	  }  
	  if (markers.length == 0) {
	    // proponemos marker inicial
	    var marker = new google.maps.Marker({
	      position: latLng,
	      //draggable:true,
	      animation: google.maps.Animation.DROP,
	      map: map,
	      icon:"img/1.png",
	    });
	  } else {
	    console.log(markers.length);  
	    // proponemos esquina
	    var marker = new google.maps.Marker({
	      position: latLng,
	      //draggable:true,
	      animation: google.maps.Animation.DROP,
	      map: map,
	      icon: iconName,
	    });
	  }
	  console.log(marker.icon);
	  marker.index = markers.length;
	  markers.push(marker);

	  // esperamos el drag del marker
	  google.maps.event.addListener(marker, 'dragend', function(event) {
	    //console.log(event);
	    // repintar la ruta al finalizar de mover un marker
	    repintarRuta();
	  });
	  // asignamos el evento de click para el marker
	  bindInfoWindow(marker, map, infowindow, direction);
	  
	  if (mustRepaint == true) {
		    repintarRuta();
		  }
	}

function repintarRuta() {
	  var pathPoints = [];
	  var waypts = [];
	  path = [];
	  path1 = [];
	  var counter = 0;
	  poly.setPath([]);
	  poly.setMap(null);
	  poly1.setPath([]);
	  poly1.setMap(null);
	  for (var i = 0; i < markers.length; i++) {
	    if (markers[i].map != null) {
	      pathPoints.push(markers[i]);
	      counter++;

	      // validate end of section path
	      if ((pathPoints.length > 0)&&(pathPoints.length % 8 == 0)) {
	        // paint current section of the path
	        console.log('pathPoints ' + pathPoints.length);
	        console.log(pathPoints);
	        var waypts = [];
	        // extract src, dest and waypoints
	        if (pathPoints.length >= 2) {
	          var src = pathPoints[0].position;
	          var des = pathPoints[pathPoints.length - 1].position;
	          for (var i = 1; i < pathPoints.length - 1; i++) {
	            waypts.push({
	              location:pathPoints[i].position,
	              stopover:true
	            });
	          }
	        }
	        path = [];
	        service.route({
	            origin: src,
	            destination: des,
	            travelMode: google.maps.DirectionsTravelMode.DRIVING,
	            waypoints: waypts,
	        }, function (result, status) {
	            if (status == google.maps.DirectionsStatus.OK) {
	                for (var i = 0, len = result.routes[0].overview_path.length; i < len; i++) {
	                    path.push(result.routes[0].overview_path[i]);
	                }
	                poly.setPath(path);
	                poly.setMap(map);
	            }
	        });       

	        // reset values
	        waypts = [];
	        pathPoints = [];
	        pathPoints.push(markers[i]);
	      }
	    }
	  }   
	  
	  if (pathPoints.length >= 2) {
	    // paint current section of the path
	    console.log('pathPoints ' + pathPoints.length);
	    console.log(pathPoints);
	    //pintarPath(pathPoints);
	    var waypts = [];
	    // extract src, dest and waypoints
	    var src = pathPoints[0].position;
	    var des = pathPoints[pathPoints.length - 1].position;
	    for (var i = 1; i < pathPoints.length - 1; i++) {
	      waypts.push({
	        location:pathPoints[i].position,
	        stopover:true
	      });
	    }
	    path1 = [];
	    service.route({
	        origin: src,
	        destination: des,
	        travelMode: google.maps.DirectionsTravelMode.DRIVING,
	        waypoints: waypts,
	    }, function (result, status) {
	        if (status == google.maps.DirectionsStatus.OK) {
	            for (var i = 0, len = result.routes[0].overview_path.length; i < len; i++) {
	                path1.push(result.routes[0].overview_path[i]);
	            }
	            poly1.setPath(path1);
	            poly1.setMap(map);
	        }
	    });   
	  }
	}

function HomeControl(controlDiv, map) {

	  // Set CSS styles for the DIV containing the control
	  // Setting padding to 5 px will offset the control
	  // from the edge of the map
	  controlDiv.style.padding = '5px';

	  // Set CSS for the control border
	  var controlUI = document.createElement('div');
	  controlUI.style.backgroundColor = 'white';
	  controlUI.style.borderStyle = 'solid';
	  controlUI.style.borderWidth = '2px';
	  controlUI.style.cursor = 'pointer';
	  controlUI.style.textAlign = 'center';
	  controlDiv.appendChild(controlUI);

	  // Set CSS for the control interior
	  var controlText = document.createElement('div');
	  controlText.style.fontFamily = 'Arial,sans-serif';
	  controlText.style.fontSize = '12px';
	  controlText.style.paddingLeft = '4px';
	  controlText.style.paddingRight = '4px';
	  controlText.innerHTML = '<img align=\"center\" src=\"img/my_location2.png\">';
	  controlUI.appendChild(controlText);

	  google.maps.event.addDomListener(controlUI, 'click', function() {
		  map.setCenter(miUb);
		  });

	}

function HomeControl2(controlDiv, map, ltlng) {

	  // Set CSS styles for the DIV containing the control
	  // Setting padding to 5 px will offset the control
	  // from the edge of the map
	  controlDiv.style.padding = '5px';

	  // Set CSS for the control border
	  var controlUI = document.createElement('div');
	  controlUI.style.backgroundColor = 'white';
	  controlUI.style.borderStyle = 'solid';
	  controlUI.style.borderWidth = '2px';
	  controlUI.style.cursor = 'pointer';
	  controlUI.style.textAlign = 'center';
	  controlDiv.appendChild(controlUI);

	  // Set CSS for the control interior
	  var controlText = document.createElement('div');
	  controlText.style.fontFamily = 'Arial,sans-serif';
	  controlText.style.fontSize = '12px';
	  controlText.style.paddingLeft = '4px';
	  controlText.style.paddingRight = '4px';
	  controlText.innerHTML = '<img align=\"center\" src=\"img/my_location2.png\">';
	  controlUI.appendChild(controlText);

	  google.maps.event.addDomListener(controlUI, 'click', function() {
		  map.setCenter(ltlng);
		  });

	}