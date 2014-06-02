'use strict';

/* Services */

var muukServices = angular.module('muukServices', ['ngResource']);
//var servicesUrl = "http://localhost:8082";
var servicesUrl = "http://54.201.26.22:8082";

muukServices.factory('RoleService', ['$http',
  function ($http) {
    'use strict';
    var adminRoles = ['ADMIN', 'EMPRESA'];
    var otherRoles = ['USUARIO'];
    return {
      validateRoleAdmin: function (currentUser) {
        return currentUser ? _.contains(adminRoles, currentUser.role) : false;
      },
      validateRoleOther: function (currentUser) {
        return currentUser ? _.contains(otherRoles, currentUser.role) : false;
      }
    };
  }]);
muukServices.factory('AuthenticationService', ['$http', '$location', 'SessionService', 
  function ($http, $location, SessionService) {
    'use strict';
    var rs = {message:'', token:'', role:'', empresa:0, nombre:''}; // role:('ADMIN', 'EMPRESA', 'USUARIO')
    return {
      login: function (usr, pwd, callbackSuccess, callBackError) {
        // this method could be used to call the API and set the user instead of taking it in the function params
          $.ajax({
            type: "POST",
            url: servicesUrl + "/login",
            data: {
              username: usr,
              password: pwd 
            },
            success: function( data ) {
              if(data.error){
                callbackSuccess(data);
              }
              else{              
                rs = data;
                var user = {name: rs.nombre, username: usr, role: rs.role, authtoken: rs.token, empresa: rs.empresa, id: rs.id};
                SessionService.currentUser = user;
                SessionService.saveSession();
                callbackSuccess(data);
              }
            },
            error: function(request, status, error) {
              callBackError(request, status, error)
            }
          });       
      },
      logout: function () {
        SessionService.endSession();      
      },
      isLoggedIn: function () {
        //return SessionService.currentUser != null;
        return SessionService.currentUser != null;
      }
    };
  }]);
muukServices.factory('SessionService', ['$cookieStore', 
  function ($cookieStore) {  
    var session = {
      currentUser: null,
      saveSession: function() {
         $cookieStore.put('session', session.currentUser);
      },
      endSession: function() {
         $cookieStore.remove('session');
         session.currentUser = null;
      },    
      loadSession: function() { 
        session.currentUser = $cookieStore.get('session');
      }
    };
    session.loadSession();
    return session;
  }]);

// *****************************************************
/* Login */
// *****************************************************
/* Login - Pre-registro empresa */
muukServices.factory('EmpresaPreregister', ['$resource', 
  function($resource){
    return $resource(servicesUrl + '/preregister/empresa/', {}, {
      create: { method:'POST', params:{}, isArray:false, headers: { }},
    });
  }]);

/* EmbarQ */
// *****************************************************
/* EmbarQ - Empresa */
muukServices.factory('Empresa', ['$resource', 'SessionService', 
  function($resource, SessionService){
    return $resource(servicesUrl + '/empresa/:exId', {}, {
      query: { method:'GET', params:{}, isArray:true, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken }},
      create: { method:'POST', params:{}, isArray:false, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken }},
      remove: { method: 'DELETE', params: {exId: '@exId'}, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken } },
      update: { method: 'PUT', params: {exId: '@exId'}, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken } },
      show: { method: 'GET' }
    });
  }]);
muukServices.factory('EmpresasAutorizadas', ['$resource', 'SessionService', 
  function($resource, SessionService){
    return $resource(servicesUrl + '/empresa?estatus=authorized', {}, {
      query: { method:'GET', params:{}, isArray:true, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken }},
    });
  }]);
muukServices.factory('EmpresasRechazadas', ['$resource', 'SessionService', 
  function($resource, SessionService){
    return $resource(servicesUrl + '/empresa?estatus=rejected', {}, {
      query: { method:'GET', params:{}, isArray:true, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken }},
    });
  }]);
muukServices.factory('EmpresasNuevas', ['$resource', 'SessionService', 
  function($resource, SessionService){
    return $resource(servicesUrl + '/empresa?estatus=new', {}, {
      query: { method:'GET', params:{}, isArray:true, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken }},
    });
  }]);
muukServices.factory('EmpresaAutorizar', ['$resource', 'SessionService',
  function($resource, SessionService){
    return $resource(servicesUrl + '/empresa/authorize/:exId', {}, {
      auth: { method:'PUT', params:{exId: '@exId'}, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken }},
    });
  }]);
