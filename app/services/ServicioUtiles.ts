import { Injectable } from '@angular/core';
import { Platform, ToastController, NavController } from '@ionic/angular';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Device } from '@ionic-native/device/ngx';
import { Network } from '@ionic-native/network/ngx';
import * as moment from 'moment';
import { environment } from '../../environments/environment';
//servicio
import { ServicioGeo } from '../services/ServicioGeo';
import { ServicioAcceso } from '../services/ServicioAcceso';
import { NavigationExtras } from '@angular/router';
import { ServicioParametrosApp } from '../services/ServicioParametrosApp';

@Injectable()
export class ServicioUtiles{
    plataforma;
	versionAppName;
    versionNumber;
    infoAplicacion = {
        VersionAppName: '',
        VersionNumnber: '',
        Plataforma: ''
    }
    pais;
    provincia;
    region;
    comuna;
    semana = {
        start: '',
        end: '',
        texto:'',
        semanas: []
    }
    semanas: any = [];

    //pruebas con iionic storage
    tiempoSegundosActualizacionAntecedentes = 300;
    tiempoSegundosActualizacionVacunas = 300;
    
    constructor(
        public platform : Platform,
        public appVersion: AppVersion,
        public toast: ToastController,
        public device: Device,
        private servicioGeo: ServicioGeo,
        public network: Network,
        private acceso: ServicioAcceso,
        private navCtrl: NavController,
        private paramettros : ServicioParametrosApp
    ){
      //inicializamos los valores
      moment.locale('es');
  
    }

    isAppOnDevice(): boolean {
		if (window.location.port === '8100') {
			return false;
		} else {
			return true;
		}
    }

    procesarRespuestaMapa(objeto){
        //lo cambiamos a local storage para hacerlo más global
        //y no consultar tantas veces para ocupar la api
        var retorno = false;
         try {
             if (objeto.results && objeto.results[0]) {
                 if (objeto.results[0].address_components && objeto.results[0].address_components.length > 0) {
                     //ahora recorremos los elementos
                     objeto.results[0].address_components.forEach(element => {
                         let busquedaCom = element.types.find(ele => ele == 'administrative_area_level_3');
                         if (busquedaCom) {
                             this.comuna = element.long_name;
                             localStorage.setItem('comuna', this.comuna);
                         }
                         let busquedaReg = element.types.find(ele => ele == 'administrative_area_level_1');
                         if (busquedaReg) {
                             this.region = element.long_name;
                             localStorage.setItem('region', this.region);
                         }
                         let busquedaProv = element.types.find(ele => ele == 'administrative_area_level_2');
                         if (busquedaProv) {
                             this.provincia = element.long_name;
                             localStorage.setItem('provincia', this.provincia);
                         }
                         let busquedaPais = element.types.find(ele => ele == 'country');
                         if (busquedaPais) {
                             this.pais = element.long_name;
                             localStorage.setItem('pais', this.pais);
                         }
                     });
                 }
             }
             retorno = true;
         }
         catch (error) {
             console.log(error);
             
         }
         return retorno;
 
        //console.log(this.pais + ' ' + this.region);
     }

