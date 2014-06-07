'use strict';

/* Controllers */

var muukControllers = angular.module('muukControllers', []);
var DebugMode = true;

muukControllers.controller('AppCtrl', ['$scope', '$location', '$window', 'SessionService',
  function($scope, $location, $window, SessionService) { 
    if(SessionService.currentUser != null){
      $scope.user = {authenticated: true, name: SessionService.currentUser.name, empresa: SessionService.currentUser.empresa, authtoken: SessionService.currentUser.token, role: SessionService.currentUser.role, id: SessionService.currentUser.id};    
    } 
    else{
      $scope.user = {authenticated: false, name: ''};   
      $scope.mainSection = 'login';
    }   

    $scope.gotoRegister = function() {
      // this should replace login with register form
      $scope.mainSection = 'register';
    };    

    $scope.gotoRegistro = function(exId) {
      // this should replace login with register form
      $scope.mainSection = 'register';
    };    

    $scope.gotoLogin = function() {
      // this should replace login with register form
      $scope.mainSection = 'login';
      $location.path('login');
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
        $scope.user.id = SessionService.currentUser.id;

        $location.path('redirect');        
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
muukControllers.controller('LoginForgotPassCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {  

  }]);
muukControllers.controller('LoginRegisterUserCtrl', ['$scope', 'EmpresaPreregister', '$location',
  function($scope, EmpresaPreregister, $location) {
    $scope.master = {};
    $scope.mainSection = 'register'; 

    $scope.update = function(empresa) {
      $scope.master = angular.copy(empresa);
    };

    $scope.reset = function() {
      $scope.empresa = angular.copy($scope.master);
    };

    $scope.save = function(empresa) { 
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
        console.log(err);
        $scope.empresas = null;
        $scope.errMsg = err.msg;
        if (DebugMode) {
          $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
        }
      });         
      console.log(ex);    

      ex.$create({}, function(res) {
        if (res.success) {
          $scope.errMsg = null;
          $scope.gotoLogin;
        } else {
          $scope.errMsg = res.msg;
          if (DebugMode) {
            $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
          }
        }
      }, function(err) {
        console.log(err);
        $scope.errMsg = err.msg;
        if (DebugMode) {
          $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
        }
      });       
    };
    
    $scope.cancel = function(){
      $scope.mainSection = 'login';
      $location.path('login');
    };
    
    $scope.reset();
  
  }]);
muukControllers.controller('LoginConfirmarRegistroCtrl', 
  ['$scope', '$routeParams', '$location', 'UsuarioRegistro', 'UsuarioAutorizar', 
  function($scope, $routeParams, $location, UsuarioRegistro, UsuarioAutorizar) {
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
        console.log(err);
        $scope.usuario = null;
        $scope.errMsg = err.msg;
        if (DebugMode) {
          $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
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
        console.log(err);
        $scope.errMsg = err.msg;
        if (DebugMode) {
          $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
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
                console.log(err);
                $scope.errMsg = err.msg;
                if (DebugMode) {
                  $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
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
          console.log(err);
          $scope.errMsg = err.msg;
          if (DebugMode) {
            $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
          }
      });       
    };
    
  }]);

// *****************************************************
/* EmbarQ  */
// *****************************************************
/* EmbarQ - Empresa */
function LoadEmpresasAutorizadas(EmpresasAutorizadas, $scope) {
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
    console.log(err);
    $scope.errMsg = err.msg;
    if (DebugMode) {
      $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
    }
  }); 
}
function LoadEmpresasNuevas(EmpresasNuevas, $scope) {
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
    console.log(err);
    $scope.errMsg = err.msg;
    if (DebugMode) {
      $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
    }
  }); 
}
function CreateEmpresa(empresa, EmpresaPreregister, $scope) {
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
    console.log(err);
    $scope.errMsg = err.msg;
    if (DebugMode) {
      $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
    }
  });   
  console.log(ex); 
  ex.$create({}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      $location.path('embarqEmpresaList');
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  });
}
function ShowEmpresa(empresaid, Empresa, $scope) {
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
      console.log(err);
      $scope.errMsg = err.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    });
}
function UpdateEmpresa(empresa, Empresa, $scope, $location, locationTo) {
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
    console.log(err);
    $scope.errMsg = err.msg;
    if (DebugMode) {
      $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
    }
  });   

  console.log(ex);    
  ex.$update({ exId: empresa.id }, function(res) {
    if (res.success) {
      $scope.errMsg = null;
      $location.path(locationTo);
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    console.log(err);
    $scope.errMsg = err.msg;
    if (DebugMode) {
      $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
    }
  });       
}
muukControllers.controller('EmbarqEmpresaListCtrl', 
  ['$scope', '$window', 'Empresa', 'EmpresasAutorizadas',
  function($scope, $window, Empresa, EmpresasAutorizadas) {
    LoadEmpresasAutorizadas(EmpresasAutorizadas, $scope);
    $scope.orderProp = 'nombre';

    $scope.deleteEmpresa = function (exId) {   
      if( $window.confirm("Se eliminará el registro con id [" + exId + "] ¿Continuar?")) {      
        Empresa.remove({ exId: exId },
          function(res){  
            if (res.success) {     
              LoadEmpresasAutorizadas(EmpresasAutorizadas, $scope);
            } else {
              $scope.errMsg = res.msg;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }
          }, function(err) {
            console.log(err);
            $scope.empresas = null;
            $scope.errMsg = err.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          }
        );
      }
    };  
    $scope.adminEmpresa = function (exId) {   
         
    };  

  }]); 
muukControllers.controller('EmbarqEmpresaPreregisterFormCtrl', ['$scope', 'EmpresaPreregister', '$location',
  function($scope, EmpresaPreregister, $location) {
    $scope.master = {};

    $scope.update = function(empresa) {
      $scope.master = angular.copy(empresa);
    };

    $scope.reset = function() {
      $scope.empresa = angular.copy($scope.master);
    };

    $scope.save = function(empresa) {
      CreateEmpresa(empresa, EmpresaPreregister, $scope);
    };
    
    $scope.cancel = function(){
      $location.path('embarqEmpresaList');
    };
    
    $scope.reset();
  
  }]);
muukControllers.controller('EmbarqEmpresaFormCtrl', ['$scope', 'EmpresaPreregister', '$location',
  function($scope, EmpresaPreregister, $location) {
    $scope.master = {};

    $scope.update = function(empresa) {
      $scope.master = angular.copy(empresa);
    };

    $scope.reset = function() {
      $scope.empresa = angular.copy($scope.master);
    };

    $scope.save = function(empresa) {
      CreateEmpresa(empresa, EmpresaPreregister, $scope);   
    };    
    
    $scope.cancel = function(){
      $location.path('embarqEmpresaList');
    };
    
    $scope.reset();

  }]);
