import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, NavController, ToastController, Platform, LoadingController, MenuController, AlertController } from '@ionic/angular';
//SERVICIOS
import { ServicioUtiles } from '../../app/services/ServicioUtiles';
import { ServicioLaboratorio } from '../../app/services/ServicioLaboratorio';
import { ServicioCitas } from '../../app/services/ServicioCitas';
import { environment } from 'src/environments/environment';
//moment
import * as moment from 'moment';
//pipe
import { SplitPipe } from '../../app/pipes/split.pipe';

@Component({
  selector: 'app-modal-alertas',
  templateUrl: './modal-alertas.page.html',
  styleUrls: ['./modal-alertas.page.scss'],
})
export class ModalAlertasPage implements OnInit {
  estaCargando = false;
  tituloLoading = '';
  styleAvatar = false;
  notificaciones = [];
  notificacionesTodas = [];

  //para el manejo de los botones en las citas
  botonReservar = {
    Titulo: 'RESERVAR',
    Visible: false,
    Operacion: 'booked',
    Color: 'primary',
    Alert: '¿Reservar cita?'
  }
  botonConfirmar = {
    Titulo: 'CONFIRMAR',
    Visible: false,
    Operacion: 'confirmed',
    Color: 'primary',
    Alert: '¿Confirmar la reserva de cita?'
  }
  botonCancelar = {
    Titulo: 'ANULAR',
    Visible: false,
    Operacion: 'cancelled',
    Color: 'danger',
    Alert: '¿Anular la reserva de cita?'
  }
  constructor(
    public modalCtrl: ModalController,
    public navParams: NavParams,
    public utiles: ServicioUtiles,
    public navCtrl: NavController,
    public toast: ToastController,
    public platform: Platform,
    public menu: MenuController,
    public loading: LoadingController,
    private lab: ServicioLaboratorio,
    private alertController: AlertController,
    private agendar: ServicioCitas,
  ) { }

  /* ME FALTA ORDENAR LOS ELEMENTOS DE LAS ALERTAS */

  ngOnInit() {
    moment.locale('es');
    //traer las notificaciones que vienen desde la pagina home
    if (this.navParams.get('notificaciones')) {
      this.notificaciones = JSON.parse(this.navParams.get('notificaciones'));
      //lo ccomenttamos por nueva implementacion
      this.procesarAlertas();
      console.log(this.notificaciones);
      this.procesarAlertasAgrupadas();
    }
  }
  procesarAlertas() {
    if (this.notificaciones && this.notificaciones.length > 0) {
      this.notificaciones.forEach(alerta => {
        let usu = this.utiles.entregaUsuarioNombre(alerta.Subtitulo);
        alerta.UsuarioAps = usu == null ? null : usu;
        if (alerta.UsuarioAps != null) {
          alerta.UsuarioAps.UrlImagen = environment.URL_FOTOS + alerta.UsuarioAps.UrlImagen;
          if (alerta.UsuarioAps.Parentezco) {
            if (alerta.UsuarioAps.Parentezco.Nombre == 'La misma persona') {
              alerta.UsuarioAps.Parentezco.Nombre = 'Yo';
            }
          }
        }
        else {
          //si no está la notificacion viene por ejemplo de asociar un nuevo miembro de la familia
          alerta.UsuarioAps = {
            UrlImagen: '',
            Parentezco: {
              Nombre: ''
            }
          }
        }
      });
    }
  }
  private getTime(date?: Date) {
    return date != null ? new Date(date).getTime() : 0;
  }

  procesarAlertasAgrupadas() {
    this.notificacionesTodas = [];
    if (this.notificaciones && this.notificaciones.length > 0) {
      var usuariosTodos = this.utiles.entregaArregloUsuarios();
      if (usuariosTodos && usuariosTodos.length > 0) {
        usuariosTodos.forEach(usu => {
          usu.UrlImagen = environment.URL_FOTOS + usu.UrlImagen;
          if (usu.Parentezco.Nombre == 'La misma persona') {
            usu.Parentezco.Nombre = 'Yo';
          }
          //console.log(usu);
          //ahora a cada usuario le podemos agregar los eventos
          var notificacionesUsu = this.notificaciones.filter(n => n.UsuarioAps.Id == usu.Id);
          
          usu.Notificaciones = notificacionesUsu;
          usu.Notificaciones.sort((a: any, b: any) => { return this.getTime(a.FechaCompleta) - this.getTime(b.FechaCompleta) });

        });
      }
      //console.log(usuariosTodos);
      this.notificacionesTodas = usuariosTodos;
      
    }

    console.log(this.notificacionesTodas);

  }
  openNotificacion(modulo) {
    if (modulo && modulo != '') {
      this.dismiss();
      this.navCtrl.navigateRoot(modulo);
    }
  }
  //nuevos metodos
  openNotificacionModal(item) {
    console.log(item);
    /*         if (modulo && modulo != '') {
              this.dismiss();
              this.navCtrl.navigateRoot(modulo);
            } */
  }
  dismiss() {
    this.modalCtrl.dismiss();
  }