    async presentToast(mensaje, posicion, duracion) {
        const toas = await this.toast.create(
            {
                message: mensaje,
                position: posicion,
                duration: duracion
            }
        );
        toas.present();
    }
    insertarGuion(rut){
        var retorno = '';
        if (rut && rut.length >= 2){
            var index = rut.length -1;
            var parte1 = rut.slice(0, index);
            var parte2 = rut.slice(index, index+ 1);
            retorno = parte1 + '-' + parte2;
        }
        return retorno;
    }
    textoBienvenida(nombre){
        var fecha = moment();
        var hrs = fecha.hour();
        var sms = '';
        if (hrs<12){
            sms = 'Buenos días ' + nombre;
        }
        else if (hrs >= 12 && hrs <= 17){
            sms = 'Buenas tardes ' + nombre;
        }
        else if (hrs >= 17 && hrs <= 24){
            sms = 'Buenas noches ' + nombre;
        }
        return sms;
        
    }
/*     entregaMiColor(){
        var retorno = '#757575';
        if (sessionStorage.getItem('UsuarioAps')) {
            var usuarioAps = JSON.parse(sessionStorage.getItem('UsuarioAps'));
            if (usuarioAps.Color && usuarioAps.Color != '') {
                if (localStorage.getItem('MI_COLOR')) {
                    var colorSession = localStorage.getItem('MI_COLOR');
                    if (colorSession != usuarioAps.Color) {
                        retorno = colorSession;
                    }
                    else{
                        //esto hay que revisarlo
                        //retorno = usuarioAps.Color;
                        retorno = colorSession;
                    }
                }
                else {
                    retorno = usuarioAps.Color;
                }
            }
        }
        return retorno;
    } */
    entregaMiColor(){
        var retorno = '#757575';
        if (localStorage.getItem('MI_COLOR')){
            var miColor = localStorage.getItem('MI_COLOR');
            if (miColor != ''){
                retorno = miColor;
            }
        }
        return retorno;
    }
    cambiaColorLocalStorage(color){
        if (sessionStorage.getItem('UsuarioAps')){
            //si está lo obtenemos
            var usuarioAps = JSON.parse(sessionStorage.getItem('UsuarioAps'));
            if (usuarioAps){
                usuarioAps.Color = color;
            }
            //volvemos a guardar la variable
            sessionStorage.setItem('UsuarioAps', JSON.stringify(usuarioAps));
        }
    }
    entregaParametroUsaAgenda(){
        var usaAgenda = false;
        var usuarioAps = JSON.parse(sessionStorage.getItem('UsuarioAps'));
        if (usuarioAps.ParametrosRayen && usuarioAps.ParametrosRayen.length > 0){
            usuarioAps.ParametrosRayen.forEach(param => {
                if (param.Descripcion == 'DISPONIBILIZA_AGENDA_WEB'){
                    if (param.Valor == '1'){
                        usaAgenda = true;
                    }
                }
            });
        }
        return usaAgenda;
    }
    tieneFamiliaAceptada(){
        var retorno = false;
        if (localStorage.getItem('FAMILIA-ACEPTADA')){
            var fam = JSON.parse(localStorage.getItem('FAMILIA-ACEPTADA'));
            if (fam && fam.length > 0){
                retorno = true;
            }
        }
        return retorno;
    }
    tieneFamiliaRechazada(){
        var retorno = false;
        if (localStorage.getItem('FAMILIA-RECHAZADA')){
            var fam = JSON.parse(localStorage.getItem('FAMILIA-RECHAZADA'));
            if (fam && fam.length > 0){
                retorno = true;
            }
        }
        return retorno;
    }
    entregaMenuPages(){
        var usaAgenda = this.entregaParametroUsaAgenda();

        var arrPages = [];
/*         var pagUno = {
            title: 'Configurar familia',
            visible: true,
            icon: 'settings',
            src: 'familia',
            esSubMenu: false
        };
        arrPages.push(pagUno); */

        var pagUno = {
            title: 'Actualizar datos',
            visible: true,
            icon: 'cloud-upload',
            src: 'familia',
            esSubMenu: false,
            parrafo: 'En el centro de salud'
        };
        arrPages.push(pagUno);

        if (this.tieneFamiliaAceptada() || this.tieneFamiliaRechazada()) {
            var pagQuitarIntegrantes = {
                title: 'Configurar familia',
                visible: false,
                icon: 'people',
                src: 'quitar-familia',
                esSubMenu: false
            }
            arrPages.push(pagQuitarIntegrantes);
        }
        //ahora los submenus de configurar familia
        //simepre y cuando tenga familia aceptada
/*         if (this.tieneFamiliaAceptada() || this.tieneFamiliaRechazada()) {
            var pagQuitarIntegrantes = {
                title: 'Desactivar/Activar',
                visible: false,
                icon: 'person',
                src: 'quitar-familia',
                esSubMenu: true
            }
            arrPages.push(pagQuitarIntegrantes);
        }
        var pagConfigContacto = {
            title: 'Datos de contacto/avatar',
            visible: false,
            icon: 'share',
            src: 'familia',
            esSubMenu: true
        }
        arrPages.push(pagConfigContacto); 
        
        var pagDos = {
            title: 'Términos y condiciones',
            visible: true,
            src:'home',
            icon: 'link',
            esSubMenu: false
        };
        arrPages.push(pagDos);*/

        var usaContacto = this.paramettros.ENVIA_CORREO_CONTACTO();
        if (usaContacto){
            var pagDos = {
                title: 'Contacto',
                visible: true,
                src:'contacto',
                icon: 'mail',
                esSubMenu: false
            };
            arrPages.push(pagDos);
        }

        return arrPages;
    }
    entregaMiImagen(){
        var retorno = environment.URL_FOTOS + '/Recursos/logousuario.png';
        if (sessionStorage.getItem('UsuarioAps')) {
            var usuarioAps = JSON.parse(sessionStorage.getItem('UsuarioAps'));
            if (usuarioAps.UrlImagen && usuarioAps.UrlImagen != '') {
                if (localStorage.getItem('MI_IMAGEN')) {
                    var imagen = localStorage.getItem('MI_IMAGEN');
                    if (imagen != usuarioAps.Color) {
                        retorno = environment.URL_FOTOS + imagen;
                    }
                }
                else {
                    retorno = environment.URL_FOTOS + usuarioAps.UrlImagen;
                }
            }
        }
        //mostramos solo si tiene imagen valida
        if (retorno.includes('Recursos/logousuario.png')){
            retorno = '';
        }
        return retorno;
    }
    entregaColor(usuarioAps){
        var retorno = '#757575';
        if (usuarioAps) {
            if (usuarioAps.Color && usuarioAps.Color != '') {
                retorno = usuarioAps.Color;
            }
        }
        return retorno;
    }
    entregaImagen(usuarioAps){
        var retorno = environment.URL_FOTOS + '/Recursos/logousuario.png';
        if (usuarioAps) {
            if (usuarioAps.UrlImagen && usuarioAps.UrlImagen != '') {
                retorno = environment.URL_FOTOS  + usuarioAps.UrlImagen;
            }
        }
        //mostramos solo si tiene imagen valida
        if (retorno.includes('Recursos/logousuario.png')){
            retorno = '';
        }
        if (retorno == environment.URL_FOTOS + 'Recursos/'){
            retorno = '';
        }
        return retorno;
    }
    entregaMiNombre(){
        var retorno = '';
        if (sessionStorage.getItem('UsuarioAps')) {
            var usuarioAps = JSON.parse(sessionStorage.getItem('UsuarioAps'));
            var nombreInicial = usuarioAps.Nombres + ' ' + usuarioAps.ApellidoPaterno;
            if (nombreInicial != '') {
                if (localStorage.getItem('MI_NOMBRE')) {
                    var nombre = localStorage.getItem('MI_NOMBRE');
                    if (nombreInicial != nombre) {
                        retorno = nombre;
                    }
                    else {
                        retorno = nombreInicial;
                    }
                }
                else {
                    retorno = nombreInicial;
                }
            }
        }
        return retorno;
    }
    //metodos para construir semanas y días
    /*
        estructura
        start: '2020-11-10T00:00:00-04:00',
        end:   '2020-11-10T23:59:59-04:00',
        organization: 'codigo deis 199991',
        patient: 'run sin guion 17000904',
        serviceType: '346' //por el momento es el único
        texto: 'Horas disponibles/horas no disponibles',


    */
    construyeSemana(runPaciente, organization, fechaInicio){
        //fecha hora actual
        //en moment el formato T se usa moment().format() sin parametros
        //la fecha actual debe considerar la hora siempre buscar desde el día siguiente
        this.semanas = [];
        var actual = fechaInicio;
        var fechaInicioSemana = new Date(actual.getFullYear(), actual.getMonth(), actual.getDate(), 0,0,0,0 );
        var fechaInicioSemanaH = new Date(actual.getFullYear(), actual.getMonth(), actual.getDate(), 23,59,0,0 );
        var inicioSemanaM = moment(fechaInicioSemana).add(1, 'day');
        console.log(inicioSemanaM.format());

        var inicioSemanaH = moment(fechaInicioSemanaH).add(7, 'day');
        console.log(inicioSemanaH.format());
        
        var diff = inicioSemanaH.diff(inicioSemanaM, 'days');
        console.log(diff);
        this.semana.start = inicioSemanaM.format();
        this.semana.end = inicioSemanaH.format();
        //texto de la semana
        this.semana.texto = 'Semana entre el ' + inicioSemanaM.format('DD-MM-YYYY') + ' hasta ' + inicioSemanaH.format('DD-MM-YYYY');

/*         var entidadCompleta = {
            start: inicioSemanaM.format(),
            end: inicioSemanaH.format(),
        }; */

        if (diff > 0){
            for(var i=0; i<= diff; i++){
                //volvemos a procesar fechas locales
                var fechaInicioLocal = new Date(inicioSemanaM.year(), inicioSemanaM.month(), inicioSemanaM.date(), 0,0,0,0);
                var fechaTerminoLocal = new Date(inicioSemanaM.year(), inicioSemanaM.month(), inicioSemanaM.date(), 23,59,0,0);
                var fechaInicioLocalM = moment(fechaInicioLocal).add(i,'day');
                var fechaTerminoLocalM = moment(fechaTerminoLocal).add(i,'day');
                console.log('inicio local ' + fechaInicioLocalM.format() + ' termino local ' + fechaTerminoLocalM.format());
                var entidad = {
                    start: fechaInicioLocalM.format(),
                    end: fechaTerminoLocalM.format(),
                    organization: organization,
                    patient: runPaciente,
                    serviceType: '346',
                    texto: fechaInicioLocalM.format('DD'),
                    diaStr: fechaInicioLocalM.format('ddd'),
                    selected: false,
                    horaInicio: fechaInicioLocalM.format('HH:mm'),
                    horaTermino: fechaTerminoLocalM.format('HH:mm'),
                }
                if (i==0){
                    entidad.selected = true;
                }
                this.semanas.push(entidad);

                //console.log('vuelta ' + i);
            }
        }
        console.log(this.semanas);
        this.semana.semanas = this.semanas;

    }
    //inserta citas integracion a los eventos ya creados del mes
    /*
    {
    Eventos: [{
        Color: "#FF6666"
        DetalleEventoMes: {
            DescripcionPrincipal: "Examen ginecológico (general) (de rutina)"
            DescripcionSecundaria: "Consulta Morbilidad Gineco-Obstetrica "
            FechaHora: "2020-11-12T14:08:00"
            Lugar: "CESFAM Dr. Hernán Alessandri"
            NombrePaciente: "Pamela Andrea Drouilly Sandoval"
            Subtitulo: "Atención Realizada"
            Titulo: "Atención"
        }
        HoraInicioFin: "14:08"
        Imagen: "diagnostico.png"
        ListaFarmacos: null
        NombrePrincipal: "Examen ginecológico (general) (de rutina)"
        NombreSecundario: "Consulta Morbilidad Gineco-Obstetrica "
    }]
    FechaCompleta: "2020-11-01T00:00:00"
    Id: 1
    Mostrar: false
    NombreDia: "domingo"
    NombreDiaReducido: "dom."
    NumeroDia: 1}
    */
   insertaCitasAEventos(arrCitas, arrEventos, nombrePaciente){
       //SE ME ESTAN DUPLICANDO LAS CITAS
       //OJO REVISAR.
       if (arrEventos && arrEventos.length > 0){
           arrEventos.forEach(evento => {
               arrCitas.forEach(cita => {
                   var fechaEvento = moment(evento.FechaCompleta).format('YYYY-MM-DD');
                   var fechaCita = moment(cita.FechaHoraInicio).format('YYYY-MM-DD');
                   if (fechaEvento == fechaCita){
                       //coinciden hay que agregar eventos
                       var entidadEventoAgregar = {
                           Color: "#FF6666",
                           HoraInicioFin: moment(cita.FechaHoraInicio).format('HH:mm'),
                           Imagen: "cita.png",
                           ListaFarmacos: null,
                           NombrePrincipal: "Consulta Médica Web",
                           NombreSecundario: "Consulta Médica Web",
                           DetalleEventoMes: {
                            DescripcionPrincipal: 'Profesional: ' + cita.NombresMedico + ' ' + cita.ApellidosMedico,
                            DescripcionSecundaria: "Consulta Médica Web",
                            FechaHora: cita.FechaHoraInicio,
                            Lugar: cita.Servicio.Nombre,
                            NombrePaciente: nombrePaciente,
                            Subtitulo: "Próxima Cita",
                            Titulo: "Cita"
                        }
                       };
                       evento.Eventos.push(entidadEventoAgregar);
                   }
               });
           });
       }
   }
   //operacion 
   traduceString(entrada){
       var retorno = '';
       switch (entrada.toUpperCase()){
           //estados de cita
           case 'CANCELLED':
               retorno = 'Cancelada';
               break;
           case 'PROPOSED':
               retorno = 'Propuesta';
               break;
           case 'BOOKED':
               retorno = 'Reservada';
               break;
           case 'CONFIRMED':
               retorno = 'Confirmada';
               break;
           case 'FULLFILED':
               retorno = 'Finalizada';
               break;
           case 'NOSHOW':
               retorno = 'No se presentó';
               break;
           default:
               retorno = '';
               break;
                
       }
       return retorno;
   }
   convertirHoraInt(hora, minuto){
    var retorno = 0;
    var minutoStr = '';
    if (minuto < 10){
        minutoStr = '0' + minuto.toString();
    }
    else{
        minutoStr = minuto.toString();
    }
    retorno = parseInt(hora.toString() + minutoStr);
    return retorno;
   }
   encriptar(texto){
       return btoa(unescape(encodeURIComponent(texto)));
   }
   desencriptar(texto){
       return decodeURIComponent(escape(atob(texto)));
   }
   //validación de rut
    Rut(texto) {
        var largo;
        var tmpstr = "";
        for (var i = 0; i < texto.length; i++)
            if (texto.charAt(i) != ' ' && texto.charAt(i) != '.' && texto.charAt(i) != '-')
                tmpstr = tmpstr + texto.charAt(i);
        texto = tmpstr;
        largo = texto.length;

        if (largo < 2) {
            //this.presentToast("Debe ingresar el run completo", "bottom", 5000)
            return false;
        }

        for (var i = 0; i < largo; i++) {
            if (texto.charAt(i) != "0" && texto.charAt(i) != "1" && texto.charAt(i) != "2" && texto.charAt(i) != "3" && texto.charAt(i) != "4" && texto.charAt(i) != "5" && texto.charAt(i) != "6" && texto.charAt(i) != "7" && texto.charAt(i) != "8" && texto.charAt(i) != "9" && texto.charAt(i) != "k" && texto.charAt(i) != "K") {
                //this.presentToast("El valor ingresado no corresponde a un R.U.N valido", "bottom", 5000);
                return false;
            }
        }

        var invertido = "";
        for (i = (largo - 1), j = 0; i >= 0; i--, j++)
            invertido = invertido + texto.charAt(i);
        var dtexto = "";
        dtexto = dtexto + invertido.charAt(0);
        dtexto = dtexto + '-';
        var cnt = 0;

        for (var i = 1, j = 2; i < largo; i++, j++) {
            if (cnt == 3) {
                dtexto = dtexto + '.';
                j++;
                dtexto = dtexto + invertido.charAt(i);
                cnt = 1;
            }
            else {
                dtexto = dtexto + invertido.charAt(i);
                cnt++;
            }
        }

        invertido = "";
        for (i = (dtexto.length - 1), j = 0; i >= 0; i--, j++)
            invertido = invertido + dtexto.charAt(i);

        //hay que ver que hace esto
        //window.document.form1.rut.value = invertido.toUpperCase()		

        if (this.revisarDigito2(texto))
            return true;

        return false;
    }
    private revisarDigito(dvr) {
        var dv = dvr + ""
        if (dv != '0' && dv != '1' && dv != '2' && dv != '3' && dv != '4' && dv != '5' && dv != '6' && dv != '7' && dv != '8' && dv != '9' && dv != 'k' && dv != 'K') {
            //this.presentToast("Debe ingresar un digito verificador valido", "bottom", 5000);
            return false;
        }
        return true;
    }
    private revisarDigito2(crut) {
        var rut;
        var dv = '';
        var dvi;
        var largo = crut.length;
        if (largo < 2) {
            //this.presentToast("Debe ingresar el run completo", "bottom", 5000)
            return false;
        }
        if (largo > 2)
            rut = crut.substring(0, largo - 1);
        else
            rut = crut.charAt(0);
        dv = crut.charAt(largo - 1);
        this.revisarDigito(dv);

        if (rut == null || dv == null)
            return 0

        var dvr = '0'
        var suma = 0
        var mul = 2

        for (var i = rut.length - 1; i >= 0; i--) {
            suma = suma + rut.charAt(i) * mul
            if (mul == 7)
                mul = 2
            else
                mul++
        }
        var res = suma % 11
        if (res == 1)
            dvr = 'k'
        else if (res == 0)
            dvr = '0'
        else {
            dvi = 11 - res
            dvr = dvi + ""
        }
        if (dvr != dv.toLowerCase()) {
            //this.presentToast("EL run es incorrecto", "bottom", 5000)
            return false
        }

        return true
    }
    entregaIdDispositivo(){
        var token = '';
        if (localStorage.getItem('token_dispositivo')){
            token = localStorage.getItem('token_dispositivo');
        }
        else{
            if (this.isAppOnDevice()) {
                token = this.device.uuid;
            }
            else {
                token = (Math.random() * (1000000 - 1) + 1).toString() + ' web';
            }
        }
        return token;

    }

