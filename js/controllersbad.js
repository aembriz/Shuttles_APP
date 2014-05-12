'use strict';

/* Controllers */

var muukControllers = angular.module('muukControllers', []);


muukControllers.controller('AppCtrl', ['$scope', '$location', '$window', 'SessionService',
  function($scope, $location, $window, SessionService) { 

    //$scope.user = {authenticated:false};
    //$scope.user = {authenticated: (SessionService.currentUser != null), name: ''};    
    if(SessionService.currentUser != null){
      $scope.user = {authenticated: true, name: SessionService.currentUser.name};    
    } 
    else{
      $scope.user = {authenticated: false, name: ''};    
      $scope.mainSection = 'login'; 
    }   

    $scope.gotoRegister = function() {
      // this should replace login with register form
      $scope.mainSection = 'register';
    };    

    $scope.gotoLogin = function() {
      // this should replace login with register form
      $scope.mainSection = 'login';
    };   
  }]);
muukControllers.controller('LoginController', ['$scope', '$location', 'AuthenticationService', 'SessionService',
  function ($scope, $location, AuthenticationService, SessionService) {
    $scope.message = "";

    $scope.logincallbackSuccess = function( data ) {              
      if(data.error){
        $scope.message = data.message;
      }
      else{            
        $scope.user.authenticated = AuthenticationService.isLoggedIn();
        $scope.user.name = SessionService.currentUser.name;
        $scope.user.empresa = SessionService.currentUser.empresa;
        $scope.user.token = SessionService.currentUser.token;
        $scope.user.role = SessionService.currentUser.role;

        $location.path('redirect');        
      }      
      $scope.$apply();
    };
    $scope.logincallbackError = function(request, status, error){
      $scope.message = request.responseJSON.message;
      $scope.$apply();      
    };            

    $scope.loginUser = function(usr, pwd, callbackSuccess, callbackError) {
      // this should be replaced with a call to your API for user verification (or you could also do it in the service)
      AuthenticationService.login(usr, pwd, callbackSuccess, callbackError);      
    };

    $scope.loginAdmin = function() {
      // this should be replaced with a call to your API for user verification (or you could also do it in the service)    
      AuthenticationService.login({name: 'Admin', role: 'admin'});
    };
  }]);
muukControllers.controller('MainCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {	

  	$scope.menuActive = ["active","","","",""]
    $scope.submenuActive = ["active","","","",""]
  	$scope.menuSelect = function(menu){		
  		for (var i = 0; i < $scope.menuActive.length; ++i) {			
  			$scope.menuActive[i] = "";
  			if(i == menu) {
          $scope.menuActive[i] = "active";			
          $scope.submenuSelect(0);
        }  
  		}	
  	};

    $scope.submenuSelect = function(submenu){   
      for (var i = 0; i < $scope.submenuActive.length; ++i) {      
        $scope.submenuActive[i] = "";
        if(i == submenu) $scope.submenuActive[i] = "active";      
      } 
    };

    $scope.logout = function(){
      AuthenticationService.logout();
      $scope.user.authenticated = AuthenticationService.isLoggedIn();
      $location.path('login');
    };
  }]);
