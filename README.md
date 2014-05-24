EmbarQ - Shuttles - RESTFul services
======

Repositorio para proyecto Shuttles, capa de servicios REST.

**URL Pruebas:** http://54.201.26.22:8082

-------

Servicio "(ABC) Empresas"
-------------------------
[URL...]/empresa

Comandos RESTFul:   
* GET /empresa = (Consulta todos, sin importar estatus de aprobación)  
  * Los filtros de empresas de acuerdo a su estatus de aprobación son:
    * /empresa?estatus=authorized
    * /empresa?estatus=new
    * /empresa?estatus=rejected
* GET /empresa/existe?nombre=[nombre empresa]&rfc=[rfc] = (Verifica si ya existe una empresa registrada con el mismo nombre O rfc)
* GET /empresa/{id} = (Consulta empresa con el id especificado)  
* POST /empresa = (Creación de registro nuevo)  
* POST /preregister/empresa = (Preregistro de una empresa **API no asegurado)
* PUT /empresa/{id} = (Update al registro con el id especificado)  
* PUT /empresa/authorize/{id} = (Marca la empresa designada por el id como autorizada)
* PUT /empresa/reject/{id} = (Marca la empresa designada por el id como rechazada)
* DELETE /empresa/{id} = (Elimina registro marcado con el id)  


Ejemplo post de empresa para registro y pre-registro (incluye usuario administrador):

    {
        "nombre": "Mico",
        "razonsocial": "Mico Corp",
        "rfc": "JUC93994BA", 
        "usuarionombre": "Arcon",
        "usuarioemail": "arcon@mail.com",
        "usuariopassword": "mammsdh",
        "usuario2nombre": "Arcon",
        "usuario2email": "arcon@mail.com",
        "usuario2password": "mammsdh"        
    }

_Nota:_ Los datos precedidos por usuario2 se refieren al administrador secundario y son opcionales.

---------

Servicio "Rutas"
-------------------------
[URL...]/ruta

Comandos RESTFul:   
* GET /ruta = (Consulta todos)  
  * Los filtros de rutas son (los filtros se pueden combinar entre si):
    * /ruta?estatus=authorized
    * /ruta?estatus=new
    * /ruta?estatus=rejected
    * /ruta?empresa=1      (para obtener las rutas ligadas a la empresa con id 1)
* GET /ruta/{id} = (Consulta ruta con el id especificado, incluye empresa a la que pertence y puntos localizados de la ruta)  
* POST /ruta = (Creación de registro nuevo)  
* PUT /ruta/{id} = (Update al registro con el id especificado)  
* PUT /ruta/authorize/{id} = (Marca la ruta designada por el id como autorizada)
* PUT /ruta/reject/{id} = (Marca la ruta designada por el id como rechazada)
* DELETE /ruta/{id} = (Elimina registro marcado con el id)  

Ejemplo de post de creación:

      {
        "nombre": "prueba 2",
        "descripcion": "dos",
        "distanciaaprox": 12.1,
        "tiempoaprox": 64,
        "origentxt": "origen 2",
        "destinotxt": "destino 2",
        "CompanyownerID": 2
      }

[URL...]/rutapunto

Comandos RESTFul:   
* GET /rutapunto = (Consulta todos los puntos dados de alta)  
* GET /rutapunto/{id} = (Consulta los puntos de la ruta con el id especificado)  
* POST /rutapunto = (Creación de registro nuevo)  
* POST /rutapunto?type=bulk = (Creación de todos los registros especificados en una sola operación. PREFERIDA por performance)  
* PUT /rutapunto/{id} = (Update al registro con el id especificado)  
* DELETE /rutapunto/{id} = (Elimina registro marcado con el id) 

Ejemplo de post de creación tipo bulk (se espera un arreglo con los objetos a crear):

    [
      {
        "indice": 1,
        "descripcion": "Esta es la primera",
        "latitud": -22.5,
        "longitud": 38.5,
        "tipo": 1,
        "RutaId": 1
      },
      {
        "indice": 3,
        "descripcion": "Parada de Miguel Angel y Coyoacán",
        "latitud": -22.8,
        "longitud": 38.9,
        "tipo": 3,
        "RutaId": 1
      },
      {
        "indice": 4,
        "descripcion": "Termina en Tasqueña",
        "latitud": -21.5,
        "longitud": 33.5,
        "tipo": 2,
        "RutaId": 1
      }
    ]


[URL...]/rutacorrida
Administración de las corridas de una ruta

Comandos RESTFul:   
* GET /rutacorrida = (Consulta todos las corridas)  
  * GET /rutacorrida?rutaid=[id ruta] = (Consulta las corridas de la ruta especificada)
* GET /rutacorrida/{id} = (Consulta la corrida con el id especificado)  
* POST /rutacorrida = (Creación de registro nuevo)
* PUT /rutacorrida/{id} = (Update al registro con el id especificado)  
* DELETE /rutacorrida/{id} = (Elimina registro marcado con el id) 

Ejemplo creación de objeto ruta. Las horas se deben asignar directamente con valor entero (horaSalida : 460) o por medio de cadena con formato en la propiedad correspondiente (horaSalidaFmt: 07:40).

    {
      "horaSalidaFmt": "07:40",
      "horaLlegadaFmt": "08:20",
      "horaSalida": 460,
      "horaLlegada": 500,
      "capacidadTotal": 40,
      "capacidadReservada": 30,
      "capacidadOfertada": 5,
      "tarifa": 23,
      "idTransporte": "NA",
      "idChofer": "NA",
      "RutaId": 1
    }

------------

Servicio "Estatus" 
-------------------------
Usado para el manejo de estatus en la diferentes entidades. 