    async obtenerParametrosApp(esProduccion){
        var strProd = '0';
        if (esProduccion){
            strProd = '1';
        }
        if (!this.isAppOnDevice()) {
            //llamada web
            this.servicioGeo.getParametros(strProd).subscribe((response:any)=>{
              //procesar
              //console.log(response);
              console.log('Parametros app obtenidos con éxito.');
              localStorage.setItem('PARAMETROS_APP',JSON.stringify(response)) 
            }, error=>{
                console.log('error al obtener los parámetros de la app');
                console.error(error);
            })
          }
          else{
            this.servicioGeo.getParametrosNative(strProd).then((response:any)=>{
                //procesar
                var data = JSON.parse(response.data);
                localStorage.setItem('PARAMETROS_APP',JSON.stringify(data)) 
                //console.log(data);
                console.log('Parametros app obtenidos con éxito.');
              }, error=>{
                console.log('error al obtener los parámetros de la app');
                console.error(error);
              })
          }
    }
    //para registrar los movimientos
    async registrarMovimiento(rssId, modulo){
        if (!this.isAppOnDevice()) {
            //llamada web
            this.servicioGeo.postMovimientoApp(rssId, modulo).subscribe((response: any) => {
                //procesar
                console.log('Movimiento registrado ' + modulo + ' Id: ' + response);
            })
        }
        else{
            //llamada nativa
            this.servicioGeo.postMovimientoAppNative(rssId, modulo).then((response: any) => {
                //procesar
                var data = JSON.parse(response.data);
                console.log('Movimiento registrado ' + modulo + ' Id: ' + data);
            })
        }
    }
    entregaTokenFCM(){
        var token = '';
        if (localStorage.getItem('TOKEN_FIREBASE_MESSAGE')){
            token = localStorage.getItem('TOKEN_FIREBASE_MESSAGE');
        }
        return token;
    }
    //proceso que entrega un arreglo de elementos para la pagina home
    //ya vienen ordenados, hay que setear algunas propiedades de estilos
    //y otras cosas
    entregaArregloHome(data){
        var arr = [];

        if (data && data.length > 0){
            data.forEach(elemento => {
                //primero los 2 más favoritos
                if (elemento.Orden == 1 || elemento.Orden == 2){
                    elemento.Favorito = true;
                }
                else{
                    elemento.Favorito = false;
                }
                //segundo las imagenes
                if (elemento.NombreModulo == 'CALENDARIO'){
                    elemento.Imagen = './assets/imgs_svg/calendario-01.svg';
                }
                else if (elemento.NombreModulo == 'ANTECEDENTES'){
                    elemento.Imagen = './assets/imgs_svg/antecedentes.svg';
                }
                else if (elemento.NombreModulo == 'EXAMENES'){
                    elemento.Imagen = './assets/imgs_svg/examenes-de-salud.svg';
                }
                else if (elemento.NombreModulo == 'INTERCONSULTAS'){
                    elemento.Imagen = './assets/imgs_svg/interconsulta_desactivado.svg';
                }
                //tercero la clase de la imagen
                elemento.ClaseImagen = 'imgs-home';
                arr.push(elemento);
            });
        }

        return arr;

    }

