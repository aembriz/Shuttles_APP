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
      "capacidadTotal": 40,
      "capacidadReservada": 30,
      "capacidadOfertada": 5,
      "tarifa": 23,
      "idTransporte": "NA",
      "idChofer": "NA",
      "RutaId": 1,
      "dia1": false,
      "dia2": true,
      "dia3": false,
      "dia4": true,
      "dia5": true
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
* POST /preregister/usuario
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
* GET /compra/rutasugeridas?puntoALat=[lat]&puntoALng=[lng]&puntoBLat=[lat]&puntoBLng=[lng] = (Consulta las rutas más próximas a las coordenadas proporcionadas)  
* GET /compra/ruta = (Lista las rutas disponibles para el usuario para el proceso de compra)
* GET /compra/ruta/[id ruta]/oferta = (Lista las corridas y su oferta para la ruta indicada, en caso de haber una reservación o lista de espera ligada a la oferta para el usuario que consulta, estos objetos aparecerán ligados Ver ejemplo más adelante)
* POST /compra/reservar/[ofertaid] = (Genera una reservación para la oferta indicada (obtener del servicio anterior))
* GET /compra/misreservaciones = (Lista las reservaciones del usuario. Permite agregar el filtro estatus=[new/confirmed/canceled] ... se puede combinar con el filtro vigente=[true/false] para mostrar solo las que tienen fech hoy o futura)
* POST /compra/cancelar/[reservacionid] = (Cancela la reservación indicada (obtener del servicio anterior), en este momento se procesa lista de espera)
* POST /compra/esperar/[ofertaid] = (Registra en lista de espera la reservación)
* POST /compra/cancelarespera/[reservacionid] = (Cancela lista de espera)
* GET /compra/misesperas = (Lista las esperas que le pertenecen al usuario. Permite agregar el filtro estatus=[new/assigned/canceled/deprecated] ... se puede combinar con el filtro vigente=[true/false] para mostrar solo las que tienen fech hoy o futura)
* PUT /compra/confirmar/[reservacionid] = (se confirma una reservación pendiente generada por proceso de lista de espera)

**Nota**: Seguridad ya integrada (se requiere pasar el Token)
. Las acciones reservar, cancelar y misreservaciones requieren el rol USUARIO

El resultado de la sugerencia de rutas es un arreglo con las rutas encontradas. El arreglo no viene ordenado pero contiene el atributo *lejania* que indica la lejanía total entre los puntos de origen y destino  proporcionados y las paradas sugeridas de ascenso y descenso para la ruta, por lo que al ordenar en orden inverso por este atributo se tendrá primero en la lista las rutas más "adecuadas" para el origen, destino proporcionados.

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


