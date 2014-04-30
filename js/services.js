'use strict';

/* Services */

var muukServices = angular.module('muukServices', ['ngResource']);
//var servicesUrl = "http://localhost:8080";
var servicesUrl = "http://54.201.26.22:8082";

muukServices.factory('RoleService', ['$http', function ($http) {
  'use strict';
  var adminRoles = ['admin', 'editor'];
  var otherRoles = ['user'];
  return {
    validateRoleAdmin: function (currentUser) {
      return currentUser ? _.contains(adminRoles, currentUser.role) : false;
    },
    validateRoleOther: function (currentUser) {
      return currentUser ? _.contains(otherRoles, currentUser.role) : false;
    }
  };
}]);

muukServices.factory('AuthenticationService', ['$http', '$location', 'SessionService', function ($http, $location, SessionService) {
  'use strict';
  var rs = {message:'', apiKey:''};
  return {
    login: function (usr, pwd, callbackSuccess, callBackError) {
      // this method could be used to call the API and set the user instead of taking it in the function params
        $.ajax({
          type: "POST",
          url: servicesUrl + "/users/login",
          data: {
            email: usr,
            password: pwd 
          },
          success: function( data ) {
            if(data.error){
              callbackSuccess(data);
            }
            else{              
              rs = data;
              var user = {name: usr, user: usr, role: 'user', authtoken: rs.apiKey};
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

muukServices.factory('SessionService', ['$cookieStore', function ($cookieStore) {  
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

muukServices.factory('Empresa', ['$resource', 'SessionService', 
  function($resource, SessionService){
    return $resource(servicesUrl + '/empresa/:exId', {}, {
      query: {method:'GET', params:{}, isArray:true, headers: { 'Access': SessionService.currentUser.authtoken }},
      create: {method:'POST', params:{}, isArray:false, headers: { 'Access': SessionService.currentUser.authtoken }},
      remove: { method: 'DELETE', params: {exId: '@id'}, headers: { 'Access': SessionService.currentUser.authtoken } },
      update: { method: 'PUT', params: {exId: '@id'}, headers: { 'Access': SessionService.currentUser.authtoken } },
      show: { method: 'GET' }
    });
  }]);

muukServices.factory('Ruta', ['$resource', 'SessionService', 
  function($resource, SessionService){
    return $resource(servicesUrl + '/ruta/:exId', {}, {
      query: {method:'GET', params:{}, isArray:true, headers: { 'Access': SessionService.currentUser.authtoken }},
      create: {method:'POST', params:{}, isArray:false, headers: { 'Access': SessionService.currentUser.authtoken }},
      remove: { method: 'DELETE', params: {exId: '@id'}, headers: { 'Access': SessionService.currentUser.authtoken } },
      update: { method: 'PUT', params: {exId: '@id'}, headers: { 'Access': SessionService.currentUser.authtoken } },
      show: { method: 'GET' }
    });
  }]);