    actualizarContactabilidad(contactabilidad){
        //buscamos al usuario en local sttorage   
        if (localStorage.getItem('UsuarioAps')){
          var usu = JSON.parse(localStorage.getItem('UsuarioAps'));
          if (usu){
            if (usu.Rut == contactabilidad.Run){
              usu.Contactabilidad = contactabilidad;
              localStorage.setItem('UsuarioAps', JSON.stringify(usu));
            }
          }
        }
        if (localStorage.getItem('UsuariosFamilia')){
          var existe = false;
          var usuarios = JSON.parse(localStorage.getItem('UsuariosFamilia'));
          if (usuarios && usuarios.length > 0){
            for(var i=0; i < usuarios.length; i++){
              if (usuarios[i].Rut == contactabilidad.Run){
                usuarios[i].Contactabilidad = contactabilidad;
                existe = true;
              }
            }
          }
          if (existe){
            localStorage.setItem('UsuariosFamilia', JSON.stringify(usuarios));
          }
        }
    
      }

    //entrega true si tiene familia asociada
    tieneFamilia() {
        var retorno = false;
        if (localStorage.getItem('UsuariosFamilia')){
          var existe = false;
          var usuarios = JSON.parse(localStorage.getItem('UsuariosFamilia'));
          if (usuarios && usuarios.length > 0){
            retorno = true;
          }
        }
        return retorno;
    }

