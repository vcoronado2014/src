import { Injectable } from '@angular/core';
import { Platform, ToastController, AlertController } from '@ionic/angular';
import { AppVersion } from '@ionic-native/app-version/ngx';
import * as moment from 'moment';
import { environment } from '../../environments/environment';
//notificaciones locales
import { ELocalNotificationTriggerUnit, LocalNotifications, ILocalNotificationActionType } from '@ionic-native/local-notifications/ngx';
//utiles
import { ServicioUtiles } from '../../app/services/ServicioUtiles';
//citas
import { ServicioCitas } from '../../app/services/ServicioCitas';
import { ServicioParametrosApp } from '../../app/services/ServicioParametrosApp';

@Injectable()
export class ServicioNotificaciones{
    citasArr = [];
    vacunasCovid = [];

    //evento click
    clickSub: any;

    constructor(
        public platform : Platform,
        public appVersion: AppVersion,
        public toast: ToastController,
        private localNotifications: LocalNotifications,
        private utiles: ServicioUtiles,
        private citas : ServicioCitas,
        public parametrosApp: ServicioParametrosApp,
        private alertController: AlertController,
    ){
      //inicializamos los valores
      moment.locale('es');
      localStorage.removeItem('NOTIFICACIONES_LOCALES_EVENTOS');
  
    }
    lanzarNotificacionPrueba(){
        if (this.utiles.isAppOnDevice()){
            this.localNotifications.schedule(
                {
                    id: 1,
                    title: 'Titulo prueba',
                    text: 'Notificación simple'
                }
            )
        }

    }
    crearNotificacion(id, titulo, texto){
        if (this.utiles.isAppOnDevice()){
            this.localNotifications.schedule(
                {
                    id: id,
                    title: titulo,
                    text: texto,
                    trigger: { in: 1, unit: ELocalNotificationTriggerUnit.MINUTE },
                    foreground: true,
                }
            )
        }
        else{
            //web
            this.utiles.presentToast(titulo + '\r\n' + texto, 'bottom', 10000);
        }
    }

    //nuevo para autentificarse
    unsub() {
        this.clickSub.unsubscribe();
    }    

    async presentAlert(data) {
        const alert = await this.alertController.create({
            header: 'Alert',
            message: data,
            buttons: ['OK']
        });
        await alert.present();
    }

    crearNotificacionEvento(id, titulo, texto, url, paciente){
        console.log(paciente);
        if (this.utiles.isAppOnDevice()){
            this.clickSub = this.localNotifications.on('click').subscribe(data => {
                console.log(data);
                //this.presentAlert('Your notifiations contains a secret = ' + data.data.secret);
                this.utiles.autentificarDirectoLogin(url, paciente);
                this.unsub();
              });

            this.localNotifications.schedule(
                {
                    id: id,
                    title: titulo,
                    text: texto,
                    trigger: { in: 1, unit: ELocalNotificationTriggerUnit.MINUTE },
                    foreground: true,
                    data: {url: url}
                }
            )
        }
        else{
            //web
            //this.utiles.presentToast(titulo + '\r\n' + texto, 'bottom', 10000);
            this.utiles.presentToastWithOptions(titulo, texto, 'top', url, paciente);
        }
    }