muukControllers.controller("DashboardCtrl", ['$scope', '$routeParams', '$window', 'File', 'Agent', 
  function ($scope, $routeParams, $window, File, Agent) {


    $scope.chartObject = {};
    var rows=[];
    $scope.charts = File.chart1(function(){
      $scope.charts.files.forEach(function(entry) {
        rows.push({c: [{v: entry.agente}, {v: entry.archivo}]});        
      });      
    });

    $scope.chartObject.data = {"cols": [
        {id: "t", label: "Agente", type: "string"},
        {id: "s", label: "Archivos", type: "number"}
    ], "rows": rows};

    //console.log(($scope.chartObject.data));

    // $routeParams.chartType == BarChart or PieChart or ColumnChart...
    $scope.chartObject.type = "BarChart";//$routeParams.chartType;
    $scope.chartObject.options = {
        'title': 'Producción por campaña'
    }

    // ***********************Ag X Campaña**********************************
    $scope.chartAgXCampana = Agent.chartXCampana();
    $scope.chartObjectAgXCamp = {};
    var rows2=[];
    $scope.charts2 = Agent.chartXCampana(function(){
      $scope.charts2.agents.forEach(function(entry) {
        rows2.push({c: [{v: entry.campana}, {v: entry.agentes}]});        
      });      
    });

    $scope.chartObjectAgXCamp.data = {"cols": [
        {id: "t", label: "Agente", type: "string"},
        {id: "s", label: "Archivos", type: "number"}
    ], "rows": rows2};

    //console.log(($scope.chartObject.data));

    // $routeParams.chartType == BarChart or PieChart or ColumnChart...
    $scope.chartObjectAgXCamp.type = "PieChart";//$routeParams.chartType;
    $scope.chartObjectAgXCamp.options = {
        'title': 'Número de agentes por campaña'
    }
  }]);

// *****************************************************
/* Login - Registro de nueva empresa */
// *****************************************************
muukControllers.controller('LoginRegisterUserCtrl', ['$scope', '$location',
  function($scope, $location) {  
    $scope.mainSection = 'register'; 
     
  }]);

// *****************************************************
/* EmbarQ  */
// *****************************************************
/* EmbarQ - Empresa */
muukControllers.controller('EmbarqEmpresaListCtrl', 
  ['$scope', '$window', 'Empresa', 'EmpresasAutorizadas',
  function($scope, $window, Empresa, EmpresasAutorizadas) {
    $scope.empresas = EmpresasAutorizadas.query();
    $scope.orderProp = 'nombre';

    $scope.deleteEmpresa = function (exId) {   
      if( $window.confirm("Se eliminará el registro con id [" + exId + "] ¿Continuar?")) {      
        Empresa.remove({ exId: exId },
          function(data){       
            $scope.empresas = EmpresasAutorizadas.query();
          }     
        );        
      }
    };  
    $scope.adminEmpresa = function (exId) {   
         
    }; 

  }]); 
muukControllers.controller('EmbarqEmpresaFormCtrl', ['$scope', 'Empresa', '$location',
  function($scope, Empresa, $location) {
    $scope.master = {};

    $scope.update = function(empresa) {
      $scope.master = angular.copy(empresa);
    };

    $scope.reset = function() {
      $scope.empresa = angular.copy($scope.master);
    };

    $scope.save = function(empresa) {
      var ex = new Empresa(empresa);   
      console.log(ex);    
      //ex.$save();
      ex.$create({}, function(){$location.path('embarqEmpresaList');});       
    };
    
    $scope.cancel = function(){
      $location.path('embarqEmpresaList');
    };
    
    $scope.reset();
  
  }]);
muukControllers.controller('EmbarqEmpresaDetailCtrl', ['$scope', '$routeParams', 'Empresa', '$location',
  function($scope, $routeParams, Empresa, $location) {    
    $scope.empresa = Empresa.show({exId: $routeParams.id});
    
    $scope.cancel = function(){
      $location.path('embarqEmpresaList');
    };    
  }]); 
muukControllers.controller('EmbarqEmpresaUpdateCtrl', ['$scope', '$routeParams', 'Empresa', '$location',
  function($scope, $routeParams, Empresa, $location) {
  
    $scope.empresa = Empresa.show({exId: $routeParams.id});

    $scope.save = function(empresa) {
      var ex = new Empresa(empresa);   
      console.log(ex);    
      //ex.$save();
      ex.$update({ exId: empresa.id }, function(){$location.path('embarqEmpresaList');});       
    };
    
    $scope.cancel = function(){
      $location.path('embarqEmpresaList');
    };
  }]);

