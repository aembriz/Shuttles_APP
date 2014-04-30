'use strict';

/* Controllers */

var muukControllers = angular.module('muukControllers', []);


muukControllers.controller('AppCtrl', ['$scope', '$location', '$window', 'SessionService',
  function($scope, $location, win, SessionService) { 

    //$scope.user = {authenticated:false};
    //$scope.user = {authenticated: (SessionService.currentUser != null), name: ''};    
    if(SessionService.currentUser != null){
      $scope.user = {authenticated: true, name: SessionService.currentUser.name};    
    } 
    else{
      $scope.user = {authenticated: false, name: ''};    
    }   
    

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
        if ($scope.user.name == 'embarq') {
          $scope.user.type = 0;
        }
        if ($scope.user.name == 'empresa') {
          $scope.user.type = 1;
        }
        if ($scope.user.name == 'usuario') {
          $scope.user.type = 2;
        }

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
muukControllers.controller('LoginRegisterUserCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {  

  }]);

// *****************************************************
/* EmbarQ - Empresa */
// *****************************************************
muukControllers.controller('EmbarQEmpresaListCtrl', ['$scope', '$window', 'Empresa',
  function($scope, $window, Empresa) {
    $scope.empresas = Empresa.query();
    $scope.orderProp = 'nombre';

  $scope.deleteEmpresa = function (exId) {   
    if( $window.confirm("Se eliminará el registro con id [" + exId + "] ¿Continuar?")) {      
      Empresa.remove({ exId: exId },
        function(data){       
          $scope.empresas = Empresa.query();
        }     
      );        
    }
  };  
  $scope.adminEmpresa = function (exId) {   
       
  }; 

  }]); 

muukControllers.controller('EmpresaFormCtrl', ['$scope', 'Empresa', '$location',
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
    ex.$create({}, function(){$location.path('embarqRutas');});       
  };
  
  $scope.cancel = function(){
    $location.path('embarqEmpresas');
  };
  
  $scope.reset();
  
  }]);

muukControllers.controller('EmpresaDetailCtrl', ['$scope', '$routeParams', 'Empresa', '$location',
  function($scope, $routeParams, Empresa, $location) {    
    $scope.empresa = Empresa.show({exId: $routeParams.id});
    
    $scope.cancel = function(){
      $location.path('embarqEmpresas');
    };    
  }]); 

muukControllers.controller('EmpresaUpdateCtrl', ['$scope', '$routeParams', 'Empresa', '$location',
  function($scope, $routeParams, Empresa, $location) {
  
    $scope.empresa = Empresa.show({exId: $routeParams.id});

    $scope.save = function(empresa) {
      var ex = new Empresa(empresa);   
      console.log(ex);    
      //ex.$save();
      ex.$update({ exId: empresa.id }, function(){$location.path('embarqRutas');});       
    };
    
    $scope.cancel = function(){
      $location.path('embarqEmpresas');
    };
  }]);

// *****************************************************
/* EmbarQ - Solicitud de Empresa */
// *****************************************************
muukControllers.controller('EmbarqSolicitudEmpresaShowCtrl', ['$scope', '$routeParams', 'Empresa', '$location',
  function($scope, $routeParams, Empresa, $location) {    
    $scope.empresa = Empresa.show({exId: $routeParams.id});
    
    $scope.cancel = function(){
      $location.path('embarqAltaEmpresa');
    };    
  }]); 

muukControllers.controller('EmbarqSolicitudEmpresaUpdateCtrl', ['$scope', '$routeParams', 'Empresa', '$location',
  function($scope, $routeParams, Empresa, $location) {
  
    $scope.empresa = Empresa.show({exId: $routeParams.id});

    $scope.save = function(empresa) {
      var ex = new Empresa(empresa);   
      console.log(ex);    
      //ex.$save();
      ex.$update({ exId: empresa.id }, function(){$location.path('embarqAltaEmpresa');});       
    };
    
    $scope.cancel = function(){
      $location.path('embarqAltaEmpresa');
    };
  }]);

muukControllers.controller('EmbarQSolicitudEmpresaListCtrl', ['$scope', '$window', 'Empresa',
  function($scope, $window, Empresa) {
    $scope.empresas = Empresa.query();
    $scope.orderProp = 'nombre';

  $scope.rechazarEmpresa = function (exId) {   
    if( $window.confirm("Se rechazará la solicitud con id [" + exId + "], ¿Desea continuar?")) {      
/*      Empresa.remove({ exId: exId },
        function(data){       
          $scope.empresas = Empresa.query();
        }     
      );        */
    }
  };  
  $scope.autorizarEmpresa = function (exId) {   
    if( $window.confirm("Se autorizará la solicitud con id [" + exId + "], ¿Desea continuar?")) {   
    /*   
      Empresa.remove({ exId: exId },
        function(data){       
          $scope.empresas = Empresa.query();
        }     
      );        
*/
    }
  }; 
  $scope.rechazarTodo = function () {   
    if( $window.confirm("Se rechazarán todos las solicitudes, ¿Desea continuar?")) {      
/*      Empresa.remove({ exId: exId },
        function(data){       
          $scope.empresas = Empresa.query();
        }     
      );        */
    }
  };  
  $scope.autorizarTodo = function () {   
    if( $window.confirm("Se autorizarán todos las solicitudes, ¿Desea continuar?")) {   
    /*   
      Empresa.remove({ exId: exId },
        function(data){       
          $scope.empresas = Empresa.query();
        }     
      );        
*/
    }
  }; 

  }]);