    notificacionCita(accion, data){
        if (this.utiles.isAppOnDevice()){
            
            if (accion === 'booked'){
                //this.utiles.presentToast('Cita reservada con éxito!!', 'bottom', 3000);
                
                console.log(data);
              }
              else if (accion === 'confirmed'){
                //this.utiles.presentToast('Cita confirmada con éxito!!', 'bottom', 3000);
                console.log(data);
              }
              else if (accion === 'cancelled'){
                //this.utiles.presentToast('Cita anulada con éxito!!', 'bottom', 3000);
                console.log(data);
              }
        }
    }
    buscarCitas(){
        var usuario = null;
        if (localStorage.getItem('UsuarioAps')){
            usuario = JSON.parse(localStorage.getItem('UsuarioAps'));
        }
        var annoConsultar = 0;
        var mesConsultar = 0;
        this.citasArr = [];
        var fechaActual = moment();
        var fechaEvaluar = moment().add(5, 'days');
        var mesActual = {
          mes: fechaActual.month() + 1,
          anno: fechaActual.year()
        };
        var mesEvaluar = {
            mes: fechaEvaluar.month() + 1,
            anno: fechaEvaluar.year()
        };
        //debemos ver si en los 5 dias de diferencia hay dos meses o un mes
        if (mesActual.mes == mesEvaluar.mes && mesActual.anno == mesEvaluar.anno){
            //es le mismo mes
            mesConsultar = mesActual.mes;
            annoConsultar = mesActual.anno;
        }
        else{
            //hay diferencia, por tanto se toma el ultimo mes
            mesConsultar = mesEvaluar.mes;
            annoConsultar = mesEvaluar.anno;
        }

        if (usuario != null){
            if (this.utiles.isAppOnDevice()){
                if (this.parametrosApp.USA_API_MANAGEMENT()){
                    this.citas.entregaPorMesNuevoApiNative(usuario.Id, usuario.IdRyf, usuario.NodId, mesConsultar, annoConsultar).then((response: any) => {
                        //aca debemos procesar las citas
                        var todas = JSON.parse(response.data);
                        if (todas && todas.length > 0) {
                            //aplicamos el primer filtro
                            var nuevas = todas.filter(e => e.Mostrar == true);
                            var total = nuevas.filter(e => moment(e.FechaCompleta) >= moment() && moment(e.FechaCompleta) <= moment().add(5, 'days'));
                            if (total && total.length > 0) {
                                //por cada uno de estos debemos hacer un mensaje
                                for (var i = 0; i < total.length; i++) {
                                    var fecha = moment(total[i].Eventos[0].DetalleEventoMes.FechaHora).format("DD-MM-YYYY");
                                    var hora = total[i].Eventos[0].HoraInicioFin;
                                    var lugar = total[i].Eventos[0].DetalleEventoMes.Lugar;
                                    var id = total[i].Eventos[0].DetalleEventoMes.IdElemento;
                                    var titulo = total[i].Eventos[0].DetalleEventoMes.Titulo;
                                    var texto = fecha + ' ' + hora + '\n' + total[i].Eventos[0].DetalleEventoMes.DescripcionPrincipal + '\n' + total[i].Eventos[0].DetalleEventoMes.DescripcionSecundaria + '\n' + lugar;
                                    //var texto = total[i].Eventos[0].DetalleEventoMes.DescripcionPrincipal + ", " + total[i].Eventos[0].DetalleEventoMes.DescripcionSecundaria;
                                    this.crearNotificacion(id, titulo, texto);
                                }
                            }

                            console.log(nuevas);
                        }

                    }).catch(error=>{
                        console.log(error.message);
                        //this.utiles.presentToast('Hay errores al comunicarse con el servidor, contacte al administrador', 'bottom', 2000);
                    })
                }
                else {
                    this.citas.entregaPorMesNuevoNative(usuario.Id, usuario.IdRyf, usuario.NodId, mesConsultar, annoConsultar).then((response: any) => {
                        //aca debemos procesar las citas
                        var todas = JSON.parse(response.data);
                        if (todas && todas.length > 0) {
                            //aplicamos el primer filtro
                            var nuevas = todas.filter(e => e.Mostrar == true);
                            var total = nuevas.filter(e => moment(e.FechaCompleta) >= moment() && moment(e.FechaCompleta) <= moment().add(5, 'days'));
                            if (total && total.length > 0) {
                                //por cada uno de estos debemos hacer un mensaje
                                for (var i = 0; i < total.length; i++) {
                                    var fecha = moment(total[i].Eventos[0].DetalleEventoMes.FechaHora).format("DD-MM-YYYY");
                                    var hora = total[i].Eventos[0].HoraInicioFin;
                                    var lugar = total[i].Eventos[0].DetalleEventoMes.Lugar;
                                    var id = total[i].Eventos[0].DetalleEventoMes.IdElemento;
                                    var titulo = total[i].Eventos[0].DetalleEventoMes.Titulo;
                                    var texto = fecha + ' ' + hora + '\n' + total[i].Eventos[0].DetalleEventoMes.DescripcionPrincipal + '\n' + total[i].Eventos[0].DetalleEventoMes.DescripcionSecundaria + '\n' + lugar;
                                    //var texto = total[i].Eventos[0].DetalleEventoMes.DescripcionPrincipal + ", " + total[i].Eventos[0].DetalleEventoMes.DescripcionSecundaria;
                                    this.crearNotificacion(id, titulo, texto);
                                }
                            }

                            console.log(nuevas);
                        }

                    }).catch(error=>{
                        console.log(error.message);
                        //this.utiles.presentToast('Hay errores al comunicarse con el servidor, contacte al administrador', 'bottom', 2000);
                    })
                }
            }
            else{
                if (this.parametrosApp.USA_API_MANAGEMENT()){
                    this.citas.entregaPorMesNuevoApi(usuario.Id, usuario.IdRyf, usuario.NodId, mesConsultar, annoConsultar).subscribe((response: any) => {
                        //aca debemos procesar las citas
                        var todas = response;
                        if (todas && todas.length > 0) {
                            //aplicamos el primer filtro
                            var nuevas = todas.filter(e => e.Mostrar == true);
                            var total = nuevas.filter(e => moment(e.FechaCompleta) >= moment() && moment(e.FechaCompleta) <= moment().add(5, 'days'));
                            if (total && total.length > 0) {
                                //por cada uno de estos debemos hacer un mensaje
                                for (var i = 0; i < total.length; i++) {
                                    var fecha = moment(total[i].Eventos[0].DetalleEventoMes.FechaHora).format("DD-MM-YYYY");
                                    var hora = total[i].Eventos[0].HoraInicioFin;
                                    var lugar = total[i].Eventos[0].DetalleEventoMes.Lugar;
                                    var id = total[i].Eventos[0].DetalleEventoMes.IdElemento;
                                    var titulo = total[i].Eventos[0].DetalleEventoMes.Titulo;
                                    var texto = fecha + ' ' + hora + '\n' + total[i].Eventos[0].DetalleEventoMes.DescripcionPrincipal + '\n' + total[i].Eventos[0].DetalleEventoMes.DescripcionSecundaria + '\n' + lugar;
                                    //var texto = total[i].Eventos[0].DetalleEventoMes.DescripcionPrincipal + ", " + total[i].Eventos[0].DetalleEventoMes.DescripcionSecundaria;
                                    this.crearNotificacion(id, titulo, texto);
                                }
                            }

                            console.log(nuevas);
                        }

                    }, error=>{
                        console.log(error.message);
                        //this.utiles.presentToast('Hay errores al comunicarse con el servidor, contacte al administrador', 'bottom', 2000);
                    })
                }
                else {
                    this.citas.entregaPorMesNuevo(usuario.Id, usuario.IdRyf, usuario.NodId, mesConsultar, annoConsultar).subscribe((response: any) => {
                        //aca debemos procesar las citas
                        var todas = response;
                        if (todas && todas.length > 0) {
                            //aplicamos el primer filtro
                            var nuevas = todas.filter(e => e.Mostrar == true);
                            var total = nuevas.filter(e => moment(e.FechaCompleta) >= moment() && moment(e.FechaCompleta) <= moment().add(5, 'days'));
                            if (total && total.length > 0) {
                                //por cada uno de estos debemos hacer un mensaje
                                for (var i = 0; i < total.length; i++) {
                                    var fecha = moment(total[i].Eventos[0].DetalleEventoMes.FechaHora).format("DD-MM-YYYY");
                                    var hora = total[i].Eventos[0].HoraInicioFin;
                                    var lugar = total[i].Eventos[0].DetalleEventoMes.Lugar;
                                    var id = total[i].Eventos[0].DetalleEventoMes.IdElemento;
                                    var titulo = total[i].Eventos[0].DetalleEventoMes.Titulo;
                                    var texto = fecha + ' ' + hora + '\n' + total[i].Eventos[0].DetalleEventoMes.DescripcionPrincipal + '\n' + total[i].Eventos[0].DetalleEventoMes.DescripcionSecundaria + '\n' + lugar;
                                    //var texto = total[i].Eventos[0].DetalleEventoMes.DescripcionPrincipal + ", " + total[i].Eventos[0].DetalleEventoMes.DescripcionSecundaria;
                                    this.crearNotificacion(id, titulo, texto);
                                }
                            }

                            console.log(nuevas);
                        }

                    },error=>{
                        console.log(error.message);
                        //this.utiles.presentToast('Hay errores al comunicarse con el servidor, contacte al administrador', 'bottom', 2000);
                    })
                }
            }

        }
    }
    private agregarEntidadLocal(titulo, nombreCompleto, indice, id, contenido){

        let entidad = {
            Titulo: titulo,
            Subtitulo: nombreCompleto,
            Contenido: contenido,
            Id: id,
            Indice: indice
        }
        if (localStorage.getItem('NOTIFICACIONES_LOCALES_EVENTOS')){
            //SI YA EXISTE HACEMOS PUSH
            var eventoEsta = false;
            let lista = JSON.parse(localStorage.getItem('NOTIFICACIONES_LOCALES_EVENTOS'));
            //primero revisamos que el evento no este ya agregado
            let evento = lista.filter(p=>p.Contenido == contenido);
            if (evento && evento.length > 0){
                eventoEsta = true;
            }
            if (eventoEsta == false) {
                lista.push(entidad);
                localStorage.setItem('NOTIFICACIONES_LOCALES_EVENTOS', JSON.stringify(lista));
            }
        }
        else{
            let lista = [];
            lista.push(entidad);
            localStorage.setItem('NOTIFICACIONES_LOCALES_EVENTOS', JSON.stringify(lista));
        }
    }
    buscarCitasTodas(){
        var indice = 1000;
        var usuario = null;
        if (localStorage.getItem('UsuarioAps')){
            usuario = JSON.parse(localStorage.getItem('UsuarioAps'));
        }
        var annoConsultar = 0;
        var mesConsultar = 0;
        this.citasArr = [];
        var fechaActual = moment();
        var fechaEvaluar = moment().add(5, 'days');
        var mesActual = {
          mes: fechaActual.month() + 1,
          anno: fechaActual.year()
        };
        var mesEvaluar = {
            mes: fechaEvaluar.month() + 1,
            anno: fechaEvaluar.year()
        };
        //debemos ver si en los 5 dias de diferencia hay dos meses o un mes
        if (mesActual.mes == mesEvaluar.mes && mesActual.anno == mesEvaluar.anno){
            //es le mismo mes
            mesConsultar = mesActual.mes;
            annoConsultar = mesActual.anno;
        }
        else{
            //hay diferencia, por tanto se toma el ultimo mes
            mesConsultar = mesEvaluar.mes;
            annoConsultar = mesEvaluar.anno;
        }
        if (usuario != null){
            if (this.utiles.isAppOnDevice()){
                //llamada nativa
                if (this.parametrosApp.USA_API_MANAGEMENT()){
                    this.citas.entregaPorMesNuevoLivianoApiNative(usuario.Id, usuario.IdRyf, usuario.NodId, mesConsultar, annoConsultar).then((response: any) => {
                        //aca debemos procesar las citas
                        var todas = JSON.parse(response.data);

                        if (todas && todas.length > 0) {
                            for (var i = 0; i < todas.length; i++){
                                if (todas[i].Eventos && todas[i].Eventos.length > 0){
                                    //foreach a LOS EVENTOS
                                    for(var s = 0; s < todas[i].Eventos.length; s++){
                                        var fecha = moment(todas[i].Eventos[s].DetalleEventoMes.FechaHora).format("DD-MM-YYYY");
                                        var hora = todas[i].Eventos[s].HoraInicioFin;
                                        var lugar = todas[i].Eventos[s].DetalleEventoMes.Lugar;
                                        var id = todas[i].Eventos[s].DetalleEventoMes.IdElemento;
                                        var titulo = todas[i].Eventos[s].DetalleEventoMes.Titulo;
                                        var texto = fecha + ' ' + hora + '\n' + todas[i].Eventos[s].DetalleEventoMes.DescripcionPrincipal + '\n' + todas[i].Eventos[s].DetalleEventoMes.DescripcionSecundaria + '\n' + lugar;
                                        //var texto = total[i].Eventos[0].DetalleEventoMes.DescripcionPrincipal + ", " + total[i].Eventos[0].DetalleEventoMes.DescripcionSecundaria;
                                        this.agregarEntidadLocal(todas[i].Eventos[s].DetalleEventoMes.Titulo, todas[i].Eventos[s].DetalleEventoMes.NombrePaciente,
                                            indice, id, texto);
                                        indice++;
                                        this.crearNotificacion(id, titulo, texto);
                                    }
                                }
                            }
                        }

                    }).catch(error => {
                        console.log(error.message);
                        //this.utiles.presentToast('Hay errores al comunicarse con el servidor, contacte al administrador', 'bottom', 2000);
                    })
                }
                else{
                    this.citas.entregaPorMesNuevoNative(usuario.Id, usuario.IdRyf, usuario.NodId, mesConsultar, annoConsultar).then((response: any) => {
                        //aca debemos procesar las citas
                        var todas = JSON.parse(response.data);
                        if (todas && todas.length > 0) {
                            //aplicamos el primer filtro
                            var nuevas = todas.filter(e => e.Mostrar == true);
                            var total = nuevas.filter(e => moment(e.FechaCompleta) >= moment() && moment(e.FechaCompleta) <= moment().add(5, 'days'));
                            if (total && total.length > 0) {
                                //por cada uno de estos debemos hacer un mensaje
                                for (var i = 0; i < total.length; i++) {
                                    var fecha = moment(total[i].Eventos[0].DetalleEventoMes.FechaHora).format("DD-MM-YYYY");
                                    var hora = total[i].Eventos[0].HoraInicioFin;
                                    var lugar = total[i].Eventos[0].DetalleEventoMes.Lugar;
                                    var id = total[i].Eventos[0].DetalleEventoMes.IdElemento;
                                    var titulo = total[i].Eventos[0].DetalleEventoMes.Titulo;
                                    var texto = fecha + ' ' + hora + '\n' + total[i].Eventos[0].DetalleEventoMes.DescripcionPrincipal + '\n' + total[i].Eventos[0].DetalleEventoMes.DescripcionSecundaria + '\n' + lugar;
                                    //var texto = total[i].Eventos[0].DetalleEventoMes.DescripcionPrincipal + ", " + total[i].Eventos[0].DetalleEventoMes.DescripcionSecundaria;
                                    this.agregarEntidadLocal(total[i].Eventos[0].DetalleEventoMes.Titulo, total[i].Eventos[0].DetalleEventoMes.NombrePaciente,
                                        indice, id, texto);
                                    indice++;
                                    this.crearNotificacion(id, titulo, texto);
                                }
                            }

                            console.log(nuevas);
                        }

                    }).catch(error => {
                        console.log(error.message);
                        //lo comentamos por mientras
                        //this.utiles.presentToast('Hay errores al comunicarse con el servidor, contacte al administrador', 'bottom', 2000);
                    })
                }
            }
            else{
                //llamada web
                if (this.parametrosApp.USA_API_MANAGEMENT()){
                    this.citas.entregaPorMesNuevoLivianoApi(usuario.Id, usuario.IdRyf, usuario.NodId, mesConsultar, annoConsultar).subscribe((response: any) => {
                        var todas = response;
                        if (todas && todas.length > 0) {
                            for (var i = 0; i < todas.length; i++){
                                if (todas[i].Eventos && todas[i].Eventos.length > 0){
                                    //foreach a LOS EVENTOS
                                    for(var s = 0; s < todas[i].Eventos.length; s++){
                                        var fecha = moment(todas[i].Eventos[s].DetalleEventoMes.FechaHora).format("DD-MM-YYYY");
                                        var hora = todas[i].Eventos[s].HoraInicioFin;
                                        var lugar = todas[i].Eventos[s].DetalleEventoMes.Lugar;
                                        var id = todas[i].Eventos[s].DetalleEventoMes.IdElemento;
                                        var titulo = todas[i].Eventos[s].DetalleEventoMes.Titulo;
                                        var texto = fecha + ' ' + hora + '\n' + todas[i].Eventos[s].DetalleEventoMes.DescripcionPrincipal + '\n' + todas[i].Eventos[s].DetalleEventoMes.DescripcionSecundaria + '\n' + lugar;
                                        //var texto = total[i].Eventos[0].DetalleEventoMes.DescripcionPrincipal + ", " + total[i].Eventos[0].DetalleEventoMes.DescripcionSecundaria;
                                        this.agregarEntidadLocal(todas[i].Eventos[s].DetalleEventoMes.Titulo, todas[i].Eventos[s].DetalleEventoMes.NombrePaciente,
                                            indice, id, texto);
                                        indice++;
                                        this.crearNotificacion(id, titulo, texto);
                                    }
                                }
                            }
                        }
                    });
                }
                else{
                    this.citas.entregaPorMesNuevo(usuario.Id, usuario.IdRyf, usuario.NodId, mesConsultar, annoConsultar).subscribe((response: any) => {
                        //aca debemos procesar las citas
                        var todas = response;
                        if (todas && todas.length > 0) {
                            //aplicamos el primer filtro
                            var nuevas = todas.filter(e => e.Mostrar == true);
                            var total = nuevas.filter(e => moment(e.FechaCompleta) >= moment() && moment(e.FechaCompleta) <= moment().add(5, 'days'));
                            if (total && total.length > 0) {
                                //por cada uno de estos debemos hacer un mensaje
                                for (var i = 0; i < total.length; i++) {
                                    var fecha = moment(total[i].Eventos[0].DetalleEventoMes.FechaHora).format("DD-MM-YYYY");
                                    var hora = total[i].Eventos[0].HoraInicioFin;
                                    var lugar = total[i].Eventos[0].DetalleEventoMes.Lugar;
                                    var id = total[i].Eventos[0].DetalleEventoMes.IdElemento;
                                    var titulo = total[i].Eventos[0].DetalleEventoMes.Titulo;
                                    var texto = fecha + ' ' + hora + '\n' + total[i].Eventos[0].DetalleEventoMes.DescripcionPrincipal + '\n' + total[i].Eventos[0].DetalleEventoMes.DescripcionSecundaria + '\n' + lugar;
                                    //var texto = total[i].Eventos[0].DetalleEventoMes.DescripcionPrincipal + ", " + total[i].Eventos[0].DetalleEventoMes.DescripcionSecundaria;
                                    this.agregarEntidadLocal(total[i].Eventos[0].DetalleEventoMes.Titulo, total[i].Eventos[0].DetalleEventoMes.NombrePaciente,
                                        indice, id, texto);
                                    indice++;
                                    this.crearNotificacion(id, titulo, texto);
                                }
                            }

                            console.log(nuevas);
                        }

                    },error=>{
                        console.log(error.message);
                        //lo comentamos por miientras
                        //this.utiles.presentToast('Hay errores al comunicarse con el servidor, contacte al administrador', 'bottom', 2000);
                    })
                }
            }
        }
    }
    construyeNotificaciones(todas){
        var arr = [];
        var indice = 1;
        if (localStorage.getItem('UsuarioAps')){
            var usuario = JSON.parse(localStorage.getItem('UsuarioAps'));
            if (usuario && usuario.VacunasCovid){
                if (usuario.VacunasCovid.length > 0){
                    usuario.VacunasCovid.forEach(element => {
                        let entidad = {
                            Titulo: element.DescripcionDosis + ' ' + element.DescripcionVacuna,
                            Subtitulo: usuario.Nombres + ' ' + usuario.ApellidoPaterno + ' ' + usuario.ApellidoMaterno,
                            Contenido: 'Tienes aplicada esta dosis el día ' + moment(element.FechaInmunizacion).format('DD-MM-YYYY') + ' en el centro de salud ' + element.DescripcionEstablecimiento,
                            Id: element.Id,
                            Indice: indice,
                            IrA: null
                        }
                        arr.push(entidad);
                        indice++;
                    });
                }

            }
        }
        //local storage
        if (localStorage.getItem('UsuariosFamilia')){
            var usuarios = JSON.parse(localStorage.getItem('UsuariosFamilia'));
            if (usuarios && usuarios.length > 0){
                usuarios.forEach(usuario => {
                    if (usuario && usuario.VacunasCovid.length > 0){
                        usuario.VacunasCovid.forEach(element => {
                            let entidad = {
                                Titulo: element.DescripcionDosis + ' ' + element.DescripcionVacuna,
                                Subtitulo: usuario.Nombres + ' ' + usuario.ApellidoPaterno + ' ' + usuario.ApellidoMaterno,
                                Contenido: 'Tienes aplicada esta dosis el día ' + moment(element.FechaInmunizacion).format('DD-MM-YYYY') + ' en el centro de salud ' + element.DescripcionEstablecimiento,
                                Id: element.Id,
                                Indice: indice,
                                IrA: null
                            }
                            arr.push(entidad);
                            indice++;
                        });
                    }
                })
            }
        }
        if (todas && todas.length > 0) {
            for (var i = 0; i < todas.length; i++){
                if (todas[i].Eventos && todas[i].Eventos.length > 0){
                    //foreach a LOS EVENTOS
                    for(var s = 0; s < todas[i].Eventos.length; s++){
                        var fecha = moment(todas[i].Eventos[s].DetalleEventoMes.FechaHora).format("DD-MM-YYYY");
                        var hora = todas[i].Eventos[s].HoraInicioFin;
                        var lugar = todas[i].Eventos[s].DetalleEventoMes.Lugar;
                        var id = todas[i].Eventos[s].DetalleEventoMes.IdElemento;
                        var titulo = todas[i].Eventos[s].DetalleEventoMes.Titulo;
                        var texto = fecha + ' ' + hora + '\n' + todas[i].Eventos[s].DetalleEventoMes.DescripcionPrincipal + '\n' + todas[i].Eventos[s].DetalleEventoMes.DescripcionSecundaria + '\n' + lugar;
                        //var texto = total[i].Eventos[0].DetalleEventoMes.DescripcionPrincipal + ", " + total[i].Eventos[0].DetalleEventoMes.DescripcionSecundaria;
                        let entidad = {
                            Titulo: titulo,
                            Subtitulo: todas[i].Eventos[s].DetalleEventoMes.NombrePaciente,
                            Contenido: texto,
                            Id: id,
                            Indice: indice,
                            IrA: null
                        }
                        arr.push(entidad);
                        indice++;

                    }
                }
            }
        }
        //familia por aceptar
        if (localStorage.getItem('FAMILIA-POR-ACEPTAR')) {
            let arrFam = JSON.parse(localStorage.getItem('FAMILIA-POR-ACEPTAR'));
            arrFam.forEach(familia => {
                let entidad = {
                    Titulo: 'Miembro de la familia',
                    Subtitulo: familia.NombreCompleto,
                    Contenido: 'Tienes a ' + familia.NombreCompleto + ' que podrías aceptar y ver su información de salud',
                    Id: familia.Id,
                    Indice: indice,
                    IrA: 'asociar-familia'
                }
                arr.push(entidad);
                indice++;
            });
        }
        return arr;
    }

