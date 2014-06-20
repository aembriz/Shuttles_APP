'use strict';

/* Controllers */

var muukControllers = angular.module('muukControllers', []);
var DebugMode = true;

var msgConfirmarCancelarRutaNueva = 'Se cancelará la ruta y se perderán los cambios hechos, ¿Deseas continuar?';
var msgConfirmarBorrarPunto = 'Se borrará el punto seleccionado, ¿Deseas continuar?';

function isValidToken(result, $window) {
  if ((result.data != null)&&(result.data.error != null)&&(result.data.error == "The security token is invalid. [The AuthToken has expired. Log in again please. [ERR0001]]")) {
    return false;
  } else {
    return true;
  }
}
function ForceLogOut($window, $scope, $location, AuthenticationService) {
  $window.alert("La sesión ha terminado. Favor de voler a firmarse." + $scope.user.authtoken);
  AuthenticationService.logout();
  $scope.user.authenticated = false;//AuthenticationService.isLoggedIn();
  console.log('ForceLogOut - goto(Login)');
  $scope.mainSection = 'login';
  $location.path('login');
}

muukControllers.controller('AppCtrl', ['$scope', '$location', '$window', 'SessionService',
  function($scope, $location, $window, SessionService) { 
    console.log('Starting AppCtrl - SessionService');
    console.log(SessionService);

    if(SessionService.currentUser != null){
      $scope.user = {authenticated: true, name: SessionService.currentUser.name, empresa: SessionService.currentUser.empresa, authtoken: SessionService.currentUser.token, role: SessionService.currentUser.role, id: SessionService.currentUser.id};    
      //$scope.mainSection = '';
    } 
    else{
      $scope.user = {authenticated: false, name: ''}; 
      $scope.mainSection = 'login';
    }   

    $scope.updateUser = function(user) {
      $scope.user = user;
    }

    $scope.gotoRegister = function() {
      // this should replace login with register form
      console.log('VAMOS A REGISTRO...');
      $scope.mainSection = 'register';
    };    

    $scope.gotoRegistro = function(exId) {
      // this should replace login with register form
      $scope.mainSection = 'register';
    };    

    $scope.gotoLogin = function() {
      // this should replace login with register form
      console.log('VAMOS A LOGIN...');
      $scope.mainSection = 'login';
      console.log('AppCtrl.gotoLogin - goto(Login)');
      $location.path('login');
    };   
  }]);
muukControllers.controller('LoginController', ['$window', '$scope', '$location', 'AuthenticationService', 'SessionService',
  function ($window, $scope, $location, AuthenticationService, SessionService) {
    $scope.message = "";

    $scope.logincallbackSuccess = function( data ) {             
      if(data.error){
        $scope.message = data.message;
      }
      else{           
        var user = SessionService.currentUser;
        user.authenticated = AuthenticationService.isLoggedIn();
        console.log(user);
        $scope.updateUser(user);
        $scope.$apply();

        if (data.role == 'ADMIN') {
          console.log('LoginController.logincallbackSuccess - goto(embarqEstadisticas)');
          $location.path('embarqEstadisticas');        
        } else if (data.role == 'EMPRESA') {
          console.log('LoginController.logincallbackSuccess - goto(empresaPerfilShow)');
          $location.path('empresaPerfilShow');        
        } else if (data.role == 'USUARIO') {
          console.log('LoginController.logincallbackSuccess - goto(usuarioPerfilShow)');
          $location.path('usuarioPerfilShow');        
        }
        //$location.path('redirect');        
      }      
      $scope.$apply();
    };
    $scope.logincallbackError = function(request, status, error){
      $scope.message = error + '|' + request.responseJSON.message;//request.responseJSON.message;
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

  	$scope.menuActive = ["active","","","","","",""];
    $scope.submenuActive = ["active","","","","","",""];
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
      $scope.user.authenticated = false;//AuthenticationService.isLoggedIn();
      $scope.updateUser($scope.user);
      console.log('MainCtrl.logout - goto(Login)');
      $scope.gotoLogin();
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
muukControllers.controller('LoginForgotPassCtrl', ['$window', '$scope', '$location', 'AuthenticationService',
  function($window, $scope, $location, AuthenticationService) {  

  }]);
muukControllers.controller('LoginRegisterUserCtrl', ['$window', '$scope', '$location', 'AuthenticationService', 'EmpresaPreregister',
  function($window, $scope, $location, AuthenticationService, EmpresaPreregister) {
    $scope.master = {};
    $scope.mainSection = 'register'; 

    $scope.update = function(empresa) {
      $scope.master = angular.copy(empresa);
    };

    $scope.reset = function() {
      $scope.empresa = angular.copy($scope.master);
    };

    $scope.save = function(empresa) { 
      //$scope.gotoLogin;
      //CreateEmpresa($window, $scope, $location, AuthenticationService, empresa, EmpresaPreregister, 'login');
      // validar nombre de empresa
      // validar correo de admin1
      // validar correo de admin2
      
      var ex = new EmpresaPreregister(empresa, function(res) {
          if (res.success) {
            $scope.errMsg = null;
          } else {
            $scope.errMsg = res.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          }
        }, function(err) {
          if (isValidToken(err, $window)) {
            console.log(err);
            $scope.errMsg = err.data.msg;
          } else {
            ForceLogOut($window, $scope, $location, AuthenticationService);
          }
        });   
        console.log(ex); 
        ex.$create({}, function(res){
          if (res.success) {
            $scope.errMsg = null;
            $window.alert('La empresa ' + empresa.nombre + ' fue creada exitosamente. Se le notificará por correo cuando su solicitud sea autorizada.')
            console.log($scope);
            $scope.gotoLogin();
            console.log($scope);
          } else {
            $scope.errMsg = res.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          }
        }, function(err) {
          if (isValidToken(err, $window)) {
            console.log(err);
            $scope.errMsg = err.data.msg;
          } else {
            ForceLogOut($window, $scope, $location, AuthenticationService);
          }
        });    
    };
    
    $scope.cancel = function(){
      $scope.mainSection = 'login';
      console.log('LoginRegisterUserCtrl.cancel - goto(Login)');
      $location.path('login');
    };
    
    $scope.reset();
  
  }]);
muukControllers.controller('LoginConfirmarRegistroCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'UsuarioRegistro', 'UsuarioAutorizar', 
  function($window, $scope, $location, AuthenticationService, $routeParams, UsuarioRegistro, UsuarioAutorizar) {
    $scope.gotoRegistro($routeParams.id);
    UsuarioRegistro.show({exId: $routeParams.id}, 
      function(res){
        if (res.success) {
          $scope.errMsg = null;
          $scope.usuario = res.resultObject;
          console.log($scope.usuario);
          console.log($scope.usuario.EstatusId);
          if ($scope.usuario.EstatusId != 1) {
            $scope.gotoLogin();
          } 
        } else {
          $scope.errMsg = res.msg;
          if (DebugMode) {
            $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
          }
        }
        
      }, function(err) {
        if (isValidToken(err, $window)) {
          console.log(err);
          $scope.usuario = null;
          $scope.errMsg = err.data.msg;
        } else {
          ForceLogOut($window, $scope, $location, AuthenticationService);
        }
      });

    $scope.cancel = function(){
      $scope.gotoLogin();
    };

    $scope.save = function(usuario) {
      var ex = new UsuarioRegistro(usuario, function(res) {
        if (res.success) {
          $scope.errMsg = null;
        } else {
          $scope.errMsg = res.msg;
          if (DebugMode) {
            $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
          }
        }
      }, function(err) {
        if (isValidToken(err, $window)) {
          console.log(err);
          $scope.errMsg = err.data.msg;
        } else {
          ForceLogOut($window, $scope, $location, AuthenticationService);
        }
      });
      console.log(ex);

      ex.$update({ exId: usuario.id },
        function(res) {
          if (res.success) {
            $scope.errMsg = null;
            UsuarioAutorizar.auth({ exId: usuario.id },
              function(data){
                if (data.success) {
                  $scope.errMsg = null;
                  $scope.gotoLogin();  
                } else {
                  $scope.errMsg = res.msg;
                  if (DebugMode) {
                    $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
                  }
                }
              }, function(err) {
                if (isValidToken(err, $window)) {
                  console.log(err);
                  $scope.errMsg = err.data.msg;
                } else {
                  ForceLogOut($window, $scope, $location, AuthenticationService);
                }
              }
            );             
          } else {
            $scope.errMsg = res.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          }
        }, function(err) {
          if (isValidToken(err, $window)) {
            console.log(err);
            $scope.errMsg = err.data.msg;
          } else {
            ForceLogOut($window, $scope, $location, AuthenticationService);
          }
      });       
    };
    
  }]);

// *****************************************************
/* EmbarQ  */
// *****************************************************
/* EmbarQ - Empresa */
function LoadEmpresasAutorizadas($window, $scope, $location, AuthenticationService, EmpresasAutorizadas) {
  EmpresasAutorizadas.query({}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      $scope.empresas = res.resultObject;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  }); 
}
function LoadEmpresasNuevas($window, $scope, $location, AuthenticationService, EmpresasNuevas) {
  EmpresasNuevas.query({}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      $scope.empresas = res.resultObject;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  }); 
}
function LoadEmpresasXCompartir($window, $scope, $location, AuthenticationService, EmpresasXCompartir, rutaid) {
  EmpresasXCompartir.query({exId: rutaid}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      $scope.empresas = res.resultObject;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  }); 
}
function CreateEmpresa($window, $scope, $location, AuthenticationService, empresa, EmpresaPreregister, locationTo) {
  var ex = new EmpresaPreregister(empresa, function(res) {
    if (res.success) {
      $scope.errMsg = null;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  });   
  console.log(ex); 
  ex.$create({}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      console.log('CreateEmpresa - goto(' + locationTo + ')');
      $location.path(locationTo);
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  });
}
function ShowEmpresa($window, $scope, $location, AuthenticationService, empresaid, Empresa) {
    $scope.empresa = null;
    Empresa.show({exId: empresaid}, function(res) {
      if (res.success) {
        $scope.errMsg = null;
        $scope.empresa = res.resultObject;
      } else {
        $scope.errMsg = res.msg;
        if (DebugMode) {
          $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
        }
      }

    }, function(err) {
      if (isValidToken(err, $window)) {
        console.log(err);
        $scope.errMsg = err.data.msg;
      } else {
        ForceLogOut($window, $scope, $location, AuthenticationService);
      }
    });
}
function UpdateEmpresa($window, $scope, $location, AuthenticationService, empresa, Empresa, locationTo) {
  var ex = new Empresa(empresa, function(res) {
    if (res.success) {
      $scope.errMsg = null;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  });   

  console.log(ex);    
  ex.$update({ exId: empresa.id }, function(res) {
    if (res.success) {
      $scope.errMsg = null;
      console.log('UpdateEmpresa - goto(' + locationTo + ')');
      $location.path(locationTo);
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  });       
}
function LoadEmpresa($window, $scope, $location, AuthenticationService, Empresa, empresaid, successCallback) {
  Empresa.query({exId: empresaid}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      $scope.empresa = res.resultObject;
      successCallback(res.resultObject);
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    console.log(err);
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  }); 
}
muukControllers.controller('EmbarqEmpresaListCtrl', ['$window', '$scope', '$location', 'AuthenticationService', 'Empresa', 'EmpresasAutorizadas',
  function($window, $scope, $location, AuthenticationService, Empresa, EmpresasAutorizadas) {
    LoadEmpresasAutorizadas($window, $scope, $location, AuthenticationService, EmpresasAutorizadas);
    $scope.orderProp = 'nombre';

    $scope.deleteEmpresa = function (exId) {   
      if( $window.confirm("Se eliminará el registro con id [" + exId + "] ¿Continuar?")) {      
        Empresa.remove({ exId: exId },
          function(res){  
            if (res.success) {   
              $scope.errMsg = null;
              $scope.sucMsg = res.msg;  
              LoadEmpresasAutorizadas($window, $scope, $location, AuthenticationService, EmpresasAutorizadas);
            } else {
              $scope.errMsg = res.msg;
              $scope.sucMsg = null;  
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }
          }, function(err) {
            if (isValidToken(err, $window)) {
              console.log(err);
              $scope.empresas = null;
              $scope.errMsg = err.data.msg;
              $scope.sucMsg = null;  
            } else {
              ForceLogOut($window, $scope, $location, AuthenticationService);
            }
          }
        );
      }
    };  
    $scope.adminEmpresa = function (exId) {   
         
    };  

  }]); 
muukControllers.controller('EmbarqEmpresaPreregisterFormCtrl', ['$window', '$scope', '$location', 'AuthenticationService', 'EmpresaPreregister',
  function($window, $scope, $location, AuthenticationService, EmpresaPreregister) {
    $scope.master = {};

    $scope.update = function(empresa) {
      $scope.master = angular.copy(empresa);
    };

    $scope.reset = function() {
      $scope.empresa = angular.copy($scope.master);
    };

    $scope.save = function(empresa) {
      CreateEmpresa($window, $scope, $location, AuthenticationService, empresa, EmpresaPreregister, 'embarqEmpresaList');
    };
    
    $scope.cancel = function(){
      console.log('EmbarqEmpresaPreregisterFormCtrl.cancel - goto(embarqEmpresaList)');
      $location.path('embarqEmpresaList');
    };
    
    $scope.reset();
  
  }]);
muukControllers.controller('EmbarqEmpresaFormCtrl', ['$window', '$scope', '$location', 'AuthenticationService', 'EmpresaPreregister',
  function($window, $scope, $location, AuthenticationService, EmpresaPreregister) {
    $scope.master = {};

    $scope.update = function(empresa) {
      $scope.master = angular.copy(empresa);
    };

    $scope.reset = function() {
      $scope.empresa = angular.copy($scope.master);
    };

    $scope.save = function(empresa) {
      CreateEmpresa($window, $scope, $location, AuthenticationService, empresa, EmpresaPreregister, 'embarqEmpresaList');   
    };    
    
    $scope.cancel = function(){
      console.log('EmbarqEmpresaFormCtrl.cancel - goto(embarqEmpresaList)');
      $location.path('embarqEmpresaList');
    };
    
    $scope.reset();

  }]);
muukControllers.controller('EmbarqEmpresaDetailCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Empresa', 
  function($window, $scope, $location, AuthenticationService, $routeParams, Empresa) {    
    ShowEmpresa($window, $scope, $location, AuthenticationService, $routeParams.id, Empresa);
    
    $scope.cancel = function(){
      console.log('EmbarqEmpresaDetailCtrl.cancel - goto(embarqEmpresaList)');
      $location.path('embarqEmpresaList');
    };    
  }]); 
muukControllers.controller('EmbarqEmpresaUpdateCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Empresa', 
  function($window, $scope, $location, AuthenticationService, $routeParams, Empresa) {
    ShowEmpresa($window, $scope, $location, AuthenticationService, $routeParams.id, Empresa);

    $scope.save = function(empresa) {
      UpdateEmpresa($window, $scope, $location, AuthenticationService, empresa, Empresa, 'embarqEmpresaList');
    };
    
    $scope.cancel = function(){
      console.log('EmbarqEmpresaUpdateCtrl.cancel - goto(embarqEmpresaList)');
      $location.path('embarqEmpresaList');
    };
  }]);

// -----------------------------------------------------
/* EmbarQ - Solicitud de Empresa */
muukControllers.controller('EmbarqSolicitudEmpresaShowCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Empresa', 
  function($window, $scope, $location, AuthenticationService, $routeParams, Empresa) {    
    ShowEmpresa($window, $scope, $location, AuthenticationService, $routeParams.id, Empresa);
    
    $scope.cancel = function(){
      console.log('EmbarqSolicitudEmpresaShowCtrl.cancel - goto(embarqSolicitudEmpresaList)');
      $location.path('embarqSolicitudEmpresaList');
    };    
  }]); 
muukControllers.controller('EmbarqSolicitudEmpresaUpdateCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Empresa', 
  function($window, $scope, $location, AuthenticationService, $routeParams, Empresa) {
    ShowEmpresa($window, $scope, $location, AuthenticationService, $routeParams.id, Empresa);

    $scope.save = function(empresa) {
      UpdateEmpresa($window, $scope, $location, AuthenticationService, empresa, Empresa, 'embarqSolicitudEmpresaList');
    };
    
    $scope.cancel = function(){
      console.log('EmbarqSolicitudEmpresaUpdateCtrl.cancel - goto(embarqSolicitudEmpresaList)');
      $location.path('embarqSolicitudEmpresaList');
    };
  }]);
