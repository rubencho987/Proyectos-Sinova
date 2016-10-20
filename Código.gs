/*VARIABLES GLOBALES*/

//Nombre del Recurso: Sala de Eventos 001
IDRESOURCE = 'sinova.co_2d3438333733343132343132@resource.calendar.google.com'; 
NOMBRE_SALA = 'Sala principal de reuniones';
ACTIVE_USER_EMAIL = "ruben.sanchez@sinova.co"; //Session.getActiveUser().getEmail();
//Hoja de Cálculo
LIBRO_EVENTOS = SpreadsheetApp.openById('1A7AcpX3ipoXVoeEK8eCiTe4mZE5JvmVktNiLq1opCOE');
HOJA_EVENTOS = LIBRO_EVENTOS.getSheetByName('Registro de Eventos');
HOJA_CONFIG= LIBRO_EVENTOS.getSheetByName('Configuracion');

/**
@name   doGet
@desc   Esta función es la que permite implementar, acceder y recibir información desde una ruta por medio de la API HtmlService
        que Google nos ofrece, el cual puede extraer el contenido de una plantilla o crearlo.
        
@return Retorna un html

@author Ruben Dario Sanchez Ramirez. (ruben.sanchez@sinova.co)
@date   Junio 2016
**/
function doGet() {
  return HtmlService.createTemplateFromFile('Index').evaluate()
      .setTitle('Gestor de eventos')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME).setFaviconUrl('http://spottedkoi.com/wp-content/uploads/2012/01/favicon_page.png');
}
/**
@desc   Obetiene el contenido del archivo que recibe por paramatro 'filename'.
        
@param  {string} filename: nombre del archivo
        {Array} dd:shgdjs
        {} dds:sds
        
@return Retorna el contenido html del archivo.
@author Ruben Dario Sanchez Ramirez. (ruben.sanchez@sinova.co)
@date   Junio 2016
**/
function include(filename) 
{
  return HtmlService.createHtmlOutputFromFile(filename)
  .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .getContent();
}

/**
@name   getEventCurrent
@desc   Obetiene todos los eventos del dia con base a un recurso especifico
        
@param  
@return Retorna el contenido html del listado de eventos
@author Ruben Dario Sanchez Ramirez. (ruben.sanchez@sinova.co)
@date   Junio 2016
**/
function getEventCurrent(){
  try{
    var start= new Date().toISOString();
    var end = new Date(new Date().setHours(23,59,59,000)).toISOString();
    var events = [];
    var eventData = [];
    var calendarEvents = Calendar.Events.list(IDRESOURCE, {timeMin: start, timeMax: end,orderBy:'startTime',singleEvents:'true',timeZone:'GMT-05:00'});
    var countEvent = 1;
    Logger.log(calendarEvents.items.length)
    if(calendarEvents.items.length == 0){
      countEvent = 0;
    }
    for(var j = 0; j < countEvent; j++){
        var starDateEvent = IsoStringToDate(calendarEvents.items[j].start.dateTime);        
        var endDateEvent = IsoStringToDate(calendarEvents.items[j].end.dateTime);
        var hoursStart = starDateEvent[1]
        var hoursEnd= endDateEvent[1]
        var descripcion = calendarEvents.items[j].description
        var attendees = calendarEvents.items[j].attendees;
        var listAttendees = []
        var count = 1
        Logger.log(attendees)
        for(var k=0;k<attendees.length;k++){
          if((attendees[k].email).indexOf("@resource") == -1){
            var nameTemp =  (attendees[k].displayName);
            var organizer =  (attendees[k].organizer);
            if(nameTemp == null || nameTemp == undefined || nameTemp == '')
              nameTemp = 'Invitado '+count;
            else{
              //nameTemp = nameTemp.substring(0,nameTemp.indexOf(' '))
              var arrayNombres = nameTemp.split(' ');
              if(arrayNombres.length==4){
                 nameTemp = arrayNombres[0]+' '+arrayNombres[2];
              }else{
                nameTemp = arrayNombres[0]+' '+arrayNombres[1];
              }              
              // recortamos el nombre
              if(nameTemp.length > 14)
                nameTemp = nameTemp.substring(0,12)+'..'
            }
             if(listAttendees.length > 0 && organizer == true)
               listAttendees.unshift([getlinkImage(attendees[k].email),nameTemp,organizer])
             else
               listAttendees.push([getlinkImage(attendees[k].email),nameTemp,organizer])
             count++;
          }
        }
        if(descripcion == undefined)
          descripcion = ''
        var nameEvent = calendarEvents.items[j].summary;
      
        //Obtenemos la información del evento para almacenar en la hoja de cálculo.
        var idEvent = calendarEvents.items[j].id;
        var emailCreatorEvent = calendarEvents.items[j].creator.email;
        eventData.push(idEvent, emailCreatorEvent, nameEvent)
        Logger.log(listAttendees)
        events =[nameEvent.replace('undefined',''),descripcion,(hoursStart.replace('undefined','')),(hoursEnd.replace('undefined','')),listAttendees]
    }
  }catch(e){ Logger.log(e)}  
  Logger.log(events)
  return events;
}