[URL...]/estatus

Comandos RESTFul:   
* GET /estatus = (Consulta todos)  
  * Para filtrar 'estatus' que sean exclusivos para alguna entidad:
    * /estatus?for=[entidad] --> /estatus?for=empresa
* GET /estatus/{id} = (Consulta registro con el id especificado)  
* POST /estatus = (Creación de registro nuevo)  
* PUT /estatus/{id} = (Update al registro con el id especificado)  
* DELETE /estatus/{id} = (Elimina registro marcado con el id)  


---------

Servicio "Usuarios"
-------------------------
[URL...]/usuario

Comandos RESTFul:   
* GET /usuario = (Consulta todos, sin importar estatus de aprobación)  
  * Los filtros de acuerdo a su estatus de aprobación son:
    * /usuario?estatus=authorized
    * /usuario?estatus=new
    * /usuario?estatus=rejected
* GET /usuario/{id} = (Consulta usuario con el id especificado)  
* GET /roles = (Lista de roles que se pueden asignar a un usuario)  
* POST /usuario = (Creación de registro nuevo)  
* POST /preregister/usuariobulk = (creación masiva de invitaciones para usuarios de una empresa, al hacer el preregistro se envían notificaciones a los correos de los usuarios)
* PUT /usuario/{id} = (Update al registro con el id especificado)  
* PUT /usuario/authorize/{id} = (Marca la empresa designada por el id como autorizada)
* PUT /usuario/reject/{id} = (Marca la empresa designada por el id como rechazada)
* DELETE /usuario/{id} = (Elimina registro marcado con el id)  

Ejemplo de post para creación de usuario:

    {
      "nombre": "Humberto andrade",
      "email": "hab@mail.com",
      "password": "xxx",
      "EmpresaId": 1
    }

Ejemplo de post para pre-registro bulk de usuarios (invitaciones):

    {
     "empresa": 1,
     "invitaciones": "oscar william, owl@mmail.com | humberto andrade, hab@mmail.com | adolfo embriz, fito@mmail.com"
    }


---------

Servicio de "Seguridad"
-------------------------
Se basa en una primera autenticación con Usuario/Password y en caso de ser exitosa se genera un token de autenticación que deberá ser enviado en cada request de un API asegurado, en alguna de las siguientes formas:
- como parámetro de url, ejemplo:  /empresa?access_token=[token]
- en el header usando: "Authorization: Bearer [token]"

[URL...]/login

Comandos RESTFul:   
* POST /login = (Recibe credenciales del usuario y en caso de éxito genera un token de autenticación)
 

---------

 Servicios para "Compra"
-------------------------
[URL...]/compra

Comandos RESTFul:   
* GET /compra/rutasuggest?puntoALat=[lat]&puntoALng=[lng]&puntoBLat=[lat]&puntoBLng=[lng] = (Consulta las rutas más próximas a las coordenadas proporcionadas)  


El resultado de la sugerencia de rutas es un arreglo con las rutas encontradas. El arreglo no viene ordenado pero contiene el atributo *lejania* que indica la lejanía total entre los puntos de origen y destino proporcionados y las paradas sugeridas de ascenso y descenso para la ruta, por lo que al ordenar en orden inverso por este atributo se tendrá primero en la lista las rutas más "adecuadas" para el origen, destino proporcionados.

    [
      {
        "lejania": 12319037.417926596,
        "ruta": {
          "id": 3,
          "nombre": "Jamon jamon",
          "descripcion": "tres",
          "distanciaaprox": 14.2,
          "tiempoaprox": 28,
          "origentxt": "origen",
          "destinotxt": "destino",
          "CompanyownerID": 1,
          "EstatusId": 3
        },
        "ascensoSugerido": {
          "distancia": 8923021.060774071,
          "rutaPunto": {
            "id": 1,
            "indice": 1,
            "descripcion": "Esta es la primera",
            "latitud": -22.5,
            "longitud": 38.5,
            "tipo": 1,
            "RutaId": 3
          }
        },
        "descensoSugerido": {
          "distancia": 3396016.357152526,
          "rutaPunto": {
            "id": 1,
            "indice": 1,
            "descripcion": "Esta es la primera",
            "latitud": -22.5,
            "longitud": 38.5,
            "tipo": 1,
            "RutaId": 3
          }
        }
      }
    ]


---------

 Servicio para "Rutas Favoritas"
-------------------------
[URL...]/rutafavorita

Usado para agregar, quitar y listar las rutas favoritas de un usuario

Comandos RESTFul:   
* PUT /rutafavorita/add?usrid=[id usuario]&rutaid=[id ruta] = (Marca la ruta indicada como favorita)
* PUT /rutafavorita/remove?usrid=[id usuario]&rutaid=[id ruta] = (Desmarca la ruta como favorita, la quita)
* GET /rutafavorita?usrid=[id usuario] = (lista las rutas favoritas del usuario)

*Nota*: En cuanto se integre la seguridad se podrá quitar el parámetro usrid porque se tomará del token de seguridad, pero si viene no afecta solo no se tomará en cuenta.

El regreso es un arreglo con las rutas sugeridas, el atributo rutum tiene los datos de la ruta:

    [
      {
        "id": 1,
        "fechaUltimoUso": "2014-01-01T00:00:00.000Z",
        "usos": 0,
        "RutaId": 1,
        "UsuarioId": 5,
        "rutum": {
          "id": 1,
          "nombre": "prueba",
          "descripcion": "una",
          "distanciaaprox": 10.2,
          "tiempoaprox": 28,
          "origentxt": "origen",
          "destinotxt": "destino",
          "CompanyownerID": 1,
          "EstatusId": 3
        }
      }
    ]