muukControllers.controller('EmbarqSolicitudEmpresaListCtrl', ['$window', '$scope', '$location', 'AuthenticationService', 'EmpresasNuevas', 'EmpresaAutorizar', 'EmpresaRechazar',
  function($window, $scope, $location, AuthenticationService, EmpresasNuevas, EmpresaAutorizar, EmpresaRechazar) {
    LoadEmpresasNuevas($window, $scope, $location, AuthenticationService, EmpresasNuevas);
    $scope.orderProp = 'nombre';

  $scope.rechazarEmpresa = function (exId) {   
    if( $window.confirm("Se rechazará la solicitud con id [" + exId + "], ¿Desea continuar?")) {      
      EmpresaRechazar.reject({ exId: exId },
        function(res){       
          if (res.success) {
            $scope.errMsg = null;
            $scope.sucMsg = 'La empresa con id [' + exId + '] fue rechazada exitosamente';
            console.log(res);
            LoadEmpresasNuevas($window, $scope, $location, AuthenticationService, EmpresasNuevas);
          } else {
            $scope.errMsg = res.msg;
            $scope.sucMsg = null;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          }          
        }, function(err) {
          if (isValidToken(err, $window)) {
            console.log(err);
            $scope.errMsg = err.data.msg;
            $scope.sucMsg = null;  
          } else {
            ForceLogOut($window, $scope, $location, AuthenticationService);
          }
        }
      );
    }
  };
  $scope.autorizarEmpresa = function (exId) {
    if( $window.confirm("Se autorizará la solicitud con id [" + exId + "], ¿Desea continuar?")) {
      EmpresaAutorizar.auth({ exId: exId },
        function(res){       
          if (res.success) {
            $scope.errMsg = null;
            console.log(res);
            $scope.sucMsg = 'La empresa con id [' + exId + '] fue aceptada exitosamente';
            LoadEmpresasNuevas($window, $scope, $location, AuthenticationService, EmpresasNuevas);
          } else {
            $scope.errMsg = res.msg;
            $scope.sucMsg = null;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          }          
        }, function(err) {
          if (isValidToken(err, $window)) {
            console.log(err);
            $scope.errMsg = err.data.msg;
            $scope.sucMsg = null;  
          } else {
            ForceLogOut($window, $scope, $location, AuthenticationService);
          }
        }
      );
    }
  };      

  }]);
// -----------------------------------------------------
/* EmbarQ - Usuarios */
function LoadUsuariosAutorizados($window, $scope, $location, AuthenticationService, UsuariosAutorizados) {
  UsuariosAutorizados.query({}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      $scope.usuarios = res.resultObject;
      for (var index in $scope.usuarios) {
        console.log($scope.usuarios[index]);
        if ($scope.usuarios[index].empresa == null) {
          //var myEmpresa = {nombre: 'EMBARQ México'};
          $scope.usuarios[index].empresanombre = 'EMBARQ México';
        } else {
          $scope.usuarios[index].empresanombre = $scope.usuarios[index].empresa.nombre;
        }
      }     
      //console.log($scope.usuarios);
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  }); 
}
function LoadUsuariosNuevos($window, $scope, $location, AuthenticationService, UsuariosNuevos) {
  UsuariosNuevos.query({}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      $scope.usuarios = res.resultObject;
      for (var index in $scope.usuarios) {
        console.log($scope.usuarios[index]);
        if ($scope.usuarios[index].empresa == null) {
          //var myEmpresa = {nombre: 'EMBARQ México'};
          $scope.usuarios[index].empresanombre = 'EMBARQ México';
        } else {
          $scope.usuarios[index].empresanombre = $scope.usuarios[index].empresa.nombre;
        }
      }  
      //console.log($scope.usuarios);
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  }); 
}
function LoadUsuariosAutorizadosXEmpresa($window, $scope, $location, AuthenticationService, UsuariosAutorizadosXEmpresa) {
  UsuariosAutorizadosXEmpresa.query({}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      $scope.usuarios = res.resultObject;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  }); 
}
function LoadUsuariosNuevosXEmpresa($window, $scope, $location, AuthenticationService, UsuariosNuevosXEmpresa) {
  UsuariosNuevosXEmpresa.query({}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      $scope.usuarios = res.resultObject;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  }); 
}
function LoadUsuario($window, $scope, $location, AuthenticationService, usuarioid, Usuario) {
  Usuario.show({exId: usuarioid}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      res.resultObject.passwordCoded = '';
      for (var i = 0; i < res.resultObject.password.length; i++) {
        res.resultObject.passwordCoded = res.resultObject.passwordCoded + '●';
      }      
      $scope.usuario = res.resultObject;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  });  
}
function LoadUsuariosPermanentes($window, $scope, $location, AuthenticationService, empresaid, rutaid, corridaid, UsuariosPermanentes) {
  UsuariosPermanentes.query({empresa: empresaid, ruta: rutaid, corrida: corridaid}, function(res){
    if (res.success) {
      $scope.errMsg = null;    
      console.log(res);
      $scope.usuarios = res.resultObject;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  });  
}

function CreateUsuarioPreregister($window, $scope, $location, AuthenticationService, usuario, UsuarioPreregister, locationTo) {
  var ex = new UsuarioPreregister(usuario, function(res) {
    if (res.success) {
      $scope.errMsg = null;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  });   
  console.log(ex); 
  ex.$create({}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      if (locationTo != '') {
        console.log('CreateUsuarioPreregister - goto(' + locationTo + ')');
        $location.path(locationTo);
      }
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  });
}
function UpdateUsuario($window, $scope, $location, AuthenticationService, usuario, Usuario, locationTo) {
  var ex = new Usuario(usuario, function(res) {
    if (res.success) {
      $scope.errMsg = null;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  });   

  console.log(ex);    
  ex.$update({ exId: usuario.id }, function(res) {
    if (res.success) {
      $scope.errMsg = null;
      console.log('UpdateUsuario - goto(' + locationTo + ')');
      $location.path(locationTo);
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  });       
}
muukControllers.controller('EmbarqUsuarioListCtrl', ['$window', '$scope', '$location', 'AuthenticationService', 'Usuario', 'UsuariosAutorizados',
  function($window, $scope, $location, AuthenticationService, Usuario, UsuariosAutorizados) {
    LoadUsuariosAutorizados($window, $scope, $location, AuthenticationService, UsuariosAutorizados);
    $scope.orderProp = 'nombre';

    $scope.deleteUsuario = function (exId) {
      if( $window.confirm("Se eliminará el usuario con id [" + exId + "] ¿Continuar?")) {
        Usuario.remove({ exId: exId },
          function(res){
            if (res.success) {
              $scope.errMsg = null;
              LoadUsuariosAutorizados($window, $scope, $location, AuthenticationService, UsuariosAutorizados);
            } else {
              $scope.errMsg = res.msg;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }  
          }, function(err) {
            if (isValidToken(err, $window)) {
              console.log(err);
              $scope.errMsg = err.data.msg;
              $scope.sucMsg = null;  
            } else {
              ForceLogOut($window, $scope, $location, AuthenticationService);
            }
          }
        ); 
      }
    };

  }]);
muukControllers.controller('EmbarqUsuarioFormCtrl', ['$window', '$scope', '$location', 'AuthenticationService', 'UsuarioPreregister', 
  function($window, $scope, $location, AuthenticationService, UsuarioPreregister) {
    $scope.master = {};

    $scope.update = function(usuario) {
      $scope.master = angular.copy(usuario);
    };

    $scope.reset = function() {
      $scope.usuario = angular.copy($scope.master);
    };

    $scope.save = function(usuario) {
      CreateUsuarioPreregister($window, $scope, $location, AuthenticationService, usuario, UsuarioPreregister, 'embarqUsuarioList');
    };

    $scope.cancel = function(){
      console.log('EmbarqUsuarioFormCtrl.cancel - goto(embarqUsuarioList)');
      $location.path('embarqUsuarioList');
    };

    $scope.reset();

  }]);
muukControllers.controller('EmbarqUsuarioShowCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Usuario', 
  function($window, $scope, $location, AuthenticationService, $routeParams, Usuario) {
    LoadUsuario($window, $scope, $location, AuthenticationService, $routeParams.id, Usuario);
    
    $scope.cancel = function(){
      console.log('EmbarqUsuarioShowCtrl.cancel - goto(embarqUsuarioList)');
      $location.path('embarqUsuarioList');
    };
  }]);
muukControllers.controller('EmbarqUsuarioEditCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Usuario', 
  function($window, $scope, $location, AuthenticationService, $routeParams, Usuario) {
    LoadUsuario($window, $scope, $location, AuthenticationService, $routeParams.id, Usuario);

    $scope.save = function(usuario) {
      UpdateUsuario($window, $scope, $location, AuthenticationService, usuario, Usuario, 'embarqUsuarioList');      
    };
    
    $scope.cancel = function(){
      console.log('EmbarqUsuarioEditCtrl.cancel - goto(embarqUsuarioList)');
      $location.path('embarqUsuarioList');
    };
  }]);

muukControllers.controller('EmbarqMultiUsuarioNewCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'UsuarioPreregister', 'SessionService', 'Empresa',
  function($window, $scope, $location, AuthenticationService, $routeParams, UsuarioPreregister, SessionService, Empresa) {
    var EmpresaSelected = $routeParams.id;
    LoadEmpresa($window, $scope, $location, AuthenticationService, Empresa, EmpresaSelected, function(res){});
    $scope.master = "";

    $scope.update = function(usuarios) {
      $scope.master = angular.copy(usuarios);
    };

    $scope.reset = function() {
      $scope.usuarios = angular.copy($scope.master);
    };

    $scope.save = function(usuarios) {
      var message = "";      
      var created = 0;
      var userList = usuarios.split("\n");
      for (var index in userList) {
        var UserObj = userList[index].split(",");
        if (UserObj.length >= 2) {
          // get name
          var name = UserObj[0]; 
          // get mail removing empty spaces
          var mail = UserObj[1].replace(" ", ""); 
          // validate mail
          if (validateEmail(mail) == false) {
            // add wrong call to the message response
            message = name + ", " + mail + "\n";
          } else {
            // add user
            console.log('Creando usuario de empresa ' + $scope.empresa.nombre)
            var usuario = {nombre: name, email: mail, password: "", EmpresaId: $scope.empresa.id};
            CreateUsuarioPreregister($window, $scope, $location, AuthenticationService, usuario, UsuarioPreregister, ''); 
            created = created + 1;
          }
        } else {
          // add wrong call to the message response
          message = userList[index] + "\n";
        }
      }  // end for
      
      if (message == "") {
        console.log('VAMOS a empresaUsuarioList');
        $window.alert("Se invitaron a " + created.toString() + "/" + userList.length + " usuarios." );
        console.log('EmbarqMultiUsuarioNewCtrl.save - goto(embarqEmpresaList)');
        $location.path('embarqEmpresaList');
        return true;
      } else {
        $scope.usuarios = message;
        $window.alert("Se invitaron a " + created.toString() + "/" + userList.length + " usuarios. Favor de verificar los datos de usuarios sobrantes." );
        /*console.log('EmbarqMultiUsuarioNewCtrl.save - goto(embarqMultiUsuarioNew/' + EmpresaSelected + ')');
        $location.path('embarqMultiUsuarioNew/' + EmpresaSelected);*/
      }

    };

    $scope.cancel = function(){
      console.log('EmbarqMultiUsuarioNewCtrl.cancel - goto(embarqEmpresaList)');
      $location.path('embarqEmpresaList');
    };

    $scope.reset();
    
    function validateEmail(email) { 
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    }

  }]);
muukControllers.controller('EmbarqUsuarioPermanenteListCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'UsuariosPermanentes', 
  function($window, $scope, $location, AuthenticationService, $routeParams, UsuariosPermanentes) {
    LoadUsuariosPermanentes($window, $scope, $location, AuthenticationService, null, null, null, UsuariosPermanentes);

  }]);

// -----------------------------------------------------
/* EmbarQ - Solicitud de usuarios */
muukControllers.controller('EmbarqSolicitudUsuarioListCtrl', ['$window', '$scope', '$location', 'AuthenticationService', 'Usuario', 'UsuariosNuevos',
  function($window, $scope, $location, AuthenticationService, Usuario, UsuariosNuevos) {
    LoadUsuariosNuevos($window, $scope, $location, AuthenticationService, UsuariosNuevos);
    $scope.orderProp = 'nombre';

    $scope.deleteUsuario = function (exId) {
      if( $window.confirm("Se eliminará el usuario con id [" + exId + "] ¿Continuar?")) {
        Usuario.remove({ exId: exId },
          function(res){
            if (res.success) {
              $scope.errMsg = null;
              LoadUsuariosNuevos($window, $scope, $location, AuthenticationService, UsuariosNuevos);
            } else {
              $scope.errMsg = res.msg;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }  
          }, function(err) {
            if (isValidToken(err, $window)) {
              console.log(err);
              $scope.errMsg = err.data.msg;
              $scope.sucMsg = null;  
            } else {
              ForceLogOut($window, $scope, $location, AuthenticationService);
            }
          }
        );
      }
    };  

  }]);
muukControllers.controller('EmbarqSolicitudUsuarioShowCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Usuario',
  function($window, $scope, $location, AuthenticationService, $routeParams, Usuario) {    
    LoadUsuario($window, $scope, $location, AuthenticationService, $routeParams.id, Usuario);
    
    $scope.cancel = function(){
      console.log('EmbarqSolicitudUsuarioShowCtrl.cancel - goto(embarqSolicitudUsuarioList)');
      $location.path('embarqSolicitudUsuarioList');
    };
  }]);
muukControllers.controller('EmbarqSolicitudUsuarioEditCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Usuario',
  function($window, $scope, $location, AuthenticationService, $routeParams, Usuario) {
    LoadUsuario($window, $scope, $location, AuthenticationService, $routeParams.id, Usuario);

    $scope.save = function(usuario) {
      UpdateUsuario($window, $scope, $location, AuthenticationService, usuario, Usuario, 'embarqSolicitudUsuarioList'); 
    };

    $scope.cancel = function(){
      console.log('EmbarqSolicitudUsuarioEditCtrl.cancel - goto(embarqSolicitudUsuarioList)');
      $location.path('embarqSolicitudUsuarioList');
    };
  }]);