// -----------------------------------------------------
/* EmbarQ - Solicitud de Empresa */
muukControllers.controller('EmbarqSolicitudEmpresaShowCtrl', ['$scope', '$routeParams', 'Empresa', '$location',
  function($scope, $routeParams, Empresa, $location) {    
    $scope.empresa = Empresa.show({exId: $routeParams.id});
    
    $scope.cancel = function(){
      $location.path('embarqSolicitudEmpresaList');
    };    
  }]); 
muukControllers.controller('EmbarqSolicitudEmpresaUpdateCtrl', ['$scope', '$routeParams', 'Empresa', '$location',
  function($scope, $routeParams, Empresa, $location) {
  
    $scope.empresa = Empresa.show({exId: $routeParams.id});

    $scope.save = function(empresa) {
      var ex = new Empresa(empresa);   
      console.log(ex);    
      //ex.$save();
      ex.$update({ exId: empresa.id }, function(){$location.path('embarqSolicitudEmpresaList');});       
    };
    
    $scope.cancel = function(){
      $location.path('embarqSolicitudEmpresaList');
    };
  }]);
muukControllers.controller('EmbarqSolicitudEmpresaListCtrl', 
  ['$scope', '$window', 'EmpresasNuevas', 'EmpresaAutorizar', 'EmpresaRechazar',
  function($scope, $window, EmpresasNuevas, EmpresaAutorizar, EmpresaRechazar) {
    $scope.empresas = EmpresasNuevas.query();
    $scope.orderProp = 'nombre';

  $scope.rechazarEmpresa = function (exId) {   
    if( $window.confirm("Se rechazará la solicitud con id [" + exId + "], ¿Desea continuar?")) {      
      EmpresaRechazar.reject({ exId: exId },
        function(data){       
          $scope.empresas = EmpresasNuevas.query();
        }     
      );        
    }
  };  
  $scope.autorizarEmpresa = function (exId) {   
    if( $window.confirm("Se autorizará la solicitud con id [" + exId + "], ¿Desea continuar?")) {   
      EmpresaAutorizar.auth({ exId: exId },
        function(data){       
          $scope.empresas = EmpresasNuevas.query();
        }     
      );        
    }
  }; 

  }]);

// -----------------------------------------------------
/* EmbarQ - Ruta */
muukControllers.controller('EmbarqRutalistCtrl', ['$scope', '$window', 'Ruta', 'RutasAutorizadas',
  function($scope, $window, Ruta, RutasAutorizadas) {
    $scope.rutas = RutasAutorizadas.query();
    $scope.orderProp = 'nombre';

    $scope.deleteRuta = function (exId) {   
      if( $window.confirm("Se eliminará la ruta con id [" + exId + "], ¿Desea continuar?")) {      
        Ruta.remove({ exId: exId },
          function(data){       
            $scope.rutas = RutasAutorizadas.query();
          }     
        ); 
      }
    };  

  }]);
muukControllers.controller('EmbarqRutaFormCtrl', ['$scope', 'Ruta', '$location',
  function($scope, Ruta, $location) {
  $scope.master = {};

  $scope.update = function(ruta) {
    $scope.master = angular.copy(ruta);
  };

  $scope.reset = function() {
    $scope.ruta = angular.copy($scope.master);
  };

  $scope.save = function(ruta) {
    var ex = new Ruta(ruta);   
    console.log(ex);    
    //ex.$save();
    ex.$create({}, function(){$location.path('embarqRutaList');});       
  };
  
  $scope.cancel = function(){
    $location.path('embarqRutaList');
  };
  
  $scope.reset();
  
  }]);
muukControllers.controller('EmbarqRutaDetailCtrl', ['$scope', '$routeParams', 'Ruta', '$location',
  function($scope, $routeParams, Ruta, $location) {    
    $scope.ruta = Ruta.show({exId: $routeParams.id});
    
    $scope.cancel = function(){
      $location.path('embarqRutaList');
    };    
  }]); 
