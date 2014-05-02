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
* PUT /empresa/{id} = (Update al registro con el id especificado)  
* PUT /empresa/authorize/{id} = (Marca la empresa designada por el id como autorizada)
* PUT /empresa/reject/{id} = (Marca la empresa designada por el id como rechazada)
* DELETE /empresa/{id} = (Elimina registro marcado con el id)  


---------

Servicio "Rutas"
-------------------------
[URL...]/ruta

Comandos RESTFul:   
* GET /ruta = (Consulta todos)  
  * Los filtros de rutas de acuerdo a su estatus de aprobación son:
    * /ruta?estatus=authorized
    * /ruta?estatus=new
    * /ruta?estatus=rejected
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