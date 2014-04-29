EmbarQ - Shuttles - RESTFul services
======

Repositorio para proyecto Shuttles, capa de servicios REST.

**URL Pruebas:** http://54.201.26.22:8082

-------

Servicio "(ABC) Empresas"
-------------------------
[URL...]/empresa

Comandos RESTFul:   
GET /empresa = (Consulta todos)  
GET /empresa/{id} = (Consulta empresa con el id especificado)  
POST /empresa = (Creación de registro nuevo)  
PUT /empresa/{id} = (Update al registro con el id especificado)  
DELETE /empresa/{id} = (Elimina registro marcado con el id)  

---------

Servicio "Rutas"
-------------------------
[URL...]/ruta

Comandos RESTFul:   
GET /ruta = (Consulta todos)  
GET /ruta/{id} = (Consulta ruta con el id especificado, incluye empresa a la que pertence y puntos localizados de la ruta)  
POST /ruta = (Creación de registro nuevo)  
PUT /ruta/{id} = (Update al registro con el id especificado)  
DELETE /ruta/{id} = (Elimina registro marcado con el id)  

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
GET /rutapunto = (Consulta todos los puntos dados de alta)  
GET /rutapunto/{id} = (Consulta los puntos de la ruta con el id especificado)  
POST /rutapunto = (Creación de registro nuevo)  
POST /rutapunto?type=bulk = (Creación de todos los registros especificados en una sola operación. PREFERIDA por performance)  
PUT /rutapunto/{id} = (Update al registro con el id especificado)  
DELETE /rutapunto/{id} = (Elimina registro marcado con el id) 

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