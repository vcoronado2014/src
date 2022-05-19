import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, NavParams, NavController, ToastController, Platform, LoadingController, MenuController, IonList, AlertController } from '@ionic/angular';
//SERVICIOS
import { ServicioUtiles } from '../../app/services/ServicioUtiles';
import { ServicioLaboratorio } from '../../app/services/ServicioLaboratorio';
import { ServicioCitas } from '../../app/services/ServicioCitas';
import { environment } from 'src/environments/environment';
import { MomentPipe } from '../../app/pipes/fecha.pipe';
//moment
import * as moment from 'moment';

@Component({
  selector: 'app-modal-operacion-cita',
  templateUrl: './modal-operacion-cita.page.html',
  styleUrls: ['./modal-operacion-cita.page.scss'],
})
export class ModalOperacionCitaPage implements OnInit {
  miColor = '#FF4081';
  //textColor Directive
  textColor = '#FFFFFF';
  public nombreUsuario;
  public usuarioAps;
  public user;
  public userColor;
  public cita;
  botonReservar = {
    Titulo: 'RESERVAR',
    Visible: false,
    Operacion: 'booked',
    Color: 'primary',
    Alert: '¿Está seguro de reservar la cita?'
  }
  botonConfirmar = {
    Titulo: 'CONFIRMAR',
    Visible: false,
    Operacion: 'confirmed',
    Color: 'primary',
    Alert: '¿Está seguro de confirmar la cita?'
  }
  botonCancelar = {
    Titulo: 'ANULAR',
    Visible: false,
    Operacion: 'cancelled',
    Color: 'danger',
    Alert: '¿Está seguro de anular la cita?'
  }
  public titulo;
  //para procesar
  estaCargando = false;
  tituloLoading = '';
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
    private agendar: ServicioCitas,
    private alertController: AlertController,
  ) { }

  ngOnInit() {
    moment.locale('es');
    //this.miColor = this.utiles.entregaMiColor();
    this.cita = JSON.parse(this.navParams.get('cita'));
    //this.operacion = this.navParams.get('operacion');
    //this.nombreUsuario = navParams.get('NombreUsuario');
    this.user = JSON.parse(sessionStorage.UsuarioAps);
    this.userColor = this.user.Color;
    this.miColor = this.utiles.entregaColor(this.user);
    if (this.cita) {
      /*
      proposed | pending | booked | confirmed | fulfilled | cancelled | noshow
      */
      if (this.cita.Estado == 'proposed') {
        this.titulo = 'Reserva de horas';
        this.botonReservar.Visible = true;
        this.botonCancelar.Visible = false;
        this.botonConfirmar.Visible = false;
      }
      else if (this.cita.Estado == 'booked') {
        //si esta booked se puede confirmar
        this.titulo = 'Confirmar/Anular hora';
        this.botonReservar.Visible = false;
        this.botonCancelar.Visible = true;
        this.botonConfirmar.Visible = true;
      }
      else if (this.cita.Estado == 'confirmed') {
        //si esta booked se puede confirmar
        this.titulo = 'Anular hora';
        this.botonReservar.Visible = false;
        this.botonCancelar.Visible = true;
        this.botonConfirmar.Visible = false;
      }
      else {
        this.titulo = 'No Cita';
        this.botonReservar.Visible = false;
        this.botonCancelar.Visible = false;
        this.botonConfirmar.Visible = false;

      }
      //console.log(this.cita);
      //console.log(this.operacion);

    }
  }
  dismiss() {
    this.modalCtrl.dismiss();
  }
  transformDate(value, format) {
    var pi = new MomentPipe();
    return pi.transform(value, format);
  }

  async accionCita(boton) {
    var idPaciente = this.cita.IdPaciente;
    var idCita = this.cita.IdCita;
    var accion = boton.Operacion;
    var origenCita = this.cita.OrigenCita;
    let loader = await this.loading.create({
      cssClass: 'loading-vacio',
      showBackdrop: false,
      spinner: null,
    });
    this.estaCargando = true;
    this.tituloLoading = 'Procesando cita';

    await loader.present().then(async () => {
      var retorno = null;
      if (!this.utiles.isAppOnDevice()) {
        //llamada web
        this.agendar.getOperacionCita(idCita, idPaciente, accion, origenCita).subscribe((response: any) => {
          this.procesarRespuesta(response, loader, accion);
        })
      }
      else {
        //llamada nativa
        this.agendar.getOperacionCitaNative(idCita, idPaciente, accion, origenCita).then((responseData: any) => {
          var response = JSON.parse(responseData.data);
          this.procesarRespuesta(response, loader, accion);
        })
      }
    });


  }
  procesarRespuesta(data, loader, accion) {
    var retorno = null;
    if (data && data.Mensaje) {
      if (data.Mensaje.Codigo == 'correcto') {
        //booked, confirmed, cancelled
        //todo bien
        this.estaCargando = false;
        this.tituloLoading = '';

        if (accion === 'booked') {
          //agregamos el tipo de atención ocupado *************
          var tipoAten = data.TiposAtencion && data.TiposAtencion.length > 0 ? data.TiposAtencion[0] : '';
          var lugar = data.CitasDisponibles && data.CitasDisponibles.length > 0 ? data.CitasDisponibles[0].Servicio.Nombre : '';
          if (tipoAten != ''){
            var arr = [];
            if (sessionStorage.getItem('TIPOS_ATENCION_OCUPADOS')){
              arr = JSON.parse(sessionStorage.getItem('TIPOS_ATENCION_OCUPADOS'));
              var existe = arr.filter(c=>c.Nombre == tipoAten && c.Lugar == lugar)[0] ? true : false;
              if (!existe){
                var tda = {
                  Nombre: tipoAten,
                  Lugar: lugar
                }
                arr.push(tda);
              }
            }
            else{
              var tda = {
                Nombre: tipoAten,
                Lugar: lugar
              }
              arr.push(tda);
            }
            sessionStorage.setItem('TIPOS_ATENCION_OCUPADOS', JSON.stringify(arr));

          }
          //***************************************************** */
          this.utiles.presentToast('Cita reservada con éxito!!', 'bottom', 3000);
        }
        else if (accion === 'confirmed') {
          //agregamos el tipo de atención ocupado *************
          var tipoAten = data.TiposAtencion && data.TiposAtencion.length > 0 ? data.TiposAtencion[0] : '';
          var lugar = data.CitasDisponibles && data.CitasDisponibles.length > 0 ? data.CitasDisponibles[0].Servicio.Nombre : '';
          if (tipoAten != ''){
            var arr = [];
            if (sessionStorage.getItem('TIPOS_ATENCION_OCUPADOS')){
              arr = JSON.parse(sessionStorage.getItem('TIPOS_ATENCION_OCUPADOS'));
              var existe = arr.filter(c=>c.Nombre == tipoAten && c.Lugar == lugar)[0] ? true : false;
              if (!existe){
                var tda = {
                  Nombre: tipoAten,
                  Lugar: lugar
                }
                arr.push(tda);
              }
            }
            else{
              var tda = {
                Nombre: tipoAten,
                Lugar: lugar
              }
              arr.push(tda);
            }
            sessionStorage.setItem('TIPOS_ATENCION_OCUPADOS', JSON.stringify(arr));

          }
          //***************************************************** */
          this.utiles.presentToast('Cita confirmada con éxito!!', 'bottom', 3000);
        }
        else if (accion === 'cancelled') {
          this.utiles.presentToast('Cita anulada con éxito!!', 'bottom', 3000);
        }
        retorno = data;
      }
      else {
        this.utiles.presentToast(data.Mensaje.Detalle.Texto, 'middle', 2000);
      }
    }
    else {
      //error en la operacion
      this.estaCargando = false;
      this.tituloLoading = '';
      this.utiles.presentToast('Error en la operación', 'middle', 2000);
    }
    loader.dismiss();
    //ACA SE DEBE ACTUALIZAR LA PAGINA DE AGENDA DISPONIBLE.
    this.modalCtrl.dismiss(
      {
        retorno: retorno,
        accion: accion
      }
    );
  }
  traduceString(texto) {
    return this.utiles.traduceString(texto);
  }

  async presentAlertConfirm(boton) {
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
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Si',
          cssClass: 'success',
          handler: () => {
            //aca debemos realizar la operación
            this.accionCita(boton);
            //console.log('Confirm Okay');
          }
        }
      ]
    });

    await alert.present();
  }

  transformDateIso(dateString) {
    var retorno = "";
    var parteT = dateString.split("T");
    if (parteT && parteT.length == 2) {
      var partes = parteT[1].split(":");
      if (partes && partes.length > 1) {
        retorno = partes[0] + ":" + partes[1];
      }
    }
    return retorno;
  }
}