muukControllers.controller('EmbarqEmpresaDetailCtrl', ['$scope', '$routeParams', 'Empresa', '$location',
  function($scope, $routeParams, Empresa, $location) {    
    ShowEmpresa($routeParams.id, Empresa, $scope);
    
    $scope.cancel = function(){
      $location.path('embarqEmpresaList');
    };    
  }]); 
muukControllers.controller('EmbarqEmpresaUpdateCtrl', ['$scope', '$routeParams', 'Empresa', '$location',
  function($scope, $routeParams, Empresa, $location) {
    ShowEmpresa($routeParams.id, Empresa, $scope);

    $scope.save = function(empresa) {
      UpdateEmpresa(empresa, Empresa, $scope, $location, 'embarqEmpresaList');
    };
    
    $scope.cancel = function(){
      $location.path('embarqEmpresaList');
    };
  }]);

// -----------------------------------------------------
/* EmbarQ - Solicitud de Empresa */
muukControllers.controller('EmbarqSolicitudEmpresaShowCtrl', ['$scope', '$routeParams', 'Empresa', '$location',
  function($scope, $routeParams, Empresa, $location) {    
    ShowEmpresa($routeParams.id, Empresa, $scope);
    
    $scope.cancel = function(){
      $location.path('embarqSolicitudEmpresaList');
    };    
  }]); 
muukControllers.controller('EmbarqSolicitudEmpresaUpdateCtrl', ['$scope', '$routeParams', 'Empresa', '$location',
  function($scope, $routeParams, Empresa, $location) {
    ShowEmpresa($routeParams.id, Empresa, $scope);

    $scope.save = function(empresa) {
      UpdateEmpresa(empresa, Empresa, $scope, $location, 'embarqSolicitudEmpresaList');
    };
    
    $scope.cancel = function(){
      $location.path('embarqSolicitudEmpresaList');
    };
  }]);
muukControllers.controller('EmbarqSolicitudEmpresaListCtrl', ['$scope', '$window', 'EmpresasNuevas', 'EmpresaAutorizar', 'EmpresaRechazar',
  function($scope, $window, EmpresasNuevas, EmpresaAutorizar, EmpresaRechazar) {
    LoadEmpresasNuevas(EmpresasNuevas, $scope);
    $scope.orderProp = 'nombre';

  $scope.rechazarEmpresa = function (exId) {   
    if( $window.confirm("Se rechazará la solicitud con id [" + exId + "], ¿Desea continuar?")) {      
      EmpresaRechazar.reject({ exId: exId },
        function(res){       
          if (res.success) {
            $scope.errMsg = null;
            LoadEmpresasNuevas(EmpresasNuevas, $scope);
          } else {
            $scope.errMsg = res.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          }          
        }, function(err) {
          console.log(err);
          $scope.errMsg = err.msg;
          if (DebugMode) {
            $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
          }
        }
      );
    }
  };
  $scope.autorizarEmpresa = function (exId) {
    if( $window.confirm("Se autorizará la solicitud con id [" + exId + "], ¿Desea continuar?")) {
      EmpresaAutorizar.reject({ exId: exId },
        function(res){       
          if (res.success) {
            $scope.errMsg = null;
            LoadEmpresasNuevas(EmpresasNuevas, $scope);
          } else {
            $scope.errMsg = res.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          }          
        }, function(err) {
          console.log(err);
          $scope.errMsg = err.msg;
          if (DebugMode) {
            $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
          }
        }
      );
    }
  };      

  }]);

// -----------------------------------------------------
/* EmbarQ - Ruta */
function LoadRutasAutorizadas(RutasAutorizadas, $scope) {
  RutasAutorizadas.query({}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      $scope.rutas = res.resultObject;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    console.log(err);
    $scope.errMsg = err.msg;
    if (DebugMode) {
      $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
    }
  }); 
}
function LoadRutasCompartidas(RutaCompartidaList, $scope) {
  RutaCompartidaList.query({}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      $scope.rutas = res.resultObject;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    console.log(err);
    $scope.errMsg = err.msg;
    if (DebugMode) {
      $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
    }
  }); 
}
function LoadRutasNuevas(RutasNuevas, $scope) {
  RutasNuevas.query({}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      $scope.rutas = res.resultObject;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    console.log(err);
    $scope.errMsg = err.msg;
    if (DebugMode) {
      $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
    }
  }); 
}
function LoadRuta(rutaid, Ruta, $scope) {
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
    console.log(err);
    $scope.errMsg = err.msg;
    if (DebugMode) {
      $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
    }
  }); 
}
function CreateRuta(ruta, Ruta, $scope, $location, locationTo) {
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
    console.log(err);
    $scope.errMsg = err.msg;
    if (DebugMode) {
      $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
    }
  });   
  console.log(ex); 
  ex.$create({}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      $location.path(locationTo);
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  });
}
function UpdateRuta(ruta, Ruta, $scope, $location, locationTo) {
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
    console.log(err);
    $scope.errMsg = err.msg;
    if (DebugMode) {
      $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
    }
  });   

  console.log(ex);    
  ex.$update({ exId: ruta.id }, function(res) {
    if (res.success) {
      $scope.errMsg = null;
      $location.path(locationTo);
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    console.log(err);
    $scope.errMsg = err.msg;
    if (DebugMode) {
      $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
    }
  });       
}
muukControllers.controller('EmbarqRutaListCtrl', ['$scope', '$window', 'Ruta', 'RutasAutorizadas', 'RutaCompartir', 'EmpresasAutorizadas',
  function($scope, $window, Ruta, RutasAutorizadas, RutaCompartir, EmpresasAutorizadas) {
    LoadRutasAutorizadas(RutasAutorizadas, $scope);
    $scope.orderProp = 'nombre';
    $scope.RutaSelected = null;

    $scope.deleteRuta = function (exId) {
      if( $window.confirm("Se eliminará la ruta con id [" + exId + "], ¿Desea continuar?")) {
        Ruta.remove({ exId: exId },
          function(res){
            if (res.success) {
              $scope.errMsg = null;
              LoadRutasAutorizadas(RutasAutorizadas, $scope);
            } else {
              $scope.errMsg = res.msg;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }  
          }, function(err) {
            console.log(err);
            $scope.errMsg = err.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          }
        );
      }
    };
    $scope.showCompartirRuta = function (ruta) {
      $scope.RutaSelected = ruta;
      LoadEmpresasAutorizadas(EmpresasAutorizadas, $scope);
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
            LoadRutasAutorizadas(RutasAutorizadas, $scope);
          } else {
            $scope.errMsg = res.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          }          
        }, function(err) {
          console.log(err);
          $scope.errMsg = err.msg;
          if (DebugMode) {
            $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
          }
        }       
      );
    };  

  }]);
