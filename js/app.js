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
      // *****************************************************
      // Login
      // *****************************************************
      when('/loginForgotPass', {
        templateUrl: 'partials/login-forgotPass.html',
        controller: 'LoginForgotPassCtrl'
      }).  
      when('/loginRegisterUser', {
        templateUrl: 'partials/login-registerUser.html',
        controller: 'LoginRegisterUserCtrl'
      }).  
      when('/registro/:id', {
        templateUrl: 'partials/login-registro.html',
        controller: 'LoginConfirmarRegistroCtrl'
      }).
      // *****************************************************
      /* EmbarQ */
      // *****************************************************
      // EmbarQ - Empresa
      when('/embarqEmpresaList', {
        templateUrl: 'partials/embarq-empresaList.html',
        controller: 'EmbarqEmpresaListCtrl'
      }).
      when('/embarqEmpresaNew', {
        templateUrl: 'partials/embarq-empresaForm.html',
        controller: 'EmbarqEmpresaFormCtrl'
      }).
      when('/embarqEmpresaEdit/:id', {
        templateUrl: 'partials/embarq-empresaForm.html',
        controller: 'EmbarqEmpresaUpdateCtrl'
      }).            
      when('/embarqEmpresaShow/:id', {
        templateUrl: 'partials/embarq-empresaShow.html',
        controller: 'EmbarqEmpresaDetailCtrl'
      }).   
      // -----------------------------------------------------
      // EmbarQ - Ruta
      when('/embarqRutaEdit/:id', {
        templateUrl: 'partials/embarq-rutaForm.html',
        controller: 'EmbarqRutaUpdateCtrl'
      }).            
      when('/embarqRutaShow/:id', {
        templateUrl: 'partials/embarq-rutaShow.html',
        controller: 'EmbarqRutaDetailCtrl'
      }).   
      when('/embarqRutaNew', {
        templateUrl: 'partials/embarq-rutaForm.html',
        controller: 'EmbarqRutaFormCtrl'
      }).      
      when('/embarqRutaList', {
        templateUrl: 'partials/embarq-rutaList.html',
        controller: 'EmbarqRutalistCtrl'
      }).      
      // -----------------------------------------------------
      // EmbarQ - Estadisticas
      when('/embarqEstadisticas', {
        templateUrl: 'partials/embarq-estadisticas.html',
        controller: 'EmbarqEstadisticasCtrl'
      }).      
      // -----------------------------------------------------
      // EmbarQ - Solicitud de empresa
      when('/embarqSolicitudEmpresaList', {
        templateUrl: 'partials/embarq-solicitudEmpresaList.html',
        controller: 'EmbarqSolicitudEmpresaListCtrl'
      }).      
      when('/embarqSolicitudEmpresaShow/:id', {
        templateUrl: 'partials/embarq-solicitudEmpresaShow.html',
        controller: 'EmbarqSolicitudEmpresaShowCtrl'
      }).   
      when('/embarqSolicitudEmpresaEdit/:id', {
        templateUrl: 'partials/embarq-solicitudEmpresaForm.html',
        controller: 'EmbarqSolicitudEmpresaUpdateCtrl'
      }).   
      // -----------------------------------------------------
      // EmbarQ - Solicitud de Ruta
      when('/embarqSolicitudRutaList', {
        templateUrl: 'partials/embarq-solicitudRutaList.html',
        controller: 'EmbarqSolicitudRutaListCtrl'
      }).      
      when('/embarqSolicitudRutaShow/:id', {
        templateUrl: 'partials/embarq-solicitudRutaShow.html',
        controller: 'EmbarqSolicitudRutaShowCtrl'
      }).   
      when('/embarqSolicitudRutaEdit/:id', {
        templateUrl: 'partials/embarq-solicitudRutaForm.html',
        controller: 'EmbarqSolicitudRutaUpdateCtrl'
      }).   
      when('/embarqAdminEmpresas', {
        templateUrl: 'partials/embarq-adminEmpresas.html',
        controller: 'EmbarqAdminEmpresasCtrl'
      }).      
      // *****************************************************
      /* Empresa */
      // *****************************************************
      // Empresa - Perfil
      when('/empresaPerfil', {
        templateUrl: 'partials/empresa-perfil.html',
        controller: 'EmpresaPerfilCtrl'
      }).      
      // -----------------------------------------------------
      // Empresa - Usuarios
      when('/empresaUsuarioList', {
        templateUrl: 'partials/empresa-usuarioList.html',
        controller: 'EmpresaUsuarioListCtrl'
      }).      
      when('/empresaUsuarioNew', {
        templateUrl: 'partials/empresa-usuarioForm.html',
        controller: 'EmpresaUsuarioFormCtrl'
      }).      
      when('/empresaUsuarioShow/:id', {
        templateUrl: 'partials/empresa-usuarioShow.html',
        controller: 'EmpresaUsuarioShowCtrl'
      }).      
      when('/empresaUsuarioEdit/:id', {
        templateUrl: 'partials/empresa-usuarioForm.html',
        controller: 'EmpresaUsuarioEditCtrl'
      }).   
      when('/empresaMultiUsuarioNew', {
        templateUrl: 'partials/empresa-multiUsuarioForm.html',
        controller: 'EmpresaMultiUsuarioNewCtrl'
      }).          
      // -----------------------------------------------------
      // Empresa - Solicitud de Usuarios
      when('/empresaSolicitudUsuarioList', {
        templateUrl: 'partials/empresa-solicitudUsuarioList.html',
        controller: 'EmpresaSolicitudUsuarioListCtrl'
      }).      
      when('/empresaSolicitudUsuarioShow/:id', {
        templateUrl: 'partials/empresa-solicitudUsuarioShow.html',
        controller: 'EmpresaSolicitudUsuarioShowCtrl'
      }).      
      when('/empresaSolicitudUsuarioEdit/:id', {
        templateUrl: 'partials/empresa-solicitudUsuarioForm.html',
        controller: 'EmpresaSolicitudUsuarioEditCtrl'
      }).      
      // -----------------------------------------------------
      // Empresa - Rutas
      when('/empresaRutaList', {
        templateUrl: 'partials/empresa-rutaList.html',
        controller: 'EmpresaRutaListCtrl'
      }).      
      when('/empresaRutaNew', {
        templateUrl: 'partials/empresa-rutaForm.html',
        controller: 'EmpresaRutaFormCtrl'
      }).      
      when('/empresaRutaShow/:id', {
        templateUrl: 'partials/empresa-rutaShow.html',
        controller: 'EmpresaRutaShowCtrl'
      }).      
      when('/empresaRutaEdit/:id', {
        templateUrl: 'partials/empresa-rutaForm.html',
        controller: 'EmpresaRutaEditCtrl'
      }).      
      // -----------------------------------------------------
      // Empresa - Comentarios
      when('/empresaComentarios', {
        templateUrl: 'partials/empresa-comentarios.html',
        controller: 'EmpresaComentariosCtrl'
      }).      
      // -----------------------------------------------------
      // Empresa - Estadisticas
      when('/empresaEstadisticas', {
        templateUrl: 'partials/empresa-estadisticas.html',
        controller: 'EmpresaEstadisticasCtrl'
      }).      
      // -----------------------------------------------------
      // Empresa - Rutas compartidas
      when('/empresaRutasCompartidas', {
        templateUrl: 'partials/empresa-rutasCompartidas.html',
        controller: 'EmpresaRutasCompartidasCtrl'
      }).      
      // *****************************************************
      /* Usuario */
      // *****************************************************
      // Usuario - Perfil
      when('/usuarioPerfil', {
        templateUrl: 'partials/usuario-perfil.html',
        controller: 'UsuarioPerfilCtrl'
      }).      
      // -----------------------------------------------------
      // Usuario - Consulta
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
      // -----------------------------------------------------
      // Usuario - Rutas
      when('/usuarioBuscarRutas', {
        templateUrl: 'partials/usuario-buscarRutas.html',
        controller: 'UsuarioBuscarRutasCtrl'
      }).      
      // -----------------------------------------------------
      // Usuario - Estadisticas
      when('/usuarioEstadisticas', {
        templateUrl: 'partials/usuario-estadisticas.html',
        controller: 'UsuarioEstadisticasCtrl'
      }). 
      otherwise({
        //redirectTo: '/main'
        redirectTo: '/redirect'
      }).
  // -----------------------------------------------------
      // MAPA
      when('/mapaview/:id', {
        templateUrl: 'partials/mapanew.html',
        controller: 'MapaFormCtrl'
      });
  }
]);

muukApp.run(['$rootScope', '$location', 'AuthenticationService', 'RoleService', 'SessionService', 
  function ($rootScope, $location, AuthenticationService, RoleService, SessionService) {

  'use strict';

  // enumerate routes that don't need authentication
  var routesThatDontRequireAuth = ['/login', '/loginForgotPass', '/loginRegisterUser', '/registro'];
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