// -----------------------------------------------------
/* EmbarQ - Ruta */
function LoadRutasAutorizadas($window, $scope, $location, AuthenticationService, RutasAutorizadas) {
  RutasAutorizadas.query({}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      $scope.rutas = res.resultObject;
      console.log(res);
      for (var index in $scope.rutas) {
        $scope.rutas[index].companyownernombre = $scope.rutas[index].companyowner.nombre;
      }
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  }); 
}
function LoadRutasCompartidas($window, $scope, $location, AuthenticationService, RutaCompartidaList) {
  RutaCompartidaList.query({}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      $scope.sucMsg = null;
      $scope.rutas = res.resultObject;
      console.log(res);
      for (var index in $scope.rutas) {
        $scope.rutas[index].empresanombre = $scope.rutas[index].empresa.nombre;
        $scope.rutas[index].empresaClientenombre = $scope.rutas[index].empresaCliente.nombre;
        $scope.rutas[index].rutumnombre = $scope.rutas[index].rutum.nombre;
        $scope.rutas[index].rutumorigentxt = $scope.rutas[index].rutum.origentxt;
        $scope.rutas[index].rutumdestinotxt = $scope.rutas[index].rutum.destinotxt;
      }      
    } else {
      $scope.errMsg = res.msg;
      $scope.sucMsg = null;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  }); 
}
function LoadRutasNuevas($window, $scope, $location, AuthenticationService, RutasNuevas) {
  RutasNuevas.query({}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      $scope.rutas = res.resultObject;
      console.log(res);
      for (var index in $scope.rutas) {
        $scope.rutas[index].companyownernombre = $scope.rutas[index].companyowner.nombre;
      }      
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  }); 
}
function LoadRuta($window, $scope, $location, AuthenticationService, rutaid, Ruta) {
  Ruta.show({exId: rutaid}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      $scope.ruta = res.resultObject;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  }); 
}
function CreateRuta($window, $scope, $location, AuthenticationService, ruta, Ruta, locationTo) {
  var ex = new Ruta(ruta, function(res) {
    if (res.success) {
      $scope.errMsg = null;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  });   
  console.log(ex); 
  ex.$create({}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      console.log('CreateRuta - goto(' + locationTo + ')');
      $location.path(locationTo);
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  });
}
function UpdateRuta($window, $scope, $location, AuthenticationService, ruta, Ruta, locationTo) {
  var ex = new Ruta(ruta, function(res) {
    if (res.success) {
      $scope.errMsg = null;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  });   

  console.log(ex);    
  ex.$update({ exId: ruta.id }, function(res) {
    if (res.success) {
      $scope.errMsg = null;
      console.log('UpdateRuta - goto(' + locationTo + ')');
      $location.path(locationTo);
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  });       
}
function LoadRutaUsuariosXRuta($window, $scope, $location, AuthenticationService, rutaid, RutaUsuariosXRuta) {
  RutaUsuariosXRuta.query({ruta: rutaid}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      $scope.usuarios = res.resultObject;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  }); 
}
function LoadRutaUsuariosXCorrida($window, $scope, $location, AuthenticationService, rutaid, corridaid, RutaUsuariosXCorrida) {
  RutaUsuariosXCorrida.query({rutaid: rutaid, corridaid: corridaid}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      $scope.usuarios = res.resultObject;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  }); 
}
muukControllers.controller('EmbarqRutaListCtrl', ['$window', '$scope', '$location', 'AuthenticationService', 'Ruta', 'RutasAutorizadas', 'RutaCompartir', 'EmpresasAutorizadas', 'EmpresasXCompartir',
  function($window, $scope, $location, AuthenticationService, Ruta, RutasAutorizadas, RutaCompartir, EmpresasAutorizadas, EmpresasXCompartir) {
    LoadRutasAutorizadas($window, $scope, $location, AuthenticationService, RutasAutorizadas);
    $scope.orderProp = 'nombre';
    $scope.RutaSelected = null;

    $scope.deleteRuta = function (exId) {
      if( $window.confirm("Se eliminará la ruta con id [" + exId + "], ¿Desea continuar?")) {
        Ruta.remove({ exId: exId },
          function(res){
            if (res.success) {
              $scope.errMsg = null;
              $scope.sucMsg = "La ruta con id [" + exId + "] se removió exitosamente";
              LoadRutasAutorizadas($window, $scope, $location, AuthenticationService, RutasAutorizadas);
            } else {
              $scope.errMsg = res.msg;
              $scope.sucMsg = null;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }  
          }, function(err) {
            if (isValidToken(err, $window)) {
              console.log(err);
              $scope.errMsg = err.data.msg;
              $scope.sucMsg = null;  
            } else {
              ForceLogOut($window, $scope, $location, AuthenticationService);
            }
          }
        );
      }
    };
    $scope.showCompartirRuta = function (ruta) {
      $scope.RutaSelected = ruta;
      LoadEmpresasXCompartir($window, $scope, $location, AuthenticationService, EmpresasXCompartir, ruta.id);
      $('#compartirModal').modal({
        show: true
      });
    };

    $scope.compartirRuta = function (ruta, empresa) {   
      console.log('Compartiendo...');
      console.log(ruta);
      console.log(empresa);

      RutaCompartir.query({rutaid: ruta.id, empresaid: empresa.id}, 
        function(res){
          if (res.success) {
            $scope.errMsg = null;
            $scope.sucMsg = res.msg;
            console.log(res);
            LoadEmpresasXCompartir($window, $scope, $location, AuthenticationService, EmpresasXCompartir, ruta.id);
          } else {
            $scope.errMsg = res.msg;
            $scope.sucMsg = null;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          }          
        }, function(err) {
          if (isValidToken(err, $window)) {
            console.log(err);
            $scope.errMsg = err.data.msg;
            $scope.sucMsg = null;  
          } else {
            ForceLogOut($window, $scope, $location, AuthenticationService);
          }
        }       
      );
    };  

  }]);
muukControllers.controller('EmbarqRutaFormCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Ruta', 'SessionService', 'Mapa', 'Empresa',
  function($window, $scope, $location, AuthenticationService, $routeParams, Ruta, SessionService, Mapa, Empresa) {
    var EmpresaSelected = $routeParams.id;
    LoadEmpresa($window, $scope, $location, AuthenticationService, Empresa, EmpresaSelected, function(res){
      $scope.reset();
    });

    $scope.master = {};
    //$scope.user.empresa = $routeParams.id;//SessionService.currentUser.empresa;
    $scope.step = 1;
    $scope.selectedMarker = null;
    $scope.selectedMarkerIndex = -1;

    $scope.update = function(ruta) {
      $scope.master = angular.copy(ruta);
    };

    $scope.reset = function() {
      console.log('reseting...' + EmpresaSelected);
      $scope.ruta = angular.copy($scope.master);
      $scope.ruta.CompanyownerID = EmpresaSelected;// SessionService.currentUser.empresa;
      $scope.ruta.diasofertafuturo = 7; // TODO: aceptar cambio de dias futuros
    };

    $scope.saveRuta = function(ruta) {
      var ex = new Ruta(ruta);
      console.log('New ruta result:');
      console.log(ex);
      ex.$create({}, function(result){
        console.log(result);      
        if (result.success) {
          $scope.errMsg = null;
          $scope.step = 2;
          console.log('Create ruta result:');
          console.log(result);
          idm = result.resultObject.id;
          creapuntos();
        } else {
          $scope.errMsg = res.msg;
          if (DebugMode) {
            $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
          }
        }    
      }, function(err) {
        if (isValidToken(err, $window)) {
          console.log(err);
          $scope.errMsg = err.data.msg;
          $scope.sucMsg = null;  
        } else {
          ForceLogOut($window, $scope, $location, AuthenticationService);
        }
      });

      /*      
      var ex = new Ruta(ruta);
      console.log(ex);
      ex.$create({}, function(){
        var lista = Ruta.query();
        lista.$promise.then(function(result){
          for (var i = 0; i < result.resultObject.length; i++) {
            if(result.resultObject[i].nombre == ruta.nombre ){
              console.log("ya cargo RutaId---< " + result.resultObject[i].id);
              $scope.step = 2;
              idm = result.resultObject[i].id;
              creapuntos();
            }
          }
        });
      });*/
    }; 

    $scope.savePunto = function(selectedMarker) {
      //$scope.selectedMarker = selectedMarker;
      console.log('saving selected punto ' + $scope.selectedMarkerIndex);
      saveSelectedPunto();      
    };

    $scope.deletePunto = function() {
      if ($window.confirm(msgConfirmarBorrarPunto)) {
        console.log('deleting selected punto ' + $scope.selectedMarkerIndex);
        deleteSelectedPunto();
      }
    };
      
    $scope.savePuntos = function() {
      console.log('vamos a salvar puntos');
      saveRutaPuntos();
    };

    $scope.saveMapa = function(mapa) {
      console.log('$scope.saveMapa');        
      console.log(mapa);        
      if($scope.user.role == 'EMPRESA'){
        SaveMapa($window, $scope, $location, AuthenticationService, mapa, Mapa, 'embarqEmpresaList'); 
      }else if($scope.user.role == 'ADMIN'){
        SaveMapa($window, $scope, $location, AuthenticationService, mapa, Mapa, 'embarqEmpresaList'); 
      }       
    }; 

    $scope.cancel = function(){
      if ($window.confirm(msgConfirmarCancelarRutaNueva)) {
        console.log('EmbarqRutaFormCtrl.cancel - goto(embarqEmpresaList)');
        $location.path('embarqEmpresaList');
      }
    };

    //$scope.reset();
  }]);  
muukControllers.controller('EmbarqRutaDetailCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Ruta', 
  function($window, $scope, $location, AuthenticationService, $routeParams, Ruta) {
    LoadRuta($window, $scope, $location, AuthenticationService, $routeParams.id, Ruta);

    $scope.cancel = function(){
      console.log('EmbarqRutaDetailCtrl.cancel - goto(embarqRutaList)');
      $location.path('embarqRutaList');
    };
  }]);
// TODO EmbarqRutaUpdateCtrl
muukControllers.controller('EmbarqRutaUpdateCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Ruta', 
  function($window, $scope, $location, AuthenticationService, $routeParams, Ruta) {
    LoadRuta($window, $scope, $location, AuthenticationService, $routeParams.id, Ruta);

    $scope.save = function(ruta) {
      UpdateRuta($window, $scope, $location, AuthenticationService, ruta, Ruta, 'embarqRutaList');
    };

    $scope.cancel = function(){
      console.log('EmbarqRutaUpdateCtrl.cancel - goto(embarqRutaList)');
      $location.path('embarqRutaList');
    };
  }]);
muukControllers.controller('EmbarqRutaUsuariosListCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Usuario', 'RutaUsuariosXRuta',
  function($window, $scope, $location, AuthenticationService, $routeParams, Usuario, RutaUsuariosXRuta) {
    console.log($routeParams);
    $scope.rutaid = $routeParams.id;
    LoadRutaUsuariosXRuta($window, $scope, $location, AuthenticationService, $scope.rutaid, RutaUsuariosXRuta);
    $scope.orderProp = 'nombre';

    $scope.deleteUsuario = function (exId) {
      if( $window.confirm("Se eliminará el usuario con id [" + exId + "] ¿Continuar?")) {
        
      }
    };

    $scope.cancel = function(){
      console.log('EmbarqRutaUsuariosListCtrl.cancel - goto(embarqRutaList)');
      $location.path('embarqRutaList');
    };    

  }]);
// -----------------------------------------------------
/* EmbarQ - Ruta */
muukControllers.controller('EmbarqRutaCompartidaListCtrl', ['$window', '$scope', '$location', 'AuthenticationService', 'RutaCompartida', 'RutaCompartidaList',
  function($window, $scope, $location, AuthenticationService, RutaCompartida, RutaCompartidaList) {
    LoadRutasCompartidas($window, $scope, $location, AuthenticationService, RutaCompartidaList);
    $scope.orderProp = 'nombre';

    $scope.deleteRutaCompartida = function (exId) {
      if( $window.confirm("Se eliminará la ruta compartida con id [" + exId + "], ¿Desea continuar?")) {
        RutaCompartida.remove({ exId: exId },
          function(res){
            if (res.success) {
              $scope.errMsg = null;
              $scope.sucMsg = "Se eliminará la ruta compartida con id [" + exId + "], ¿Desea continuar?";
              LoadRutasCompartidas($window, $scope, $location, AuthenticationService, RutaCompartidaList);
            } else {
              $scope.errMsg = res.msg;
              $scope.sucMsg = null;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }  
          }, function(err) {
            if (isValidToken(err, $window)) {
              console.log(err);
              $scope.errMsg = err.data.msg;
              $scope.sucMsg = null;  
            } else {
              ForceLogOut($window, $scope, $location, AuthenticationService);
            }
          }
        );        
      }
    };

  }]);
  // -----------------------------------------------------
/* EmbarQ - Corrida */
function LoadCorridasXRuta($window, $scope, $location, AuthenticationService, CorridaXRuta, rutaid) {
  CorridaXRuta.query({rutaid: rutaid}, function(res){
    if (res.success) {
      console.log(res);
      $scope.errMsg = null;
      $scope.corridas = res.resultObject;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  }); 
}
function LoadCorrida($window, $scope, $location, AuthenticationService, Corrida, rutaid) {
  Corrida.show({exId: rutaid}, function(res){
    console.log(res);
    if (res.success) {
      $scope.errMsg = null;
      console.log(res);
      $scope.corrida = res.resultObject;
      $scope.rutaid = res.resultObject.RutaId;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  }); 
}
function UpdateRuta($window, $scope, $location, AuthenticationService, ruta, Ruta, locationTo) {
  var ex = new Ruta(ruta, function(res) {
    if (res.success) {
      $scope.errMsg = null;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  });   

  console.log(ex);    
  ex.$update({ exId: ruta.id }, function(res) {
    if (res.success) {
      $scope.errMsg = null;
      console.log('UpdateRuta - goto(' + locationTo + ')');
      $location.path(locationTo);
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  });       
}
muukControllers.controller('EmbarqCorridaListCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Corrida', 'CorridaXRuta', 'OfertaGenerar', 'RutaUsuariosXCorrida',
  function($window, $scope, $location, AuthenticationService, $routeParams, Corrida, CorridaXRuta, OfertaGenerar, RutaUsuariosXCorrida) {
    $scope.rutaid = $routeParams.id;
    LoadCorridasXRuta($window, $scope, $location, AuthenticationService, CorridaXRuta, $routeParams.id);
    $scope.orderProp = 'nombre';

    $scope.deleteCorrida = function (exId) {
      if( $window.confirm("Se eliminará la corrida con id [" + exId + "], ¿Desea continuar?")) {
        Corrida.remove({ exId: exId },
          function(res){
            if (res.success) {
              $scope.errMsg = null;
              LoadCorridasXRuta($window, $scope, $location, AuthenticationService, CorridaXRuta, $routeParams.id);
            } else {
              $scope.errMsg = res.msg;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }  
          }, function(err) {
            if (isValidToken(err, $window)) {
              console.log(err);
              $scope.errMsg = err.data.msg;
              $scope.sucMsg = null;  
            } else {
              ForceLogOut($window, $scope, $location, AuthenticationService);
            }
          }
        );        
      }
    };
    $scope.cancel = function(){
      console.log('EmbarqCorridaListCtrl.cancel - goto(embarqRutaList)');
      $location.path('embarqRutaList');
    };
    $scope.generarOferta = function(exId) {
      OfertaGenerar.query({ exId: exId },
          function(res){
            console.log(res);
            if (res.success) {
              $scope.errMsg = null;
              $window.alert(res.msg);
            } else {
              $scope.errMsg = res.msg;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }           
          }, function(err) {
            if (isValidToken(err, $window)) {
              console.log(err);
              $scope.errMsg = err.data.msg;
              $scope.sucMsg = null;  
            } else {
              ForceLogOut($window, $scope, $location, AuthenticationService);
            }
          }
        );
    };
    $scope.showUsuarios = function(corridaid) {
      LoadRutaUsuariosXCorrida($window, $scope, $location, AuthenticationService, $scope.rutaid, corridaid, RutaUsuariosXCorrida);
      $('#usuariosModal').modal({
        show: true
      }); 
    };
   
  }]);
muukControllers.controller('EmbarqCorridaDetailCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Corrida', 
  function($window, $scope, $location, AuthenticationService, $routeParams, Corrida) {
    $scope.rutaid = $routeParams.id;
    console.log($scope.rutaid);
    LoadCorrida($window, $scope, $location, AuthenticationService, Corrida, $routeParams.id);

    $scope.cancel = function(){
      console.log('EmbarqCorridaDetailCtrl.cancel - goto(embarqCorridaList/' + $scope.rutaid);
      $location.path('embarqCorridaList/' + $scope.rutaid);
    };
  }]);
muukControllers.controller('EmbarqCorridaFormCtrl', ['$window', '$scope', '$location', 'AuthenticationService', 'Corrida', '$routeParams',
  function($window, $scope, $location, AuthenticationService, Corrida, $routeParams) {
    $scope.master = {};

    $scope.update = function(corrida) {
      $scope.master = angular.copy(corrida);
    };

    $scope.reset = function() {
      $scope.corrida = angular.copy($scope.master);
      $scope.corrida.RutaId = $routeParams.id;
      $scope.corrida.dia1 = true;
      $scope.corrida.dia2 = false;
      $scope.corrida.dia3 = false;
      $scope.corrida.dia4 = false;
      $scope.corrida.dia5 = false;
      $scope.corrida.dia6 = false;
      $scope.corrida.dia7 = false;
    };

    $scope.save = function(corrida) {
      CreateCorrida($window, $scope, $location, AuthenticationService, corrida, Corrida, 'embarqCorridaList/' + $scope.corrida.RutaId);
      /*
      var ex = new Corrida(corrida);
      console.log(ex);
      //ex.$save();
      ex.$create({}, function(result){
        console.log(result);
        if (!result.success) {
          console.log(JSON.stringify(result.msg))
          $window.alert(JSON.stringify(result.msg));
        } else {
          $location.path();
        }
        
      });*/
    };

    $scope.cancel = function(){
      console.log('EmbarqCorridaFormCtrl.cancel - goto(embarqCorridaList/' + $scope.corrida.RutaId);
      $location.path('embarqCorridaList/' + $scope.corrida.RutaId);
    };

    $scope.validateChecks = function() {
      if (($scope.corrida.dia1 == null) || ($scope.corrida.dia2 == null) || ($scope.corrida.dia3 == null) || ($scope.corrida.dia4 == null) || ($scope.corrida.dia5 == null) || ($scope.corrida.dia6 == null) || ($scope.corrida.dia7 == null)) {
        return false;
      } else {
        return ($scope.corrida.dia1 || $scope.corrida.dia2 || $scope.corrida.dia3 || $scope.corrida.dia4 || $scope.corrida.dia5 || $scope.corrida.dia6 || $scope.corrida.dia7);
      }
    };

    $scope.reset();
  }]);
muukControllers.controller('EmbarqCorridaEditCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Corrida', 
  function($window, $scope, $location, AuthenticationService, $routeParams, Corrida) {
    $scope.corrida = {dia1: false,dia2: false,dia3: false,dia4: false,dia5: false,dia6: false,dia7: false};
    LoadCorrida($window, $scope, $location, AuthenticationService, Corrida, $routeParams.id);

    $scope.save = function(corrida) {
      UpdateCorrida($window, $scope, $location, AuthenticationService, corrida, Corrida, 'empresaCorridaList/' + $scope.corrida.RutaId);
      /*
      var ex = new Corrida(corrida);
      console.log(ex);
      ex.$update({ exId: corrida.id }, function(){$location.path('empresaCorridaList/' + $scope.corrida.RutaId);});*/
    };

    $scope.cancel = function(){
      console.log('EmbarqCorridaEditCtrl.cancel - goto(embarqCorridaList/' + $scope.corrida.RutaId);
      $location.path('embarqCorridaList/' + $scope.corrida.RutaId);
    };

    $scope.validateChecks = function() {
      if (($scope.corrida.dia1 == null) || ($scope.corrida.dia2 == null) || ($scope.corrida.dia3 == null) || ($scope.corrida.dia4 == null) || ($scope.corrida.dia5 == null) || ($scope.corrida.dia6 == null) || ($scope.corrida.dia7 == null)) {
        return false;
      } else {
        return ($scope.corrida.dia1 || $scope.corrida.dia2 || $scope.corrida.dia3 || $scope.corrida.dia4 || $scope.corrida.dia5 || $scope.corrida.dia6 || $scope.corrida.dia7);
      }
    };

  }]);
// -----------------------------------------------------
/* EmbarQ - Solicitud Corrida */
muukControllers.controller('EmbarqSolicitudCorridaListCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Corrida', 'CorridaXRuta',
  function($window, $scope, $location, AuthenticationService, $routeParams, Corrida, CorridaXRuta) {
    $scope.rutaid = $routeParams.id;
    LoadCorridasXRuta($window, $scope, $location, AuthenticationService, CorridaXRuta, $routeParams.id);
    $scope.orderProp = 'nombre';

    $scope.deleteCorrida = function (exId) {
      if( $window.confirm("Se eliminará la corrida con id [" + exId + "], ¿Desea continuar?")) {
        Corrida.remove({ exId: exId },
          function(res){
            if (res.success) {
              $scope.errMsg = null;
              LoadCorridasXRuta($window, $scope, $location, AuthenticationService, CorridaXRuta, $routeParams.id);
            } else {
              $scope.errMsg = res.msg;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }  
          }, function(err) {
            if (isValidToken(err, $window)) {
              console.log(err);
              $scope.errMsg = err.data.msg;
              $scope.sucMsg = null;  
            } else {
              ForceLogOut($window, $scope, $location, AuthenticationService);
            }
          }
        );        
      }
    };
    $scope.cancel = function(){
      console.log('EmbarqSolicitudCorridaListCtrl.cancel - goto(embarqSolicitudRutaList)');
      $location.path('embarqSolicitudRutaList');
    };
  }]);