muukControllers.controller('EmbarqRutaFormCtrl', ['$scope', 'Ruta', '$location', 'SessionService',
  function($scope, Ruta, $location, SessionService) {
  $scope.master = {};

  $scope.update = function(ruta) {
    $scope.master = angular.copy(ruta);
  };

  $scope.reset = function() {
    $scope.ruta = angular.copy($scope.master);
    $scope.ruta.CompanyownerID = SessionService.currentUser.empresa;
  };

  $scope.save = function(ruta) {
    CreateRuta(ruta, Ruta, $scope, $location, 'embarqRutaList');
  };

  $scope.cancel = function(){
    $location.path('embarqRutaList');
  };

  $scope.reset();

  }]);
muukControllers.controller('EmbarqRutaDetailCtrl', ['$scope', '$routeParams', 'Ruta', '$location',
  function($scope, $routeParams, Ruta, $location) {
    LoadRuta($routeParams.id, Ruta, $scope);

    $scope.cancel = function(){
      $location.path('embarqRutaList');
    };
  }]);
// TODO EmbarqRutaUpdateCtrl
muukControllers.controller('EmbarqRutaUpdateCtrl', ['$scope', '$routeParams', 'Ruta', '$location',
  function($scope, $routeParams, Ruta, $location) {
    LoadRuta($routeParams.id, Ruta, $scope);

    $scope.save = function(ruta) {
      UpdateRuta(ruta, Ruta, $scope, $location, 'embarqRutaList');
    };

    $scope.cancel = function(){
      $location.path('embarqRutaList');
    };
  }]);

// -----------------------------------------------------
/* EmbarQ - Ruta */
muukControllers.controller('EmbarqRutaCompartidaListCtrl', ['$scope', '$window', 'RutaCompartida', 'RutaCompartidaList',
  function($scope, $window, RutaCompartida, RutaCompartidaList) {
    LoadRutasCompartidas(RutaCompartidaList, $scope);
    $scope.orderProp = 'nombre';

    $scope.deleteRutaCompartida = function (exId) {
      if( $window.confirm("Se eliminará la ruta compartida con id [" + exId + "], ¿Desea continuar?")) {
        RutaCompartida.remove({ exId: exId },
          function(res){
            if (res.success) {
              $scope.errMsg = null;
              LoadRutasCompartidas(RutaCompartidaList, $scope);
            } else {
              $scope.errMsg = res.msg;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }  
          }, function(err) {
            console.log(err);
            $scope.errMsg = err.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          }
        );        
      }
    };

  }]);
  // -----------------------------------------------------
/* EmbarQ - Corrida */
function LoadCorridasXRuta(CorridaXRuta, rutaid, $scope) {
  CorridaXRuta.query({exId: rutaid}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      $scope.corridas = res.resultObject;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    console.log(err);
    $scope.errMsg = err.msg;
    if (DebugMode) {
      $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
    }
  }); 
}
function LoadCorrida(Corrida, rutaid, $scope) {
  Corrida.show({exId: rutaid}, function(res){
    console.log(res);
    if (res.success) {
      $scope.errMsg = null;
      $scope.corrida = res.resultObject;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    console.log(err);
    $scope.errMsg = err.msg;
    if (DebugMode) {
      $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
    }
  }); 
}
function UpdateRuta(ruta, Ruta, $scope, $location, locationTo) {
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
    console.log(err);
    $scope.errMsg = err.msg;
    if (DebugMode) {
      $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
    }
  });   

  console.log(ex);    
  ex.$update({ exId: ruta.id }, function(res) {
    if (res.success) {
      $scope.errMsg = null;
      $location.path(locationTo);
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    console.log(err);
    $scope.errMsg = err.msg;
    if (DebugMode) {
      $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
    }
  });       
}
muukControllers.controller('EmbarqCorridaListCtrl', ['$scope', '$window', '$routeParams', '$location', 'Corrida', 'CorridaXRuta',
  function($scope, $window, $routeParams, $location, Corrida, CorridaXRuta) {
    $scope.rutaid = $routeParams.id;
    LoadCorridasXRuta(CorridaXRuta, $routeParams.id, $scope);
    $scope.orderProp = 'nombre';

    $scope.deleteCorrida = function (exId) {
      if( $window.confirm("Se eliminará la corrida con id [" + exId + "], ¿Desea continuar?")) {
        Corrida.remove({ exId: exId },
          function(res){
            if (res.success) {
              $scope.errMsg = null;
              LoadCorridasXRuta(CorridaXRuta, $routeParams.id, $scope);
            } else {
              $scope.errMsg = res.msg;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }  
          }, function(err) {
            console.log(err);
            $scope.errMsg = err.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          }
        );        
      }
    };
    $scope.cancel = function(){
      $location.path('embarqRutaList');
    };
    
  }]);
muukControllers.controller('EmbarqCorridaDetailCtrl', ['$scope', '$routeParams', 'Corrida', '$location',
  function($scope, $routeParams, Corrida, $location) {
    $scope.rutaid = $routeParams.id;
    LoadCorrida(Corrida, $routeParams.id, $scope);

    $scope.cancel = function(){
      $location.path('embarqCorridaList/' + $scope.rutaid);
    };
  }]);

// -----------------------------------------------------
/* EmbarQ - Solicitud Corrida */
muukControllers.controller('EmbarqSolicitudCorridaListCtrl', ['$scope', '$window', '$routeParams', '$location', 'Corrida', 'CorridaXRuta',
  function($scope, $window, $routeParams, $location, Corrida, CorridaXRuta) {
    $scope.rutaid = $routeParams.id;
    LoadCorridasXRuta(CorridaXRuta, $routeParams.id, $scope);
    $scope.orderProp = 'nombre';

    $scope.deleteCorrida = function (exId) {
      if( $window.confirm("Se eliminará la corrida con id [" + exId + "], ¿Desea continuar?")) {
        Corrida.remove({ exId: exId },
          function(res){
            if (res.success) {
              $scope.errMsg = null;
              LoadCorridasXRuta(CorridaXRuta, $routeParams.id, $scope);
            } else {
              $scope.errMsg = res.msg;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }  
          }, function(err) {
            console.log(err);
            $scope.errMsg = err.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          }
        );        
      }
    };
    $scope.cancel = function(){
      $location.path('embarqSolicitudRutaList');
    };
  }]);
