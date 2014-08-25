var iabRef = null;

    function iabLoadStart(event) {
        //alert(event.type + ' - ' + event.url);
    }

    function iabLoadStop(event) {
        //alert(event.type + ' - ' + event.url);
    }

    function iabLoadError(event) {
        //alert(event.type + ' - ' + event.message);
    }

    function iabClose(event) {
         //alert(event.type);
         iabRef.removeEventListener('loadstart', iabLoadStart);
         iabRef.removeEventListener('loadstop', iabLoadStop);
         iabRef.removeEventListener('loaderror', iabLoadError);
         iabRef.removeEventListener('exit', iabClose);
    }

    function pagina() {
         iabRef = window.open('http://www.nubeet.com', '_blank', 'location=yes');
         iabRef.addEventListener('loadstart', iabLoadStart);
         iabRef.addEventListener('loadstop', iabLoadStop);
         iabRef.removeEventListener('loaderror', iabLoadError);
         iabRef.addEventListener('exit', iabClose);
    }