    //falta definir cuales serán las notificaciones locales y cuales serán las push
    //por lo pronto sólo se dejará cuando haya familia por aceptar
    construyeNotificacionesLocales(todas){
        var arrAtencionSesion = [];
        var arr = [];
        var indice = 1;
        //familia por aceptar
        if (localStorage.getItem('FAMILIA-POR-ACEPTAR')) {
            let arrFam = JSON.parse(localStorage.getItem('FAMILIA-POR-ACEPTAR'));
            arrFam.forEach(familia => {
                let entidad = {
                    Titulo: 'Miembro de la familia',
                    Subtitulo: familia.NombreCompleto,
                    Contenido: 'Tienes a ' + familia.NombreCompleto + ' que podrías aceptar y ver su información de salud',
                    Id: familia.Id,
                    Indice: indice,
                    IrA: 'asociar-familia'
                }
                arr.push(entidad);
                indice++;
            });
        }
        if (todas && todas.length > 0) {
            for (var i = 0; i < todas.length; i++){
                if (todas[i].Eventos && todas[i].Eventos.length > 0){
                    //foreach a LOS EVENTOS
                    for(var s = 0; s < todas[i].Eventos.length; s++){
                        var fecha = moment(todas[i].Eventos[s].DetalleEventoMes.FechaHora).format("DD-MM-YYYY");
                        var hora = todas[i].Eventos[s].HoraInicioFin;
                        var lugar = todas[i].Eventos[s].DetalleEventoMes.Lugar;
                        var id = todas[i].Eventos[s].DetalleEventoMes.IdElemento;
                        var titulo = todas[i].Eventos[s].DetalleEventoMes.Titulo;
                        //var texto = fecha + ' ' + hora + '\n' + todas[i].Eventos[s].DetalleEventoMes.DescripcionPrincipal + '\n' + todas[i].Eventos[s].DetalleEventoMes.DescripcionSecundaria + '\n' + lugar;
                        //para obtener al paciente
                        var paciente = this.utiles.entregaUsuarioRut(todas[i].Eventos[s].DetalleEventoMes.NombrePaciente);
                        var nombrePaciente = paciente != null ? paciente.Nombres + ' ' + paciente.ApellidoPaterno + ' ' + paciente.ApellidoMaterno : '';
                        //esta entidad la cambiaremos para que se pueda mostrar un modal o bien 
                        //se muestre la opción de anular o confirmar una cita
                        var esCita = todas[i].Eventos[s].DetalleEventoMes.Titulo == 'Cita' ? true : false;
                        var estado = todas[i].Eventos[s].DetalleEventoMes.Estado ? todas[i].Eventos[s].DetalleEventoMes.Estado : '';
                        var origenCita = todas[i].Eventos[s].DetalleEventoMes.OrigenCita ? todas[i].Eventos[s].DetalleEventoMes.OrigenCita : 0;
                        var colaId = todas[i].Eventos[s].DetalleEventoMes.ColaId ? todas[i].Eventos[s].DetalleEventoMes.ColaId : 0;
                        var colaVisto = todas[i].Eventos[s].DetalleEventoMes.ColaVisto ? todas[i].Eventos[s].DetalleEventoMes.ColaVisto : 0;
                        var texto = '';
                        if (estado != ''){
                            if (estado == 'cancelled'){
                                texto = 'Su cita para el día ' + fecha + ' a las ' + hora + ' en ' + lugar + ' con ' + todas[i].Eventos[s].DetalleEventoMes.DescripcionSecundaria + ', ha sido CANCELADA.';
                            }
                            else{
                                texto = 'Tienes una cita para el día ' + fecha + ' a las ' + hora + ' en ' + lugar + ' con ' + todas[i].Eventos[s].DetalleEventoMes.DescripcionSecundaria + ', recuerda presentarte con anticipación.';
                            }
                        }
                        else{
                            texto = fecha + ' ' + hora + '\n' + todas[i].Eventos[s].DetalleEventoMes.DescripcionPrincipal + '\n' + todas[i].Eventos[s].DetalleEventoMes.DescripcionSecundaria + '\n' + lugar;
                        }
                        let entidad = {
                            Titulo: titulo,
                            Subtitulo: nombrePaciente,
                            Contenido: texto,
                            Id: id,
                            Indice: indice,
                            IrA: null,
                            EsCita: esCita,
                            Estado: estado,
                            OrigenCita: origenCita,
                            ColaId: colaId,
                            ColaVisto: colaVisto
                        }
                        arr.push(entidad);
                        //tipos atencion locales occupados
                        if (estado != '' && estado != 'cancelled'){
                            //aca creamos y agregamos una nueva entidad
                            var tipoAten = todas[i].Eventos[s].DetalleEventoMes.DescripcionPrincipal;
                            var lugar = todas[i].Eventos[s].DetalleEventoMes.Lugar;
                            //var existe = arrAtencionSesion.filter(c=>c == tipoAten)[0] != null ? true : false;
                            var existe = arrAtencionSesion.filter(c=>c.Nombre == tipoAten && c.Lugar == lugar)[0] != null ? true : false;
                            if (!existe){
                                var tda = {
                                    Lugar: lugar,
                                    Nombre: tipoAten
                                }
                                //arrAtencionSesion.push(tipoAten);
                                arrAtencionSesion.push(tda);
                            }

                        }
                        indice++;

                    }
                }
            }
            //guardamos en sesion
            sessionStorage.setItem('TIPOS_ATENCION_OCUPADOS', JSON.stringify(arrAtencionSesion));
        }
        return arr;
    }