muukControllers.controller('EmbarqSolicitudCorridaDetailCtrl', ['$scope', '$routeParams', 'Corrida', '$location',
  function($scope, $routeParams, Corrida, $location) {
    $scope.rutaid = $routeParams.id;
    LoadCorrida(Corrida, $routeParams.id, $scope);

    $scope.cancel = function(){
      $location.path('embarqSolicitudCorridaList/' + $scope.rutaid);
    };
  }]);
// -----------------------------------------------------
/* EmbarQ - Solicitud de Ruta */
muukControllers.controller('EmbarqSolicitudRutaShowCtrl', ['$scope', '$routeParams', 'Ruta', '$location',
  function($scope, $routeParams, Ruta, $location) {
    LoadRuta($routeParams.id, Ruta, $scope);

    $scope.cancel = function(){
      $location.path('embarqSolicitudRutaList');
    };
  }]);
muukControllers.controller('EmbarqSolicitudRutaUpdateCtrl', ['$scope', '$routeParams', 'Ruta', '$location',
  function($scope, $routeParams, Ruta, $location) {
    LoadRuta($routeParams.id, Ruta, $scope);

    $scope.save = function(ruta) {
      UpdateRuta(ruta, Ruta, $scope, $location, 'embarqSolicitudRutaList');
    };

    $scope.cancel = function(){
      $location.path('embarqSolicitudRutaList');
    };
  }]);
muukControllers.controller('EmbarqSolicitudRutaListCtrl', ['$scope', '$window', 'RutasNuevas', 'RutaAutorizar', 'RutaRechazar',
  function($scope, $window, RutasNuevas, RutaAutorizar, RutaRechazar) {
    LoadRutasNuevas(RutasNuevas, $scope);
    $scope.orderProp = 'nombre';

    $scope.rechazarRuta = function (exId) {   
      if( $window.confirm("Se rechazará la ruta con id [" + exId + "], ¿Desea continuar?")) {  
        RutaRechazar.reject({ exId: exId },
          function(res){
            if (res.success) {
              $scope.errMsg = null;
              LoadRutasNuevas(RutasNuevas, $scope);
            } else {
              $scope.errMsg = res.msg;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }  
          }, function(err) {
            console.log(err);
            $scope.errMsg = err.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
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
              LoadRutasNuevas(RutasNuevas, $scope);
            } else {
              $scope.errMsg = res.msg;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }  
          }, function(err) {
            console.log(err);
            $scope.errMsg = err.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
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
function LoadEmpresa(Empresa, empresaid, $scope) {
  Empresa.query({exId: empresaid}, function(res){
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
    console.log(err);
    $scope.errMsg = err.msg;
    if (DebugMode) {
      $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
    }
  }); 
}
muukControllers.controller('EmpresaPerfilShowCtrl', ['$scope', '$location', 'SessionService', 'AuthenticationService', 'Empresa',
  function($scope, $location, SessionService, AuthenticationService, Empresa) {
    LoadEmpresa(Empresa, SessionService.currentUser.empresa, $scope);

  }]);
muukControllers.controller('EmpresaPerfilEditCtrl', ['$scope', '$location', 'SessionService', 'AuthenticationService', 'Empresa',
  function($scope, $location, SessionService, AuthenticationService, Empresa) {
    LoadEmpresa(Empresa, SessionService.currentUser.empresa, $scope);

    $scope.save = function(empresa) {
      UpdateEmpresa(empresa, Empresa, $scope, $location, 'empresaPerfilShow');
    };

    $scope.cancel = function(){
      $location.path('empresaPerfilShow');
    };

  }]);

// -----------------------------------------------------
/* Empresa - Usuarios */
function LoadUsuariosAutorizadosXEmpresa(UsuariosAutorizadosXEmpresa, $scope) {
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
    console.log(err);
    $scope.errMsg = err.msg;
    if (DebugMode) {
      $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
    }
  }); 
}
function LoadUsuariosNuevosXEmpresa(UsuariosNuevosXEmpresa, $scope) {
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
    console.log(err);
    $scope.errMsg = err.msg;
    if (DebugMode) {
      $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
    }
  }); 
}
function LoadUsuario(usuarioid, Usuario, $scope) {
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
    console.log(err);
    $scope.errMsg = err.msg;
    if (DebugMode) {
      $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
    }
  });  
}
function CreateUsuarioPreregister(usuario, UsuarioPreregister, $scope, $location, locationTo) {
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
    console.log(err);
    $scope.errMsg = err.msg;
    if (DebugMode) {
      $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
    }
  });   
  console.log(ex); 
  ex.$create({}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      $location.path(locationTo);
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  });
}
function UpdateUsuario(usuario, Usuario, $scope, $location, locationTo) {
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
    console.log(err);
    $scope.errMsg = err.msg;
    if (DebugMode) {
      $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
    }
  });   

  console.log(ex);    
  ex.$update({ exId: usuario.id }, function(res) {
    if (res.success) {
      $scope.errMsg = null;
      $location.path(locationTo);
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    console.log(err);
    $scope.errMsg = err.msg;
    if (DebugMode) {
      $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
    }
  });       
}
muukControllers.controller('EmpresaUsuarioListCtrl', ['$scope', '$window', 'Usuario', 'UsuariosAutorizadosXEmpresa',
  function($scope, $window, Usuario, UsuariosAutorizadosXEmpresa) {
    LoadUsuariosAutorizadosXEmpresa(UsuariosAutorizadosXEmpresa, $scope);
    $scope.orderProp = 'nombre';

    $scope.deleteUsuario = function (exId) {
      if( $window.confirm("Se eliminará el usuario con id [" + exId + "] ¿Continuar?")) {
        Usuario.remove({ exId: exId },
          function(res){
            if (res.success) {
              $scope.errMsg = null;
              LoadUsuariosAutorizadosXEmpresa(UsuariosAutorizadosXEmpresa, $scope);
            } else {
              $scope.errMsg = res.msg;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }  
          }, function(err) {
            console.log(err);
            $scope.errMsg = err.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          }
        ); 
      }
    };

  }]);
muukControllers.controller('EmpresaUsuarioFormCtrl', ['$scope', 'UsuarioPreregister', '$location',
  function($scope, UsuarioPreregister, $location) {
    $scope.master = {};

    $scope.update = function(usuario) {
      $scope.master = angular.copy(usuario);
    };

    $scope.reset = function() {
      $scope.usuario = angular.copy($scope.master);
    };

    $scope.save = function(usuario) {
      CreateUsuarioPreregister(usuario, UsuarioPreregister, $scope, $location, 'empresaUsuarioList');
    };

    $scope.cancel = function(){
      $location.path('empresaUsuarioList');
    };

    $scope.reset();

  }]);