/**
@name   getlinkImage
@desc   Obetiene todos los eventos del dia con base a un recurso especifico
        
@param  email {email}
@return Link de la imagen de google plus
@author Ruben Dario Sanchez Ramirez. (ruben.sanchez@sinova.co)
@date   Junio 2016
**/
function getlinkImage(email){
  var urlImg='http://ssl.gstatic.com/accounts/ui/avatar_2x.png';
  try{
    var profile = PlusDomains.People.get(email);
    urlImg = restablecerURL(profile.image.url);    
  }catch(e){Logger.log(e)}
  
  return urlImg
}

/**
@name   restablecerURL
@desc    

@param  
@return 
@author Rubén Darío Sánchez Ramírez. (ruben.sanchez@sinova.co)
@date   Junio 2016
**/
function restablecerURL(url) {
    var pos = url.indexOf("?");
    return url.substring(0, pos);
}

/**
@name   getEventsCalendarByDay
@desc   Obetiene todos los eventos del dia con base a un recurso especifico
        
@param  
@return Retorna el contenido html del listado de eventos
@author Ruben Dario Sanchez Ramirez. (ruben.sanchez@sinova.co)
@date   Junio 2016
**/
function getEventsCalendarByDay(){
  try{
    var descripcionSala = HOJA_CONFIG.getRange("B2").getValue();
    var start= new Date(new Date()).toISOString()
    var end = new Date(new Date().setHours(23,59,59,999)).toISOString()    
    var events = '';
    var calendarEvents = Calendar.Events.list(IDRESOURCE, {timeMin: start, timeMax: end,orderBy:'startTime',singleEvents:'true',timeZone:'GMT-05:00'});
    var eventsCount = calendarEvents.items.length;
    var startIndice = 1;
    if(eventsCount > 3){
      eventsCount = 3
    }
    for(var j=1; j < eventsCount; j++){
        var starDateEvent = IsoStringToDate(calendarEvents.items[j].start.dateTime);        
        var endDateEvent = IsoStringToDate(calendarEvents.items[j].end.dateTime);
        var hoursStart = starDateEvent[1]
        var hoursEnd= endDateEvent[1]
        var nameEvent = calendarEvents.items[j].summary;
        events += createHtmlDetails(nameEvent.replace('undefined',''),hoursStart.replace('undefined',''),hoursEnd.replace('undefined',''),calendarEvents.items[j].creator.email)
    }
  }catch(e){}  
  return [getEventCurrent(),events,descripcionSala,getAllHoursEventForDay()];
}

/**
@name   createHtmlDetails
@desc   Con base al nombre del evento, hora de inicio y hora de fin 
        
@param  nameEvent {String}
        hoursStart {String}
        hoursEnd {String}
@return Retorna el contenido html de los eventos
@author Ruben Dario Sanchez Ramirez. (ruben.sanchez@sinova.co)
@date   Junio 2016
**/
function createHtmlDetails(nameEvent,hoursStart,hoursEnd,email){
   return '<div class="pnlDetailsEventsNext"><span>'+nameEvent+' - </span> '+changeFormatterHours(hoursStart,12)+' a '+changeFormatterHours(hoursEnd,12)+' - ' +email+'</div>';
}

