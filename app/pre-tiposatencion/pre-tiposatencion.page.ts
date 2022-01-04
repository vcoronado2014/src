import { Component, ViewChild, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { NavController, ToastController, Platform, ModalController, LoadingController, MenuController, IonItem } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

import { ServicioUtiles } from '../../app/services/ServicioUtiles';
import { ServicioParametrosApp } from '../../app/services/ServicioParametrosApp';
import { ServicioAcceso } from '../../app/services/ServicioAcceso';
import { ServicioCitas } from '../../app/services/ServicioCitas';
/* import { ServicioGeo } from '../../app/services/ServicioGeo'; */
import * as moment from 'moment';
import { MomentPipe } from '../../app/pipes/fecha.pipe';
//pipe
import { FilterPipe } from '../../app/pipes/filter.pipe';
import { environment } from 'src/environments/environment';
//modal
import { ModalOperacionCitaPage } from '../modal-operacion-cita/modal-operacion-cita.page';

@Component({
  selector: 'app-pre-tiposatencion',
  templateUrl: './pre-tiposatencion.page.html',
  styleUrls: ['./pre-tiposatencion.page.scss'],
})
export class PreTiposatencionPage implements OnInit {
  miColor = '#FF4081';
  public usuarioAps;
  textColor = '#FFFFFF';
  //datos para consultar citas
  runPaciente = '';
  codigoDeis = '';
  serviceType = '349';
  tipoOperacion = 'disponibilidad';
  nodId;
  //tipos de atencion disponibles y citas
  citas = [];
  citasFiltradas = [];
  tiposAtencion = [];
  comboSeleccionado = 'Selecciona...';
  idComboSeleccionado = 0;
  //para el tratamiento de fechas
  fechaInicio;
  fechaTermino;
  mostrarProgress = false;
  encontroCitas = false;
  disabledCombo = false;
  paginaActual = 0;
  itemSelected;
  //para el progress de buscar diponibilidad
  mostrarProgressDisp = false;
  encontroCitasDisp = false;
  //idconsultar
  idConsultar = 0;
  constructor(
    public navCtrl: NavController,
    public toast: ToastController,
    public modalCtrl: ModalController,
    public platform: Platform,
    public loading: LoadingController,
    public menu: MenuController,
    public utiles: ServicioUtiles,
    public acceso: ServicioAcceso,
    public cita: ServicioCitas,
    public parametrosApp: ServicioParametrosApp,
    public activatedRoute: ActivatedRoute,
    private router: Router,
    /* public global: ServicioGeo */
  ) { }

  async ngOnInit() {
    moment.locale('es');
    //debemos recibir por parametro al usuario que le conseguiremos la hora
    this.activatedRoute.queryParams.subscribe(async params => {
      if (params && params.Id) {
        //this.estaAgregandoFamilia = true;
        this.idConsultar = params.Id;
        this.usuarioAps = this.utiles.entregaUsuario(params.Id);
        if (this.usuarioAps != null) {
          this.usuarioAps.UrlImagen = this.utiles.entregaImagen(this.usuarioAps);
          this.miColor = this.utiles.entregaColor(this.usuarioAps);
          this.runPaciente = this.utiles.insertarGuion(this.usuarioAps.Rut);
          this.codigoDeis = this.usuarioAps.ConfiguracionNodo.CodigoDeis2014;
          this.nodId = this.usuarioAps.ConfiguracionNodo.NodId;
          //creamos tipo atencion inicial
          this.crearTiposAtencion();
          this.setFechasInicioFin();
          if (this.parametrosApp.USA_API_MANAGEMENT()) {
            await this.buscarDisponibilidadApi(this.fechaInicio, this.fechaTermino, this.codigoDeis, this.runPaciente, this.serviceType, this.tipoOperacion);
          }
          else {
            await this.buscarDisponibilidad(this.fechaInicio, this.fechaTermino, this.codigoDeis, this.runPaciente, this.serviceType, this.tipoOperacion);
          }
        }
        else {
          this.utiles.presentToast('No hay usuario, vuelva a seleccionar', 'bottom', 2000);
        }
      }
      else {
        this.utiles.presentToast('No hay usuario, vuelva a seleccionar', 'bottom', 2000);
      }
    });
    /*     if (sessionStorage.UsuarioAps) {
          this.usuarioAps = JSON.parse(sessionStorage.UsuarioAps);
          if (this.usuarioAps) {
            //this.usuarioAps.UrlImagen = this.utiles.entregaMiImagen();
            this.usuarioAps.UrlImagen = this.utiles.entregaImagen(this.usuarioAps);
            this.miColor = this.utiles.entregaColor(this.usuarioAps);
            this.runPaciente = this.utiles.insertarGuion(this.usuarioAps.Rut);
            this.codigoDeis = this.usuarioAps.ConfiguracionNodo.CodigoDeis2014;
            this.nodId = this.usuarioAps.ConfiguracionNodo.NodId;
          }
        } */

  }
  setFechasInicioFin() {
    //var fechaIni = moment().add(environment.HORAS_FECHA_INICIO, 'hour');
    var fechaIni = moment().add(this.parametrosApp.HORAS_FECHA_INICIO(), 'hour');
    var date = new Date();
    console.log(fechaIni);
    date = new Date(fechaIni.year(), fechaIni.month(), fechaIni.date(), 0, 0, 0, 0);
    console.log(date);
    var fechaTer = moment().add(1, 'month');
    var dateFin = new Date(fechaTer.year(), fechaTer.month(), fechaTer.date(), 23, 59, 0, 0);
    console.log(fechaTer);
    console.log(dateFin);
    this.fechaInicio = fechaIni.format();
    this.fechaTermino = fechaTer.format();
    //guardamos las fechas de consulta para después procesarlas
    sessionStorage.setItem('FECHA_INICIO_CONSULTA', this.fechaInicio);
    sessionStorage.setItem('FECHA_TERMINO_CONSULTA', this.fechaTermino);

  }


  //metodo para obtener disponibilidad y tipos de atención
  //lo comentamos debido a que se usará progress

  async buscarDisponibilidad(start, end, organization, patient, serviceType, tipoOperacion) {
    //ACA ME FALTA CONTROLAR LOS MENSAJES
    let loader = await this.loading.create({
      cssClass: 'loading-vacio',
      showBackdrop: false,
      spinner: null,
    });

    await loader.present().then(async () => {
      //esto lo agregamos para desabilitarlo
      this.disabledCombo = true;
      //lo agregamos para mostrar la info de buscando disponibilidad
      this.mostrarProgress = true;
      //********************* */
      this.citas = [];
      this.citasFiltradas = [];
      if (!this.utiles.isAppOnDevice()) {
        //llamada web
        this.cita.getDisponibilidad(start, end, organization, patient, serviceType, '', '', tipoOperacion, this.nodId).subscribe((response: any) => {
          this.procesarRespuestaTotal(response, loader);
        });
        /*         this.cita.getDisponibilidadApi(start, end, organization, patient, serviceType, '', '', tipoOperacion, this.nodId).subscribe((response: any)=>{
                  this.procesarRespuestaTotal(response, loader);
                }); */
      }
      else {
        //llamada nativa
        this.cita.getDisponibilidadNative(start, end, organization, patient, serviceType, '', '', tipoOperacion, this.nodId).then((response: any) => {
          var respuesta = JSON.parse(response.data);
          this.procesarRespuestaTotal(respuesta, loader);
        });
        /*         this.cita.getDisponibilidadApiNative(start, end, organization, patient, serviceType, '', '', tipoOperacion, this.nodId).then((response: any)=>{
                  var respuesta = JSON.parse(response.data);
                  this.procesarRespuestaTotal(respuesta, loader);
                }); */
      }
    });
  }
  async buscarDisponibilidadApi(start, end, organization, patient, serviceType, tipoOperacion) {
    //ACA ME FALTA CONTROLAR LOS MENSAJES
    let loader = await this.loading.create({
      cssClass: 'loading-vacio',
      showBackdrop: false,
      spinner: null,
    });

    await loader.present().then(async () => {
      //esto lo agregamos para desabilitarlo
      this.disabledCombo = true;
      this.mostrarProgressDisp = true;
      //********************* */
      this.citas = [];
      this.citasFiltradas = [];
      if (!this.utiles.isAppOnDevice()) {
        //llamada web
        this.cita.getDisponibilidadApi(start, end, organization, patient, serviceType, '', '', tipoOperacion, this.nodId).subscribe((response: any) => {
          this.procesarRespuestaTotal(response, loader);
        }, error => {
          console.log(error.message);
          loader.dismiss();
          this.disabledCombo = false;
          this.mostrarProgressDisp = false;
          this.utiles.presentToast('Se ha producido un error al obtener disponibilidad', 'bottom', 2000);
        });
      }
      else {
        //llamada nativa
        this.cita.getDisponibilidadApiNative(start, end, organization, patient, serviceType, '', '', tipoOperacion, this.nodId).then((responseD: any) => {
          var respuestaDisp = JSON.parse(responseD.data);
          this.procesarRespuestaTotal(respuestaDisp, loader);
        }).catch(error => {
          console.log(error.message);
          loader.dismiss();
          this.disabledCombo = false;
          this.mostrarProgressDisp = false;
          this.utiles.presentToast('Se ha producido un error al obtener disponibilidad', 'bottom', 2000);
        });
      }
    });
  }

  //metodo para procesar la respuesta
  procesarRespuestaTotalDisp(data) {
    //vienen las citas sin fecha
    this.citas = [];
    this.citasFiltradas = [];
    //this.tiposAtencion = [];
    if (data && data.Mensaje) {
      //correcto
      if (data.Mensaje.Codigo == 'correcto') {
        //todo bien procesar las citas
        var contador = 0;
        if (data.TiposAtencion) {
          this.agregarTiposAtencion(data.TiposAtencion);
          //console.log(this.tiposAtencion);
        }
        //aca asignamos las citas
        this.citas = data.CitasDisponibles;
        //console.log(this.citas);
        //guardamos las citas en session
        sessionStorage.setItem('CITAS_DISPONIBLES', JSON.stringify(this.citas));
        //als citas deberíamos guardarlas para procesarlas
        //hay que ver si es necesario o no
      }
      else {
        this.idComboSeleccionado = 0;
        this.tiposAtencion = [];
        this.citas = [];
        this.citasFiltradas = [];
      }
      this.mostrarProgressDisp = false;
      this.encontroCitasDisp = true;
      //error
    }
  }
  procesarRespuestaTotal(data, loader) {
    //vienen las citas sin fecha
    this.citas = [];
    this.citasFiltradas = [];
    //this.tiposAtencion = [];
    if (data && data.Mensaje) {
      //correcto
      if (data.Mensaje.Codigo == 'correcto') {
        //todo bien procesar las citas
        var contador = 0;
        if (data.TiposAtencion) {
          this.agregarTiposAtencion(data.TiposAtencion);
          //console.log(this.tiposAtencion);
        }
        //aca asignamos las citas
        this.citas = data.CitasDisponibles;
        //console.log(this.citas);
        //guardamos las citas en session
        sessionStorage.setItem('CITAS_DISPONIBLES', JSON.stringify(this.citas));
        //als citas deberíamos guardarlas para procesarlas
        //hay que ver si es necesario o no
        loader.dismiss();
        this.disabledCombo = false;
        this.mostrarProgressDisp = false;
        this.mostrarProgress = false;
      }
      else {
        this.idComboSeleccionado = 0;
        this.tiposAtencion = [];
        this.citas = [];
        this.citasFiltradas = [];
        loader.dismiss();
        this.disabledCombo = false;
        this.mostrarProgressDisp = false;
        this.mostrarProgress = false;
      }
      //error
    }
  }
  indexarCitas() {
    //el tipo de atencion seleccionado
    this.citasFiltradas = [];
    var indice = 1;
    if (this.citas && this.citas.length > 0) {
      this.citas.forEach(cita => {
        if (cita.TipoAtencion == this.comboSeleccionado) {
          //esta filtrando
          cita.indice = indice;
          this.citasFiltradas.push(cita);
          indice++;
        }
      });
    }
    if (indice > 2) {
      this.encontroCitas = true;
    }
    //console.log(this.citasFiltradas);
  }
  //creamos los tipos de atención disponibles
  crearTiposAtencion() {
    //var arr = [];
    this.tiposAtencion = [];
    var contador = 1;
    var entidadInicial = {
      Texto: 'Selecciona...',
      Valor: 0,
      Selected: true
    }
    this.tiposAtencion.push(entidadInicial);
    this.idComboSeleccionado = 0;
    //console.log('tipo seleccionado ' + this.idComboSeleccionado);
    //console.log(this.tiposAtencion);
  }
  agregarTiposAtencion(tipos) {
    var contador = 1;
    if (tipos && tipos.length > 0) {
      tipos.forEach(tipo => {
        var entidadTipo = {
          Texto: tipo,
          Valor: contador,
          Selected: false
        };
        //tipos.push(entidadTipo);
        this.tiposAtencion.push(entidadTipo);
        contador++;
      });
    }
    //guardamos los tipos de atencion
    sessionStorage.setItem('TIPOS_ATENCION', JSON.stringify(this.tiposAtencion));
  }
  seleccionarItemCombo() {
    if (this.comboSeleccionado && this.tiposAtencion) {
      this.tiposAtencion.forEach(tipo => {
        if (tipo.Texto == this.comboSeleccionado) {
          tipo.Selected = true;
        }
        else {
          tipo.Selected = false;
        }
      });
      //guardamos los tipos de atención
      sessionStorage.setItem('TIPOS_ATENCION', JSON.stringify(this.tiposAtencion));
    }
  }
  buscarCitas(event) {
    //este lo cambiamos para el control mat-select

    //if (event.detail.value){
    if (event.value) {
      this.comboSeleccionado = event.value;
      //console.log(this.comboSeleccionado);
      this.mostrarProgress = true;
      this.encontroCitas = false;
      this.disabledCombo = false;
      this.seleccionarItemCombo();
      setTimeout(() => {
        //console.log('Async operation has ended');

        //event.target.complete();
        this.mostrarProgress = false;
        //this.encontroCitas = true;
        //si existen citas hay que deshabilitar el control
        this.disabledCombo = true;
        this.indexarCitas();
      }, 2000);
    }

  }
  transformDate(value, format) {
    var pi = new MomentPipe();
    return pi.transform(value, format);
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
  //modal del detalle de la cita
  async citaSelected(item) {
    if (item) {
      this.itemSelected = item;
    }
    const modal = await this.modalCtrl.create(
      {
        component: ModalOperacionCitaPage,
        componentProps: {
          'cita': JSON.stringify(item),
          'operacion': 'reservar'
        }
      }
    );
    modal.onDidDismiss().then((data) => {
      if (data.data && data.data.accion) {
        var accion = data.data.accion;
        //obtenemos la pagina actual
        //aca debemos revisar a donde nos vamos
        this.navCtrl.navigateRoot('calendario');
        //console.log(accion);        
      }
    });
    return await modal.present();
  }
  openBusquedaAvanzada() {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        Id: this.idConsultar
      }
    };
    this.navCtrl.navigateRoot(['busqueda-avanzada'], navigationExtras);
  }

}