muukControllers.controller('EmpresaUsuarioShowCtrl', ['$scope', '$routeParams', 'Usuario', '$location',
  function($scope, $routeParams, Usuario, $location) {
    LoadUsuario($routeParams.id, Usuario, $scope);
    
    $scope.cancel = function(){
      $location.path('empresaUsuarioList');
    };
  }]);
muukControllers.controller('EmpresaUsuarioEditCtrl', ['$scope', '$routeParams', 'Usuario', '$location',
  function($scope, $routeParams, Usuario, $location) {
    LoadUsuario($routeParams.id, Usuario, $scope);

    $scope.save = function(usuario) {
      UpdateUsuario(usuario, Usuario, $scope, $location, 'empresaUsuarioList');      
    };
    
    $scope.cancel = function(){
      $location.path('empresaUsuarioList');
    };
  }]);

muukControllers.controller('EmpresaMultiUsuarioNewCtrl', ['$scope', '$window', 'UsuarioPreregister', '$location', 'SessionService',
  function($scope, $window, UsuarioPreregister, $location, SessionService) {

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
            CreateUsuarioPreregister(usuario, UsuarioPreregister, $scope, $location, ''); 
            created = created + 1;
          }
        }
      }  // end for
      
      if (message == "") {
        $window.alert("Se invitaron a " + created.toString() + "/" + UserObj.length + " usuarios." );
        $location.path('empresaUsuarioList');
      } else {
        $scope.usuarios = message;
        $window.alert("Se invitaron a " + created.toString() + "/" + UserObj.length + " usuarios. Favor de verificar los datos de usuarios sobrantes." );
        $location.path('empresaMultiUsuarioNew');
      }

    };

    $scope.cancel = function(){
      $location.path('empresaUsuarioList');
    };

    $scope.reset();
    
    function validateEmail(email) { 
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    }

  }]);

// -----------------------------------------------------
/* Empresa - Solicitud de usuarios */
muukControllers.controller('EmpresaSolicitudUsuarioListCtrl', ['$scope', '$window', 'Usuario', 'UsuariosNuevosXEmpresa',
  function($scope, $window, Usuario, UsuariosNuevosXEmpresa) {
    LoadUsuariosNuevosXEmpresa(UsuariosNuevosXEmpresa, $scope);
    $scope.orderProp = 'nombre';

    $scope.deleteUsuario = function (exId) {
      if( $window.confirm("Se eliminará el usuario con id [" + exId + "] ¿Continuar?")) {
        Usuario.remove({ exId: exId },
          function(res){
            if (res.success) {
              $scope.errMsg = null;
              LoadUsuariosNuevosXEmpresa(UsuariosNuevosXEmpresa, $scope);
            } else {
              $scope.errMsg = res.msg;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }  
          }, function(err) {
            console.log(err);
            $scope.errMsg = err.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          }
        );
      }
    };  

  }]);
muukControllers.controller('EmpresaSolicitudUsuarioShowCtrl', ['$scope', '$routeParams', 'Usuario', '$location',
  function($scope, $routeParams, Usuario, $location) {    
    LoadUsuario($routeParams.id, Usuario, $scope);
    
    $scope.cancel = function(){
      $location.path('empresaSolicitudUsuarioList');
    };
  }]);
muukControllers.controller('EmpresaSolicitudUsuarioEditCtrl', ['$scope', '$routeParams', 'Usuario', '$location',
  function($scope, $routeParams, Usuario, $location) {
    LoadUsuario($routeParams.id, Usuario, $scope);

    $scope.save = function(usuario) {
      UpdateUsuario(usuario, Usuario, $scope, $location, 'empresaSolicitudUsuarioList'); 
    };

    $scope.cancel = function(){
      $location.path('empresaSolicitudUsuarioList');
    };
  }]);

// -----------------------------------------------------
/* Empresa - Rutas */
function LoadRutasXEmpresa(RutaXEmpresa, $scope) {
  RutaXEmpresa.query({}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      $scope.rutas = res.resultObject;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    console.log(err);
    $scope.errMsg = err.msg;
    if (DebugMode) {
      $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
    }
  }); 
}
muukControllers.controller('EmpresaRutaListCtrl', ['$scope', '$window', 'Ruta', 'RutaXEmpresa', 
  function($scope, $window, Ruta, RutaXEmpresa) {
    LoadRutasXEmpresa(RutaXEmpresa, $scope);
    $scope.orderProp = 'nombre';

    $scope.deleteRuta = function (exId) {
      if( $window.confirm("Se eliminará la ruta con id [" + exId + "], ¿Desea continuar?")) {
        Ruta.remove({ exId: exId },
          function(res){
            if (res.success) {
              $scope.errMsg = null;
              LoadRutasXEmpresa(RutaXEmpresa, $scope);
            } else {
              $scope.errMsg = res.msg;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }  
          }, function(err) {
            console.log(err);
            $scope.errMsg = err.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          }
        );
      }
    };

  }]);
muukControllers.controller('EmpresaRutaFormCtrl', ['$scope', 'Ruta', '$location', 'SessionService',
  function($scope, Ruta, $location, SessionService) {
    $scope.master = {};
    $scope.user.empresa = SessionService.currentUser.empresa;

    $scope.update = function(ruta) {
      $scope.master = angular.copy(ruta);
    };

    $scope.reset = function() {
      $scope.ruta = angular.copy($scope.master);
      $scope.ruta.CompanyownerID = SessionService.currentUser.empresa;
      $scope.ruta.diasofertafuturo = 7; // TODO: aceptar cambio de dias futuros
    };

    $scope.save = function(ruta) {
      CreateRuta(ruta, Ruta, $scope, $location, 'empresaRutaList');
    };

    $scope.cancel = function(){
      $location.path('empresaRutaList');
    };

    $scope.reset();
  }]);
muukControllers.controller('EmpresaRutaShowCtrl', ['$scope', '$routeParams', 'Ruta', '$location',
  function($scope, $routeParams, Ruta, $location) {
    LoadRuta($routeParams.id, Ruta, $scope);

    $scope.cancel = function(){
      $location.path('empresaRutaList');
    };
  }]);
muukControllers.controller('EmpresaRutaEditCtrl', ['$scope', '$routeParams', 'Ruta', '$location',
  function($scope, $routeParams, Ruta, $location) {
    LoadRuta($routeParams.id, Ruta, $scope);

    $scope.save = function(ruta) {
      UpdateRuta(ruta, Ruta, $scope, $location, 'empresaRutaList');
    };

    $scope.cancel = function(){
      $location.path('empresaRutaList');
    };
  }]);