Ejemplo de resultado de oferta:

    [
      {
        "id": 6,
        "fechaOferta": "2014-05-30T00:00:00.000Z",
        "oferta": 10,
        "RutaId": 1,
        "RutaCorridaId": 2,
        "rutaCorrida": {
          "horaSalidaFmt": "07:40",
          "horaLlegadaFmt": "08:20",
          "id": 2,
          "horaSalida": 460,
          "horaLlegada": 500,
          "capacidadTotal": 40,
          "capacidadReservada": 30,
          "capacidadOfertada": 5,
          "tarifa": 23,
          "idTransporte": "NA",
          "idChofer": "NA",
          "RutaId": 1
        },
        "reservacion": {
          "id": 17,
          "fechaReservacion": "2014-05-30T00:00:00.000Z",
          "estatus": 2,
          "createdAt": "2014-05-28T01:07:28.000Z",
          "updatedAt": "2014-05-28T01:07:28.000Z",
          "RutaId": 1,
          "RutaCorridaId": 2,
          "UsuarioId": 9,
          "OfertaId": 6
        }
      },
      {
        "id": 7,
        "fechaOferta": "2014-06-01T00:00:00.000Z",
        "oferta": 10,
        "RutaId": 1,
        "RutaCorridaId": 2,
        "rutaCorrida": {
          "horaSalidaFmt": "07:40",
          "horaLlegadaFmt": "08:20",
          "id": 2,
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
      },
      {
        "id": 8,
        "fechaOferta": "2014-06-02T00:00:00.000Z",
        "oferta": 10,
        "RutaId": 1,
        "RutaCorridaId": 2,
        "rutaCorrida": {
          "horaSalidaFmt": "07:40",
          "horaLlegadaFmt": "08:20",
          "id": 2,
          "horaSalida": 460,
          "horaLlegada": 500,
          "capacidadTotal": 40,
          "capacidadReservada": 30,
          "capacidadOfertada": 5,
          "tarifa": 23,
          "idTransporte": "NA",
          "idChofer": "NA",
          "RutaId": 1
        },
        "espera": {
          "id": 1,
          "fechaReservacion": "2014-06-02T00:00:00.000Z",
          "estatus": 1,
          "createdAt": "2014-05-27T19:06:47.000Z",
          "updatedAt": "2014-05-28T00:25:45.000Z",
          "RutaId": 1,
          "RutaCorridaId": 2,
          "UsuarioId": 9,
          "OfertaId": 8,
          "ReservacionId": 14
        }
      }
    ]

**Reservación multiple (Bulk)**

Ejemplo de objeto post para reservación múltiple, se pasan los ids de las ofertas a reservar:

    {
       "ofertaids":[4,5]
    }

Ejemplo de objeto resultado de una reservación múltiple, los resultados vienen identificados por el id de la oferta que se trató de reservar:

    {
      "msg": "",
      "resultado": {
        "4": {
          "msg": "Existieron errores al registrar su reservación. Por favor vuelva a intentarlo.",
          "err": {
            "validateFecha": [
              "La reservación no puede ser en fechas pasadas."
            ]
          }
        },
        "5": {
          "msg": "Su reservación has sido registrada.",
          "reservacion": {
            "RutaId": 1,
            "RutaCorridaId": 2,
            "OfertaId": 5,
            "UsuarioId": 9,
            "fechaReservacion": "2014-05-28T00:00:00.000Z",
            "estatus": 2,
            "id": 17,
            "updatedAt": "2014-05-28T01:07:28.000Z",
            "createdAt": "2014-05-28T01:07:28.000Z"
          }
        }
      }
    }

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
**Nota**: Seguridad ya integrada (se requiere pasar el Token)

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


---------

 Servicio para "Generación de Ofertas"
-------------------------
[URL...]/oferta

Usado para generar la oferta de las rutas/corridas. La generación de ofertas se realiza tomando en cuenta el parámetro de RUTA.diasofertafuturo y los días de la semana habilitados en CORRIDA.

**Nota:** Sólo se genera oferta para las rutas autorizadas.

Comandos RESTFul:   
* POST /oferta/generar/[rutaid] = (Genera la oferta para la ruta especificada. )
* POST /oferta/generar = (Genera la oferta de todas las rutas de todo el sistema )


---------

**SEGURIDAD en los servicios**

A continuación se muestra el aseguramiento de los servicios por autenticación y Role. 

    app.post('/login', usuario.login);

    // TODO: verificar cuestiones de seguridad (cuales se necesitan para el preregistro por parte del usuario)
    app.get('/usuario', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), usuario.list());
    app.get('/usuario/:id', usuario.listOne());
    app.post('/usuario', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), usuario.add());
    app.put('/usuario/:id', usuario.update()); 
    app.put('/usuario/authorize/:id', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), usuario.authorize());
    app.put('/usuario/reject/:id', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), usuario.reject());
    app.delete('/usuario/:id', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), usuario.delete());

    app.post('/preregister/usuario', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), usuario.addPre());
    app.post('/preregister/usuariobulk', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), usuario.addPreBulk());
    app.get('/roles', usuario.listRoles());


    // --------------- Estatus ----------------
    var estatus = require('./routes/estatus');
    app.get('/estatus', usuario.authenticate, usuario.needsRole(['ADMIN']), estatus.list());
    app.get('/estatus/:id', usuario.authenticate, usuario.needsRole(['ADMIN']), estatus.listOne());
    app.post('/estatus', usuario.authenticate, usuario.needsRole(['ADMIN']), estatus.add());
    app.put('/estatus/:id', usuario.authenticate, usuario.needsRole(['ADMIN']), estatus.update());
    app.delete('/estatus/:id', usuario.authenticate, usuario.needsRole(['ADMIN']), estatus.delete());

    // --------------- Empresa ----------------
    var empresa = require('./routes/empresa');
    app.get('/empresa', usuario.authenticate, usuario.needsRole(['ADMIN']), empresa.list());
    app.get('/empresa/existe', usuario.authenticate, usuario.needsRole(['ADMIN']), empresa.alreadyExist());
    app.get('/empresa/:id', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), empresa.listOne());
    app.post('/empresa', usuario.authenticate, usuario.needsRole(['ADMIN']), empresa.add(false));
    app.post('/preregister/empresa', empresa.add(true));
    app.put('/empresa/:id', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), empresa.update());
    app.put('/empresa/authorize/:id', usuario.authenticate, usuario.needsRole(['ADMIN']), empresa.authorize());
    app.put('/empresa/reject/:id', usuario.authenticate, usuario.needsRole(['ADMIN']), empresa.reject());
    app.delete('/empresa/:id', usuario.authenticate, usuario.needsRole(['ADMIN']), empresa.delete());

    // --------------- Ruta ----------------
    var ruta = require('./routes/ruta');
    app.get('/ruta', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), ruta.list());
    app.get('/ruta/:id', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), ruta.listOne());
    app.post('/ruta', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), ruta.add());
    app.put('/ruta/:id', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), ruta.update());
    app.put('/ruta/authorize/:id', usuario.authenticate, usuario.needsRole(['ADMIN']), ruta.authorize());
    app.put('/ruta/reject/:id', usuario.authenticate, usuario.needsRole(['ADMIN']), ruta.reject());
    app.delete('/ruta/:id', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), ruta.delete());

    // --------------- RutaPunto ---------------- // TODO: Incluir seguridad por rutas compartidas
    var rutapunto = require('./routes/rutapunto');
    app.get('/rutapunto', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), rutapunto.list());
    app.get('/rutapunto/:id', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), rutapunto.listOne());
    app.post('/rutapunto', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), rutapunto.add());
    app.put('/rutapunto/:id', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), rutapunto.update());
    app.delete('/rutapunto/:id', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), rutapunto.delete());

    // --------------- RutaCorrida ----------------  TODO: Incluir seguridad por rutas compartidas
    var rutacorrida = require('./routes/rutacorrida');
    app.get('/rutacorrida', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), rutacorrida.list());
    app.get('/rutacorrida/:id', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), rutacorrida.listOne());
    app.post('/rutacorrida', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), rutacorrida.add());
    app.put('/rutacorrida/:id', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), rutacorrida.update());
    app.delete('/rutacorrida/:id', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), rutacorrida.delete());

    // --------------- Ruta Suggestions----------------
    var rutasuggest = require('./routes/procesocompraruta');
    app.get('/compra/ruta', usuario.authenticate, rutasuggest.listRoutes());
    app.get('/compra/rutasugeridas', usuario.authenticate, rutasuggest.listSuggestions());
    app.get('/compra/ruta/:rutaid/oferta', usuario.authenticate, rutasuggest.listOferta());
    app.post('/compra/reservar/:ofertaid', usuario.authenticate, usuario.needsRole(['USUARIO', 'EMPRESA']), rutasuggest.reservationCreate()); // Crea la reservación
    app.post('/compra/reservarbulk/', usuario.authenticate, usuario.needsRole(['USUARIO', 'EMPRESA']), rutasuggest.reservationCreateBulk()); // Crea varias reservaciones

    app.put('/compra/confirmar/:reservacionid', usuario.authenticate, usuario.needsRole(['USUARIO', 'EMPRESA']), rutasuggest.reservationConfirm()); 

    app.post('/compra/cancelar/:reservacionid', usuario.authenticate, usuario.needsRole(['USUARIO', 'EMPRESA']), rutasuggest.reservationCancel()); // cancela una reservación
    app.get('/compra/misreservaciones', usuario.authenticate, usuario.needsRole(['USUARIO', 'EMPRESA']), rutasuggest.reservationList());

    app.post('/compra/esperar/:ofertaid', usuario.authenticate, usuario.needsRole(['USUARIO', 'EMPRESA']), rutasuggest.waitinglistCreate()); 
    app.post('/compra/cancelarespera/:reservacionid', usuario.authenticate, usuario.needsRole(['USUARIO', 'EMPRESA']), rutasuggest.waitinglistCancel()); 
    app.get('/compra/misesperas', usuario.authenticate, usuario.needsRole(['USUARIO', 'EMPRESA']), rutasuggest.waitinglistList());


    // --------------- Rutas Favoritas----------------
    var rutasuggest = require('./routes/rutafavorita');
    //app.get('/rutafavorita', rutasuggest.favouriteList());
    app.put('/rutafavorita/add', usuario.authenticate, usuario.needsRole(['USUARIO', 'EMPRESA']), rutasuggest.favouriteAdd());
    app.put('/rutafavorita/remove', usuario.authenticate, usuario.needsRole(['USUARIO', 'EMPRESA']), rutasuggest.favouriteDel());
    app.get('/rutafavorita', usuario.authenticate, usuario.needsRole(['USUARIO', 'EMPRESA']), rutasuggest.favouriteList());


    // --------------- Oferta ----------------
    var oferta = require('./routes/oferta');
    app.get('/oferta', usuario.authenticate, oferta.list());
    app.get('/oferta/:id', usuario.authenticate, oferta.listOne());
    app.post('/oferta', usuario.authenticate, usuario.needsRole(['ADMIN']), oferta.add());
    app.post('/oferta/generar/:rutaid', usuario.authenticate, usuario.needsRole(['ADMIN', 'EMPRESA']), oferta.generaOfertaXRuta());
    app.post('/oferta/generar', usuario.authenticate, usuario.needsRole(['ADMIN']), oferta.generaOfertaGlobalServ()); // genera de todas las rutas (autorizadas) de todo el sistema

    app.put('/oferta/:id', usuario.authenticate, usuario.needsRole(['ADMIN']), oferta.update());
    app.delete('/oferta/:id', usuario.authenticate, usuario.needsRole(['ADMIN']), oferta.delete());
    app.put('/oferta/:id/plus', usuario.authenticate, usuario.needsRole(['ADMIN']), oferta.incrementOferta());
    app.put('/oferta/:id/minus', usuario.authenticate, usuario.needsRole(['ADMIN']), oferta.decrementOferta());


