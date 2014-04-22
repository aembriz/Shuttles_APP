'use strict';

/* App Module */

var muukApp = angular.module('muukApp', [
  'ngRoute',
  'ngCookies',
  'muukAnimations',
  
  'muukControllers',
  'muukFilters',
  'muukServices',
  'muukDirectives',
  'googlechart'
]);

muukApp.config(['$routeProvider', '$httpProvider',
  function($routeProvider, $httpProvider) {
    $routeProvider. 
      when('/login', {        
        controller: 'LoginController'
      }).    
      when('/empresas', {
        templateUrl: 'partials/empresa-list.html',
        controller: 'EmpresaListCtrl'
      }).
      when('/empresasNew', {
        templateUrl: 'partials/empresa-form.html',
        controller: 'EmpresaFormCtrl'
      }).
      when('/empresasEdit/:id', {
        templateUrl: 'partials/empresa-form.html',
        controller: 'EmpresaUpdateCtrl'
      }).            
      when('/empresasShow/:id', {
        templateUrl: 'partials/empresa-show.html',
        controller: 'EmpresaDetailCtrl'
      }).
      when('/main', {
        templateUrl: 'partials/dashboard-main.html',
        controller: 'DashboardCtrl'
      }).
      otherwise({
        redirectTo: '/main'
      });
  }
]);

muukApp.run(['$rootScope', '$location', 'AuthenticationService', 'RoleService', 'SessionService', function ($rootScope, $location, AuthenticationService, RoleService, SessionService) {

  'use strict';

  // enumerate routes that don't need authentication
  var routesThatDontRequireAuth = ['/login'];
  var routesForAdmin = ['/admin'];


  // check if current location matches route  
  var routeClean = function (route) {
    return _.find(routesThatDontRequireAuth,
      function (noAuthRoute) {
        //return _.str.startsWith(route, noAuthRoute);
        return startsWith(route, noAuthRoute);
      });
  };

  // check if current location matches route  
  var routeAdmin = function (route) {
    return _.find(routesForAdmin,
      function (noAuthRoute) {
        //return _.str.startsWith(route, noAuthRoute);
        return startsWith(route, noAuthRoute);
      });
  };

  $rootScope.$on('$routeChangeStart', function (event, next, current) {
    // if route requires auth and user is not logged in
    if (!routeClean($location.url()) && !AuthenticationService.isLoggedIn()) {
      // redirect back to login
      event.preventDefault();
      $location.path('/login');
    }
    else if (routeAdmin($location.url()) && !RoleService.validateRoleAdmin(SessionService.currentUser)) {
      // redirect back to login
      event.preventDefault();
      $location.path('/error');
    }
  });
}]);
