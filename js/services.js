'use strict';

/* Services */

var muukServices = angular.module('muukServices', ['ngResource']);
//var servicesUrl = "http://localhost:8080";
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
                var user = {name: rs.nombre, username: usr, role: rs.role, authtoken: rs.token, empresa: rs.empresa};
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
/* EmbarQ - Pre-registro empresa */
muukServices.factory('EmpresaPreregister', ['$resource', 
  function($resource){
    return $resource(servicesUrl + '/preregister/empresa/', {}, {
      create: { method:'POST', params:{}, isArray:false, headers: { }},
    });
  }]);

// *****************************************************
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