/**
@name   IsoStringToDate
@desc   Funcion que permiso convertir una fecha tipo ISO a una fecha normal
        
@param  format {date}
@return Fecha tipo new Date()
@author Ruben Dario Sanchez Ramirez. (ruben.sanchez@sinova.co)
@date   Junio 2016
**/
function IsoStringToDate(format){
  Logger.log("[ *** ] - "+format)
  var date='',hours='';
  if(format !='' && format !=undefined && format != null){
    //Logger.log(format)
    var limitDate = format.indexOf('T');
    date = format.substring(0 , limitDate).replace(/-/g,'/');
    //Logger.log(date)
    hours = format.substring(limitDate+1,format.length).split('-')[0]
    //Logger.log(hours)
  }
  return [date,hours]  
}
/**
@name   dateFromISO8601
@desc   Funcion que permiso convertir una fecha tipo ISO a una fecha normal
        
@param  format {date}
@return Fecha tipo new Date()
@author Ruben Dario Sanchez Ramirez. (ruben.sanchez@sinova.co)
@date   Junio 2016
**/
Date.dateFromISO8601 = function(isoDateString) {
    var parts = isoDateString.match(/\d+/g);
    //Logger.log(isoDateString)
    var isoTime = Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
    var isoDate = new Date(isoTime);
    return isoDate;
}
/**
@name   dateToISO8601String
@desc   Funcion que permiso convertir una fecha tipo ISO a una fecha normal
        
@param  format {date}
@return Fecha tipo new Date()
@author Ruben Dario Sanchez Ramirez. (ruben.sanchez@sinova.co)
@date   Junio 2016
**/
Date.prototype.dateToISO8601String = function() {
    var padDigits = function padDigits(number, digits) {
        return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
    }
    var offsetMinutes = this.getTimezoneOffset();
    var offsetHours = offsetMinutes / 60;
    var offset = "Z";
    if (offsetHours < 0) offset = "-" + padDigits(offsetHours.replace("-", "") + "00", 4);
    else if (offsetHours > 0) offset = "+" + padDigits(offsetHours + "00", 4);
    return this.getFullYear() + "-" + padDigits((this.getUTCMonth() + 1), 2) + "-" + padDigits(this.getUTCDate(), 2) + "T" + padDigits(this.getUTCHours(), 2) + ":" + padDigits(this.getUTCMinutes(), 2) + ":" + padDigits(this.getUTCSeconds(), 2) + "." + padDigits(this.getUTCMilliseconds(), 2) + offset;
}

/**
@name   formattearDate
@desc   Resmplazar los guiones por un eslach
        
@param  fecha {date}
@return fecha con nuevo formato
@author Ruben Dario Sanchez Ramirez. (ruben.sanchez@sinova.co)
@date   Junio 2016
**/      
function formattearDate(fecha){
    return fecha.replace(/-/g,'/')  
}

/**
@name   changeFormatterHours
@desc   Convierte una hora en el formato que este como parametro
        
@param  hours {time}
        format {number}: 12 || 24
@return hora con nuevo formato
@author Ruben Dario Sanchez Ramirez. (ruben.sanchez@sinova.co)
@date   Junio 2016
**/      
function changeFormatterHours(hours,format){
  var values = hours.split(':')
  var hoursNew = '';
  if(format == 12){
    var ident = 'AM'
    if(values[0] >= 12){
      ident = 'PM'
      values[0] = values[0] - 12
      if(values[0] == 0)
        values[0] = 12
    }
    
    if(String(values[0]).length==1)
      values[0] = '0'+values[0];
    if(String(values[1]).length==1)
      values[1] = '0'+values[1];
    
      hoursNew = values[0]+':'+values[1]+' '+ident
  }else{
     var d = new Date("1/1/2013 " + hours); 
     hoursNew = d.getHours() + ':' + d.getMinutes();
  }
  
    return hoursNew;
}