muukControllers.controller('EmbarqSolicitudCorridaDetailCtrl',['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Corrida', 
  function($window, $scope, $location, AuthenticationService, $routeParams, Corrida) {
    LoadCorrida($window, $scope, $location, AuthenticationService, Corrida, $routeParams.id);

    $scope.cancel = function(){
      console.log('EmbarqSolicitudCorridaDetailCtrl.cancel - goto(embarqSolicitudCorridaList/' + $scope.rutaid);
      $location.path('embarqSolicitudCorridaList/' + $scope.rutaid);
    };
  }]);
// -----------------------------------------------------
/* EmbarQ - Solicitud de Ruta */
muukControllers.controller('EmbarqSolicitudRutaShowCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Ruta',
  function($window, $scope, $location, AuthenticationService, $routeParams, Ruta) {
    LoadRuta($window, $scope, $location, AuthenticationService, $routeParams.id, Ruta);

    $scope.cancel = function(){
      console.log('EmbarqSolicitudRutaShowCtrl.cancel - goto(embarqSolicitudRutaList)');
      $location.path('embarqSolicitudRutaList');
    };
  }]);
muukControllers.controller('EmbarqSolicitudRutaUpdateCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Ruta', 
  function($window, $scope, $location, AuthenticationService, $routeParams, Ruta) {
    LoadRuta($window, $scope, $location, AuthenticationService, $routeParams.id, Ruta);

    $scope.save = function(ruta) {
      UpdateRuta($window, ruta, Ruta, $scope, $location, 'embarqSolicitudRutaList');
    };

    $scope.cancel = function(){
      console.log('EmbarqSolicitudRutaUpdateCtrl - goto(embarqSolicitudRutaList)');
      $location.path('embarqSolicitudRutaList');
    };
  }]);
muukControllers.controller('EmbarqSolicitudRutaListCtrl', ['$window', '$scope', '$location', 'AuthenticationService', 'RutasNuevas', 'RutaAutorizar', 'RutaRechazar',
  function($window, $scope, $location, AuthenticationService, RutasNuevas, RutaAutorizar, RutaRechazar) {
    LoadRutasNuevas($window, $scope, $location, AuthenticationService, RutasNuevas);
    $scope.orderProp = 'nombre';

    $scope.rechazarRuta = function (exId) {   
      if( $window.confirm("Se rechazará la ruta con id [" + exId + "], ¿Desea continuar?")) {  
        RutaRechazar.reject({ exId: exId },
          function(res){
            if (res.success) {
              $scope.errMsg = null;
              LoadRutasNuevas($window, $scope, $location, AuthenticationService, RutasNuevas);
            } else {
              $scope.errMsg = res.msg;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }  
          }, function(err) {
            if (isValidToken(err, $window)) {
              console.log(err);
              $scope.errMsg = err.data.msg;
              $scope.sucMsg = null;  
            } else {
              ForceLogOut($window, $scope, $location, AuthenticationService);
            }
          }
        ); 
      }
    };  
    $scope.autorizarRuta = function (exId) {
      if( $window.confirm("Se autorizará la ruta con id [" + exId + "], ¿Desea continuar?")) {   
        RutaAutorizar.auth({ exId: exId },
          function(res){
            if (res.success) {
              $scope.errMsg = null;
              LoadRutasNuevas($window, $scope, $location, AuthenticationService, RutasNuevas);
            } else {
              $scope.errMsg = res.msg;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }  
          }, function(err) {
            if (isValidToken(err, $window)) {
              console.log(err);
              $scope.errMsg = err.data.msg;
              $scope.sucMsg = null;  
            } else {
              ForceLogOut($window, $scope, $location, AuthenticationService);
            }
          }
        );  
      }
    }; 
  }]);

// -----------------------------------------------------
/* EmbarQ - Estadisticas */
muukControllers.controller('EmbarqEstadisticasCtrl', ['$scope', '$location', 'AuthenticationService', 'Estadisticas',
  function($scope, $location, AuthenticationService, Estadisticas) {  
    // ***********************Reservaciones por estatus**********************************
    // Actuales
    var rowsReservacionesXEstatus=[];
    Estadisticas.reservacionesXEstatus({}, function(res){
      if(res.success == true){
        res.resultObject.forEach(function(entry) {
          rowsReservacionesXEstatus.push({c: [{v: entry.estatus}, {v: entry.count}]});  
        });
      }
    });
 
    $scope.chartReservacionXEstatus = {};
    $scope.chartReservacionXEstatus.data = {"cols": [
        {id: "t", label: "Estatus", type: "string"},
        {id: "s", label: "Reservaciones", type: "number"}
    ], "rows": rowsReservacionesXEstatus};
    $scope.chartReservacionXEstatus.type = "PieChart";//BarChart or PieChart or ColumnChart...
    $scope.chartReservacionXEstatus.options = {
        'title': 'Reservaciones por estatus'
    }

    // Históricos
    var rowsReservacionesXEstatusHist=[];
    Estadisticas.reservacionesXEstatusHistorico({}, function(res){
      if(res.success == true){
        res.resultObject.forEach(function(entry) {
          rowsReservacionesXEstatusHist.push({c: [{v: entry.estatus}, {v: entry.count}]});  
        });
      }
    });
 
    $scope.chartReservacionXEstatusHist = {};
    $scope.chartReservacionXEstatusHist.data = {"cols": [
        {id: "t", label: "Estatus", type: "string"},
        {id: "s", label: "Reservaciones", type: "number"}
    ], "rows": rowsReservacionesXEstatusHist};
    $scope.chartReservacionXEstatusHist.type = "PieChart";//BarChart or PieChart or ColumnChart...
    $scope.chartReservacionXEstatusHist.options = {
        'title': 'Histórico de reservaciones por estatus'
    }    

    // ***********************Reservaciones de la última semana**********************************
    var rowsReservacionesXUltimaSemana=[];
    Estadisticas.reservacionesXUltimaSemana({}, function(res){
      if(res.success == true){
        res.resultObject.forEach(function(entry) {
          rowsReservacionesXUltimaSemana.push({c: [{v: entry.fechaReservacion}, {v: entry.count}]});  
        });
      }
    });
 
    $scope.chartReservacionXUltimaSemana = {};
    $scope.chartReservacionXUltimaSemana.data = {"cols": [
        {id: "t", label: "Fecha", type: "string"},
        {id: "s", label: "Reservaciones", type: "number"}
    ], "rows": rowsReservacionesXUltimaSemana};
    $scope.chartReservacionXUltimaSemana.type = "ColumnChart";//BarChart or PieChart or ColumnChart...
    $scope.chartReservacionXUltimaSemana.options = {
        'title': 'Reservaciones de los últimos 7 días'
    }

    // ***********************Números Globales**********************************
    $scope.rowsNumerosGlobales={};
    Estadisticas.numerosGlobales({}, function(res){
      if(res.success == true){        
        $scope.rowsNumerosGlobales = res.resultObject;
        console.log($scope.rowsNumerosGlobales)
      }
    });
  }]);
// -----------------------------------------------------
/* EmbarQ - Comentarios */
function LoadComentarios($window, $scope, $location, AuthenticationService, Comentarios) {
  Comentarios.query({}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      for (var i = 0; i < res.resultObject.length; i++) {
        res.resultObject[i].fechaCreada = res.resultObject[i].createdAt.substring(0, 10); 
        res.resultObject[i].empresanombre = res.resultObject[i].empresa.nombre; 
        res.resultObject[i].usuarionombre = res.resultObject[i].usuario.nombre; 
        res.resultObject[i].usuarioemail = res.resultObject[i].usuario.email; 
      }
      $scope.comentarios = res.resultObject;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  }); 
}
muukControllers.controller('EmbarqComentariosListCtrl', ['$window', '$scope', '$location', 'AuthenticationService', 'Comentarios',
  function($window, $scope, $location, AuthenticationService, Comentarios) {  
    LoadComentarios($window, $scope, $location, AuthenticationService, Comentarios);
  }]);

// -----------------------------------------------------
/* EmbarQ - Administrar Empresa */
muukControllers.controller('EmbarqAdminEmpresasCtrl', ['$window', '$scope', '$location', 'AuthenticationService',
  function($window, $scope, $location, AuthenticationService) {  

  }]);

// *****************************************************
/* Empresa  */
// *****************************************************
/* Empresa - Perfil */
muukControllers.controller('EmpresaPerfilShowCtrl', ['$window', '$scope', '$location', 'AuthenticationService', 'SessionService', 'Empresa',
  function($window, $scope, $location, AuthenticationService, SessionService, Empresa) {
    console.log(SessionService.currentUser.authtoken);
    LoadEmpresa($window, $scope, $location, AuthenticationService, Empresa, SessionService.currentUser.empresa, function(res){});

  }]);
muukControllers.controller('EmpresaPerfilEditCtrl', ['$window', '$scope', '$location', 'AuthenticationService', 'SessionService', 'Empresa',
  function($window, $scope, $location, AuthenticationService, SessionService, Empresa) {
    LoadEmpresa($window, $scope, $location, AuthenticationService, Empresa, SessionService.currentUser.empresa, function(res){});

    $scope.save = function(empresa) {
      UpdateEmpresa($window, $scope, $location, AuthenticationService, empresa, Empresa, 'empresaPerfilShow');
    };

    $scope.cancel = function(){
      console.log('EmpresaPerfilEditCtrl.cancel - goto(empresaPerfilShow)');
      $location.path('empresaPerfilShow');
    };

  }]);

// -----------------------------------------------------
/* Empresa - Usuarios */
muukControllers.controller('EmpresaUsuarioListCtrl', ['$window', '$scope', '$location', 'AuthenticationService', 'Usuario', 'UsuariosAutorizadosXEmpresa',
  function($window, $scope, $location, AuthenticationService, Usuario, UsuariosAutorizadosXEmpresa) {
    LoadUsuariosAutorizadosXEmpresa($window, $scope, $location, AuthenticationService, UsuariosAutorizadosXEmpresa);
    $scope.orderProp = 'nombre';

    $scope.deleteUsuario = function (exId) {
      if( $window.confirm("Se eliminará el usuario con id [" + exId + "] ¿Continuar?")) {
        Usuario.remove({ exId: exId },
          function(res){
            if (res.success) {
              $scope.errMsg = null;
              LoadUsuariosAutorizadosXEmpresa($window, $scope, $location, AuthenticationService, UsuariosAutorizadosXEmpresa);
            } else {
              $scope.errMsg = res.msg;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }  
          }, function(err) {
            if (isValidToken(err, $window)) {
              console.log(err);
              $scope.errMsg = err.data.msg;
              $scope.sucMsg = null;  
            } else {
              ForceLogOut($window, $scope, $location, AuthenticationService);
            }
          }
        ); 
      }
    };

  }]);
muukControllers.controller('EmpresaUsuarioFormCtrl', ['$window', '$scope', '$location', 'AuthenticationService', 'UsuarioPreregister', 
  function($window, $scope, $location, AuthenticationService, UsuarioPreregister) {
    $scope.master = {};

    $scope.update = function(usuario) {
      $scope.master = angular.copy(usuario);
    };

    $scope.reset = function() {
      $scope.usuario = angular.copy($scope.master);
    };

    $scope.save = function(usuario) {
      CreateUsuarioPreregister($window, $scope, $location, AuthenticationService, usuario, UsuarioPreregister, 'empresaUsuarioList');
    };

    $scope.cancel = function(){
      console.log('EmpresaUsuarioFormCtrl.cancel - goto(empresaUsuarioList)');
      $location.path('empresaUsuarioList');
    };

    $scope.reset();

  }]);
muukControllers.controller('EmpresaUsuarioShowCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Usuario',
  function($window, $scope, $location, AuthenticationService, $routeParams, Usuario) {
    LoadUsuario($window, $scope, $location, AuthenticationService, $routeParams.id, Usuario);
    
    $scope.cancel = function(){
      console.log('EmpresaUsuarioShowCtrl.cancel - goto(empresaUsuarioList)');
      $location.path('empresaUsuarioList');
    };
  }]);