muukControllers.controller('EmbarqRutaUpdateCtrl', ['$scope', '$routeParams', 'Ruta', '$location',
  function($scope, $routeParams, Ruta, $location) {
  
    $scope.ruta = Ruta.show({exId: $routeParams.id});

    $scope.save = function(ruta) {
      var ex = new Ruta(ruta);   
      console.log(ex);    
      //ex.$save();
      ex.$update({ exId: ruta.id }, function(){$location.path('embarqRutaList');});       
    };
    
    $scope.cancel = function(){
      $location.path('embarqRutaList');
    };
  }]);

// -----------------------------------------------------
/* EmbarQ - Solicitud de Ruta */
muukControllers.controller('EmbarqSolicitudRutaShowCtrl', ['$scope', '$routeParams', 'Ruta', '$location',
  function($scope, $routeParams, Ruta, $location) {    
    $scope.ruta = Ruta.show({exId: $routeParams.id});
    
    $scope.cancel = function(){
      $location.path('embarqSolicitudRutaList');
    };    
  }]); 
muukControllers.controller('EmbarqSolicitudRutaUpdateCtrl', ['$scope', '$routeParams', 'Ruta', '$location',
  function($scope, $routeParams, Ruta, $location) {
  
    $scope.ruta = Ruta.show({exId: $routeParams.id});

    $scope.save = function(ruta) {
      var ex = new Ruta(ruta);   
      console.log(ex);    
      //ex.$save();
      ex.$update({ exId: ruta.id }, function(){$location.path('embarqSolicitudRutaList');});       
    };
    
    $scope.cancel = function(){
      $location.path('embarqSolicitudRutaList');
    };
  }]);
muukControllers.controller('EmbarqSolicitudRutaListCtrl', 
  ['$scope', '$window', 'RutasNuevas', 'RutaAutorizar', 'RutaRechazar',
  function($scope, $window, RutasNuevas, RutaAutorizar, RutaRechazar) {
    $scope.rutas = RutasNuevas.query();
    $scope.orderProp = 'nombre';

    $scope.rechazarRuta = function (exId) {   
      if( $window.confirm("Se rechazará la ruta con id [" + exId + "], ¿Desea continuar?")) {      
        RutaRechazar.reject({ exId: exId },
          function(data){       
            $scope.rutas = RutasNuevas.query();
          }     
        ); 
      }
    };  
    $scope.autorizarRuta = function (exId) {   
      if( $window.confirm("Se autorizará la ruta con id [" + exId + "], ¿Desea continuar?")) {   
        RutaAutorizar.auth({ exId: exId },
          function(data){       
            $scope.rutas = RutasNuevas.query();
          }     
        ); 
      }
    }; 
  }]);

// -----------------------------------------------------
/* EmbarQ - Estadisticas */
muukControllers.controller('EmbarqEstadisticasCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {  

  }]);

// -----------------------------------------------------
/* EmbarQ - Administrar Empresa */
muukControllers.controller('EmbarqAdminEmpresasCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {  

  }]);

// *****************************************************
/* Empresa  */
// *****************************************************
/* Empresa - Perfil */
muukControllers.controller('EmpresaPerfilCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {  
    $scope.user.nombre = 'nombre vacio';
  }]);

// -----------------------------------------------------
/* Empresa - Usuarios */
muukControllers.controller('EmpresaUsuarioListCtrl', 
  ['$scope', '$window', 'Usuario', 'UsuariosAutorizadosXEmpresa',
  function($scope, $window, Usuario, UsuariosAutorizadosXEmpresa) {
    $scope.usuarios = UsuariosAutorizadosXEmpresa.query();
    $scope.orderProp = 'nombre';

    $scope.deleteUsuario = function (exId) {   
      if( $window.confirm("Se eliminará el usuario con id [" + exId + "] ¿Continuar?")) {      
        Usuario.remove({ exId: exId },
          function(data){       
            $scope.usuarios = UsuariosAutorizadosXEmpresa.query();
          }     
        );        
      }
    };  

  }]);