/**
@name   getAllEventsForDay
@desc   Obtiene todos los eventos del dia desde las 12AM a 11:59PM
        
@param  
@return Retorna el contenido html del listado de eventos
@author Ruben Dario Sanchez Ramirez. (ruben.sanchez@sinova.co)
@date   Junio 2016
**/
function getAllEventsForDay(){
  try{
    var start= new Date(new Date().setHours(0,0,0,0)).toISOString()
    var end = new Date(new Date().setHours(23,59,59,999)).toISOString()    
    var events = [];
    var calendarEvents = Calendar.Events.list(IDRESOURCE, {timeMin: start, timeMax: end,orderBy:'startTime',singleEvents:'true',timeZone:'GMT-05:00'});
    for(var j=0; j < calendarEvents.items.length; j++){
        var idRec = calendarEvents.items[j].recurringEventId
        if(idRec != null && idRec != '' && idRec != undefined){
          var val = validateEventRecirrent(idRec,calendarEvents.items[j].id,calendarEvents.items[j].creator.email,calendarEvents.items[j].summary)
          if(val == false){
            events.push([calendarEvents.items[j].id,calendarEvents.items[j].creator.email,nameEvent.replace('undefined',''),hoursStart.replace('undefined',''),hoursEnd.replace('undefined',''),'Iniciado'])
          }
        }else{
        var starDateEvent = IsoStringToDate(calendarEvents.items[j].start.dateTime);        
        var endDateEvent = IsoStringToDate(calendarEvents.items[j].end.dateTime);
        
        var hoursStart = starDateEvent[1]
        var hoursEnd= endDateEvent[1]
        var nameEvent = calendarEvents.items[j].summary;
        events.push([calendarEvents.items[j].id,calendarEvents.items[j].creator.email,nameEvent.replace('undefined',''),hoursStart.replace('undefined',''),hoursEnd.replace('undefined',''),'Iniciado'])
        }
        
    }
    var lastRow = parseInt(HOJA_EVENTOS.getLastRow())+1;
    var lastColumn = parseInt(HOJA_EVENTOS.getLastColumn());
    if(lastRow>2){
      var rangeCurrent = HOJA_EVENTOS.getRange(2,1,lastRow-2,lastColumn);
      var eventsNew = validateInformations(rangeCurrent.getValues(),events)
      if(eventsNew.length>0){
        var rangeNew = HOJA_EVENTOS.getRange(lastRow,1,eventsNew.length,eventsNew[0].length);
        rangeNew.setValues(eventsNew)
      }
    }else{
      var rangeNew = HOJA_EVENTOS.getRange(lastRow,1,events.length,events[0].length);
      rangeNew.setValues(events)
    }
  }catch(e){Logger.log(e.lineNumber)}  
  return ;
}
/**
@name   getAllHoursEventForDay
@desc   Obtiene todos los eventos del dia desde las 12AM a 11:59PM 
        
@param  
@return Retorna una matriz de2 columnas y n filas segun corresponda
@author Ruben Dario Sanchez Ramirez. (ruben.sanchez@sinova.co)
@date   Agosto 2016
**/
function getAllHoursEventForDay(){
  try{
    var start= new Date(new Date().setHours(0,0,0,0)).toISOString()
    var end = new Date(new Date().setHours(23,59,59,999)).toISOString()    
    var eventsHours = [];
    var calendarEvents = Calendar.Events.list(IDRESOURCE, {timeMin: start, timeMax: end,orderBy:'startTime',singleEvents:'true',timeZone:'GMT-05:00'});
    for(var j = 0; j < calendarEvents.items.length; j++){        
        var starDateEvent = IsoStringToDate(calendarEvents.items[j].start.dateTime);        
        var endDateEvent = IsoStringToDate(calendarEvents.items[j].end.dateTime);
        eventsHours.push([starDateEvent[1],endDateEvent[1]]);        
     }        
  }catch(e){Logger.log(e.lineNumber)}  
  return eventsHours;
}
/**
@name   validateInformations
@desc   Valida que la información que está en la hoja de cálculo no se repita al adicionar los nuevos eventos 
        
@param  
@return Array con valores a guardar
@author Ruben Dario Sanchez Ramirez. (ruben.sanchez@sinova.co)
@date   Junio 2016
**/
function validateInformations(dataCurrent,dataNew){
  try{
    Logger.log(dataCurrent)
    Logger.log(dataNew)
    var arrayNew = []
    var count = 0;
    for(var i=0; i < dataNew.length; i++){
      for(var j=0; j < dataCurrent.length; j++){
        if(dataNew[i][0]==dataCurrent[j][0]){
          count++;
          break;
        }
      }
     if(count==0)
       arrayNew.push(dataNew[i])
       
       count=0
    }
  }catch(e){}    
  
  return arrayNew;
}

/**
@name   validateInformations
@desc   Valida que la información que está en la hoja de cálculo no se repita al adicionar los nuevos eventos 
        
@param  
@return Array con valores a guardar
@author Ruben Dario Sanchez Ramirez. (ruben.sanchez@sinova.co)
@date   Junio 2016
**/
function validateEventRecirrent(eventRecurrenceId,eventId,email,nameEvent){
    var val = false;
  try{
    var eventRecurrent = Calendar.Events.get(IDRESOURCE, eventRecurrenceId);
    var starDateEvent = IsoStringToDate(eventRecurrent.start.dateTime);
    var difference = (new Date().setHours(0,0,0,0)) - (new Date(starDateEvent[0]).getTime()) 
    if( difference > getDiasToMilesegundos()){
      deleteResourceNotification(eventId,email,nameEvent,difference);
      val = true
    }
  }catch(e){Logger.log(e)}    
  Logger.log(val)
  return val;
}
/**
@name   getDiasToMilesegundos
@desc   obtiene los dias que tiene como parametro en la hoja de calculo
        
@param  
@return Array con valores a guardar
@author Ruben Dario Sanchez Ramirez. (ruben.sanchez@sinova.co)
@date   Junio 2016
**/
function getDiasToMilesegundos(){
  var dias = HOJA_CONFIG.getRange('A2').getValue();
      return (parseInt(dias) * 86400000)

}