muukControllers.controller('EmpresaUsuarioEditCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Usuario', 
  function($window, $scope, $location, AuthenticationService, $routeParams, Usuario) {
    LoadUsuario($window, $scope, $location, AuthenticationService, $routeParams.id, Usuario);

    $scope.save = function(usuario) {
      UpdateUsuario($window, $scope, $location, AuthenticationService, usuario, Usuario, 'empresaUsuarioList');      
    };
    
    $scope.cancel = function(){
      console.log('EmpresaUsuarioEditCtrl.cancel - goto(empresaUsuarioList)');
      $location.path('empresaUsuarioList');
    };
  }]);

muukControllers.controller('EmpresaMultiUsuarioNewCtrl', ['$window', '$scope', '$location', 'AuthenticationService', 'UsuarioPreregister', 'SessionService',
  function($window, $scope, $location, AuthenticationService, UsuarioPreregister, SessionService) {

    $scope.master = "";

    $scope.update = function(usuarios) {
      $scope.master = angular.copy(usuarios);
    };

    $scope.reset = function() {
      $scope.usuarios = angular.copy($scope.master);
    };

    $scope.save = function(usuarios) {
      var message = "";      
      var created = 0;
      var userList = usuarios.split("\n");
      for (var index in userList) {
        var UserObj = userList[index].split(",");
        if (UserObj.length >= 2) {
          // get name
          var name = UserObj[0]; 
          // get mail removing empty spaces
          var mail = UserObj[1].replace(" ", ""); 
          // validate mail
          if (validateEmail(mail) == false) {
            // add wrong call to the message response
            message = name + ", " + mail + "\n";
          } else {
            // add user
            var usuario = {nombre: name, email: mail, password: "", EmpresaId: SessionService.currentUser.empresa};
            CreateUsuarioPreregister($window, $scope, $location, AuthenticationService, usuario, UsuarioPreregister, ''); 
            created = created + 1;
          }
        }
      }  // end for
      
      if (message == "") {
        console.log('VAMOS a empresaUsuarioList');
        $window.alert("Se invitaron a " + created.toString() + "/" + UserObj.length + " usuarios." );

        console.log('EmpresaMultiUsuarioNewCtrl.save - goto(empresaUsuarioList)');
        $location.path('empresaUsuarioList');
        return true;
      } else {
        $scope.usuarios = message;
        $window.alert("Se invitaron a " + created.toString() + "/" + UserObj.length + " usuarios. Favor de verificar los datos de usuarios sobrantes." );
        console.log('ForceLogOut - goto(' + locationTo + ')');
        console.log('EmpresaMultiUsuarioNewCtrl.save - goto(empresaMultiUsuarioNew)');
        $location.path('empresaMultiUsuarioNew');
      }

    };

    $scope.cancel = function(){
      console.log('EmpresaMultiUsuarioNewCtrl.cancel - goto(empresaUsuarioList)');
      $location.path('empresaUsuarioList');
    };

    $scope.reset();
    
    function validateEmail(email) { 
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    }

  }]);
muukControllers.controller('EmpresaUsuarioPermanenteListCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'UsuariosPermanentes', 
  function($window, $scope, $location, AuthenticationService, $routeParams, UsuariosPermanentes) {
    LoadUsuariosPermanentes($window, $scope, $location, AuthenticationService, $scope.user.empresa, null, null, UsuariosPermanentes);

  }]);

// -----------------------------------------------------
/* Empresa - Solicitud de usuarios */
muukControllers.controller('EmpresaSolicitudUsuarioListCtrl', ['$window', '$scope', '$location', 'AuthenticationService', 'Usuario', 'UsuariosNuevosXEmpresa',
  function($window, $scope, $location, AuthenticationService, Usuario, UsuariosNuevosXEmpresa) {
    LoadUsuariosNuevosXEmpresa($window, $scope, $location, AuthenticationService, UsuariosNuevosXEmpresa);
    $scope.orderProp = 'nombre';

    $scope.deleteUsuario = function (exId) {
      if( $window.confirm("Se eliminará el usuario con id [" + exId + "] ¿Continuar?")) {
        Usuario.remove({ exId: exId },
          function(res){
            if (res.success) {
              $scope.errMsg = null;
              LoadUsuariosNuevosXEmpresa($window, $scope, $location, AuthenticationService, UsuariosNuevosXEmpresa);
            } else {
              $scope.errMsg = res.msg;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }  
          }, function(err) {
            if (isValidToken(err, $window)) {
              console.log(err);
              $scope.errMsg = err.data.msg;
              $scope.sucMsg = null;  
            } else {
              ForceLogOut($window, $scope, $location, AuthenticationService);
            }
          }
        );
      }
    };  

  }]);
muukControllers.controller('EmpresaSolicitudUsuarioShowCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Usuario',
  function($window, $scope, $location, AuthenticationService, $routeParams, Usuario) {    
    LoadUsuario($window, $scope, $location, AuthenticationService, $routeParams.id, Usuario);
    
    $scope.cancel = function(){
      console.log('EmpresaSolicitudUsuarioShowCtrl.cancel - goto(empresaSolicitudUsuarioList)');
      $location.path('empresaSolicitudUsuarioList');
    };
  }]);
muukControllers.controller('EmpresaSolicitudUsuarioEditCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Usuario',
  function($window, $scope, $location, AuthenticationService, $routeParams, Usuario) {
    LoadUsuario($window, $scope, $location, AuthenticationService, $routeParams.id, Usuario);

    $scope.save = function(usuario) {
      UpdateUsuario($window, $scope, $location, AuthenticationService, usuario, Usuario, 'empresaSolicitudUsuarioList'); 
    };

    $scope.cancel = function(){
      console.log('EmpresaSolicitudUsuarioEditCtrl.cancel - goto(empresaSolicitudUsuarioList)');
      $location.path('empresaSolicitudUsuarioList');
    };
  }]);

// -----------------------------------------------------
/* Empresa - Rutas */
function LoadRutasXEmpresa($window, $scope, $location, AuthenticationService, RutaXEmpresa) {
  RutaXEmpresa.query({}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      $scope.rutas = res.resultObject;
      console.log(res);
      for (var index in $scope.rutas) {
        $scope.rutas[index].companyownernombre = $scope.rutas[index].companyowner.nombre;
      }      
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  }); 
}
muukControllers.controller('EmpresaRutaListCtrl', ['$window', '$scope', '$location', 'AuthenticationService', 'Ruta', 'RutaXEmpresa', 
  function($window, $scope, $location, AuthenticationService, Ruta, RutaXEmpresa) {
    LoadRutasXEmpresa($window, $scope, $location, AuthenticationService, RutaXEmpresa);
    $scope.orderProp = 'nombre';

    $scope.deleteRuta = function (exId) {
      if( $window.confirm("Se eliminará la ruta con id [" + exId + "], ¿Desea continuar?")) {
        Ruta.remove({ exId: exId },
          function(res){
            if (res.success) {
              $scope.errMsg = null;
              $scope.sucMsg = "Se eliminó exitosamente la ruta con id [" + exId + "]";
              LoadRutasXEmpresa($window, $scope, $location, AuthenticationService, RutaXEmpresa);
            } else {
              $scope.errMsg = res.msg;
              $scope.sucMsg = null;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }  
          }, function(err) {
            if (isValidToken(err, $window)) {
              console.log(err);
              $scope.errMsg = err.data.msg;
              $scope.sucMsg = null;  
            } else {
              ForceLogOut($window, $scope, $location, AuthenticationService);
            }
          }
        );
      }
    };

  }]);
muukControllers.controller('EmpresaRutaFormCtrl', ['$window', '$scope', '$location', 'AuthenticationService', 'Ruta', 'SessionService', 'Mapa',
  function($window, $scope, $location, AuthenticationService, Ruta, SessionService, Mapa) {
    $scope.master = {};
    $scope.user.empresa = SessionService.currentUser.empresa;
    $scope.step = 1;
    $scope.selectedMarker = null;
    $scope.selectedMarkerIndex = -1;

    $scope.update = function(ruta) {
      $scope.master = angular.copy(ruta);
    };

    $scope.reset = function() {
      $scope.ruta = angular.copy($scope.master);
      $scope.ruta.CompanyownerID = SessionService.currentUser.empresa;
      $scope.ruta.diasofertafuturo = 7; // TODO: aceptar cambio de dias futuros
    };

    $scope.saveRuta = function(ruta) {
      var ex = new Ruta(ruta);
      console.log('New ruta result:');
      console.log(ex);
      ex.$create({}, function(result){
        console.log(result);      
        if (result.success) {
          $scope.errMsg = null;
          $scope.step = 2;
          console.log('Create ruta result:');
          console.log(result);
          idm = result.resultObject.id;
          creapuntos();
        } else {
          $scope.errMsg = res.msg;
          if (DebugMode) {
            $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
          }
        }    
      }, function(err) {
        if (isValidToken(err, $window)) {
          console.log(err);
          $scope.errMsg = err.data.msg;
          $scope.sucMsg = null;  
        } else {
          ForceLogOut($window, $scope, $location, AuthenticationService);
        }
      });
    }; 

    $scope.savePunto = function(selectedMarker) {
      //$scope.selectedMarker = selectedMarker;
      console.log('saving selected punto ' + $scope.selectedMarkerIndex);
      saveSelectedPunto();      
    };

    $scope.deletePunto = function() {
      if ($window.confirm(msgConfirmarBorrarPunto)) {
        console.log('deleting selected punto ' + $scope.selectedMarkerIndex);
        deleteSelectedPunto();
      }
    };
      
    $scope.savePuntos = function() {
      console.log('vamos a salvar puntos');
      saveRutaPuntos();
    };

    $scope.saveMapa = function(mapa) {
      console.log('$scope.saveMapa');        
      console.log(mapa);        
      if($scope.user.role == 'EMPRESA'){
        SaveMapa($window, $scope, $location, AuthenticationService, mapa, Mapa, 'empresaRutaList'); 
      }else if($scope.user.role == 'ADMIN'){
        SaveMapa($window, $scope, $location, AuthenticationService, mapa, Mapa, 'empresaRutaList'); 
      }       
    }; 

    $scope.cancel = function(){
      if ($window.confirm(msgConfirmarCancelarRutaNueva)) {
        console.log('EmpresaRutaFormCtrl.cancel - goto(empresaRutaList)');
        $location.path('empresaRutaList');
      }
    };

    $scope.reset();
  }]);
muukControllers.controller('EmpresaRutaShowCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Ruta', 
  function($window, $scope, $location, AuthenticationService, $routeParams, Ruta) {
    LoadRuta($window, $scope, $location, AuthenticationService, $routeParams.id, Ruta);

    $scope.cancel = function(){
      console.log('EmpresaRutaShowCtrl.cancel - goto(empresaRutaList)');
      $location.path('empresaRutaList');
    };
  }]);
muukControllers.controller('EmpresaRutaEditCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Ruta', 
  function($window, $scope, $location, AuthenticationService, $routeParams, Ruta) {
    LoadRuta($window, $scope, $location, AuthenticationService, $routeParams.id, Ruta);

    $scope.save = function(ruta) {
      UpdateRuta($window, ruta, Ruta, $scope, $location, 'empresaRutaList');
    };

    $scope.cancel = function(){
      console.log('EmpresaRutaEditCtrl.cancel - goto(empresaRutaList)');
      $location.path('empresaRutaList');
    };
  }]);
muukControllers.controller('EmpresaRutaUsuariosListCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Usuario', 'RutaUsuariosXRuta',
  function($window, $scope, $location, AuthenticationService, $routeParams, Usuario, RutaUsuariosXRuta) {
    console.log($routeParams);
    $scope.rutaid = $routeParams.id;
    LoadRutaUsuariosXRuta($window, $scope, $location, AuthenticationService, $scope.rutaid, RutaUsuariosXRuta);
    $scope.orderProp = 'nombre';

    $scope.deleteUsuario = function (exId) {
      if( $window.confirm("Se eliminará el usuario con id [" + exId + "] ¿Continuar?")) {
        
      }
    };

    $scope.cancel = function(){
      console.log('EmpresaRutaUsuariosListCtrl.cancel - goto(empresaRutaList)');
      $location.path('empresaRutaList');
    };    

  }]);

// -----------------------------------------------------
/* Empresa - Corrida */
function CreateCorrida($window, $scope, $location, AuthenticationService, corrida, Corrida, locationTo) {
  var ex = new Corrida(corrida, function(res) {
    if (res.success) {
      $scope.errMsg = null;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  });   
  console.log(ex); 
  ex.$create({}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      console.log('CreateCorrida - goto(' + locationTo + ')');
      $location.path(locationTo);
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  });
}
function UpdateCorrida($window, $scope, $location, AuthenticationService, corrida, Corrida, locationTo) {
  var ex = new Corrida(corrida, function(res) {
    if (res.success) {
      $scope.errMsg = null;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  });   

  console.log(ex);    
  ex.$update({ exId: corrida.id }, function(res) {
    if (res.success) {
      $scope.errMsg = null;
      console.log('UpdateCorrida - goto(' + locationTo + ')');
      $location.path(locationTo);
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  });       
}
muukControllers.controller('EmpresaCorridaListCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Corrida', 'CorridaXRuta', 'RutaUsuariosXCorrida', 'OfertaGenerar',
  function($window, $scope, $location, AuthenticationService, $routeParams, Corrida, CorridaXRuta, RutaUsuariosXCorrida, OfertaGenerar) {
    $scope.rutaid = $routeParams.id;
    LoadCorridasXRuta($window, $scope, $location, AuthenticationService, CorridaXRuta, $routeParams.id);
    $scope.orderProp = 'nombre';

    $scope.deleteCorrida = function (exId) {
      if( $window.confirm("Se eliminará la corrida con id [" + exId + "], ¿Desea continuar?")) {
        Corrida.remove({ exId: exId },
          function(res){
            if (res.success) {
              $scope.errMsg = null;
              LoadCorridasXRuta($window, $scope, $location, AuthenticationService, CorridaXRuta, $routeParams.id);
            } else {
              $scope.errMsg = res.msg;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }  
          }, function(err) {
            if (isValidToken(err, $window)) {
              console.log(err);
              $scope.errMsg = err.data.msg;
              $scope.sucMsg = null;  
            } else {
              ForceLogOut($window, $scope, $location, AuthenticationService);
            }
          }
        ); 
      }
    };
    $scope.cancel = function(){
      console.log('EmpresaCorridaListCtrl.cancel - goto(empresaRutaList)');
      $location.path('empresaRutaList');
    };
    $scope.generarOferta = function(exId) {
      OfertaGenerar.query({ exId: exId },
          function(res){
            if (res.success) {
              $scope.errMsg = null;
              $window.alert(res.msg);
            } else {
              $scope.errMsg = res.msg;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }           
          }, function(err) {
            if (isValidToken(err, $window)) {
              console.log(err);
              $scope.errMsg = err.data.msg;
              $scope.sucMsg = null;  
            } else {
              ForceLogOut($window, $scope, $location, AuthenticationService);
            }
          }
        );
    };
    $scope.showUsuarios = function(corridaid) {
      LoadRutaUsuariosXCorrida($window, $scope, $location, AuthenticationService, $scope.rutaid, corridaid, RutaUsuariosXCorrida);
      $('#usuariosModal').modal({
        show: true
      }); 
    };
  }]);
muukControllers.controller('EmpresaCorridaFormCtrl', ['$window', '$scope', '$location', 'AuthenticationService', 'Corrida', '$routeParams',
  function($window, $scope, $location, AuthenticationService, Corrida, $routeParams) {
    $scope.master = {};

    $scope.update = function(corrida) {
      $scope.master = angular.copy(corrida);
    };

    $scope.reset = function() {
      $scope.corrida = angular.copy($scope.master);
      $scope.corrida.RutaId = $routeParams.id;
      $scope.corrida.dia1 = true;
      $scope.corrida.dia2 = false;
      $scope.corrida.dia3 = false;
      $scope.corrida.dia4 = false;
      $scope.corrida.dia5 = false;
      $scope.corrida.dia6 = false;
      $scope.corrida.dia7 = false;
    };

    $scope.save = function(corrida) {
      CreateCorrida($window, $scope, $location, AuthenticationService, corrida, Corrida, 'empresaCorridaList/' + $scope.corrida.RutaId);
      /*
      var ex = new Corrida(corrida);
      console.log(ex);
      //ex.$save();
      ex.$create({}, function(result){
        console.log(result);
        if (!result.success) {
          console.log(JSON.stringify(result.msg))
          $window.alert(JSON.stringify(result.msg));
        } else {
          $location.path();
        }
        
      });*/
    };

    $scope.cancel = function(){
      console.log('EmpresaCorridaFormCtrl.cancel - goto(empresaCorridaList/' + $scope.corrida.RutaId);
      $location.path('empresaCorridaList/' + $scope.corrida.RutaId);
    };

    $scope.validateChecks = function() {
      if (($scope.corrida.dia1 == null) || ($scope.corrida.dia2 == null) || ($scope.corrida.dia3 == null) || ($scope.corrida.dia4 == null) || ($scope.corrida.dia5 == null) || ($scope.corrida.dia6 == null) || ($scope.corrida.dia7 == null)) {
        return false;
      } else {
        return ($scope.corrida.dia1 || $scope.corrida.dia2 || $scope.corrida.dia3 || $scope.corrida.dia4 || $scope.corrida.dia5 || $scope.corrida.dia6 || $scope.corrida.dia7);
      }
    };

    $scope.reset();
  }]);
muukControllers.controller('EmpresaCorridaShowCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Corrida', 
  function($window, $scope, $location, AuthenticationService, $routeParams, Corrida) {
    LoadCorrida($window, $scope, $location, AuthenticationService, Corrida, $routeParams.id);

    $scope.cancel = function(){
      console.log('EmpresaCorridaShowCtrl.cancel - goto(empresaCorridaList/' + $scope.corrida.RutaId);
      $location.path('empresaCorridaList/' + $scope.corrida.RutaId);
    };
  }]);