muukControllers.controller('EmpresaUsuarioFormCtrl', ['$scope', 'Usuario', '$location',
  function($scope, Usuario, $location) {
    $scope.master = {};

    $scope.update = function(usuario) {
      $scope.master = angular.copy(usuario);
    };

    $scope.reset = function() {
      $scope.usuario = angular.copy($scope.master);
    };

    $scope.save = function(usuario) {
      var ex = new Usuario(usuario);   
      console.log(ex);    
      //ex.$save();
      ex.$create({}, function(){$location.path('empresaUsuarioList');});       
    };
    
    $scope.cancel = function(){
      $location.path('empresaUsuarioList');
    };
    
    $scope.reset();
  
  }]);
muukControllers.controller('EmpresaUsuarioShowCtrl', ['$scope', '$routeParams', 'Usuario', '$location',
  function($scope, $routeParams, Usuario, $location) {    
    $scope.usuario = Usuario.show({exId: $routeParams.id});
    
    $scope.cancel = function(){
      $location.path('empresaUsuarioList');
    };    
  }]); 
muukControllers.controller('EmpresaUsuarioEditCtrl', ['$scope', '$routeParams', 'Usuario', '$location',
  function($scope, $routeParams, Usuario, $location) {
    $scope.usuario = Usuario.show({exId: $routeParams.id});

    $scope.save = function(usuario) {
      var ex = new Usuario(usuario);   
      console.log(ex);    
      //ex.$save();
      ex.$update({ exId: usuario.id }, function(){$location.path('empresaUsuarioList');});       
    };
    
    $scope.cancel = function(){
      $location.path('empresaUsuarioList');
    };
  }]);
muukControllers.controller('EmpresaMultiUsuarioNewCtrl', ['$scope', '$window', 'Usuario', '$location',
  function($scope, $window, Usuario, $location) {
    $scope.master = {};

    $scope.update = function(usuario) {
      $scope.master = angular.copy(usuario);
    };

    $scope.reset = function() {
      $scope.usuario = angular.copy($scope.master);
    };

    $scope.save = function(usuarios) {
//      var userList = test.split(" ");
/*
      var userList = usuarios.split(/\r\n|\r|\n/g);
      for (var index in userList) {
        var UserObj = userList[index].split(",");
        if userlist.length >= 2 {
          // get name
          var nombre = UserObj[0]; 
          // get mail removing empty spaces
          var mail = UserObj[1].replace(/ +/g, "");; 
        }
*/
        if( $window.confirm("Input: [" + userList[index] + "] ¿Continuar?")) {      
  /*
          var ex = new Usuario(usuario);   
          console.log(ex);    
          ex.$create({}, function(){$location.path('empresaUsuarioList');});       
          */
        }
      }
    };
    
    $scope.cancel = function(){
      $location.path('empresaUsuarioList');
    };
    
    $scope.reset();
    /*
    function validateEmail(email) { 
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    } 
*/
  }]);

// -----------------------------------------------------
/* Empresa - Solicitud de usuarios */
muukControllers.controller('EmpresaSolicitudUsuarioListCtrl', 
  ['$scope', '$window', 'Usuario', 'UsuariosNuevosXEmpresa',
  function($scope, $window, Usuario, UsuariosNuevosXEmpresa) {
    $scope.usuarios = UsuariosNuevosXEmpresa.query();
    $scope.orderProp = 'nombre';

    $scope.deleteUsuario = function (exId) {   
      if( $window.confirm("Se eliminará el usuario con id [" + exId + "] ¿Continuar?")) {      
        Usuario.remove({ exId: exId },
          function(data){       
            $scope.usuarios = UsuariosNuevosXEmpresa.query();
          }     
        );        
      }
    };  

  }]);
muukControllers.controller('EmpresaSolicitudUsuarioShowCtrl', ['$scope', '$routeParams', 'Usuario', '$location',
  function($scope, $routeParams, Usuario, $location) {    
    $scope.usuario = Usuario.show({exId: $routeParams.id});
    
    $scope.cancel = function(){
      $location.path('empresaSolicitudUsuarioList');
    };    
  }]); 