/**
@name   sendMailNotification
@desc   Valida que la información que está en la hoja de cálculo no se repita al adicionar los nuevos eventos 
        
@param  
@return Array con valores a guardar
@author Ruben Dario Sanchez Ramirez. (ruben.sanchez@sinova.co)
@date   Junio 2016
**/
function sendMailNotification(nameEvento,email) {
    var correoHtml = HtmlService.createHtmlOutputFromFile('tpl_notification').getContent();
    correoHtml = correoHtml.replace('|*NOMBRE*|',nameEvento);
    correoHtml = correoHtml.replace('|*SALA*|',NOMBRE_SALA);
    MailApp.sendEmail(email, 'Notificación de eliminación de eventos', '', {
        htmlBody: correoHtml
    });
}

/**
@name   deleteResourceNotification
@desc   Elimina el evento por el ID y envia la notificacion correspondiente
        
@param  
@return Array con valores a guardar
@author Ruben Dario Sanchez Ramirez. (ruben.sanchez@sinova.co)
@date   Junio 2016
**/
function deleteResourceNotification(eventId,email,nameEvento,difference) {
CalendarApp.getCalendarById(IDRESOURCE).getEventSeriesById(eventId).deleteEventSeries()  
       sendMailNotification(nameEvento,email)
}

/**
@name   listAllUsers
@desc   Con base al servicio AdminSDK que google nos ofrece para poder tomar informacion de los usuarios del dominio

@param  
@return {Array} correo: retorna un arreglo con los correos que tiene el respectivo dominio.
@author Rubén Darío Sánchez Ramírez. (ruben.sanchez@sinova.co)
@date   08-Abr-2015
**/
function listAllUsers() {
  var pageToken, page;
  var emailList = [];
  Logger.log(getDomainUser())
  do {
    page = AdminDirectory.Users.list({
      domain: getDomainUser().toLowerCase(),
      orderBy: 'givenName',
      maxResults: 100,
      pageToken: pageToken
    });
    var users = page.users;
    if (users) {
      for (var i = 0; i < users.length; i++) {
        var user = users[i];
        emailList.push(user.primaryEmail)
      }
    } else {
      Logger.log('No users found.');
    }
    pageToken = page.nextPageToken;
  } while (pageToken);
  return remove(emailList, ACTIVE_USER_EMAIL);
}

/*
@desc: Función encargada de obtener el dominio del usuario
@return  {String} dominio del usario activo.
*/
function getDomainUser() {
  return (ACTIVE_USER_EMAIL.replace(/.*@/, "")).toUpperCase();
}

// funciones para crear eventos

function createEvent(data) {
 // Logger.log(data)
  //data = ["1", "2016-05-12", "12:01", "2016-05-12", "13:01", "", "", "111", "11"]
  var calendarId = IDRESOURCE;
  var msg = 'Evento creado satisfactoriamente'
  var arrayHoursStart = data[2].value.split(':')
  var arrayHoursEnd = data[3].value.split(':')
  var start = new Date();
  start.setHours(arrayHoursStart[0]);
  start.setMinutes(arrayHoursStart[1]);
  var end = new Date();
  end.setHours(arrayHoursEnd[0]);
  end.setMinutes(arrayHoursEnd[1]);
  
  if(validationTime(start,end)){
    return "Por favor verificar en la linea del tiempo los espacios disponibles para esta sala"
  }
  if(start-end == 0){
    return "El valor de las 2 horas no pueden ser los mismos"
  } 
  var event = {
    summary: data[1].value,
    location: NOMBRE_SALA,
    description: data[0].value+" invita a:\n"+data[5].value,
    start: {
      dateTime: start.toISOString()
    },
    end: {
      dateTime: end.toISOString()
    },
    attendees: [
    ],
    // Red background. Use Calendar.Colors.get() for the full list.
    colorId: 11
  };
    var invitadosArray = remove(data[4].value.split(','), ACTIVE_USER_EMAIL);
Logger.log(invitadosArray)
     event.attendees.push({'email':ACTIVE_USER_EMAIL})
    for(var i=0; i< invitadosArray.length;i++){
      event.attendees.push({'email':invitadosArray[i]})
    }
    
  event = Calendar.Events.insert(event, calendarId, {'sendNotifications': true});
  return msg
}

function validationTime(start,end){
  var calendarEvents = Calendar.Events.list(IDRESOURCE, {timeMin: start.toISOString(), timeMax: end.toISOString()});
  if(calendarEvents.items.length > 0 )
    return true;
  
    return false;
}

function remove(arr, item) {
  Logger.log(arr)
      for(var i = arr.length; i--;) {
          if(arr[i] === item) {
              arr.splice(i, 1);
          }
      }
  return arr;
}