    entregaUsuario(id){
        //buscamos al usuario en local sttorage
        let usuario = null;   
        if (localStorage.getItem('UsuarioAps')){
          var usu = JSON.parse(localStorage.getItem('UsuarioAps'));
          if (usu){
            if (usu.Id == id){
              usuario = usu;
            }
          }
        }
        if (localStorage.getItem('UsuariosFamilia')){
          var existe = false;
          var usuarios = JSON.parse(localStorage.getItem('UsuariosFamilia'));
          if (usuarios && usuarios.length > 0){
            for(var i=0; i < usuarios.length; i++){
              if (usuarios[i].Id == id){
                usuario = usuarios[i];
              }
            }
          }
        }
        return usuario;
    
      }
      entregaUsuarioNombre(nombre){
        //buscamos al usuario en local sttorage
        let usuario = null;   
        if (localStorage.getItem('UsuarioAps')){
          var usu = JSON.parse(localStorage.getItem('UsuarioAps'));
          if (usu){
            let nombreComparar = usu.Nombres + ' ' + usu.ApellidoPaterno + ' ' + usu.ApellidoMaterno;
            if (nombreComparar.toUpperCase() == nombre.toUpperCase()){
              usuario = usu;
            }
          }
        }
        if (localStorage.getItem('UsuariosFamilia')){
          var existe = false;
          var usuarios = JSON.parse(localStorage.getItem('UsuariosFamilia'));
          if (usuarios && usuarios.length > 0){
            for(var i=0; i < usuarios.length; i++){
              let nombreComparar = usuarios[i].Nombres + ' ' + usuarios[i].ApellidoPaterno + ' ' + usuarios[i].ApellidoMaterno;
              if (nombreComparar.toUpperCase() == nombre.toUpperCase()){
                usuario = usuarios[i];
              }
            }
          }
        }
        return usuario;
    
      }
    entregaArregloUsuarios() {
        var arr = [];
        if (localStorage.getItem('UsuarioAps')) {
            var usu = JSON.parse(localStorage.getItem('UsuarioAps'));
            if (usu) {
                arr.push(usu);
            }
        }
        if (localStorage.getItem('UsuariosFamilia')) {
            var existe = false;
            var usuarios = JSON.parse(localStorage.getItem('UsuariosFamilia'));
            if (usuarios && usuarios.length > 0) {
                for (var i = 0; i < usuarios.length; i++) {
                    arr.push(usuarios[i]);
                }
            }
        }
        return arr;
    }
    removeCitaNotificacionesLocales(idCita){
        if (localStorage.getItem('NOTIFICACIONES_LOCALES_EVENTOS')){
            var listaEventos = JSON.parse(localStorage.getItem('NOTIFICACIONES_LOCALES_EVENTOS'));
            if (listaEventos != null && listaEventos.length > 0){
                let listaSinElemento = listaEventos.filter(p=>p.Id != idCita);
                //esta es la nueva lista
                if (listaSinElemento && listaSinElemento.length > 0){
                    localStorage.setItem('NOTIFICACIONES_LOCALES_EVENTOS', JSON.stringify(listaSinElemento));
                }
            }
        }
    }
    //entrega y setea los parametros de token y otros
    async crearTokenPlano(){
        var entidad = {
            tokenDispositivo: '',
            versionAppName: '',
            versionNumber: '',
            plataforma: ''
        }
        if (!this.isAppOnDevice()) {
            //web
            //guardar local storage
            if (!localStorage.getItem('token_dispositivo')) {
              //crear token para web
              entidad.tokenDispositivo = (Math.random() * (1000000 - 1) + 1).toString() + ' web';
              localStorage.setItem('token_dispositivo', entidad.tokenDispositivo);
            }
            else {
              entidad.tokenDispositivo = localStorage.getItem('token_dispositivo');
            }
            entidad.versionAppName = "Mi salud familiar"
            entidad.versionNumber = "1.0.3";
            entidad.plataforma = "Web";
            //loader.dismiss();
            //otras variables
            localStorage.setItem('version_app_name', entidad.versionAppName);
            localStorage.setItem('version_number', entidad.versionNumber);
            localStorage.setItem('plataforma', entidad.plataforma);
          }
          else {
            if (this.platform.is('ios')){
              entidad.versionAppName = await this.appVersion.getAppName();
              entidad.versionNumber = await this.appVersion.getVersionNumber();
              entidad.plataforma = "iOS";
            } 
            else if (this.platform.is('android')){
              entidad.versionAppName = await this.appVersion.getAppName();
              entidad.versionNumber = await this.appVersion.getVersionNumber();
              entidad.plataforma = "Android";
            }
            else if (this.platform.is('mobileweb')){
              entidad.versionAppName = "Mi salud familiar"
              entidad.versionNumber = "1.0.3";
              entidad.plataforma = "Web";
            }
            else {
              entidad.versionAppName = "Mi salud familiar"
              entidad.versionNumber = "1.0.3";
              entidad.plataforma = "No informado";
            }
            //crear token para web
            var tokenDispositivo = this.device.uuid;
            localStorage.setItem('token_dispositivo', tokenDispositivo);
            //otras variables
            localStorage.setItem('version_app_name', entidad.versionAppName);
            localStorage.setItem('version_number', entidad.versionNumber);
            localStorage.setItem('plataforma', entidad.plataforma);
          }
    }
    necesitaActualizarDatosPaciente(uspId){
        var retorno = true;
        var fechaActual = moment();
        var fechaUltimaActualizacion = moment();
        if (localStorage.getItem('ANTECEDENTES')) {
            //tiene antecedentes, pero puede que no tenga antecddentes el usuario aps, en este caso hay que acrualizar
            var tiene = false;
            let antecedentes = JSON.parse(localStorage.getItem('ANTECEDENTES'));
            if (antecedentes && antecedentes.length > 0) {
                var arrUsuarioTiene = antecedentes.filter(p => p.UsuarioAps.Id == uspId);
                if (arrUsuarioTiene && arrUsuarioTiene.length > 0) {
                    tiene = true;
                }
            }
            if (tiene == false) {
                retorno = true;
            }
            else {
                if (localStorage.getItem('FECHA_ACTUALIZACION_ANTECEDENTES')) {
                    fechaUltimaActualizacion = moment(localStorage.getItem('FECHA_ACTUALIZACION_ANTECEDENTES'));
                    var diferencia = fechaActual.diff(fechaUltimaActualizacion, 'days');
                    if (diferencia < 1) {
                        retorno = false;
                    }
                }
            }

        }
        return retorno;
    }
    necesitaActualizarAlergiasPacientes(uspId){
        var retorno = true;
        var fechaActual = moment();
        var fechaUltimaActualizacion = moment();
        var tiene = false;
        let alergias = JSON.parse(localStorage.getItem('ALERGIAS'));
        if (alergias && alergias.length > 0) {
            var arrUsuarioTiene = alergias.filter(p => p.UsuarioAps.Id == uspId);
            if (arrUsuarioTiene && arrUsuarioTiene.length > 0) {
                tiene = true;
            }
        }
        if (tiene == false) {
            retorno = true;
        }
        else {
            if (localStorage.getItem('ALERGIAS')) {
                if (localStorage.getItem('FECHA_ACTUALIZACION_ALERGIAS')) {
                    fechaUltimaActualizacion = moment(localStorage.getItem('FECHA_ACTUALIZACION_ALERGIAS'));
                    var diferencia = fechaActual.diff(fechaUltimaActualizacion, 'days');
                    if (diferencia < 1) {
                        retorno = false;
                    }
                }
            }
        }

        return retorno;
    }
    necesitaActualizarMorbidosPacientes(uspId){
        var retorno = true;
        var fechaActual = moment();
        var fechaUltimaActualizacion = moment();
        var tiene = false;
        let morbidos = JSON.parse(localStorage.getItem('MORBIDOS'));
        if (morbidos && morbidos.length > 0) {
            var arrUsuarioTiene = morbidos.filter(p => p.UsuarioAps.Id == uspId);
            if (arrUsuarioTiene && arrUsuarioTiene.length > 0) {
                tiene = true;
            }
        }
        if (tiene == false) {
            retorno = true;
        }
        else {
            if (localStorage.getItem('MORBIDOS')) {
                if (localStorage.getItem('FECHA_ACTUALIZACION_MORBIDOS')) {
                    fechaUltimaActualizacion = moment(localStorage.getItem('FECHA_ACTUALIZACION_MORBIDOS'));
                    var diferencia = fechaActual.diff(fechaUltimaActualizacion, 'days');
                    if (diferencia < 1) {
                        retorno = false;
                    }
                }
            }
        }

        return retorno;
    }
    entregaArregloDatosPaciente(uspId){
        var antecedentes = [];
        if (localStorage.getItem('ANTECEDENTES')){
            var arreglo = JSON.parse(localStorage.getItem('ANTECEDENTES'));
            if (arreglo && arreglo.length > 0){
                for(var s in arreglo){
                    if (arreglo[s].UsuarioAps.Id == uspId){
                        antecedentes = arreglo[s].Mediciones;
                    }
                }
            }
        }

        return antecedentes;
    }
    entregaArregloAlergiasPaciente(uspId){
        var alergias = [];
        if (localStorage.getItem('ALERGIAS')){
            var arreglo = JSON.parse(localStorage.getItem('ALERGIAS'));
            if (arreglo && arreglo.length > 0){
                for(var s in arreglo){
                    if (arreglo[s].UsuarioAps.Id == uspId){
                        alergias = arreglo[s].Alergias;
                    }
                }
            }
        }

        return alergias;
    }
    entregaArregloMorbidosPaciente(uspId){
        var morbidos = [];
        if (localStorage.getItem('MORBIDOS')){
            var arreglo = JSON.parse(localStorage.getItem('MORBIDOS'));
            if (arreglo && arreglo.length > 0){
                for(var s in arreglo){
                    if (arreglo[s].UsuarioAps.Id == uspId){
                        morbidos = arreglo[s].Morbidos;
                    }
                }
            }
        }

        return morbidos;
    }
    //nuevos cambios
    isAppIOS(): boolean {
		if (window.location.port === '8100') {
			return false;
		} else {
            if (!this.platform.is('android'))
			    return true;
            else
                return false;
		}
    }