    crearNotificacionesCitas(todas, creaNotificacion){
        var indice = 1000;
        if (todas && todas.length > 0) {
            for (var i = 0; i < todas.length; i++){
                if (todas[i].Eventos && todas[i].Eventos.length > 0){
                    //foreach a LOS EVENTOS
                    for(var s = 0; s < todas[i].Eventos.length; s++){
                        var fecha = moment(todas[i].Eventos[s].DetalleEventoMes.FechaHora).format("DD-MM-YYYY");
                        var hora = todas[i].Eventos[s].HoraInicioFin;
                        var lugar = todas[i].Eventos[s].DetalleEventoMes.Lugar;
                        var id = todas[i].Eventos[s].DetalleEventoMes.IdElemento;
                        var titulo = todas[i].Eventos[s].DetalleEventoMes.Titulo;
                        var texto = fecha + ' ' + hora + '\n' + todas[i].Eventos[s].DetalleEventoMes.DescripcionPrincipal + '\n' + todas[i].Eventos[s].DetalleEventoMes.DescripcionSecundaria + '\n' + lugar;
                        //para obtener al paciente
                        var paciente = this.utiles.entregaUsuarioRut(todas[i].Eventos[s].DetalleEventoMes.NombrePaciente);
                        var nombrePaciente = paciente != null ? paciente.Nombres + ' ' + paciente.ApellidoPaterno + ' ' + paciente.ApellidoMaterno : '';

                        this.agregarEntidadLocal(todas[i].Eventos[s].DetalleEventoMes.Titulo, nombrePaciente,
                            indice, id, texto);
                        indice++;
                        //this.crearNotificacion(id, titulo, texto);
                        if (creaNotificacion){
                            this.crearNotificacionEvento(id, titulo, texto, 'calendario', paciente);
                        }
                        

                    }
                }
            }
        }
    }