  revisarCita(evento, tituloBoton) {
    //aca hay solo booked y confirmed
    //si está booked puede confirmar y anular
    //si está confirmed solo puede anular
    //boton confirmar, anular
    var visible = [false, false];
    if (evento.Estado == 'booked' && tituloBoton == 'Confirmar' && evento.EsCita) {
      //si esta booked se puede confirmar
      visible = [true, true];
    }
    else if (evento.Estado == 'confirmed' && tituloBoton == 'Anular' && evento.EsCita) {
      //si esta booked se puede confirmar
      visible = [false, true];
    }
    else if (evento.Estado == 'booked' && tituloBoton == 'Anular' && evento.EsCita) {
      //si esta booked se puede confirmar
      visible = [true, true];
    }
    else {
      visible = [false, false]
    }
    return visible;
  }

  //acciones con las citas
  async presentAlertConfirm(boton, evento) {
    var titulo = '';

    const alert = await this.alertController.create({
      header: boton.Titulo,
      message: boton.Alert,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'danger',
          handler: (blah) => {
            //console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Si',
          cssClass: 'success',
          handler: () => {
            //aca debemos realizar la operación
            this.accionCita(boton, evento);
          }
        }
      ]
    });

    await alert.present();
  }

  async presentAlertConfirmBorrar(evento) {
    var titulo = '';

    const alert = await this.alertController.create({
      header: 'Borrar',
      message: '¿Está seguro de borrar esta alerta?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'danger',
          handler: (blah) => {
            //console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Si',
          cssClass: 'success',
          handler: () => {
            //aca debemos realizar la operación
            //this.accionCita(boton, evento);
            var colaId = evento.ColaId;
            var colaVisto = 1;
            this.accionBorrarNotificacion(colaId, colaVisto);
          }
        }
      ]
    });

    await alert.present();
  }


  async accionBorrarNotificacion(colaId, colaVisto) {
    this.estaCargando = true;
    this.tituloLoading = 'Borrando alerta';
    var retorno = null;
    if (!this.utiles.isAppOnDevice()) {
      //llamada web
      this.agendar.postColaMensaje(colaId, colaVisto).subscribe((response: any) => {
        this.procesarRespuestaCola(response);
      })
    }
    else {
      //llamada nativa
      this.agendar.postColaMensajeNative(colaId, colaVisto).then((responseData: any) => {
        var response = JSON.parse(responseData.data);
        this.procesarRespuestaCola(response);
      })
    }
  }

  async accionCita(boton, evento) {
    if (evento.Estado && evento.Estado != '') {
      //aca buscamos al paciente por el nombre
      //let usuarioCita = this.utiles.entregaUsuarioNombre(evento.DetalleEventoMes.NombrePaciente);
      //var idPaciente = this.usuarioAps.Rut;
      var idPaciente = evento.UsuarioAps.Rut;
      var idCita = evento.Id;
      var accion = boton.Operacion;
      //agregado 
      var origenCita = evento.OrigenCita;
      let loader = await this.loading.create({
        cssClass: 'loading-vacio',
        showBackdrop: false,
        spinner: null,
        duration: 2000
      });
      this.estaCargando = true;
      this.tituloLoading = 'Obteniendo respuesta';

      await loader.present().then(async () => {
        var retorno = null;
        if (!this.utiles.isAppOnDevice()) {
          //llamada web
          this.agendar.getOperacionCita(idCita, idPaciente, accion, origenCita).subscribe((response: any) => {
            this.procesarRespuestaAgendar(response, loader, accion);
          })
        }
        else {
          //llamada nativa
          this.agendar.getOperacionCitaNative(idCita, idPaciente, accion, origenCita).then((responseData: any) => {
            var response = JSON.parse(responseData.data);
            this.procesarRespuestaAgendar(response, loader, accion);
          })
        }
      });
    }

  }

  procesarRespuestaAgendar(data, loader, accion) {
    var retorno = null;
    if (data && data.Mensaje) {
      if (data.Mensaje.Codigo == 'correcto') {
        //todo bien
        retorno = data;
        //actualizar la pagina
        this.estaCargando = false;
        this.tituloLoading = '';
        if (accion === 'booked') {
          this.utiles.presentToast('Cita reservada con éxito!!', 'bottom', 3000);
        }
        else if (accion === 'confirmed') {
          this.utiles.presentToast('Cita confirmada con éxito!!', 'bottom', 3000);
        }
        else if (accion === 'cancelled') {
          //si la cita es cnacelada hay que quitarla de notificaciones locales
          //obtenemos el id dde la cita
          if (data.CitasDisponibles && data.CitasDisponibles.length == 1) {
            let idCita = data.CitasDisponibles[0].IdCita;
            this.utiles.removeCitaNotificacionesLocales(idCita);
          }
          this.utiles.presentToast('Cita anulada con éxito!!', 'bottom', 3000);
        }
        loader.dismiss();
        //enviar data al dismmis
        //this.dismiss(retorno);
        this.modalCtrl.dismiss({
          data: data.Mensaje
        });

      }
      else {
        this.estaCargando = false;
        this.tituloLoading = '';
        this.utiles.presentToast(data.Mensaje.Detalle.Texto, 'middle', 2000);
        loader.dismiss();
      }
    }
    else {
      //error en la operacion
      this.estaCargando = false;
      this.tituloLoading = '';
      this.utiles.presentToast('Error en la operación', 'middle', 2000);
      loader.dismiss();
    }

  }

  procesarRespuestaCola(data) {
    var retorno = null;
    if (data) {
      //todo bien
      retorno = data;
      //actualizar la pagina
      this.estaCargando = false;
      this.tituloLoading = '';
      this.utiles.presentToast('Alerta borrada con éxito!!', 'bottom', 3000);
      this.modalCtrl.dismiss({
        data: data
      });


    }

  }

}