    guardarLogin(userName, password, recordarme){
        var pass = this.encriptar(password);
        localStorage.setItem('NOMBRE_USUARIO_LOGUEADO', userName);
        localStorage.setItem('PASS_USUARIO_LOGUEADO', pass);
        localStorage.setItem('RECORDARME', recordarme.toString());
    }
    tieneUsuarioYPassword(){
        var tieneUsuario = localStorage.getItem('NOMBRE_USUARIO_LOGUEADO') && localStorage.getItem('NOMBRE_USUARIO_LOGUEADO') != '' ? true : false;
        var tienePassword = localStorage.getItem('PASS_USUARIO_LOGUEADO') && localStorage.getItem('PASS_USUARIO_LOGUEADO') != '' ? true : false;
        
        return tieneUsuario && tienePassword;
    }
    getNombreUsuario(){
        return localStorage.getItem('NOMBRE_USUARIO_LOGUEADO') && localStorage.getItem('NOMBRE_USUARIO_LOGUEADO') != '' ? localStorage.getItem('NOMBRE_USUARIO_LOGUEADO') : '';
    }
    getPassword(){
        var pass = localStorage.getItem('PASS_USUARIO_LOGUEADO') && localStorage.getItem('PASS_USUARIO_LOGUEADO') != '' ? localStorage.getItem('PASS_USUARIO_LOGUEADO') : '';
        return this.desencriptar(pass);
    }
    getMiNombre(){
        return localStorage.getItem('MI_NOMBRE') && localStorage.getItem('MI_NOMBRE') != '' ? localStorage.getItem('MI_NOMBRE') : '';
    }
    entregaUsuarioRut(rut){
        //buscamos al usuario en local sttorage
        let usuario = null;   
        if (localStorage.getItem('UsuarioAps')){
          var usu = JSON.parse(localStorage.getItem('UsuarioAps'));
          if (usu){
            if (usu.Rut == rut){
              usuario = usu;
            }
          }
        }
        if (localStorage.getItem('UsuariosFamilia')){
          var existe = false;
          var usuarios = JSON.parse(localStorage.getItem('UsuariosFamilia'));
          if (usuarios && usuarios.length > 0){
            for(var i=0; i < usuarios.length; i++){
              if (usuarios[i].Rut == rut){
                usuario = usuarios[i];
              }
            }
          }
        }
        return usuario;
    
      }
      
    entregaMiImagenLogin() {
        var retorno = environment.URL_FOTOS + '/Recursos/logousuario.png';
        if (localStorage.getItem('MI_IMAGEN')) {
            var imagen = localStorage.getItem('MI_IMAGEN');
            retorno = environment.URL_FOTOS + imagen;
        }
        return retorno;
    }
    entregaInfoApp(){
        var ambiente = '';
        if (environment.API_ENDPOINT.includes('https://preapp.')){
            ambiente = 'Pre-producción';
        }
        else if (environment.API_ENDPOINT.includes('https://app.')){
            ambiente = 'Producción';
        }
        else{
            ambiente = 'Desarrollo';
        }

        var entidad = {
            Version: localStorage.getItem('version_number') ? localStorage.getItem('version_number') : '1.0.3',
            EsProduccion: environment.production,
            Nombre: localStorage.getItem('version_app_name') ? localStorage.getItem('version_app_name') : '',
            Ambiente: ambiente
        }
        return entidad;
    }
    //nuevo método para eliminar registro
    obtenerRegistro(){
        return localStorage.getItem('REGISTRO') && localStorage.getItem('REGISTRO') != '' ? JSON.parse(localStorage.getItem('REGISTRO')) : null;
    }
    
    limpiarCache(){
        localStorage.clear();
        sessionStorage.clear();
    }

    async presentToastWithOptions(titulo, mensaje, posicion, url, paciente) {
        const toast = await this.toast.create({
          header: titulo,
          message: mensaje,
          position: posicion,
          buttons: [
              {
                  text: 'Cerrar',
                  role: 'cancel',
                  handler: () => {
                      console.log('Cancel clicked');
                      toast.dismiss();
                  },
              },
              {
                  side: 'end',
                  text: 'Ver',
                  role: 'alert',
                  handler: () => {
                      console.log('Favorite clicked');
                      console.log(url);
                      this.autentificarDirectoLogin(url, paciente);
                      toast.dismiss();
                  },
              },

          ],
        });
        await toast.present();
      }

    autentificarDirectoLogin(url, paciente) {
        if (url) {
            //obtenemos las variables
            let correo = this.getNombreUsuario();
            if (correo == '') {
                //no se puede, ya que este parametro está vacío
                this.presentToast('No ha recordado su nombre de usuario, no puede autentificarse', 'bottom', 4000);
                return;
            }

            let password = this.encriptar(this.getPassword());
            if (password == '') {
                //no se puede, ya que este parametro está vacío
                this.presentToast('No ha recordado su nombre de usuario, no puede autentificarse', 'bottom', 4000);
                return;
            }

            this.irLogin(correo, password, paciente, url);

        }
    }   
    irLogin(user, password, paciente, url) {
        const navigationExtras: NavigationExtras = {
            queryParams: {
                user: user,
                password: password,
                idUsp: paciente.Id,
                url: url
            }
        };
        this.navCtrl.navigateBack(['nuevo-login'], navigationExtras);
    }