muukControllers.controller('EmpresaCorridaEditCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Corrida', 
  function($window, $scope, $location, AuthenticationService, $routeParams, Corrida) {
    $scope.corrida = {dia1: false,dia2: false,dia3: false,dia4: false,dia5: false,dia6: false,dia7: false};
    LoadCorrida($window, $scope, $location, AuthenticationService, Corrida, $routeParams.id);

    $scope.save = function(corrida) {
      UpdateCorrida($window, $scope, $location, AuthenticationService, corrida, Corrida, 'empresaCorridaList/' + $scope.corrida.RutaId);
      /*
      var ex = new Corrida(corrida);
      console.log(ex);
      ex.$update({ exId: corrida.id }, function(){$location.path('empresaCorridaList/' + $scope.corrida.RutaId);});*/
    };

    $scope.cancel = function(){
      console.log('EmpresaCorridaEditCtrl.cancel - goto(empresaCorridaList/' + $scope.corrida.RutaId);
      $location.path('empresaCorridaList/' + $scope.corrida.RutaId);
    };

    $scope.validateChecks = function() {
      if (($scope.corrida.dia1 == null) || ($scope.corrida.dia2 == null) || ($scope.corrida.dia3 == null) || ($scope.corrida.dia4 == null) || ($scope.corrida.dia5 == null) || ($scope.corrida.dia6 == null) || ($scope.corrida.dia7 == null)) {
        return false;
      } else {
        return ($scope.corrida.dia1 || $scope.corrida.dia2 || $scope.corrida.dia3 || $scope.corrida.dia4 || $scope.corrida.dia5 || $scope.corrida.dia6 || $scope.corrida.dia7);
      }
    };

  }]);

// -----------------------------------------------------
/* Empresa - Rutas compartidas */
muukControllers.controller('EmpresaRutasCompartidasCtrl', ['$window', '$scope', '$location', 'AuthenticationService', 'RutaCompartidaList', 'RutaCompartida',
  function($window, $scope, $location, AuthenticationService, RutaCompartidaList, RutaCompartida) {
    LoadRutasCompartidas($window, $scope, $location, AuthenticationService, RutaCompartidaList);
    $scope.orderProp = 'nombre';

    $scope.deleteRutaCompartida = function (exId) {
      if( $window.confirm("Se eliminará la ruta compartida con id [" + exId + "], ¿Desea continuar?")) {
        RutaCompartida.remove({ exId: exId },
          function(res){
            if (res.success) {
              $scope.errMsg = null;
              $scope.sucMsg = "Se eliminó exitosamente la ruta compartida con id [" + exId + "]";
              LoadRutasCompartidas($window, $scope, $location, AuthenticationService, RutaCompartidaList);
            } else {
              $scope.errMsg = res.msg;
              $scope.sucMsg = null;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }  
          }, function(err) {
            if (isValidToken(err, $window)) {
              console.log(err);
              $scope.errMsg = err.data.msg;
              $scope.sucMsg = null;  
            } else {
              ForceLogOut($window, $scope, $location, AuthenticationService);
            }
          }
        );        
      }
    };

  }]);

// -----------------------------------------------------
/* Empresa - Comentarios */
muukControllers.controller('EmpresaComentariosCtrl', ['$window', '$scope', '$location', 'AuthenticationService', 'Comentarios',
  function($window, $scope, $location, AuthenticationService, Comentarios) {
    LoadComentarios($window, $scope, $location, AuthenticationService, Comentarios);

    $scope.showComentario = function() {
      $('#comentarioModal').modal({
        show: true
      });   
    }
    $scope.comentar = function(comentario) {
      var ex = new Comentarios({comentario: comentario}, 
        function(res) {
          if (res.success) {
            $scope.errMsg = null;
          } else {
            $scope.errMsg = res.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          }
        }, function(err) {
          if (isValidToken(err, $window)) {
            console.log(err);
            $scope.errMsg = err.data.msg;
            $scope.sucMsg = null;  
          } else {
            ForceLogOut($window, $scope, $location, AuthenticationService);
          }
        }
      );   
      console.log(ex); 
      ex.$create({}, function(res){
        if (res.success) {
          $scope.errMsg = null;
          $scope.sucMsg = "El comentario se envió exitosamente"; 
          $scope.comentario = '';
          LoadComentarios($window, $scope, $location, AuthenticationService, Comentarios);
        } else {
          $scope.errMsg = res.msg;
          $scope.sucMsg = null;
          if (DebugMode) {
            $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
          }
        }
      }, function(err) {
        if (isValidToken(err, $window)) {
          console.log(err);
          $scope.errMsg = err.data.msg;
          $scope.sucMsg = null;  
        } else {
          ForceLogOut($window, $scope, $location, AuthenticationService);
        }
      });
    }    
  }]);

// -----------------------------------------------------
/* Empresa - Estadisticas */
muukControllers.controller('EmpresaEstadisticasCtrl', ['$window', '$scope', '$location', 'AuthenticationService',
  function($window, $scope, $location, AuthenticationService) {

  }]);

// *****************************************************
/* Usuario  */
// *****************************************************
/* Usuario - Perfil */
muukControllers.controller('UsuarioPerfilShowCtrl', ['$window', '$scope', '$location', 'AuthenticationService', 'SessionService', 'Usuario',
  function($window, $scope, $location, AuthenticationService, SessionService, Usuario) {
    LoadUsuario($window, $scope, $location, AuthenticationService, SessionService.currentUser.id, Usuario);
  }]);
muukControllers.controller('UsuarioPerfilEditCtrl', ['$window', '$scope', '$location', 'AuthenticationService', 'SessionService', 'Usuario',
  function($window, $scope, $location, AuthenticationService, SessionService, Usuario) {
    LoadUsuario($window, $scope, $location, AuthenticationService, SessionService.currentUser.id, Usuario);

    $scope.save = function(usuario) {
      UpdateUsuario($window, $scope, $location, AuthenticationService, usuario, Usuario, 'usuarioPerfilShow');
    };

    $scope.cancel = function(){
      console.log('UsuarioPerfilEditCtrl.cancel - goto(usuarioPerfilShow)');
      $location.path('usuarioPerfilShow');
    };
  }]);