muukControllers.controller('EmpresaSolicitudUsuarioEditCtrl', ['$scope', '$routeParams', 'Usuario', '$location',
  function($scope, $routeParams, Usuario, $location) {
  
    $scope.usuario = Usuario.show({exId: $routeParams.id});

    $scope.save = function(usuario) {
      var ex = new Usuario(usuario);   
      console.log(ex);    
      //ex.$save();
      ex.$update({ exId: usuario.id }, function(){$location.path('empresaSolicitudUsuarioList');});       
    };
    
    $scope.cancel = function(){
      $location.path('empresaSolicitudUsuarioList');
    };
  }]);

// -----------------------------------------------------
/* Empresa - Rutas */
muukControllers.controller('EmpresaRutaListCtrl', ['$scope', '$window', 'RutaXEmpresa',
  function($scope, $window, RutaXEmpresa) {
    $scope.rutas = RutaXEmpresa.query();
    $scope.orderProp = 'nombre';

    $scope.deleteRuta = function (exId) {   
      if( $window.confirm("Se eliminará la ruta con id [" + exId + "], ¿Desea continuar?")) {      
       
      }
    };  

  }]);
muukControllers.controller('EmpresaRutaFormCtrl', ['$scope', 'Ruta', '$location',
  function($scope, Ruta, $location) {
  $scope.master = {};

  $scope.update = function(ruta) {
    $scope.master = angular.copy(ruta);
  };

  $scope.reset = function() {
    $scope.ruta = angular.copy($scope.master);
  };

  $scope.save = function(ruta) {
    var ex = new Ruta(ruta);   
    console.log(ex);    
    //ex.$save();
    ex.$create({}, function(){$location.path('empresaRutaList');});       
  };
  
  $scope.cancel = function(){
    $location.path('empresaRutaList');
  };
  
  $scope.reset();
  
  }]);
muukControllers.controller('EmpresaRutaShowCtrl', ['$scope', '$routeParams', 'Ruta', '$location',
  function($scope, $routeParams, Ruta, $location) {    
    $scope.ruta = Ruta.show({exId: $routeParams.id});
    
    $scope.cancel = function(){
      $location.path('empresaRutaList');
    };    
  }]); 
muukControllers.controller('EmpresaRutaEditCtrl', ['$scope', '$routeParams', 'Ruta', '$location',
  function($scope, $routeParams, Ruta, $location) {
  
    $scope.ruta = Ruta.show({exId: $routeParams.id});

    $scope.save = function(ruta) {
      var ex = new Ruta(ruta);   
      console.log(ex);    
      //ex.$save();
      ex.$update({ exId: ruta.id }, function(){$location.path('empresaRutaList');});       
    };
    
    $scope.cancel = function(){
      $location.path('empresaRutaList');
    };
  }]);

// -----------------------------------------------------
/* Empresa - Rutas compartidas */
muukControllers.controller('EmpresaRutasCompartidasCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {  

  }]);

// -----------------------------------------------------
/* Empresa - Comentarios */
muukControllers.controller('EmpresaComentariosCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {  

  }]);

// *****************************************************
/* Usuario  */
// *****************************************************
/* Usuario - Perfil */
muukControllers.controller('UsuarioPerfilCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {  

  }]);

// -----------------------------------------------------
/* Usuario - Consultas */
muukControllers.controller('UsuarioResumenCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {  

  }]);
muukControllers.controller('UsuarioViajesCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {  

  }]);
muukControllers.controller('UsuarioRutasCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {  

  }]);
muukControllers.controller('UsuarioReservacionesCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {  

  }]);
muukControllers.controller('UsuarioCancelacionesCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {  

  }]);
muukControllers.controller('UsuarioFavoritosCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {  

  }]);

// -----------------------------------------------------
/* Usuario - Rutas */
muukControllers.controller('UsuarioBuscarRutasCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {  

  }]);

// -----------------------------------------------------
/* Usuario - Estadisticas */
muukControllers.controller('UsuarioEstadisticasCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {  

  }]);
muukControllers.controller('LoginForgotPassCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {  

  }]);






  