muukServices.factory('EmpresaRechazar', ['$resource', 'SessionService',
  function($resource, SessionService){
    return $resource(servicesUrl + '/empresa/reject/:exId', {}, {
      reject: { method:'PUT', params:{exId: '@exId'}, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken }},
    });
  }]);

// -----------------------------------------------------
/* EmbarQ - Ruta */
muukServices.factory('Ruta', ['$resource', 'SessionService',
  function($resource, SessionService){
    return $resource(servicesUrl + '/ruta/:exId', {}, {
      query: { method:'GET', params:{}, isArray:true, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken }},
      create: { method:'POST', params:{}, isArray:false, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken }},
      remove: { method: 'DELETE', params: {exId: '@exId'}, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken } },
      update: { method: 'PUT', params: {exId: '@exId'}, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken } },
      show: { method: 'GET' }
    });
  }]);
muukServices.factory('RutasAutorizadas', ['$resource', 'SessionService',
  function($resource, SessionService){
    return $resource(servicesUrl + '/ruta?estatus=authorized', {}, {
      query: { method:'GET', params:{}, isArray:true, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken }},
    });
  }]);
muukServices.factory('RutasRechazadas', ['$resource', 'SessionService',
  function($resource, SessionService){
    return $resource(servicesUrl + '/ruta?estatus=rejected', {}, {
      query: { method:'GET', params:{}, isArray:true, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken }},
    });
  }]);
muukServices.factory('RutasNuevas', ['$resource', 'SessionService',
  function($resource, SessionService){
    return $resource(servicesUrl + '/ruta?estatus=new', {}, {
      query: { method:'GET', params:{}, isArray:true, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken }},
    });
  }]);
muukServices.factory('RutaAutorizar', ['$resource', 'SessionService',
  function($resource, SessionService){
    return $resource(servicesUrl + '/ruta/authorize/:exId', {}, {
      auth: { method:'PUT', params:{exId: '@exId'}, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken }},
    });
  }]);
muukServices.factory('RutaRechazar', ['$resource', 'SessionService',
  function($resource, SessionService){
    return $resource(servicesUrl + '/ruta/reject/:exId', {}, {
      reject: { method:'PUT', params:{exId: '@exId'}, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken }},
    });
  }]);

// -----------------------------------------------------
/* EmbarQ - Corrida */
muukServices.factory('Corrida', ['$resource', 'SessionService', '$routeParams',
  function($resource, SessionService){
    return $resource(servicesUrl + '/rutacorrida/:exId', {}, {
      query: { method:'GET', params:{}, isArray:true, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken }},
      create: { method:'POST', params:{}, isArray:false, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken }},
      remove: { method: 'DELETE', params: {exId: '@exId'}, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken } },
      update: { method: 'PUT', params: {exId: '@exId'}, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken } },
      show: { method: 'GET' }
    });
  }]);

muukServices.factory('CorridaXRuta', ['$resource', 'SessionService',
  function($resource, SessionService){
    return $resource(servicesUrl + '/rutacorrida?rutaid=:exId', {}, {
      query: { method:'GET', params:{}, isArray:true, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken }},
    });
  }]);
// -----------------------------------------------------
/* EmbarQ - Usuario */
muukServices.factory('Usuario', ['$resource', 'SessionService',
  function($resource, SessionService){
    return $resource(servicesUrl + '/usuario/:exId', {}, {
      query: { method:'GET', params:{}, isArray:true, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken }},
      create: { method:'POST', params:{}, isArray:false, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken }},
      remove: { method: 'DELETE', params: {exId: '@exId'}, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken } },
      update: { method: 'PUT', params: {exId: '@exId'}, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken } },
      show: { method: 'GET' }
    });
  }]);
muukServices.factory('UsuariosAutorizados', ['$resource', 'SessionService',
  function($resource, SessionService){
    return $resource(servicesUrl + '/usuario?estatus=authorized', {}, {
      query: { method:'GET', params:{}, isArray:true, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken }},
    });
  }]);
muukServices.factory('UsuariosRechazados', ['$resource', 'SessionService',
  function($resource, SessionService){
    return $resource(servicesUrl + '/usuario?estatus=rejected', {}, {
      query: { method:'GET', params:{}, isArray:true, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken }},
    });
  }]);
muukServices.factory('UsuariosNuevos', ['$resource', 'SessionService',
  function($resource, SessionService){
    return $resource(servicesUrl + '/usuario?estatus=new', {}, {
      query: { method:'GET', params:{}, isArray:true, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken }},
    });
  }]);

