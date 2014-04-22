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
        $location.path('main');        
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

	$scope.menuActive = ["active","",""]
	$scope.menuSelect = function(menu){		
		for (var i = 0; i < $scope.menuActive.length; ++i) {			
			$scope.menuActive[i] = "";
			if(i == menu) $scope.menuActive[i] = "active";			
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


// ***************** EMPRESA ************************************

muukControllers.controller('EmpresaListCtrl', ['$scope', '$window', 'Empresa',
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
    ex.$create({}, function(){$location.path('empresas');});       
  };
  
  $scope.cancel = function(){
    $location.path('empresas');
  };
  
  $scope.reset();
  
  }]);

muukControllers.controller('EmpresaDetailCtrl', ['$scope', '$routeParams', 'Empresa', '$location',
  function($scope, $routeParams, Empresa, $location) {    
    $scope.empresa = Empresa.show({exId: $routeParams.id});
    
    $scope.cancel = function(){
      $location.path('empresas');
    };    
  }]); 

muukControllers.controller('EmpresaUpdateCtrl', ['$scope', '$routeParams', 'Empresa', '$location',
  function($scope, $routeParams, Empresa, $location) {
  
    $scope.empresa = Empresa.show({exId: $routeParams.id});

    $scope.save = function(empresa) {
      var ex = new Empresa(empresa);   
      console.log(ex);    
      //ex.$save();
      ex.$update({ exId: empresa.id }, function(){$location.path('empresas');});       
    };
    
    $scope.cancel = function(){
      $location.path('empresas');
    };
    
  }]);


  