// -----------------------------------------------------
/* Empresa - Corrida */
function CreateCorrida(corrida, Corrida, $scope, $location, locationTo) {
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
    console.log(err);
    $scope.errMsg = err.msg;
    if (DebugMode) {
      $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
    }
  });   
  console.log(ex); 
  ex.$create({}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      $location.path(locationTo);
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  });
}
function UpdateCorrida(corrida, Corrida, $scope, $location, locationTo) {
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
    console.log(err);
    $scope.errMsg = err.msg;
    if (DebugMode) {
      $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
    }
  });   

  console.log(ex);    
  ex.$update({ exId: corrida.id }, function(res) {
    if (res.success) {
      $scope.errMsg = null;
      $location.path(locationTo);
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    console.log(err);
    $scope.errMsg = err.msg;
    if (DebugMode) {
      $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
    }
  });       
}
muukControllers.controller('EmpresaCorridaListCtrl', ['$scope', '$window', '$location', '$routeParams', 'Corrida', 'CorridaXRuta', 'OfertaGenerar',
  function($scope, $window, $location, $routeParams, Corrida, CorridaXRuta, OfertaGenerar) {
    $scope.rutaid = $routeParams.id;
    LoadCorridasXRuta(CorridaXRuta, $routeParams.id, $scope);
    $scope.orderProp = 'nombre';

    $scope.deleteCorrida = function (exId) {
      if( $window.confirm("Se eliminará la corrida con id [" + exId + "], ¿Desea continuar?")) {
        Corrida.remove({ exId: exId },
          function(res){
            if (res.success) {
              $scope.errMsg = null;
              LoadCorridasXRuta(CorridaXRuta, $routeParams.id, $scope);
            } else {
              $scope.errMsg = res.msg;
              if (DebugMode) {
                $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
              }
            }  
          }, function(err) {
            console.log(err);
            $scope.errMsg = err.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          }
        ); 
      }
    };
    $scope.cancel = function(){
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
            console.log(err);
            $scope.errMsg = err.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          }
        );
    };

  }]);
muukControllers.controller('EmpresaCorridaFormCtrl', ['$scope', '$window', 'Corrida', '$location', '$routeParams',
  function($scope, $window, Corrida, $location, $routeParams) {
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
      CreateCorrida(corrida, Corrida, $scope, $location, 'empresaCorridaList/' + $scope.corrida.RutaId);
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
muukControllers.controller('EmpresaCorridaShowCtrl', ['$scope', '$routeParams', 'Corrida', '$location',
  function($scope, $routeParams, Corrida, $location) {
    LoadCorrida(Corrida, $routeParams.id, $scope);

    $scope.cancel = function(){
      $location.path('empresaCorridaList/' + $scope.corrida.RutaId);
    };
  }]);
muukControllers.controller('EmpresaCorridaEditCtrl', ['$scope', '$routeParams', 'Corrida', '$location',
  function($scope, $routeParams, Corrida, $location) {
    LoadCorrida(Corrida, $routeParams.id, $scope);

    $scope.save = function(corrida) {
      UpdateCorrida(corrida, Corrida, $scope, $location, 'empresaCorridaList/' + $scope.corrida.RutaId);
      /*
      var ex = new Corrida(corrida);
      console.log(ex);
      ex.$update({ exId: corrida.id }, function(){$location.path('empresaCorridaList/' + $scope.corrida.RutaId);});*/
    };

    $scope.cancel = function(){
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
muukControllers.controller('EmpresaRutasCompartidasCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {

  }]);

// -----------------------------------------------------
/* Empresa - Comentarios */
muukControllers.controller('EmpresaComentariosCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {

  }]);

// -----------------------------------------------------
/* Empresa - Estadisticas */
muukControllers.controller('EmpresaEstadisticasCtrl', ['$scope', '$location',
  function($scope, $location) {

  }]);

// *****************************************************
/* Usuario  */
// *****************************************************
/* Usuario - Perfil */
muukControllers.controller('UsuarioPerfilShowCtrl', ['$scope', '$location', 'SessionService', 'AuthenticationService', 'Usuario',
  function($scope, $location, SessionService, AuthenticationService, Usuario) {
    LoadUsuario(SessionService.currentUser.id, Usuario, $scope);
  }]);
muukControllers.controller('UsuarioPerfilEditCtrl', ['$scope', '$location', 'SessionService', 'AuthenticationService', 'Usuario',
  function($scope, $location, SessionService, AuthenticationService, Usuario) {
    LoadUsuario(SessionService.currentUser.id, Usuario, $scope);

    $scope.save = function(usuario) {
      UpdateUsuario(usuario, Usuario, $scope, $location, 'usuarioPerfilShow');
    };

    $scope.cancel = function(){
      $location.path('usuarioPerfilShow');
    };
  }]);

// -----------------------------------------------------
/* Usuario - Consultas */
function LoadReservaciones(Reservaciones, estatus, vigente, $scope) {
  Reservaciones.query({estatus: estatus, vigente: vigente}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      // fill folio
      for (var i = 0; i < res.resultObject.length; i++) {
        res.resultObject[i].folio = res.resultObject[i].id.toString();
        while (res.resultObject[i].folio.length < 6) {
          res.resultObject[i].folio = '0' + res.resultObject[i].folio;
        }
      }      
      $scope.reservaciones = res.resultObject;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    console.log(err);
    $scope.errMsg = err.msg;
    if (DebugMode) {
      $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
    }
  }); 
}
function LoadEsperas(Esperas, $scope) {
  Esperas.query({ }, function(res){
    if (res.success) {
      $scope.errMsg = null;
      // fill folio
      for (var i = 0; i < res.resultObject.length; i++) {
        res.resultObject[i].folio = res.resultObject[i].id.toString();
        while (res.resultObject[i].folio.length < 6) {
          res.resultObject[i].folio = '0' + res.resultObject[i].folio;
        }
      }      
      $scope.esperas = res.resultObject;
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    console.log(err);
    $scope.errMsg = err.msg;
    if (DebugMode) {
      $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
    }
  }); 
}
function LoadRutasXUsuario(UsuarioRuta, RutaFavorita, usuarioid, $scope) {
  UsuarioRuta.query({}, function(res){
    if (res.success) {
      $scope.errMsg = null;
      RutaFavorita.query({usrid: usuarioid}, function(favoritos) {
        for (var i = 0; i < favoritos.resultObject.length; i++) {
          for (var j = 0; j < res.resultObject.length; j++) {
            console.log("comparando " + res.resultObject[j].id + '/' + favoritos.resultObject[i].RutaId);
            res.resultObject[j].isFavorite = (res.resultObject[j].id == favoritos.resultObject[i].RutaId);
            if (res.resultObject[j].isFavorite) { break; }
          } 
        }
        $scope.rutas = res.resultObject;
      }, function(err) {
        console.log(err);
        $scope.errMsg = err.msg;
        if (DebugMode) {
          $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
        }
      });
    } else {
      $scope.errMsg = res.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  }, function(err) {
    console.log(err);
    $scope.errMsg = err.msg;
    if (DebugMode) {
      $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
    }
  }); 
}
function ShowMapa(rutaid, Mapa, $scope) {
  var consulta = Mapa.query({exId: rutaid});
  $scope.rutaid = rutaid;

  consulta.$promise.then(
    function(res){
      console.log("ya cargo ---< " + res.resultObject.length);
      if(res.resultObject.length > 0){
        $scope.pMapa = res.resultObject;
        $scope.orderProp = 'id';
        console.log($scope.pMapa);
        consultapuntos();
      }
      console.log($scope.pMapa); 

    }, function(err) {
      console.log(err);
      $scope.errMsg = err.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  );      
}
function SaveMapa(mapa, Mapa, $scope, $location, locationTo) {
  console.log("Objeto de cordenadas---> ");
  console.log(mapa);
  var ex = new Mapa(mapa);   
  console.log("Parceo de mapa -----> ");
  console.log(ex);    
  ex.$createBulk({}, 
    function(res) {
      if (res.success) {
        $scope.errMsg = null;
        $location.path(locationTo);
      } else {
        $scope.errMsg = res.msg;
        if (DebugMode) {
          $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
        }
      }   
    }, function(err) {
      console.log(err);
      $scope.errMsg = err.msg;
      if (DebugMode) {
        $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
      }
    }
  );
}  
muukControllers.controller('UsuarioResumenCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {

  }]);
muukControllers.controller('UsuarioViajesCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {

  }]);
muukControllers.controller('UsuarioRutasCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {

  }]);
