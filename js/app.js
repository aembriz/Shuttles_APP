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
      when('/main', {
        templateUrl: 'partials/dashboard-main.html',
        controller: 'DashboardCtrl'
      }).
      when('/redirect', {
        templateUrl: 'partials/redirect-main.html',
        controller: 'LoginController'
      }).

      // Login
      when('/loginForgotPass', {
        templateUrl: 'partials/login-forgotPass.html',
        controller: 'LoginForgotPassCtrl'
      }).  
      when('/loginRegisterUser', {
        templateUrl: 'partials/login-registerUser.html',
        controller: 'LoginRegisterUserCtrl'
      }).  

      // EmbarQ
      when('/embarqEmpresas', {
        templateUrl: 'partials/embarq-empresaList.html',
        controller: 'EmbarQEmpresaListCtrl'
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
      when('/embarqRutaEdit/:id', {
        templateUrl: 'partials/embarq-rutaForm.html',
        controller: 'EmbarqRutaUpdateCtrl'
      }).            
      when('/embarqRutaShow/:id', {
        templateUrl: 'partials/embarq-rutaShow.html',
        controller: 'EmbarqRutaDetailCtrl'
      }).   
      when('/embarqRutas', {
        templateUrl: 'partials/embarq-rutaList.html',
        controller: 'EmbarQRutalistCtrl'
      }).      
      when('/embarqEstadisticas', {
        templateUrl: 'partials/embarq-estadisticas.html',
        controller: 'EmbarQEstadisticasCtrl'
      }).      
      when('/embarqAltaEmpresa', {
        templateUrl: 'partials/embarq-altaEmpresa.html',
        controller: 'EmbarQAltaEmpresaCtrl'
      }).      
      when('/embarqSolicitudEmpresaShow/:id', {
        templateUrl: 'partials/embarq-solicitudEmpresaShow.html',
        controller: 'EmbarqSolicitudEmpresaShowCtrl'
      }).   
      when('/embarqSolicitudEmpresaEdit/:id', {
        templateUrl: 'partials/embarq-solicitudEmpresaForm.html',
        controller: 'EmbarqSolicitudEmpresaUpdateCtrl'
      }).   
      when('/embarqSolicitudRutaShow/:id', {
        templateUrl: 'partials/embarq-solicitudRutaShow.html',
        controller: 'EmbarqSolicitudRutaShowCtrl'
      }).   
      when('/embarqSolicitudRutaEdit/:id', {
        templateUrl: 'partials/embarq-solicitudRutaForm.html',
        controller: 'EmbarqSolicitudRutaUpdateCtrl'
      }).   
      when('/embarqAltaRuta', {
        templateUrl: 'partials/embarq-altaRuta.html',
        controller: 'EmbarQAltaRutaCtrl'
      }).      
      when('/embarqAdminEmpresas', {
        templateUrl: 'partials/embarq-adminEmpresas.html',
        controller: 'EmbarQAdminEmpresasCtrl'
      }).      

      // Empresa
      when('/empresaPerfil', {
        templateUrl: 'partials/empresa-perfil.html',
        controller: 'EmpresaPerfilCtrl'
      }).      
      when('/empresaListaUsuarios', {
        templateUrl: 'partials/empresa-listaUsuarios.html',
        controller: 'EmpresaListaUsuariosCtrl'
      }).      
      when('/empresaMisRutas', {
        templateUrl: 'partials/empresa-misRutas.html',
        controller: 'EmpresaMisRutasCtrl'
      }).      
      when('/empresaComentarios', {
        templateUrl: 'partials/empresa-comentarios.html',
        controller: 'EmpresaComentariosCtrl'
      }).      
      when('/empresaEstadisticas', {
        templateUrl: 'partials/empresa-estadisticas.html',
        controller: 'EmpresaEstadisticasCtrl'
      }).      
      when('/empresaAltaUsuarios', {
        templateUrl: 'partials/empresa-altaUsuarios.html',
        controller: 'EmpresaAltaUsuariosCtrl'
      }).      
      when('/empresaRutasCompartidas', {
        templateUrl: 'partials/empresa-rutasCompartidas.html',
        controller: 'EmpresaRutasCompartidasCtrl'
      }).      
      when('/empresaAltaRuta', {
        templateUrl: 'partials/empresa-altaRuta.html',
        controller: 'EmpresaAltaRutaCtrl'
      }).      
      when('/empresaEstadisticas', {
        templateUrl: 'partials/empresa-estadisticas.html',
        controller: 'EmpresaEstadisticasCtrl'
      }).      

      // Usuario
      when('/usuarioPerfil', {
        templateUrl: 'partials/usuario-perfil.html',
        controller: 'UsuarioPerfilCtrl'
      }).      
      when('/usuarioResumen', {
        templateUrl: 'partials/usuario-resumen.html',
        controller: 'UsuarioResumenCtrl'
      }).      
      when('/usuarioViajes', {
        templateUrl: 'partials/usuario-viajes.html',
        controller: 'UsuarioViajesCtrl'
      }).      
      when('/usuarioRutas', {
        templateUrl: 'partials/usuario-rutas.html',
        controller: 'UsuarioRutasCtrl'
      }).      
      when('/usuarioReservaciones', {
        templateUrl: 'partials/usuario-reservaciones.html',
        controller: 'UsuarioReservacionesCtrl'
      }).      
      when('/usuarioCancelaciones', {
        templateUrl: 'partials/usuario-cancelaciones.html',
        controller: 'UsuarioCancelacionesCtrl'
      }).      
      when('/usuarioFavoritos', {
        templateUrl: 'partials/usuario-favoritos.html',
        controller: 'UsuarioFavoritosCtrl'
      }).      
      when('/usuarioBuscarRutas', {
        templateUrl: 'partials/usuario-buscarRutas.html',
        controller: 'UsuarioBuscarRutasCtrl'
      }).      
      when('/usuarioEstadisticas', {
        templateUrl: 'partials/usuario-estadisticas.html',
        controller: 'UsuarioEstadisticasCtrl'
      }). 

      otherwise({
        //redirectTo: '/main'
        redirectTo: '/redirect'
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