muukServices.factory('UsuarioAutorizar', ['$resource', 'SessionService',
  function($resource, SessionService){
    return $resource(servicesUrl + '/usuario/authorize/:exId', {}, {
      auth: { method:'PUT', params:{exId: '@exId'}, headers: { }},
    });
  }]);
muukServices.factory('UsuarioRechazar', ['$resource', 'SessionService',
  function($resource, SessionService){
    return $resource(servicesUrl + '/usuario/reject/:exId', {}, {
      reject: { method:'PUT', params:{exId: '@exId'}, headers: { }},
    });
  }]);
muukServices.factory('UsuarioRegistro', ['$resource', 'SessionService',
  function($resource, SessionService){
    return $resource(servicesUrl + '/usuario/:exId', {}, {
      query: { method:'GET', params:{}, isArray:true, headers: { }},
      create: { method:'POST', params:{}, isArray:false, headers: { }},
      remove: { method: 'DELETE', params: {exId: '@exId'}, headers: { }},
      update: { method: 'PUT', params: {exId: '@exId'}, headers: { }},
      show: { method: 'GET' }
    });
  }]);
// *****************************************************
/* Empresa */
// *****************************************************
/* Empresa - Ruta */
muukServices.factory('RutaXEmpresa', ['$resource', 'SessionService', 
  function($resource, SessionService){
    return $resource(servicesUrl + '/ruta?empresa=' + SessionService.currentUser.empresa.toString(), {}, {
      query: { method:'GET', params:{}, isArray:true, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken }},
    });
  }]);

// -----------------------------------------------------
/* Empresa - Usuario */
muukServices.factory('UsuariosAutorizadosXEmpresa', ['$resource', 'SessionService', 
  function($resource, SessionService){
    return $resource(servicesUrl + '/usuario?empresa=' + SessionService.currentUser.empresa.toString() + '&estatus=authorized', {}, {
      query: { method:'GET', params:{}, isArray:true, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken }},
    });
  }]);
muukServices.factory('UsuariosNuevosXEmpresa', ['$resource', 'SessionService', 
  function($resource, SessionService){
    return $resource(servicesUrl + '/usuario?empresa=' + SessionService.currentUser.empresa.toString() + '&estatus=new', {}, {
      query: { method:'GET', params:{}, isArray:true, headers: { 'Access': 'Bearer ' + SessionService.currentUser.authtoken }},
    });
  }]);

// *****************************************************
/* Usuario */
// *****************************************************
/* Usuario - Buscar Ruta */
muukServices.factory('RutasSugeridas', ['$resource', 'SessionService', 
  function($resource, SessionService){
    return $resource(servicesUrl + '/compra/rutasugeridas', {}, {
      query: { method:'GET', params:{puntoALat: '@OrigenLat', puntoALng: '@OrigenLng', puntoBLat: '@DestinoLat', puntoBLng: '@DestinoLng'}, isArray:true, headers: { 'Authorization': 'Bearer ' + SessionService.currentUser.authtoken }},
    });
  }]);

// -----------------------------------------------------
/* MAPA */
muukServices.factory('Mapa',['$resource', 'SessionService',
  function($resource, SessionService){
    return $resource(servicesUrl + '/rutapunto/\:exId', {},{
      query: {method: 'GET', params:{}, isArray:true, headers: { 'Access': SessionService.currentUser.authtoken }},
      createBulk: {method: 'POST', params:{exId:'', type:'bulk'}, isArray:false, headers:{ 'Access': SessionService.currentUser.authtoken}},
      show: { method: 'GET' }
    });
  }]);

// *****************************************************
/* Usuario */
// *****************************************************
/* Usuario - Buscar Ruta */

muukServices.factory('RutaSugerida',['$resource', 'SessionService',
  function($resource, SessionService){
    return $resource(servicesUrl + '/compra/rutasugeridas', {}, {
      query: {
        method: 'GET', 
        params:{puntoALat: '@OrigenLat', puntoALng: '@OrigenLng', puntoBLat: '@DestinoLat', puntoBLng: '@DestinoLng'}, 
        isArray:true, 
        headers: { 'Authorization': 'Bearer ' + SessionService.currentUser.authtoken }
      }     
    });
  }]);

muukServices.factory('RutaOferta',['$resource', 'SessionService',
  function($resource, SessionService){
    return $resource(servicesUrl + '/compra/ruta/:exId/oferta', {}, {
      query: {
        method: 'GET', 
        params:{}, 
        isArray:true, 
        headers: { 'Authorization': 'Bearer ' + SessionService.currentUser.authtoken }
      }     
    });
  }]);