muukControllers.controller('UsuarioReservacionesCtrl', ['$scope', '$location', '$window', 'Reservaciones', 'CancelarReservacion', 'ConfirmarReservacion',
  function($scope, $location, $window, Reservaciones, CancelarReservacion, ConfirmarReservacion) {

    $scope.loadReservaciones = function(estatus, vigente) {
      LoadReservaciones(Reservaciones, estatus, vigente, $scope);
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
                }
                // fill ruta
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
        console.log(err);
        $scope.errMsg = err.msg;
        if (DebugMode) {
          $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
        }
      });      
    }

    $scope.cancel = function(reservacion) {
      if( $window.confirm("Se cancelará la reservacion id [" + reservacion.id + "] ¿Continuar?")) {
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
            console.log(err);
            $scope.errMsg = err.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
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
            console.log(err);
            $scope.errMsg = err.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          }
        );        
      }
    }

    $scope.selectTab = function(tabIndex) {
      if (tabIndex == 0) {
        $scope.tabActive = ["active","",""];  
        $scope.tabSelected = "new";
      } else if (tabIndex == 1) {
        $scope.tabActive = ["","active",""];  
        $scope.tabSelected = "confirmed";
      } else if (tabIndex == 2) {
        $scope.tabActive = ["","","active"];  
        $scope.tabSelected = "canceled";
      }
      $scope.reservaciones = null;
      $scope.loadReservaciones($scope.tabSelected, $scope.tabHideOlder);
    }

    $scope.tabActive = ["active","",""];
    $scope.tabSelected = "new";
    $scope.tabHideOlder = true; 

    $scope.init($scope.tabSelected, $scope.tabHideOlder);    
  }]);
muukControllers.controller('UsuarioEsperaCtrl', ['$scope', '$location', 'Esperas', 'CancelarEspera',
  function($scope, $location, Esperas, CancelarEspera) {

    $scope.loadEsperas = function() {
      LoadEsperas(Esperas, $scope);
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
        console.log(err);
        $scope.errMsg = err.msg;
        if (DebugMode) {
          $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
        }
      });      
    }

    $scope.loadEsperas();
  }]);