// -----------------------------------------------------
/* Usuario - Consultas */
function LoadReservaciones($window, $scope, $location, AuthenticationService, Reservaciones, estatus, vigente) {
  Reservaciones.query({estatus: estatus, vigente: vigente}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      // fill folio y fechas
      for (var i = 0; i < res.resultObject.length; i++) {
        // fill folio
        res.resultObject[i].folio = res.resultObject[i].id.toString();
        while (res.resultObject[i].folio.length < 6) {
          res.resultObject[i].folio = '0' + res.resultObject[i].folio;
        }
        // fill fechas
        res.resultObject[i].fechaCreada = res.resultObject[i].createdAt.substring(0, 10);
        res.resultObject[i].fechaReservada = res.resultObject[i].fechaReservacion.substring(0, 10);
        res.resultObject[i].rutumnombre = res.resultObject[i].rutum.nombre;
        res.resultObject[i].rutumorigentxt = res.resultObject[i].rutum.origentxt;
        res.resultObject[i].rutumdestinotxt = res.resultObject[i].rutum.destinotxt;


        res.resultObject[i].rutaCorridahoraSalidaFmt = res.resultObject[i].rutaCorrida.horaSalidaFmt;
        res.resultObject[i].rutaCorridahoraLlegadaFmt = res.resultObject[i].rutaCorrida.horaLlegadaFmt;

      }
      
      $scope.reservaciones = res.resultObject;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  }); 
}
function LoadReservacionesPermanentes($window, $scope, $location, AuthenticationService, RutaUsuariosXRuta) {
  RutaUsuariosXRuta.query({}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      $scope.reservaciones = res.resultObject;
      console.log(res);
//      $scope.usuarios = res.resultObject;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  }); 
}
function LoadEsperas($window, $scope, $location, AuthenticationService, Esperas) {
  Esperas.query({ }, function(res){
    if (res.success) {
      $scope.errMsg = null;
      // fill folio
      for (var i = 0; i < res.resultObject.length; i++) {
        res.resultObject[i].folio = res.resultObject[i].id.toString();
        while (res.resultObject[i].folio.length < 6) {
          res.resultObject[i].folio = '0' + res.resultObject[i].folio;
        }
        // fill fechas
        res.resultObject[i].fechaCreada = res.resultObject[i].createdAt.substring(0, 10);
        res.resultObject[i].fechaReservada = res.resultObject[i].fechaReservacion.substring(0, 10);
      }      
      //$scope.esperas = res.resultObject;
      $scope.reservaciones = res.resultObject;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  }); 
}
function LoadRutasXUsuario($window, $scope, $location, AuthenticationService, UsuarioRuta, RutaFavorita, usuarioid) {
  UsuarioRuta.query({}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      RutaFavorita.query({usrid: usuarioid}, function(favoritos) {
        //console.log(res.resultObject);
        //console.log(favoritos.resultObject);
        for (var i = 0; i < favoritos.resultObject.length; i++) {
          for (var j = 0; j < res.resultObject.length; j++) {
            if (res.resultObject[j].id == favoritos.resultObject[i].RutaId) {
              res.resultObject[j].isFavorite = true;
            }
          } 
        }
        //console.log($scope.showFavoritos);
        if (($scope.showFavoritos != null)&&($scope.showFavoritos)) {
          // filtrar solo favoritos
          while ($scope.rutas.length > 0) {
            $scope.rutas.pop();
          }            
          for (var j = 0; j < res.resultObject.length; j++) {
            if (res.resultObject[j].isFavorite) {
              $scope.rutas.push(res.resultObject[j]);
            }
          }
        } else {
          // mostrar todos
          $scope.rutas = res.resultObject;;
        }        
        console.log(res);
        for (var index in $scope.rutas) {
          $scope.rutas[index].companyownernombre = $scope.rutas[index].companyowner.nombre;
        }
        //console.log($scope.rutas);
        //$scope.rutas = res.resultObject;
      }, function(err) {
        if (isValidToken(err, $window)) {
          console.log(err);
          $scope.errMsg = err.data.msg;
          $scope.sucMsg = null;  
        } else {
          ForceLogOut($window, $scope, $location, AuthenticationService);
        }
      });
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    if (isValidToken(err, $window)) {
      console.log(err);
      $scope.errMsg = err.data.msg;
      $scope.sucMsg = null;  
    } else {
      ForceLogOut($window, $scope, $location, AuthenticationService);
    }
  }); 
}
function ShowMapa($window, $scope, $location, AuthenticationService, rutaid, Mapa) {
  var consulta = Mapa.query({exId: rutaid});
  $scope.rutaid = rutaid;

  consulta.$promise.then(
    function(res){
      console.log("ya cargo ---< " + res.resultObject.length);
      console.log(res);
      if(res.resultObject.length > 0){
        $scope.pMapa = res.resultObject;
        $scope.orderProp = 'id';
        console.log($scope.pMapa);
        consultapuntos();
      } else {
        creapuntos();
      }
      console.log($scope.pMapa); 

    }, function(err) {
      if (isValidToken(err, $window)) {
        console.log(err);
        $scope.errMsg = err.data.msg;
        $scope.sucMsg = null;  
      } else {
        ForceLogOut($window, $scope, $location, AuthenticationService);
      }
    }
  );      
}
function SaveMapa($window, $scope, $location, AuthenticationService, mapa, Mapa, locationTo) {
  console.log("Objeto de cordenadas---> ");
  console.log(mapa);
  var ex = new Mapa(mapa);   
  console.log("Parceo de mapa -----> ");
  console.log(ex);    
  ex.$createBulk({}, 
    function(res) {
      if (res.success) {
        $scope.errMsg = null;
        console.log('SaveMapa - goto(' + locationTo + ')');
        $location.path(locationTo);
      } else {
        $scope.errMsg = res.msg;
        if (DebugMode) {
          $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
        }
      }   
    }, function(err) {
      if (isValidToken(err, $window)) {
        console.log(err);
        $scope.errMsg = err.data.msg;
        $scope.sucMsg = null;  
      } else {
        ForceLogOut($window, $scope, $location, AuthenticationService);
      }
    }
  );
}  
muukControllers.controller('UsuarioResumenCtrl', ['$window', '$scope', '$location', 'AuthenticationService',
  function($window, $scope, $location, AuthenticationService) {

  }]);
muukControllers.controller('UsuarioViajesCtrl', ['$window', '$scope', '$location', 'AuthenticationService',
  function($window, $scope, $location, AuthenticationService) {

  }]);
muukControllers.controller('UsuarioRutasCtrl', ['$window', '$scope', '$location', 'AuthenticationService',
  function($window, $scope, $location, AuthenticationService) {

  }]);
muukControllers.controller('UsuarioReservacionesCtrl', ['$window', '$scope', '$location', 'AuthenticationService', 'Reservaciones', 'CancelarReservacion', 'ConfirmarReservacion', 'Esperas', 'CancelarEspera', 'RutaUsuariosXRuta',
  function($window, $scope, $location, AuthenticationService, Reservaciones, CancelarReservacion, ConfirmarReservacion, Esperas, CancelarEspera, RutaUsuariosXRuta) {

    $scope.loadReservaciones = function(estatus, vigente) {
      LoadReservaciones($window, $scope, $location, AuthenticationService, Reservaciones, estatus, vigente);
    }
    $scope.loadReservacionesPermanentes = function() {
      LoadReservacionesPermanentes($window, $scope, $location, AuthenticationService, RutaUsuariosXRuta);
    }
    $scope.loadEsperas = function() {
      LoadEsperas($window, $scope, $location, AuthenticationService, Esperas);
    }
    $scope.init = function(estatus, vigente) {
      Reservaciones.query({estatus: estatus, vigente: vigente}, function(res){
        if (res.success) {
          $scope.errMsg = null;
          // fill folio
          for (var i = 0; i < res.resultObject.length; i++) {
            res.resultObject[i].folio = res.resultObject[i].id.toString();
            while (res.resultObject[i].folio.length < 6) {
              res.resultObject[i].folio = '0' + res.resultObject[i].folio;
            }
            // fill fechas
            res.resultObject[i].fechaCreada = res.resultObject[i].createdAt.substring(0, 10);
            res.resultObject[i].fechaReservada = res.resultObject[i].fechaReservacion.substring(0, 10);            
          }      
          $scope.reservaciones = res.resultObject;

          if ((res.resultObject.length == 0)&&(estatus=="new")) {
            // si el resultado fue vacio mostrar el siguiente tab
            $scope.selectTab(1);
            Reservaciones.query({estatus: "confirmed", vigente: vigente}, function(results){
              if (results.success) {
                $scope.errMsg = null;
                console.log(results);
                // fill folio
                for (var i = 0; i < results.resultObject.length; i++) {
                  results.resultObject[i].folio = results.resultObject[i].id.toString();
                  while (results.resultObject[i].folio.length < 6) {
                    results.resultObject[i].folio = '0' + results.resultObject[i].folio;
                  }
                  // fill fechas
                  results.resultObject[i].fechaCreada = results.resultObject[i].createdAt.substring(0, 10);
                  results.resultObject[i].fechaReservada = results.resultObject[i].fechaReservacion.substring(0, 10);                  
                }
                // fill ruta
                console.log(results.resultObject);
                $scope.reservaciones = results.resultObject;                
              }              

            });
          }          
        } else {
          $scope.errMsg = res.msg;
          if (DebugMode) {
            $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
          }
        }
      }, function(err) {
        if (isValidToken(err, $window)) {
          console.log(err);
          $scope.errMsg = err.data.msg;
          $scope.sucMsg = null;  
        } else {
          ForceLogOut($window, $scope, $location, AuthenticationService);
        }
      });      
    }
    $scope.cancel = function(reservacion) {
      if( $window.confirm("Se cancelará la reservacion id [" + reservacion.id + "], ¿Desea continuar?")) {
        CancelarReservacion.query({exId: reservacion.id}, 
          function(res) {
            if (res.success) {
              $scope.errMsg = null;
              $scope.loadReservaciones($scope.tabSelected, $scope.tabHideOlder);
            } else {
              $scope.errMsg = res.msg;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }       
          }, function(err) {
            if (isValidToken(err, $window)) {
              console.log(err);
              $scope.errMsg = err.data.msg;
              $scope.sucMsg = null;  
            } else {
              ForceLogOut($window, $scope, $location, AuthenticationService);
            }
          }
        );
      }
    }
    $scope.confirm = function(reservacion) {
      if( $window.confirm("Se confirmará la reservacion id [" + reservacion.id + "] ¿Continuar?")) {
        ConfirmarReservacion.query({exId: reservacion.id}, 
          function(res) {
            if (res.success) {
              $scope.errMsg = null;
              $scope.loadReservaciones($scope.tabSelected, $scope.tabHideOlder);
            } else {
              $scope.errMsg = res.msg;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }       
          }, function(err) {
            if (isValidToken(err, $window)) {
              console.log(err);
              $scope.errMsg = err.data.msg;
              $scope.sucMsg = null;  
            } else {
              ForceLogOut($window, $scope, $location, AuthenticationService);
            }
          }
        );        
      }
    }
    $scope.selectTab = function(tabIndex) {
      $scope.reservaciones = null;
      $scope.esperas = null;
      if (tabIndex == 0) {
        $scope.tabActive = ["active","","","",""];  
        $scope.tabSelected = "new";
        $scope.loadReservaciones($scope.tabSelected, $scope.tabHideOlder);
      } else if (tabIndex == 1) {
        $scope.tabActive = ["","active","","",""];  
        $scope.tabSelected = "confirmed";
        $scope.loadReservaciones($scope.tabSelected, $scope.tabHideOlder);
      } else if (tabIndex == 2) {
        $scope.tabActive = ["","","active","",""];  
        $scope.tabSelected = "canceled";
        $scope.loadReservaciones($scope.tabSelected, $scope.tabHideOlder);
      } else if (tabIndex == 3) {
        $scope.tabActive = ["","","","active",""];  
        $scope.tabSelected = "waiting";
        $scope.loadEsperas();
      } else if (tabIndex == 4) {
        $scope.tabActive = ["","","","","active"];  
        $scope.tabSelected = "permanent";
        $scope.loadReservacionesPermanentes();
      }
    }
    $scope.cancelEspera = function(espera) {
      if( $window.confirm("Se cancelará la espera de la corrida con id [" + reservacion.id + "], ¿Desea continuar?")) {
        CancelarEspera.query({exId: espera.id}, function(res){
          if (res.success) {
            $scope.errMsg = null;
            $scope.loadEsperas();
          } else {
            $scope.errMsg = res.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          }
        }, function(err) {
          if (isValidToken(err, $window)) {
            console.log(err);
            $scope.errMsg = err.data.msg;
            $scope.sucMsg = null;  
          } else {
            ForceLogOut($window, $scope, $location, AuthenticationService);
          }
        });
      }      
    }

    $scope.tabActive = ["active","","",""];
    $scope.tabSelected = "new";
    $scope.tabHideOlder = true; 

    $scope.init($scope.tabSelected, $scope.tabHideOlder);    
  }]);
muukControllers.controller('UsuarioEsperaCtrl', ['$window', '$scope', '$location', 'AuthenticationService', 'Esperas', 'CancelarEspera',
  function($window, $scope, $location, AuthenticationService, Esperas, CancelarEspera) {

    $scope.loadEsperas = function() {
      LoadEsperas($window, $scope, $location, AuthenticationService, Esperas);
    }

    $scope.cancel = function(espera) {
      CancelarEspera.query({exId: espera.id}, function(res){
        if (res.success) {
          $scope.errMsg = null;
          $scope.loadEsperas();
        } else {
          $scope.errMsg = res.msg;
          if (DebugMode) {
            $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
          }
        }
      }, function(err) {
        if (isValidToken(err, $window)) {
          console.log(err);
          $scope.errMsg = err.data.msg;
          $scope.sucMsg = null;  
        } else {
          ForceLogOut($window, $scope, $location, AuthenticationService);
        }
      });      
    }

    $scope.loadEsperas();
  }]);
muukControllers.controller('UsuarioFavoritosCtrl', ['$window', '$scope', '$location', 'AuthenticationService', 'SessionService', 'UsuarioRuta', 'RutaFavorita', 'RutaOferta', 'RutaFavoritaAdd', 'RutaFavoritaRemove', 'RutaReservar', 'RutaReservarRecurrente', 'RutaEsperar', 'Mapa',
  function($window, $scope, $location, AuthenticationService, SessionService, UsuarioRuta, RutaFavorita, RutaOferta, RutaFavoritaAdd, RutaFavoritaRemove, RutaReservar, RutaReservarRecurrente, RutaEsperar, Mapa) {
    $scope.showFavoritos = false;
    LoadRutasXUsuario($window, $scope, $location, AuthenticationService, UsuarioRuta, RutaFavorita, SessionService.currentUser.id);
    $scope.orderProp = 'nombre';

    $scope.prepareResults = function(results) {
      // add folio
      for (var i = 0; i < results.length; i++) {
        // asignar folio si tiene reservacion o se encuentra en espera
        if (results[i].reservacion != null) {
          // con reservacion
          results[i].reservacion.folio = results[i].reservacion.id.toString();
          while (results[i].reservacion.folio.length < 6) {
            results[i].reservacion.folio = '0' + results[i].reservacion.folio;
          }
        } else if (results[i].espera != null) {
          // en espera
          results[i].espera.folio = results[i].espera.id.toString();
          while (results[i].espera.folio.length < 6) {
            results[i].espera.folio = '0' + results[i].espera.folio;
          }
        }
        
        var myDate = new Date(results[i].fechaOferta);
        var diaSemana = myDate.getDay();
        if (diaSemana == 1) {
          results[i].fecha = 'Lunes ';
        } else if (diaSemana == 2) {
          results[i].fecha = 'Martes ';
        } else if (diaSemana == 3) {
          results[i].fecha = 'Miércoles ';
        } else if (diaSemana == 4) {
          results[i].fecha = 'Jueves ';
        } else if (diaSemana == 5) {
          results[i].fecha = 'Viernes ';
        } else if (diaSemana == 6) {
          results[i].fecha = 'Sabado ';
        } else if (diaSemana == 0) {
          results[i].fecha = 'Domingo ';
        }
        results[i].fecha = results[i].fecha + '[' + myDate.getDate() + '/' + myDate.getMonth() + '/' + myDate.getFullYear() + ']';
      }

      return results;
    };
    $scope.favorito = function(ruta){
      if (ruta.isFavorite) {
        RutaFavoritaRemove.query({usrid: SessionService.currentUser.id, rutaid: ruta.id}, 
          function(res) {
            console.log(res);
            if (res.success) {
              $scope.errMsg = null;
              ruta.isFavorite = false;              
            } else {
              $scope.errMsg = res.msg;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }            
          }, function(err) {
            if (isValidToken(err, $window)) {
              console.log(err);
              $scope.errMsg = err.data.msg;
              $scope.sucMsg = null;  
            } else {
              ForceLogOut($window, $scope, $location, AuthenticationService);
            }
          }
        );
      } else {
        RutaFavoritaAdd.query({usrid: SessionService.currentUser.id, rutaid: ruta.id}, 
          function(res) {
            console.log(res);
            if (res.success) {
              $scope.errMsg = null;
              ruta.isFavorite = true;              
            } else {
              $scope.errMsg = res.msg;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }            
          }, function(err) {
            if (isValidToken(err, $window)) {
              console.log(err);
              $scope.errMsg = err.data.msg;
              $scope.sucMsg = null;  
            } else {
              ForceLogOut($window, $scope, $location, AuthenticationService);
            }
          }
        );
        /*        
        RutaFavoritaAdd.query({usrid: SessionService.currentUser.id, rutaid: ruta.id}, function(result) {
          console.log('agregado');
          ruta.isFavorite = true;
        });*/
      }   
    };
    $scope.filtraFavoritos = function() {
      if ($scope.showFavoritos == null) {
        $scope.showFavoritos = false;
      }
      $scope.showFavoritos = !$scope.showFavoritos;
      LoadRutasXUsuario($window, $scope, $location, AuthenticationService, UsuarioRuta, RutaFavorita, SessionService.currentUser.id);
      /*
      UsuarioRuta.query(function(results){
          var RutaList = RutaFavorita.query({usrid: SessionService.currentUser.id}, function(favoritos) {
          for (var i = 0; i < favoritos.length; i++) {
            for (var j = 0; j < results.length; j++) {
              console.log("filtrando " + results[j].id + '/' + favoritos[i].RutaId);
              results[j].isFavorite = (results[j].id == favoritos[i].RutaId);
              if (results[j].isFavorite) { break; }
            } 
          }
          if ($scope.showFavoritos) {
            // filtrar solo favoritos
            while ($scope.rutas.length > 0) {
              $scope.rutas.pop();
            }            
            for (var j = 0; j < results.length; j++) {
              if (results[j].isFavorite) {
                $scope.rutas.push(results[j]);
              }
            }
          } else {
            // mostrar todos
            $scope.rutas = results;
          }
        });

      });   */   
    };
    $scope.showCompraList = function(ruta){
      $scope.selRuta = ruta;

      console.log(ruta);
      RutaOferta.query({exId: ruta.id}, function(res){
        if (res.success) {
          console.log(res);
          $scope.errMsg = null;
          $scope.corridas = $scope.prepareResults(res.resultObject);
          console.log($scope.corridas);
          $('#myModal').modal({
            show: true
          });          
        } else {
          $scope.errMsg = res.msg;
          if (DebugMode) {
            $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
          }
        }
      }, function(err) {
        if (isValidToken(err, $window)) {
          console.log(err);
          $scope.errMsg = err.data.msg;
          $scope.sucMsg = null;  
        } else {
          ForceLogOut($window, $scope, $location, AuthenticationService);
        }
      });       
    };    
    $scope.reservar = function(corrida){
      if ($window.confirm('Se reservará la corrida con id [' + corrida.id + '], ¿Desea continuar?')) {
        $scope.errMsg = null;
        $scope.sucMsg = null;
        RutaReservar.query({exId: corrida.id}, function(res){
          if (res.success) {
            $scope.errMsg = null;
            $scope.sucMsg = "La reservación se realizó con éxito";
            //$window.alert($scope.sucMsg);
            RutaOferta.query({exId: corrida.RutaId}, function(result){
              if (result.success) {
                $scope.errMsg = null;
                console.log(result);
                $scope.corridas = $scope.prepareResults(result.resultObject);         
              } else {
                $scope.errMsg = result.msg;
                $scope.sucMsg = null;
                if (DebugMode) {
                  $scope.errMsg = $scope.errMsg + ' [' + result.msgCode + ']';
                }
              }
            }, function(err) {
              if (isValidToken(err, $window)) {
                console.log(err);
                $scope.errMsg = err.data.msg;
                $scope.sucMsg = null;  
              } else {
                ForceLogOut($window, $scope, $location, AuthenticationService);
              }
            });         
          } else {
            $scope.errMsg = res.msg;
            $scope.sucMsg = null;
          }
        }, function(err) {
          if (isValidToken(err, $window)) {
            console.log(err);
            $scope.errMsg = err.data.msg;
            $scope.sucMsg = null;  
          } else {
            ForceLogOut($window, $scope, $location, AuthenticationService);
          }
        }); 
      }
    };
    $scope.reservarRecurrente = function(corrida){
      if ($window.confirm('Se reservará de manera recurrente todos los días de la corrida con id [' + corrida.id + '], ¿Desea continuar?')) {
        $scope.errMsg = null;
        $scope.sucMsg = null;

        var ex = new RutaReservarRecurrente(corrida);          
        console.log(ex); 
        ex.$create({}, function(res){
          if (res.success) {
            $scope.sucMsg = "La reservación recurrente se realizó con éxito";
            RutaOferta.query({exId: corrida.RutaId}, function(result){
              if (result.success) {
                $scope.errMsg = null;
                console.log(result);
                $scope.corridas = $scope.prepareResults(result.resultObject);         
              } else {
                $scope.errMsg = result.msg;
                $scope.sucMsg = null;
                if (DebugMode) {
                  $scope.errMsg = $scope.errMsg + ' [' + result.msgCode + ']';
                }
              }
            }, function(err) {
              if (isValidToken(err, $window)) {
                console.log(err);
                $scope.errMsg = err.data.msg;
                $scope.sucMsg = null;  
              } else {
                ForceLogOut($window, $scope, $location, AuthenticationService);
              }
            });
          } else {
            $scope.errMsg = res.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          }
        }, function(err) {
          console.log('ERROR...');
          console.log(err);
          if (isValidToken(err, $window)) {
            console.log(err);
            $scope.errMsg = err.data.msg;
          } else {
            ForceLogOut($window, $scope, $location, AuthenticationService);
          }
        });
      }
    };
    $scope.esperar = function(corrida){
      if ($window.confirm('Se reservará la corrida con id [' + corrida.id + '], ¿Desea continuar?')) {
        $scope.errMsg = null;
        $scope.sucMsg = null;      
        RutaEsperar.query({exId: corrida.id}, function(res){
          if (res.success) {
            $scope.errMsg = null;
            $scope.sucMsg = "La espera se realizó con éxito";
            $window.alert($scope.sucMsg);          
            RutaOferta.query({exId: corrida.RutaId}, function(result){
              if (result.success) {
                $scope.errMsg = null;
                $scope.corridas = $scope.prepareResults(result.resultObject);         
              } else {
                $scope.errMsg = result.msg;
                if (DebugMode) {
                  $scope.errMsg = $scope.errMsg + ' [' + result.msgCode + ']';
                }
              }
            }, function(err) {
              if (isValidToken(err, $window)) {
                console.log(err);
                $scope.errMsg = err.data.msg;
                $scope.sucMsg = null;  
              } else {
                ForceLogOut($window, $scope, $location, AuthenticationService);
              }
            });          
                   
          } else {
            $scope.errMsg = res.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          }
        }, function(err) {
          if (isValidToken(err, $window)) {
            console.log(err);
            $scope.errMsg = err.data.msg;
            $scope.sucMsg = null;  
          } else {
            ForceLogOut($window, $scope, $location, AuthenticationService);
          }
        }); 
      } 
    };
    $scope.showMapa = function(ruta) {
      $scope.selRuta = ruta;
      idm = ruta.id;
      ShowMapa($window, $scope, $location, AuthenticationService, idm, Mapa);      
      $('#mapaModal').modal({
        show: true
      });          
    };
  }]);

// -----------------------------------------------------
/* Usuario - Rutas */
muukControllers.controller('UsuarioBuscarRutasCtrl', ['$window', '$scope', '$location', 'AuthenticationService', 'SessionService', 'RutaSugerida', 'RutaOferta', 'RutaReservar', 'RutaReservarRecurrente', 'RutaEsperar', 'RutaFavorita', 'RutaFavoritaAdd', 'RutaFavoritaRemove', 'Mapa',
  function($window, $scope, $location, AuthenticationService, SessionService, RutaSugerida, RutaOferta, RutaReservar, RutaReservarRecurrente, RutaEsperar, RutaFavorita, RutaFavoritaAdd, RutaFavoritaRemove, Mapa) {
    //$scope.PointCount = 0;
    $scope.mostrarSugerencias = false;
    $scope.puntoALat = 0;
    $scope.puntoALng = 0;
    $scope.puntoBLat = 0;
    $scope.puntoBLng = 0;
    $scope.rutasuggest = null;
    $scope.cargandorutas = false;
    creapuntos();
    $scope.rutas = null;
    $scope.orderProp = 'nombre';

    $scope.prepareResults = function(results) {
      // add folio
      for (var i = 0; i < results.length; i++) {
        // asignar folio si tiene reservacion o se encuentra en espera
        if (results[i].reservacion != null) {
          // con reservacion
          results[i].reservacion.folio = results[i].reservacion.id.toString();
          while (results[i].reservacion.folio.length < 6) {
            results[i].reservacion.folio = '0' + results[i].reservacion.folio;
          }
        } else if (results[i].espera != null) {
          // en espera
          results[i].espera.folio = results[i].espera.id.toString();
          while (results[i].espera.folio.length < 6) {
            results[i].espera.folio = '0' + results[i].espera.folio;
          }
        }
        
        var myDate = new Date(results[i].fechaOferta);
        var diaSemana = myDate.getDay();
        if (diaSemana == 1) {
          results[i].fecha = 'Lunes ';
        } else if (diaSemana == 2) {
          results[i].fecha = 'Martes ';
        } else if (diaSemana == 3) {
          results[i].fecha = 'Miércoles ';
        } else if (diaSemana == 4) {
          results[i].fecha = 'Jueves ';
        } else if (diaSemana == 5) {
          results[i].fecha = 'Viernes ';
        } else if (diaSemana == 6) {
          results[i].fecha = 'Sabado ';
        } else if (diaSemana == 0) {
          results[i].fecha = 'Domingo ';
        }
        results[i].fecha = results[i].fecha + '[' + myDate.getDate() + '/' + myDate.getMonth() + '/' + myDate.getFullYear() + ']';
      }

      return results;
    };
    $scope.showCompraList = function(sugerenciaSelected){
      $scope.sugSelected = sugerenciaSelected;

      console.log(sugerenciaSelected);
      RutaOferta.query({exId: sugerenciaSelected.ruta.id}, function(res){
        if (res.success) {
          console.log(res);
          $scope.errMsg = null;
          $scope.corridas = $scope.prepareResults(res.resultObject);
          console.log($scope.corridas);
          $('#myModal').modal({
            show: true
          });          
        } else {
          $scope.errMsg = res.msg;
          if (DebugMode) {
            $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
          }
        }
      }, function(err) {
        if (isValidToken(err, $window)) {
          console.log(err);
          $scope.errMsg = err.data.msg;
          $scope.sucMsg = null;  
        } else {
          ForceLogOut($window, $scope, $location, AuthenticationService);
        }
      });       
    };    
    $scope.reservar = function(corrida){
      if ($window.confirm('Se reservará la corrida con id [' + corrida.id + '], ¿Desea continuar?')) {
        $scope.errMsg = null;
        $scope.sucMsg = null;
        RutaReservar.query({exId: corrida.id}, function(res){
          if (res.success) {
            $scope.errMsg = null;
            $scope.sucMsg = "La reservación se realizó con éxito";
            //$window.alert($scope.sucMsg);
            RutaOferta.query({exId: corrida.RutaId}, function(result){
              if (result.success) {
                $scope.errMsg = null;
                console.log(result);
                $scope.corridas = $scope.prepareResults(result.resultObject);         
              } else {
                $scope.errMsg = result.msg;
                $scope.sucMsg = null;
                if (DebugMode) {
                  $scope.errMsg = $scope.errMsg + ' [' + result.msgCode + ']';
                }
              }
            }, function(err) {
              if (isValidToken(err, $window)) {
                console.log(err);
                $scope.errMsg = err.data.msg;
                $scope.sucMsg = null;  
              } else {
                ForceLogOut($window, $scope, $location, AuthenticationService);
              }
            });         
          } else {
            $scope.errMsg = res.msg;
            $scope.sucMsg = null;
          }
        }, function(err) {
          if (isValidToken(err, $window)) {
            console.log(err);
            $scope.errMsg = err.data.msg;
            $scope.sucMsg = null;  
          } else {
            ForceLogOut($window, $scope, $location, AuthenticationService);
          }
        }); 
      }
    };
    $scope.reservarRecurrente = function(corrida){
      if ($window.confirm('Se reservará de manera recurrente todos los días de la corrida con id [' + corrida.id + '], ¿Desea continuar?')) {
        $scope.errMsg = null;
        $scope.sucMsg = null;

        var ex = new RutaReservarRecurrente(corrida);          
        console.log(ex); 
        ex.$create({}, function(res){
          if (res.success) {
            $scope.sucMsg = "La reservación recurrente se realizó con éxito";
            RutaOferta.query({exId: corrida.RutaId}, function(result){
              if (result.success) {
                $scope.errMsg = null;
                console.log(result);
                $scope.corridas = $scope.prepareResults(result.resultObject);         
              } else {
                $scope.errMsg = result.msg;
                $scope.sucMsg = null;
                if (DebugMode) {
                  $scope.errMsg = $scope.errMsg + ' [' + result.msgCode + ']';
                }
              }
            }, function(err) {
              if (isValidToken(err, $window)) {
                console.log(err);
                $scope.errMsg = err.data.msg;
                $scope.sucMsg = null;  
              } else {
                ForceLogOut($window, $scope, $location, AuthenticationService);
              }
            });
          } else {
            $scope.errMsg = res.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          }
        }, function(err) {
          console.log('ERROR...');
          console.log(err);
          if (isValidToken(err, $window)) {
            console.log(err);
            $scope.errMsg = err.data.msg;
          } else {
            ForceLogOut($window, $scope, $location, AuthenticationService);
          }
        });
      }
    };
    $scope.esperar = function(corrida){
      if ($window.confirm('Se reservará la corrida con id [' + corrida.id + '], ¿Desea continuar?')) {
        $scope.errMsg = null;
        $scope.sucMsg = null;      
        RutaEsperar.query({exId: corrida.id}, function(res){
          if (res.success) {
            $scope.errMsg = null;
            $scope.sucMsg = "La espera se realizó con éxito";
            $window.alert($scope.sucMsg);          
            RutaOferta.query({exId: corrida.RutaId}, function(result){
              if (result.success) {
                $scope.errMsg = null;
                $scope.corridas = $scope.prepareResults(result.resultObject);         
              } else {
                $scope.errMsg = result.msg;
                if (DebugMode) {
                  $scope.errMsg = $scope.errMsg + ' [' + result.msgCode + ']';
                }
              }
            }, function(err) {
              if (isValidToken(err, $window)) {
                console.log(err);
                $scope.errMsg = err.data.msg;
                $scope.sucMsg = null;  
              } else {
                ForceLogOut($window, $scope, $location, AuthenticationService);
              }
            });          
                   
          } else {
            $scope.errMsg = res.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          }
        }, function(err) {
          if (isValidToken(err, $window)) {
            console.log(err);
            $scope.errMsg = err.data.msg;
            $scope.sucMsg = null;  
          } else {
            ForceLogOut($window, $scope, $location, AuthenticationService);
          }
        }); 
      } 
    };
    $scope.favorito = function(ruta){
      if (ruta.isFavorite) {
        RutaFavoritaRemove.query({usrid: SessionService.currentUser.id, rutaid: ruta.id}, 
          function(res) {
            console.log(res);
            if (res.success) {
              $scope.errMsg = null;
              ruta.isFavorite = false;              
            } else {
              $scope.errMsg = res.msg;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }            
          }, function(err) {
            if (isValidToken(err, $window)) {
              console.log(err);
              $scope.errMsg = err.data.msg;
              $scope.sucMsg = null;  
            } else {
              ForceLogOut($window, $scope, $location, AuthenticationService);
            }
          }
        );
      } else {
        RutaFavoritaAdd.query({usrid: SessionService.currentUser.id, rutaid: ruta.id}, 
          function(res) {
            console.log(res);
            if (res.success) {
              $scope.errMsg = null;
              ruta.isFavorite = true;              
            } else {
              $scope.errMsg = res.msg;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }            
          }, function(err) {
            if (isValidToken(err, $window)) {
              console.log(err);
              $scope.errMsg = err.data.msg;
              $scope.sucMsg = null;  
            } else {
              ForceLogOut($window, $scope, $location, AuthenticationService);
            }
          }
        );
      }   
    };    
    $scope.sugerir = function() {
      $scope.mostrarSugerencias = true;
      $scope.cargandorutas = true;
      $scope.puntoALat = $scope.OrigenLat;
      $scope.puntoALng = $scope.OrigenLng;
      $scope.puntoBLat = $scope.DestinoLat;
      $scope.puntoBLng = $scope.DestinoLng;
      
      RutaSugerida.query({puntoALat: $scope.puntoALat, puntoALng: $scope.puntoALng, puntoBLat: $scope.puntoBLat, puntoBLng: $scope.puntoBLng}, 
        function(res) {
          if (res.success) {
            $scope.errMsg = null;
            console.log(res[0]) 
            $scope.cargandorutas = false;
            $scope.rutasuggest = res.resultObject;

            RutaFavorita.query({usrid: SessionService.currentUser.id}, 
              function(favoritos) {
                for (var i = 0; i < favoritos.resultObject.length; i++) {
                  for (var j = 0; j < res.resultObject.length; j++) {
                    console.log("comparando " + res.resultObject[j].ruta.id + '/' + favoritos.resultObject[i].RutaId);
                    res.resultObject[j].ruta.isFavorite = (res.resultObject[j].ruta.id == favoritos.resultObject[i].RutaId);
                    if (res.resultObject[j].ruta.isFavorite) { break; }
                  } 
                }
                $scope.rutasuggest = res.resultObject;
                console.log(res);
                for (var index in $scope.rutasuggest) {
                  $scope.rutasuggest[index].rutanombre = $scope.rutasuggest[index].ruta.nombre;
                  $scope.rutasuggest[index].ascensoSugeridodescripcion = $scope.rutasuggest[index].ascensoSugerido.rutaPunto.descripcion;
                  $scope.rutasuggest[index].descensoSugeridodescripcio = $scope.rutasuggest[index].descensoSugerido.rutaPunto.descripcio;
                } 

              }
            );
           
          } else {
            $scope.errMsg = res.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          }  

        }, function(err) {
          if (isValidToken(err, $window)) {
            console.log(err);
            $scope.errMsg = err.data.msg;
            $scope.sucMsg = null;  
          } else {
            ForceLogOut($window, $scope, $location, AuthenticationService);
          }
        }
      );
    };    
    $scope.showMapa = function(ruta){
      ShowMapa($window, $scope, $location, AuthenticationService, ruta.id, Mapa);
    };

  }]);

// -----------------------------------------------------
/* Usuario - Estadisticas */
muukControllers.controller('UsuarioEstadisticasCtrl', ['$window', '$scope', '$location', 'AuthenticationService',
  function($window, $scope, $location, AuthenticationService) {

  }]);
// -----------------------------------------------------
/* Empresa - Comentarios */
muukControllers.controller('UsuarioComentariosCtrl', ['$window', '$scope', '$location', 'AuthenticationService', 'Comentarios',
  function($window, $scope, $location, AuthenticationService, Comentarios) {
    LoadComentarios($window, $scope, $location, AuthenticationService, Comentarios);

    $scope.comentar = function(comentario) {
      //var comment = {comentario: comentario};
      var ex = new Comentarios({comentario: comentario}, 
        function(res) {
          if (res.success) {
            $scope.errMsg = null;
          } else {
            $scope.errMsg = res.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          }
        }, function(err) {
          if (isValidToken(err, $window)) {
            console.log(err);
            $scope.errMsg = err.data.msg;
            $scope.sucMsg = null;  
          } else {
            ForceLogOut($window, $scope, $location, AuthenticationService);
          }
        }
      );   
      console.log(ex); 
      ex.$create({}, function(res){
        if (res.success) {
          $scope.errMsg = null;
          $scope.sucMsg = "El comentario se envió exitosamente"; 
          $window.alert($scope.sucMsg);
          $scope.comentario = '';
          /*
          $scope.menuActive = ["","active","","",""];
          $scope.submenuActive = ["active","","","",""];          
          $location.path('usuarioFavoritos');
          */
        } else {
          $scope.errMsg = res.msg;
          $scope.sucMsg = null;
          if (DebugMode) {
            $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
          }
        }
      }, function(err) {
        if (isValidToken(err, $window)) {
          console.log(err);
          $scope.errMsg = err.data.msg;
          $scope.sucMsg = null;  
        } else {
          ForceLogOut($window, $scope, $location, AuthenticationService);
        }
      });

    }
  }]);

// -----------------------------------------------------
/* MAPA */
var idm;
muukControllers.controller('MapaFormCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Mapa',
  function($window, $scope, $location, AuthenticationService, $routeParams, Mapa) {
    idm = $routeParams.id;
    ShowMapa($window, $scope, $location, AuthenticationService, idm, Mapa); 

    $scope.save = function(mapa) {  
      if($scope.user.role == 'EMPRESA'){
        SaveMapa($window, $scope, $location, AuthenticationService, mapa, Mapa, 'empresaRutaList'); 
      }else if($scope.user.role == 'ADMIN'){
        SaveMapa($window, $scope, $location, AuthenticationService, mapa, Mapa, 'embarqRutaList'); 
      }       
    }; 

    $scope.cancel = function(){
      console.log('MapaFormCtrl.cancel - goto(embarqRutaList)');
      $location.path('embarqRutaList');
    };  
  }]);