    buscarCitasTodasLocales(){
        var indice = 1000;
        var annoConsultar = 0;
        var mesConsultar = 0;
        this.citasArr = [];
        var fechaActual = moment();
        var fechaEvaluar = moment().add(5, 'days');
        var mesActual = {
          mes: fechaActual.month() + 1,
          anno: fechaActual.year()
        };
        var mesEvaluar = {
            mes: fechaEvaluar.month() + 1,
            anno: fechaEvaluar.year()
        };
        //debemos ver si en los 5 dias de diferencia hay dos meses o un mes
        if (mesActual.mes == mesEvaluar.mes && mesActual.anno == mesEvaluar.anno){
            //es le mismo mes
            mesConsultar = mesActual.mes;
            annoConsultar = mesActual.anno;
        }
        else{
            //hay diferencia, por tanto se toma el ultimo mes
            mesConsultar = mesEvaluar.mes;
            annoConsultar = mesEvaluar.anno;
        }

        var ruts = this.entregaArregloRuts();
        if (ruts){
            if (!this.utiles.isAppOnDevice()){
                //web
                this.citas.postCitasWebFuturas(ruts).subscribe((response:any)=>{
                    var todas = response;
                    this.crearNotificacionesCitas(todas, true);
                })
            }
            else{
                //nativa
                this.citas.postCitasWebFuturasNative(ruts).then((response:any)=>{
                    var todas = JSON.parse(response.data);
                    this.crearNotificacionesCitas(todas, false);
                })
            }
        }
    }

    //por lo pronto generaremos esta búsqueda para traernos las citas locales
    //y no ir de nuevo al mes api liviano
    //ya que dicho método consume muchos recursos
    //se debe implementar esto con un servicio de windows
    entregaArregloRuts(){
        var usuarios = this.utiles.entregaArregloUsuarios();
        //de los usuarios necesitamos sus respectivos ids
        var arrRuts = [];
        if (usuarios && usuarios.length > 0){
            usuarios.forEach(usuario => {
                arrRuts.push(usuario.Rut);
            });
        }
        console.log(arrRuts.toString());
        return arrRuts.toString();
    }

}