    //metodos para filtrar citas
    obtenerTdasProfesional(citasFiltradas, nombreProfesional){
        var nuevoArreglo = [];
        var cantidad = 0;
        var cantidadProcesar = 3;
        var arrTDAS = [];
        if (citasFiltradas && citasFiltradas.length > 0){
            citasFiltradas.forEach(cita => {
                if (cita.NombreCompletoMedico.toLowerCase() == nombreProfesional.toLowerCase()){
                    var tdas = arrTDAS.filter(t=>t.toLowerCase() == cita.TipoAtencion.toLowerCase());
                    if (tdas.length == 0){
                        arrTDAS.push(cita.TipoAtencion);
                    }
                }
            });
        }

        cantidad = arrTDAS.length;
        //hay que controlar la cantidad de citas de acuerdo al tipo de atencion
        if (cantidad > 1 && cantidad <= 2){
            cantidadProcesar = 3;
        }
        if (cantidad > 2 && cantidad <= 3){
            cantidadProcesar = 2;
        }
        if (cantidad > 3){
            cantidadProcesar = 1;
        }


        if (cantidad > 1){
            //debemos recorrer las citas por tdas y obtener al menos las primeras 2 de cada una
            arrTDAS.forEach(tda => {
                var elemento = citasFiltradas.filter(c=>c.TipoAtencion.toLowerCase() == tda.toLowerCase());
                //console.log(elemento);
                //determinamos el largo de los elementos a obtener
                var largo = elemento.length <= cantidadProcesar ? elemento.length : cantidadProcesar;
                var arr = elemento.slice(0, largo);
                //console.log(arr);
                nuevoArreglo = nuevoArreglo.concat(arr);
            });
        }
        else{
            nuevoArreglo = citasFiltradas;
        }
        //console.log(nuevoArreglo);
        this.indexarCitas(nuevoArreglo);
        return nuevoArreglo;
    }

    obtenerProfesionalTdas(citasFiltradas, nombreTda){
        var nuevoArreglo = [];
        var cantidad = 0;
        var cantidadProcesar = 3;
        var arrProf = [];
        if (citasFiltradas && citasFiltradas.length > 0){
            citasFiltradas.forEach(cita => {
                if (cita.TipoAtencion.toLowerCase() == nombreTda.toLowerCase()){
                    var tdas = arrProf.filter(t=>t.toLowerCase() == cita.NombreCompletoMedico.toLowerCase());
                    if (tdas.length == 0){
                        arrProf.push(cita.NombreCompletoMedico);
                    }
                }
            });
        }

        cantidad = arrProf.length;
        //hay que controlar la cantidad de citas de acuerdo al tipo de atencion
        if (cantidad > 1 && cantidad <= 2) {
            cantidadProcesar = 3;
        }
        if (cantidad > 2 && cantidad <= 3) {
            cantidadProcesar = 2;
        }
        if (cantidad > 3) {
            cantidadProcesar = 1;
        }
        if (cantidad > 1){
            //debemos recorrer las citas por tdas y obtener al menos las primeras 2 de cada una
            arrProf.forEach(tda => {
                var elemento = citasFiltradas.filter(c=>c.NombreCompletoMedico.toLowerCase() == tda.toLowerCase());
                //console.log(elemento);
                //determinamos el largo de los elementos a obtener
                var largo = elemento.length <= cantidadProcesar ? elemento.length : cantidadProcesar;
                var arr = elemento.slice(0, largo);
                //console.log(arr);
                nuevoArreglo = nuevoArreglo.concat(arr);
            });
        }
        else{
            nuevoArreglo = citasFiltradas;
        }
        //console.log(nuevoArreglo);
        this.indexarCitas(nuevoArreglo);
        return nuevoArreglo;
    }

    indexarCitas(citasFiltradas){
        var contador = 1;
        if (citasFiltradas && citasFiltradas.length > 0){
            citasFiltradas.forEach(cita => {
                cita.indice = contador;
                contador++;
            });
        }
    }
    entregaNodId() {
        //buscamos al usuario en local sttorage
        let nodId = 0;
        if (localStorage.getItem('UsuarioAps')) {
            var usu = JSON.parse(localStorage.getItem('UsuarioAps'));
            if (usu) {
                nodId = usu.NodId ? usu?.NodId : 0;
            }
        }
        return nodId;
    }

    entregaUsuarioLogueado(){
        return localStorage.getItem('UsuarioAps') ? JSON.parse(localStorage.getItem('UsuarioAps')) : null;
    }
    //los datos de rayen los dejaremos en sesion, solo se deberían actualizar cuando
    //se agregan miembros de la familia, ahi se fuerza la acctualizacion
    necesitaActualizarDatosRayen(fuerzaActualizacion) {
        var retorno = true;
        if (fuerzaActualizacion) {
            return retorno;
        }
        else {
            if (sessionStorage.getItem('USUARIOS_RAYEN')) {
                var tiene = false;
                let pacientes = JSON.parse(sessionStorage.getItem('USUARIOS_RAYEN'));
                if (pacientes && pacientes.length > 0) {
                    tiene = true;
                }
                if (tiene == false) {
                    retorno = true;
                }
                else {
                    retorno = false;
                }
            }
        }


        return retorno;
    }

    obtenerEstablecimientosRayen(uspId){
        var array = sessionStorage.getItem('ESTABLECIMIENTOS_USUARIO_RAYEN') ? JSON.parse(sessionStorage.getItem('ESTABLECIMIENTOS_USUARIO_RAYEN')) : [];
        array = array.filter(e=>e.uspId == uspId);
        return array;
    }
    
    entregaEstablecimientosUsuariosRayen() {
        //buscamos al usuario en local sttorage
        var arreglo = [];
        let usuario = null;
        if (localStorage.getItem('UsuarioAps')) {
            var usu = JSON.parse(localStorage.getItem('UsuarioAps'));
            if (usu) {
                if (usu.UsuarioNodos) {
                    usu.UsuarioNodos.forEach(usuNodo => {
                        var entidad = {
                            codigoDeis2014: usuNodo.CodigoDeis2014,
                            direccion: usuNodo.Direccion,
                            razonSocial: usuNodo.RazonSocial,
                            nodId: usuNodo.NodId,
                            esInscrito: usuNodo.EsInscrito,
                            idFuncionarioPrestadorCabecera: usuNodo.FnpIdCabecera,
                            nombreFuncionarioPrestadorCabecera: usuNodo.NombreMedicoCabecera,
                            uspId: usuNodo.UspId
                        };

                        arreglo.push(entidad);
                    });
                }
            }
        }
        if (localStorage.getItem('UsuariosFamilia')) {
            var existe = false;
            var usuarios = JSON.parse(localStorage.getItem('UsuariosFamilia'));
            if (usuarios && usuarios.length > 0) {
                for (var i = 0; i < usuarios.length; i++) {
                    if (usuarios[i].UsuarioNodos) {
                        usuarios[i].UsuarioNodos.forEach(usuNodo => {
                            var entidad = {
                                codigoDeis2014: usuNodo.CodigoDeis2014,
                                direccion: usuNodo.Direccion,
                                razonSocial: usuNodo.RazonSocial,
                                nodId: usuNodo.NodId,
                                esInscrito: usuNodo.EsInscrito,
                                idFuncionarioPrestadorCabecera: usuNodo.FnpIdCabecera,
                                nombreFuncionarioPrestadorCabecera: usuNodo.NombreMedicoCabecera,
                                uspId: usuNodo.UspId
                            };

                            arreglo.push(entidad);
                        });
                    }

                }
            }
        }
        return arreglo;

    }