// *****************************************************
/* EmbarQ - Ruta */
// *****************************************************
muukControllers.controller('EmbarQRutalistCtrl', ['$scope', '$window', 'Ruta',
  function($scope, $window, Ruta) {
    $scope.rutas = Ruta.query();
    $scope.orderProp = 'nombre';

    $scope.deleteRuta = function (exId) {   
      if( $window.confirm("Se eliminará la ruta con id [" + exId + "], ¿Desea continuar?")) {      
       
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
    ex.$create({}, function(){$location.path('embarqRutas');});       
  };
  
  $scope.cancel = function(){
    $location.path('embarqRutas');
  };
  
  $scope.reset();
  
  }]);

muukControllers.controller('EmbarqRutaDetailCtrl', ['$scope', '$routeParams', 'Ruta', '$location',
  function($scope, $routeParams, Ruta, $location) {    
    $scope.ruta = Ruta.show({exId: $routeParams.id});
    
    $scope.cancel = function(){
      $location.path('embarqRutas');
    };    
  }]); 

muukControllers.controller('EmbarqRutaUpdateCtrl', ['$scope', '$routeParams', 'Ruta', '$location',
  function($scope, $routeParams, Ruta, $location) {
  
    $scope.ruta = Ruta.show({exId: $routeParams.id});

    $scope.save = function(ruta) {
      var ex = new Ruta(ruta);   
      console.log(ex);    
      //ex.$save();
      ex.$update({ exId: ruta.id }, function(){$location.path('embarqRutas');});       
    };
    
    $scope.cancel = function(){
      $location.path('embarqRutas');
    };
  }]);

// *****************************************************
/* EmbarQ - Solicitud de Ruta */
// *****************************************************
muukControllers.controller('EmbarqSolicitudRutaShowCtrl', ['$scope', '$routeParams', 'Ruta', '$location',
  function($scope, $routeParams, Ruta, $location) {    
    $scope.ruta = Ruta.show({exId: $routeParams.id});
    
    $scope.cancel = function(){
      $location.path('embarqAltaRuta');
    };    
  }]); 

muukControllers.controller('EmbarqSolicitudRutaUpdateCtrl', ['$scope', '$routeParams', 'Ruta', '$location',
  function($scope, $routeParams, Ruta, $location) {
  
    $scope.ruta = Ruta.show({exId: $routeParams.id});

    $scope.save = function(ruta) {
      var ex = new Ruta(ruta);   
      console.log(ex);    
      //ex.$save();
      ex.$update({ exId: ruta.id }, function(){$location.path('embarqAltaRuta');});       
    };
    
    $scope.cancel = function(){
      $location.path('embarqAltaRuta');
    };
  }]);

muukControllers.controller('EmbarQSolicitudRutaListCtrl', ['$scope', '$window', 'Ruta',
  function($scope, $window, Ruta) {
    $scope.rutas = Ruta.query();
    $scope.orderProp = 'nombre';

  $scope.rechazarRuta = function (exId) {   
    if( $window.confirm("Se rechazará la ruta con id [" + exId + "], ¿Desea continuar?")) {      
      Ruta.remove({ exId: exId },
        function(data){       
          $scope.rutas = Ruta.query();
        }     
      );        
    }
  };  
  $scope.autorizarRuta = function (exId) {   
    if( $window.confirm("Se autorizará la ruta con id [" + exId + "], ¿Desea continuar?")) {   
    /*   
      Empresa.remove({ exId: exId },
        function(data){       
          $scope.empresas = Empresa.query();
        }     
      );        
*/
    }
  }; 
  $scope.rechazarTodo = function () {   
    if( $window.confirm("Se rechazarán todos las solicitudes, ¿Desea continuar?")) {      
/*      Empresa.remove({ exId: exId },
        function(data){       
          $scope.empresas = Empresa.query();
        }     
      );        */
    }
  };  
  $scope.autorizarTodo = function () {   
    if( $window.confirm("Se autorizarán todos las solicitudes, ¿Desea continuar?")) {   
    /*   
      Empresa.remove({ exId: exId },
        function(data){       
          $scope.empresas = Empresa.query();
        }     
      );        
*/
    }
  };
  }]);

// *****************************************************
/* EmbarQ - Estadisticas */
// *****************************************************
muukControllers.controller('EmbarQEstadisticasCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {  

  }]);



muukControllers.controller('EmbarQAdminEmpresasCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {  

  }]);

// *****************************************************
/* Empresa - Perfil */
// *****************************************************
muukControllers.controller('EmpresaPerfilCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {  

  }]);

// *****************************************************
/* Empresa - Usuarios */
// *****************************************************
muukControllers.controller('EmpresaListaUsuariosCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {  

  }]);

muukControllers.controller('EmpresaAltaUsuariosCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {  

  }]);

// *****************************************************
/* Empresa - Rutas */
// *****************************************************
muukControllers.controller('EmpresaRutasCompartidasCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {  

  }]);

muukControllers.controller('EmpresaAltaRutaCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {  

  }]);

// *****************************************************
/* Empresa - Comentarios */
// *****************************************************
muukControllers.controller('EmpresaComentariosCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {  

  }]);

// *****************************************************
/* Usuario - Perfil */
// *****************************************************
muukControllers.controller('UsuarioPerfilCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {  

  }]);

// *****************************************************
/* Usuario - Consultas */
// *****************************************************
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

// *****************************************************
/* Usuario - Rutas */
// *****************************************************
muukControllers.controller('UsuarioBuscarRutasCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {  

  }]);

// *****************************************************
/* Usuario - Estadisticas */
// *****************************************************
muukControllers.controller('UsuarioEstadisticasCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {  

  }]);

muukControllers.controller('LoginForgotPassCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {  

  }]);






  