muukControllers.controller('UsuarioFavoritosCtrl', ['$scope', '$location', 'SessionService', 'UsuarioRuta', 'RutaFavorita', 'RutaFavoritaAdd', 'RutaFavoritaRemove',
  function($scope, $location, SessionService, UsuarioRuta, RutaFavorita, RutaFavoritaAdd, RutaFavoritaRemove) {
    LoadRutasXUsuario(UsuarioRuta, RutaFavorita, SessionService.currentUser.id, $scope);
    /*
    $scope.rutas = UsuarioRuta.query(function(results){
      var RutaList = RutaFavorita.query({usrid: SessionService.currentUser.id}, function(favoritos) {
        for (var i = 0; i < favoritos.length; i++) {
          for (var j = 0; j < results.length; j++) {
            console.log("comparando " + results[j].id + '/' + favoritos[i].RutaId);
            results[j].isFavorite = (results[j].id == favoritos[i].RutaId);
            if (results[j].isFavorite) { break; }
          } 
        }
        $scope.rutas = results;
      });

    });*/
    $scope.orderProp = 'nombre';

    $scope.favorito = function(ruta){
      if (ruta.isFavorite) {
        RutaFavoritaRemove.query({usrid: SessionService.currentUser.id, rutaid: ruta.id}, 
          function(res) {
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
            console.log(err);
            $scope.errMsg = err.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          }
        );
      } else {
        RutaFavoritaAdd.query({usrid: SessionService.currentUser.id, rutaid: ruta.id}, 
          function(res) {
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
            console.log(err);
            $scope.errMsg = err.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
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
      LoadRutasXUsuario(UsuarioRuta, RutaFavorita, SessionService.currentUser.id, $scope);
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
    }
  }]);

// -----------------------------------------------------
/* Usuario - Rutas */
muukControllers.controller('UsuarioBuscarRutasCtrl', ['$scope', '$location', '$window', 'SessionService', 'RutaSugerida', 'RutaOferta', 'RutaReservar', 'RutaEsperar', 'RutaFavorita', 'RutaFavoritaAdd', 'RutaFavoritaRemove', 'Mapa',
  function($scope, $location, $window, SessionService, RutaSugerida, RutaOferta, RutaReservar, RutaEsperar, RutaFavorita, RutaFavoritaAdd, RutaFavoritaRemove, Mapa) {
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
      // inicializamos variables para comparar fechas
      var daymilisec = 24 * 60 * 60 * 1000;
      var hoy = new Date();
      var d1 = new Date(hoy.getTime() + daymilisec);
      var d2 = new Date(hoy.getTime() + 2 * daymilisec);
      var d3  = new Date(hoy.getTime() + 3 * daymilisec);
      var d4  = new Date(hoy.getTime() + 4 * daymilisec);
      var d5  = new Date(hoy.getTime() + 5 * daymilisec);
      var d6  = new Date(hoy.getTime() + 6 * daymilisec);
      var d7  = new Date(hoy.getTime() + 7 * daymilisec);
      var d8  = new Date(hoy.getTime() + 8 * daymilisec);

      $scope.dias0 = [];
      $scope.dias1 = [];
      $scope.dias2 = [];
      $scope.dias3 = [];
      $scope.dias4 = [];
      $scope.dias5 = [];
      $scope.dias6 = [];
      $scope.dias7 = [];

      // llenar listas
      for (var i = 0; i < results.length; i++) {
        console.log(results[i].fechaOferta);
        var fechaOferta = new Date(results[i].fechaOferta);
        console.log(fechaOferta);
        // filtrado de listas
        if ((fechaOferta > hoy)&&(fechaOferta < d1)) {
          $scope.dias0.push(results[i]);
        } else if ((fechaOferta > d1)&&(fechaOferta < d2)) {
          $scope.dias1.push(results[i]);
        } else if ((fechaOferta > d2)&&(fechaOferta < d3)) {
          $scope.dias2.push(results[i]);
        } else if ((fechaOferta > d3)&&(fechaOferta < d4)) {
          $scope.dias3.push(results[i]);
        } else if ((fechaOferta > d4)&&(fechaOferta < d5)) {
          $scope.dias4.push(results[i]);
        } else if ((fechaOferta > d5)&&(fechaOferta < d6)) {
          $scope.dias5.push(results[i]);
        } else if ((fechaOferta > d6)&&(fechaOferta < d7)) {
          $scope.dias6.push(results[i]);
        } else if ((fechaOferta > d1)&&(fechaOferta < d8)) {
          $scope.dias7.push(results[i]);
        }
      }        
    };

    $scope.showCorridaList = function(ruta){
      RutaOferta.query({exId: ruta.id}, function(res){
        if (res.success) {
          $scope.errMsg = null;
          $scope.corridas = $scope.prepareResults(res.resultObject);
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
        console.log(err);
        $scope.errMsg = err.msg;
        if (DebugMode) {
          $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
        }
      });       
    };    

    $scope.reservar = function(corrida){
      RutaReservar.query({exId: ruta.id}, function(res){
        if (res.success) {
          $scope.errMsg = null;
          RutaOferta.query({exId: ruta.id}, function(result){
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
            console.log(err);
            $scope.errMsg = err.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          });         
        } else {
          $scope.errMsg = res.msg;
          if (DebugMode) {
            $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
          }
        }
      }, function(err) {
        console.log(err);
        $scope.errMsg = err.msg;
        if (DebugMode) {
          $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
        }
      }); 
    };

    $scope.esperar = function(corrida){
      RutaEsperar.query({exId: ruta.id}, function(res){
        if (res.success) {
          $scope.errMsg = null;
          RutaOferta.query({exId: ruta.id}, function(result){
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
            console.log(err);
            $scope.errMsg = err.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          });          
                 
        } else {
          $scope.errMsg = res.msg;
          if (DebugMode) {
            $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
          }
        }
      }, function(err) {
        console.log(err);
        $scope.errMsg = err.msg;
        if (DebugMode) {
          $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
        }
      }); 
    };

    $scope.favorito = function(ruta){
      if (ruta.isFavorite) {
        RutaFavoritaRemove.query({usrid: SessionService.currentUser.id, rutaid: ruta.id}, 
          function(res) {
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
            console.log(err);
            $scope.errMsg = err.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          }
        );
      } else {
        RutaFavoritaAdd.query({usrid: SessionService.currentUser.id, rutaid: ruta.id}, 
          function(res) {
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
            console.log(err);
            $scope.errMsg = err.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
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
              }
            );
           
          } else {
            $scope.errMsg = res.msg;
            if (DebugMode) {
              $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
            }
          }  

        }, function(err) {
          console.log(err);
          $scope.errMsg = err.msg;
          if (DebugMode) {
            $scope.errMsg = $scope.errMsg + ' [' + res.msgCode + ']';
          }
        }
      );
    };    

    $scope.showMapa = function(ruta){
      ShowMapa(ruta, Mapa, $scope);
    };

  }]);

// -----------------------------------------------------
/* Usuario - Estadisticas */
muukControllers.controller('UsuarioEstadisticasCtrl', ['$scope', '$location', 'AuthenticationService',
  function($scope, $location, AuthenticationService) {

  }]);
// -----------------------------------------------------
/* MAPA */
var idm;
muukControllers.controller('MapaFormCtrl', ['$scope', '$routeParams', 'Mapa', '$location',
  function($scope, $routeParams, Mapa, $location) {
    idm = $routeParams.id;
    ShowMapa(idm, Mapa, $scope); 

    $scope.save = function(mapa) {  
      if($scope.user.role == 'EMPRESA'){
        SaveMapa(mapa, Mapa, $scope, $location, 'empresaRutaList'); 
      }else if($scope.user.role == 'ADMIN'){
        SaveMapa(mapa, Mapa, $scope, $location, 'embarqRutaList'); 
      }       
    }; 

    $scope.cancel = function(){
      $location.path('embarqRutaList');
    };  
  }]);
muukControllers.controller('EmbarqSolicitudMapaFormCtrl', ['$scope', '$routeParams', 'Mapa', '$location',
  function($scope, $routeParams, Mapa, $location) {
    idm = $routeParams.id;
    ShowMapa(idm, Mapa, $scope);

    $scope.save = function(mapa) {
      if($scope.user.role == 'EMPRESA'){
        SaveMapa(mapa, Mapa, $scope, $location, 'empresaRutaList'); 
      }else if($scope.user.role == 'ADMIN'){
        SaveMapa(mapa, Mapa, $scope, $location, 'embarqRutaList'); 
      }  
    }; 

    $scope.cancel = function(){
      $location.path('embarqSolicitudRutaList');
    };  
  }]);
muukControllers.controller('EmpresaMapaFormCtrl', ['$scope', '$routeParams', 'Mapa', '$location',
  function($scope, $routeParams, Mapa, $location) {
    idm = $routeParams.id;
    ShowMapa(idm, Mapa, $scope);

    $scope.save = function(mapa) {
      if($scope.user.role == 'EMPRESA'){
        SaveMapa(mapa, Mapa, $scope, $location, 'empresaRutaList'); 
      }else if($scope.user.role == 'ADMIN'){
        SaveMapa(mapa, Mapa, $scope, $location, 'embarqRutaList'); 
      }  
    }; 

    $scope.cancel = function(){
      $location.path('empresaRutaList');
    };  
  }]);


  