muukServices.factory('RutaReservar',['$resource', 'SessionService',
  function($resource, SessionService){
    return $resource(servicesUrl + '/compra/reservar/:exId', {}, {
      query: {
        method: 'POST', 
        params:{exId: '@exId'}, 
        isArray:false, 
        headers: { 'Authorization': 'Bearer ' + SessionService.currentUser.authtoken }
      }     
    });
  }]);

muukServices.factory('RutaEsperar',['$resource', 'SessionService',
  function($resource, SessionService){
    return $resource(servicesUrl + '/compra/esperar/:exId', {}, {
      query: {
        method: 'POST', 
        params: {exId: '@exId'}, 
        isArray: false, 
        headers: { 'Authorization': 'Bearer ' + SessionService.currentUser.authtoken }
      }     
    });
  }]);

muukServices.factory('RutaFavorita',['$resource', 'SessionService',
  function($resource, SessionService){
    return $resource(servicesUrl + '/rutafavorita', {}, {
      query: {
        method: 'GET', 
        params:{usrid: '@usrid'}, 
        isArray: true, 
        headers: { 'Authorization': 'Bearer ' + SessionService.currentUser.authtoken }
      }     
    });

  }]);

muukServices.factory('RutaFavoritaAdd',['$resource', 'SessionService',
  function($resource, SessionService){
    return $resource(servicesUrl + '/rutafavorita/add', {}, {
      query: {
        method: 'PUT', 
        params: {usrid: '@usrid', rutaid: '@rutaid'}, 
        isArray: false, 
        headers: { 'Authorization': 'Bearer ' + SessionService.currentUser.authtoken }
      }     
    });

  }]);

muukServices.factory('RutaFavoritaRemove',['$resource', 'SessionService',
  function($resource, SessionService){
    return $resource(servicesUrl + '/rutafavorita/remove', {}, {
      query: {
        method: 'PUT', 
//        params: { }, 
        params: {usrid: '@usrid', rutaid: '@rutaid'}, 
        isArray: false, 
        headers: { 'Authorization': 'Bearer ' + SessionService.currentUser.authtoken }
      }     
    });

  }]);

muukServices.factory('Reservaciones',['$resource', 'SessionService',
  function($resource, SessionService){
    return $resource(servicesUrl + '/compra/misreservaciones', {}, {
      query: {
        method: 'GET', 
        params: { }, 
        isArray: true, 
        headers: { 'Authorization': 'Bearer ' + SessionService.currentUser.authtoken }
      }     
    });

  }]);

muukServices.factory('CancelarReservacion',['$resource', 'SessionService',
  function($resource, SessionService){
    return $resource(servicesUrl + '/compra/cancelar/:exId', {}, {
      query: {
        method: 'POST', 
        params: {exId: '@exId'}, 
        isArray: false, 
        headers: { 'Authorization': 'Bearer ' + SessionService.currentUser.authtoken }
      }     
    });

  }]);

muukServices.factory('Esperas',['$resource', 'SessionService',
  function($resource, SessionService){
    return $resource(servicesUrl + '/compra/misesperas', {}, {
      query: {
        method: 'GET', 
        params: { }, 
        isArray: true, 
        headers: { 'Authorization': 'Bearer ' + SessionService.currentUser.authtoken }
      }     
    });

  }]);

muukServices.factory('CancelarEspera',['$resource', 'SessionService',
  function($resource, SessionService){
    return $resource(servicesUrl + '/compra/cancelarespera/:exId', {}, {
      query: {
        method: 'POST', 
        params: {exId: '@exId'}, 
        isArray: false, 
        headers: { 'Authorization': 'Bearer ' + SessionService.currentUser.authtoken }
      }     
    });

  }]);


/*
muukServices.factory('RutaSugerida',['$resource', 'SessionService',
  function($resource, SessionService){
    var ResourceObject = $resource(servicesUrl + '/compra/rutasugeridas');
    return {
      getTransformedValues:function() {
        return ResourceObject.query().$promise.then(function(data){

        });
      }
    };

    $resource(, {}, {
      query: {method: 'GET', params:{puntoALat: '@OrigenLat', puntoALng: '@OrigenLng', puntoBLat: '@DestinoLat', puntoBLng: '@DestinoLng'}, isArray:true, headers: { 'Authorization': 'Bearer ' + SessionService.currentUser.authtoken }}
    });

    //{puntoALat: $scope.OrigenLat, puntoALng: $scope.OrigenLng, puntoBLat: $scope.DestinoLat, puntoBLng: $scope.DestinoLng}
  }]);
*/