muukControllers.controller('EmbarqSolicitudMapaFormCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Mapa', 
  function($window, $scope, $location, AuthenticationService, $routeParams, Mapa) {
    idm = $routeParams.id;
    ShowMapa($window, $scope, $location, AuthenticationService, idm, Mapa);

    $scope.save = function(mapa) {
      if($scope.user.role == 'EMPRESA'){
        SaveMapa($window, $scope, $location, AuthenticationService, mapa, Mapa, 'empresaRutaList'); 
      }else if($scope.user.role == 'ADMIN'){
        SaveMapa($window, $scope, $location, AuthenticationService, mapa, Mapa, 'embarqRutaList'); 
      }  
    }; 

    $scope.cancel = function(){
      console.log('EmbarqSolicitudMapaFormCtrl.cancel - goto(embarqSolicitudRutaList)');
      $location.path('embarqSolicitudRutaList');
    };  
  }]);
muukControllers.controller('EmpresaMapaFormCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Mapa',
  function($window, $scope, $location, AuthenticationService, $routeParams, Mapa) {
    idm = $routeParams.id;
    ShowMapa($window, $scope, $location, AuthenticationService, idm, Mapa);

    $scope.save = function(mapa) {
      SaveMapa($window, $scope, $location, AuthenticationService, mapa, Mapa, 'empresaRutaList'); 
    }; 

    $scope.cancel = function(){
      console.log('EmpresaMapaFormCtrl.cancel - goto(empresaRutaList)');
      $location.path('empresaRutaList');
    };  
  }]);
muukControllers.controller('EmbarqMapaFormCtrl', ['$window', '$scope', '$location', 'AuthenticationService', '$routeParams', 'Mapa',
  function($window, $scope, $location, AuthenticationService, $routeParams, Mapa) {
    idm = $routeParams.id;
    ShowMapa($window, $scope, $location, AuthenticationService, idm, Mapa);

    $scope.save = function(mapa) {
      SaveMapa($window, $scope, $location, AuthenticationService, mapa, Mapa, 'embarqRutaList'); 
    }; 

    $scope.cancel = function(){
      console.log('EmbarqMapaFormCtrl.cancel - goto(embarqRutaList)');
      $location.path('embarqRutaList');
    };  
  }]);

  