    entregaEstablecimientoRayen(nodId, uspId){
        var retorno = null;
        var establecimientos = sessionStorage.getItem('ESTABLECIMIENTOS_USUARIO_RAYEN') ?
            JSON.parse(sessionStorage.getItem('ESTABLECIMIENTOS_USUARIO_RAYEN')) : [];
        
        if (establecimientos && establecimientos.length > 0){
            retorno = establecimientos.filter(e=>e.nodId == nodId && e.uspId == uspId)[0];
        }

        return retorno;
    }

    verificaNodoRayenAgregar(uspId, nodId){
        var agrega = false;
        var usuario = this.entregaUsuario(uspId);
        if (usuario && usuario.EntidadContratante && usuario.EntidadContratante.length > 0){
            for(let contratante of usuario.EntidadContratante){
                if (contratante.RelacionNodos && contratante.RelacionNodos.length > 0){
                    for(let rl of contratante.RelacionNodos){
                        if (rl.NodId == nodId){
                            agrega = true;
                            break;
                        }
                    }
                }
            }
        }
        return agrega;
    }
    obtenerEstablecimientoRayenPorNodId(nodId){
        var array = sessionStorage.getItem('ESTABLECIMIENTOS_USUARIO_RAYEN') ? JSON.parse(sessionStorage.getItem('ESTABLECIMIENTOS_USUARIO_RAYEN')) : [];
        array = array.filter(e=>e.nodId == nodId)[0];
        return array;
    }
    entregaEstablecimientosUsuariosRayenUsp(uspId) {
        //buscamos al usuario en local sttorage
        var arreglo = [];
        let usuario = null;
        if (localStorage.getItem('UsuarioAps')) {
            var usu = JSON.parse(localStorage.getItem('UsuarioAps'));
            if (usu) {
                if (usu.UsuarioNodos) {
                    usu.UsuarioNodos.forEach(usuNodo => {
                        if (usuNodo.UspId == uspId){
                            var entidad = {
                                codigoDeis2014: usuNodo.CodigoDeis2014,
                                direccion: usuNodo.Direccion,
                                razonSocial: usuNodo.RazonSocial,
                                nodId: usuNodo.NodId,
                                esInscrito: usuNodo.EsInscrito,
                                idFuncionarioPrestadorCabecera: usuNodo.FnpIdCabecera,
                                nombreFuncionarioPrestadorCabecera: usuNodo.NombreMedicoCabecera,
                                uspId: usuNodo.UspId
                            };

                            arreglo.push(entidad);  
                        }

                    });
                }
            }
        }
        if (localStorage.getItem('UsuariosFamilia')) {
            var existe = false;
            var usuarios = JSON.parse(localStorage.getItem('UsuariosFamilia'));
            if (usuarios && usuarios.length > 0) {
                for (var i = 0; i < usuarios.length; i++) {
                    if (usuarios[i].UsuarioNodos) {
                        usuarios[i].UsuarioNodos.forEach(usuNodo => {
                            if (usuNodo.UspId == uspId) {
                                var entidad = {
                                    codigoDeis2014: usuNodo.CodigoDeis2014,
                                    direccion: usuNodo.Direccion,
                                    razonSocial: usuNodo.RazonSocial,
                                    nodId: usuNodo.NodId,
                                    esInscrito: usuNodo.EsInscrito,
                                    idFuncionarioPrestadorCabecera: usuNodo.FnpIdCabecera,
                                    nombreFuncionarioPrestadorCabecera: usuNodo.NombreMedicoCabecera,
                                    uspId: usuNodo.UspId
                                };

                                arreglo.push(entidad);
                            }

                        });
                    }

                }
            }
        }
        return arreglo;

    }

    construteEstablecimientosLogin() {
        //buscamos al usuario en local sttorage
        var arreglo = [];
        if (localStorage.getItem('UsuarioAps')) {
            var usu = JSON.parse(localStorage.getItem('UsuarioAps'));
            if (usu) {
                if (usu.UsuarioNodos) {
                    usu.UsuarioNodos.forEach(usuNodo => {
                            var entidad = {
                                codigoDeis2014: usuNodo.CodigoDeis2014,
                                direccion: usuNodo.Direccion,
                                razonSocial: usuNodo.RazonSocial,
                                nodId: usuNodo.NodId,
                                esInscrito: usuNodo.EsInscrito,
                                idFuncionarioPrestadorCabecera: usuNodo.FnpIdCabecera,
                                nombreFuncionarioPrestadorCabecera: usuNodo.NombreMedicoCabecera,
                                uspId: usuNodo.UspId
                            };

                            arreglo.push(entidad);  

                    });
                }
            }
        }
        if (localStorage.getItem('UsuariosFamilia')) {
            var existe = false;
            var usuarios = JSON.parse(localStorage.getItem('UsuariosFamilia'));
            if (usuarios && usuarios.length > 0) {
                for (var i = 0; i < usuarios.length; i++) {
                    if (usuarios[i].UsuarioNodos) {
                        usuarios[i].UsuarioNodos.forEach(usuNodo => {

                                var entidad = {
                                    codigoDeis2014: usuNodo.CodigoDeis2014,
                                    direccion: usuNodo.Direccion,
                                    razonSocial: usuNodo.RazonSocial,
                                    nodId: usuNodo.NodId,
                                    esInscrito: usuNodo.EsInscrito,
                                    idFuncionarioPrestadorCabecera: usuNodo.FnpIdCabecera,
                                    nombreFuncionarioPrestadorCabecera: usuNodo.NombreMedicoCabecera,
                                    uspId: usuNodo.UspId
                                };

                                arreglo.push(entidad);

                        });
                    }

                }
            }
        }
        if (arreglo && arreglo.length > 0){
            sessionStorage.setItem('ESTABLECIMIENTOS_USUARIO_RAYEN', JSON.stringify(arreglo));
        }

    }

    entregaTiposAtencionOcupados(){
        var tdas = sessionStorage.getItem('TIPOS_ATENCION_OCUPADOS') ?
            JSON.parse(sessionStorage.getItem('TIPOS_ATENCION_OCUPADOS')) : [];

        return tdas;
    }
    entregaTiposAtencionOcupadosNodo(nombre){
        var tdas = sessionStorage.getItem('TIPOS_ATENCION_OCUPADOS') ?
            JSON.parse(sessionStorage.getItem('TIPOS_ATENCION_OCUPADOS')) : [];

        var filter = tdas.filter(t=>t.Lugar == nombre);
        
        return filter;
    }

    //metodos para ionic storage
    actualizaAntecedentes(fechaHoraUltimaActualizacion){
        var actualiza = false;
        if (fechaHoraUltimaActualizacion != null){
            let ultima = moment(fechaHoraUltimaActualizacion);
            let ahora = moment();
            let seconds = ahora.diff(ultima, 'seconds');
            if (seconds > this.tiempoSegundosActualizacionAntecedentes){
                actualiza = true;
            }
        }
        return actualiza;
    }

    actualizaVacunas(fechaHoraUltimaActualizacion){
        var actualiza = false;
        if (fechaHoraUltimaActualizacion != null){
            let ultima = moment(fechaHoraUltimaActualizacion);
            let ahora = moment();
            let seconds = ahora.diff(ultima, 'seconds');
            if (seconds > this.tiempoSegundosActualizacionVacunas){
                actualiza = true;
            }
        }
        return actualiza;
    }

}