------------

Servicio "Compartir rutas" 
-------------------------
Usado para compartir rutas entre compañías 

[URL...]/rutacompartir

Comandos RESTFul:   
* GET /rutacompartida = (Consulta todos. Se pueden incluir los filtros (empresa (dueña de la ruta), empresacliente, ruta, estatus=[new/authorized/rejected]) )  
* GET /rutacompartida/{id} = (Consulta registro con el id especificado)  
* GET /rutacompartida/[rutaid]/empresasxcompartir = (Consulta las empresas con las que se puede compartir la ruta especificada)
* POST /rutacompartida = (Creación de registro nuevo)  
* PUT /rutacompartida/[rutaid]/empresa/[empresaid] = (Comparte la ruta indicada con la empresa indicada)  
* PUT /rutacompartida/{id} = (Update al registro con el id especificado)  
* DELETE /rutacompartida/{id} = (Elimina registro marcado con el id)  

------------

Servicio "Reservaciones recurrentes" 
-------------------------
Crea reservaciones recurrentes para una corrida la cual debe de ser de la misma empresa a la que el usuario pertenece

[URL...]/rutacompartir

Comandos RESTFul:   
* GET /reservacionrecurrente = (Consulta todos.)  
* GET /reservacionrecurrente/{id} = (Consulta registro con el id especificado  
* POST /reservacionrecurrente = (Creación de registro nuevo)  
* DELETE /reservacionrecurrente/{id} = (Elimina registro marcado con el id)  

Ejemplo de post para creación de reservación:

    {
      "RutaCorridaId": 1
    }

Ejemplo de regreso de consulta:

    [
        {
          "id": 6,
          "estatus": 2,
          "complementarykey": "9-1",
          "createdAt": "2014-06-11T00:00:00.000Z",
          "updatedAt": "2014-06-11T00:00:00.000Z",
          "RutaId": 1,
          "RutaCorridaId": 1,
          "UsuarioId": 9,
          "rutum": {
            "id": 1,
            "nombre": "Ruta 1",
            "descripcion": "Descripcion 1",
            "distanciaaprox": 20,
            "tiempoaprox": 30,
            "origentxt": "Barranca del muerto",
            "destinotxt": "Indios verdes",
            "diasofertafuturo": 5,
            "CompanyownerID": 1,
            "EstatusId": 3
          },
          "rutaCorrida": {
            "horaSalidaFmt": "21:30",
            "horaLlegadaFmt": "23:20",
            "id": 1,
            "horaSalida": 1290,
            "horaLlegada": 1400,
            "capacidadTotal": 5,
            "capacidadReservada": 2,
            "capacidadOfertada": 3,
            "tarifa": 23,
            "idTransporte": "NA",
            "idChofer": "NA",
            "dia1": false,
            "dia2": true,
            "dia3": false,
            "dia4": true,
            "dia5": true,
            "dia6": false,
            "dia7": false,
            "reservacionesRecurrentes": 1,
            "caducaCapacidadReservada": 60,
            "RutaId": 1
          },
          "usuario": {
            "nombre": "Adolfo embriz",
            "email": "william.lithgow@nubeet.com",
            "id": 9
          }
        }
      ]

------------

Servicio "Sugerencias / Comentarios" 
-------------------------
Usado para crear y listar sugerencias y comentarios 

[URL...]/sugerencia

Comandos RESTFul:   
* GET /sugerencia = (Consulta las sugerencias (internamente se hacen filtros de acuerdo al rol del Usuario))  
* GET /sugerencia/{id} = (Consulta registro con el id especificado)  
* POST /sugerencia = (Creación de registro nuevo)  

Ejemplo de creación de sugerencia:

    {
      "comentario": "Comentario usuario 9 de la empresa 1",
      "RutaId": 1,
      "RutaCorridaId": 22
    }

**Nota:** Tanto RutaId como RutaCorridaId son opcionales

------------

** FORMATO DE RESPUESTA DE SERVICIOS **
-------------------------
El formato de resultado de TODOS los servicios (excepto login y la respuesta de autenticación), es de la siguiente manera:

    {
      "msg": "",
      "err": null,
      "success": true,
      "msgCode": "ErrEmpX000",
      "resultObject": **OBJETO**
    }

Los atributos son:
* msg = Un mensaje de texto con descripción generál para el usuario.
* err = objeto de error generado (su formato depende del generador, Ej: el ORM)
* success = [true/false] false en caso de que haya habido un error en la ejecución del servicio. En su caso desplegar el atributo msg al usuario
* msgCode = Identificador de la posición del mensaje en el código de los servicios
* resultObject = aquí se adjunta el resultado del servicio, ya sea un arreglo, un objeto, etc. Tal cual se mandaba antes de implementar este formato de respuesta.

