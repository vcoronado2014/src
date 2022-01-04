import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController, ToastController, Platform, ModalController, LoadingController, MenuController, IonSlides } from '@ionic/angular';
import { NavigationExtras } from '@angular/router';

import { ServicioUtiles } from '../../app/services/ServicioUtiles';
import { ServicioAcceso } from '../../app/services/ServicioAcceso';
import { ServicioCitas } from '../../app/services/ServicioCitas';
import { ServicioNotificacionesLocales } from '../../app/services/ServicioNotificacionesLocales';
import { ServicioNotificaciones } from '../../app/services/ServicioNotificaciones';
import { ServicioGeo } from '../../app/services/ServicioGeo';
import { ServicioParametrosApp } from '../../app/services/ServicioParametrosApp';
import { ServicioInfoUsuario } from '../../app/services/ServicioInfoUsuario';
import { environment } from 'src/environments/environment';
//modal
import { ModalAlertasPage } from '../modal-alertas/modal-alertas.page';
//moment
import * as moment from 'moment';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild('mySlider', { static: true }) slides: IonSlides;

  //nuevo slide
  slideOpts = {
    initialSlide: 0,
    speed: 500,
    pager: true
  };

  usuarioAps;
  miColor = '#FF4081';
  miImagen;
  miNombre;
  miInstitucion;
  pages: any = [];
  //datos para consultar citas
  runPaciente = '';
  codigoDeis = '';
  serviceType = '349';
  //semanas
  semanas: any = [];
  semana: any;
  //tiene disponibilidad
  tieneCitaVigente = false;
  usaAgenda = false;
  //para registrar la salida
  objetoEntrada = {
    VersionAppName: '',
    Plataforma: '',
    Token: '',
    VersionAppNumber: '',
    Fecha: new Date(),
    TipoOperacion: '1',
    Id: '0'
  };

  pushes: any = [];
  //para progress bar
  estaCargando = false;
  estaCargandoNotificaciones = false;
  //procesar los items del menu
  itemsMenu = [];
  //notificaciones
  notificaciones = [];
  muestraNotificaciones = false;
  //para generar data
  arrMediciones=[];
  arrAlergias=[];
  arrMorbidos=[];
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
    public servicioGeo: ServicioGeo,
    public parametrosApp: ServicioParametrosApp,
    public servicioNotLocales: ServicioNotificacionesLocales,
    public servNotificaciones: ServicioNotificaciones,
    public info: ServicioInfoUsuario
  ) { }

  ngOnInit() {
    moment.locale('es');
    //this.miColor = this.utiles.entregaMiColor();
    this.usuarioAps = JSON.parse(sessionStorage.UsuarioAps);
    this.miColor = this.utiles.entregaColor(this.usuarioAps);
    //this.miImagen = this.utiles.entregaMiImagen();
    this.miImagen = this.utiles.entregaImagen(this.usuarioAps)
    this.miNombre = this.utiles.entregaMiNombre();
    if (this.usuarioAps.Establecimiento) {
      this.miInstitucion = this.usuarioAps.Establecimiento.RazonSocial;
    }
    //console.log(this.miColor);
    //console.log(this.miImagen);
    //console.log(this.miNombre);
    this.pages = this.utiles.entregaMenuPages();
    //console.log(this.pages);
    this.runPaciente = this.utiles.insertarGuion(this.usuarioAps.Rut);
    this.codigoDeis = this.usuarioAps.ConfiguracionNodo.CodigoDeis2014;
    this.usaAgenda = this.utiles.entregaParametroUsaAgenda();
    this.buscarLogMovimientos();
    //notificaciones locales
    //this.obtenerNotificaciones();
    //ACA ESTOY TRABAJANDO HAY UN ERROR EN API MANAGEMENT
    this.obtenerNotificacionesApi();
    /*     if (this.utiles.entregaParametroUsaAgenda()){
          this.buscarDisponibilidad();
        } */
    //nueva implementación
    this.miembrosPorAceptar();

  }
  obtenerDatosUsuarios() {
      this.arrMediciones = [];
      var arregloUsuarios = this.utiles.entregaArregloUsuarios();
      if (arregloUsuarios && arregloUsuarios.length > 0) {
        arregloUsuarios.forEach(usu => {
          if (this.utiles.necesitaActualizarDatosPaciente(usu.Id)) {
            var entidad = {
              UsuarioAps: usu,
              Mediciones: null,
            }
            if (!this.utiles.isAppOnDevice()) {
              //llamada web
              this.info.getIndicadorValorApi(usu.Id).subscribe((response: any) => {
                console.log(response);
                entidad.Mediciones = response;
                this.arrMediciones.push(entidad);
                localStorage.setItem('ANTECEDENTES', JSON.stringify(this.arrMediciones));
                localStorage.setItem('FECHA_ACTUALIZACION_ANTECEDENTES', moment().format('YYYY-MM-DD HH:mm'));
                //correcto
                //this.procesarNuevoArregloValoresIndependiente(response, loader);
              }, async error => {
                console.log(error.message);
              });
            }
            else {
              //llamada nativa
              this.info.getIndicadorValorNativeApi(usu.Id).then((response: any) => {
                //this.procesarIndicadorValor(JSON.parse(response.data), loader);
                console.log(JSON.parse(response.data));
                entidad.Mediciones = JSON.parse(response.data);
                this.arrMediciones.push(entidad);
                localStorage.setItem('ANTECEDENTES', JSON.stringify(this.arrMediciones));
                localStorage.setItem('FECHA_ACTUALIZACION_ANTECEDENTES', moment().format('YYYY-MM-DD HH:mm'));
                //this.procesarNuevoArregloValoresIndependiente(JSON.parse(response.data), loader);
              }).catch(async error => {
                console.log(error.message);
              });

            }
          }
        });
      }
  }
  obtenerAlergiasPacientes(){
      this.arrAlergias = [];
      var arregloUsuarios = this.utiles.entregaArregloUsuarios();
      if (arregloUsuarios && arregloUsuarios.length > 0) {
        arregloUsuarios.forEach(usu => {
          if (this.utiles.necesitaActualizarAlergiasPacientes(usu.Id)) {
            var entidad = {
              UsuarioAps: usu,
              Alergias: null,
            }
            if (!this.utiles.isAppOnDevice()) {
              //llamada web
              this.info.getAlergiasApi(usu.Id).subscribe((response: any) => {
                console.log(response);
                entidad.Alergias = response;
                this.arrAlergias.push(entidad);
                localStorage.setItem('ALERGIAS', JSON.stringify(this.arrAlergias));
                localStorage.setItem('FECHA_ACTUALIZACION_ALERGIAS', moment().format('YYYY-MM-DD HH:mm'));
                //correcto
                //this.procesarNuevoArregloValoresIndependiente(response, loader);
              }, async error => {
                console.log(error.message);
              });
            }
            else {
              //llamada nativa
              this.info.getAlergiasNativeApi(usu.Id).then((response: any) => {
                //this.procesarIndicadorValor(JSON.parse(response.data), loader);
                console.log(JSON.parse(response.data));
                entidad.Alergias = JSON.parse(response.data);
                this.arrAlergias.push(entidad);
                localStorage.setItem('ALERGIAS', JSON.stringify(this.arrAlergias));
                localStorage.setItem('FECHA_ACTUALIZACION_ALERGIAS', moment().format('YYYY-MM-DD HH:mm'));
                //this.procesarNuevoArregloValoresIndependiente(JSON.parse(response.data), loader);
              }).catch(async error => {
                console.log(error.message);
              });

            }
          }
        });
      }

  }
  obtenerMorbidosPacientes(){
      this.arrMorbidos = [];
      var arregloUsuarios = this.utiles.entregaArregloUsuarios();
      if (arregloUsuarios && arregloUsuarios.length > 0) {
        arregloUsuarios.forEach(usu => {
          if (this.utiles.necesitaActualizarMorbidosPacientes(usu.Id)) {
            var entidad = {
              UsuarioAps: usu,
              Morbidos: null,
            }
            if (!this.utiles.isAppOnDevice()) {
              //llamada web
              this.info.postAntecedentesApi(usu.Id).subscribe((response: any) => {
                console.log(response);
                entidad.Morbidos = response;
                this.arrMorbidos.push(entidad);
                localStorage.setItem('MORBIDOS', JSON.stringify(this.arrMorbidos));
                localStorage.setItem('FECHA_ACTUALIZACION_MORBIDOS', moment().format('YYYY-MM-DD HH:mm'));
                //correcto
                //this.procesarNuevoArregloValoresIndependiente(response, loader);
              }, async error => {
                console.log(error.message);
              });
            }
            else {
              //llamada nativa
              this.info.postAntecedentesNativeApi(usu.Id).then((response: any) => {
                //this.procesarIndicadorValor(JSON.parse(response.data), loader);
                console.log(JSON.parse(response.data));
                entidad.Morbidos = JSON.parse(response.data);
                this.arrMorbidos.push(entidad);
                localStorage.setItem('MORBIDOS', JSON.stringify(this.arrMorbidos));
                localStorage.setItem('FECHA_ACTUALIZACION_MORBIDOS', moment().format('YYYY-MM-DD HH:mm'));
                //this.procesarNuevoArregloValoresIndependiente(JSON.parse(response.data), loader);
              }).catch(async error => {
                console.log(error.message);
              });

            }
          }
        });
      }
  }
  miembrosPorAceptar() {
    if (localStorage.getItem('FAMILIA-POR-ACEPTAR')) {
      let arrFam = JSON.parse(localStorage.getItem('FAMILIA-POR-ACEPTAR'));
      if (arrFam.length > 0) {
        this.utiles.presentToast('Tienes familia asociada que podrías aceptar, pincha en la notificación para poder hacerlo', 'bottom', 5000);
      }
    }
  }
  ionViewWillEnter() {
    //si existen cambios se setean nuevamente
    //this.miColor = this.utiles.entregaMiColor();
    this.miColor = this.utiles.entregaColor(this.usuarioAps);
    //this.miImagen = this.utiles.entregaMiImagen();
    this.miImagen = this.utiles.entregaImagen(this.usuarioAps)
    this.miNombre = this.utiles.entregaMiNombre();
    console.log('will enter home');
    this.obtenerDatosUsuarios();
    this.obtenerAlergiasPacientes();
    this.obtenerMorbidosPacientes();
    //console.log(this.miImagen);
    //console.log(this.miNombre);
  }
  openPage(pages) {
    if (pages.src != '#') {
      this.navCtrl.navigateRoot(pages.src);
    }
  }
  openFamiliaPage() {
    this.navCtrl.navigateRoot('familia');
  }
  openAntePage() {
    if (sessionStorage.getItem("RSS_ID")) {
      if (this.parametrosApp.USA_LOG_MODULOS()) {
        this.utiles.registrarMovimiento(sessionStorage.getItem("RSS_ID"), 'ANTECEDENTES');
      }
    }
    this.navCtrl.navigateRoot('antecedentes');
  }
  openOrdenesPage() {
    if (sessionStorage.getItem("RSS_ID")) {
      if (this.parametrosApp.USA_LOG_MODULOS()) {
        this.utiles.registrarMovimiento(sessionStorage.getItem("RSS_ID"), 'EXAMENES');
      }
    }
    this.navCtrl.navigateRoot('pre-ordenes');
  }
  openCalendarioPage() {
    //registramos movimiento
    if (sessionStorage.getItem("RSS_ID")) {
      if (this.parametrosApp.USA_LOG_MODULOS()) {
        this.utiles.registrarMovimiento(sessionStorage.getItem("RSS_ID"), 'CALENDARIO');
      }
    }
    this.navCtrl.navigateRoot('calendario');
  }
  logout() {
    //aca debemos registrar el fin de la session
    this.registrarSalida();
    this.acceso.logout();
    this.navCtrl.navigateRoot('nuevo-login');
  }
  openReservarHoraPage() {
    this.navCtrl.navigateRoot('pre-tiposatencion');
  }
  abrirEditar() {
    let registro = null;
    if (localStorage.getItem('REGISTRO')) {
      registro = JSON.parse(localStorage.getItem('REGISTRO'));
      const navigationExtras: NavigationExtras = {
        queryParams: {
          usuario: JSON.stringify(registro),
          EstaEditando: true
        }
      };
      //this.dismiss();
      this.navCtrl.navigateRoot(['registro-usuario'], navigationExtras);
    }
    else {
      this.utiles.presentToast("No puedes editar ya que no te encuentras registrado", "bottom", 3000);

    }
  }
  dismiss() {
    this.modalCtrl.dismiss();
  }
  async registrarSalida() {
    //variable de session que identifica el ingreso
    if (sessionStorage.getItem('RSS_ID')) {
      this.objetoEntrada.VersionAppName = localStorage.getItem('version_app_name');
      this.objetoEntrada.Plataforma = localStorage.getItem('plataforma');
      this.objetoEntrada.VersionAppNumber = localStorage.getItem('version_number');
      this.objetoEntrada.Token = localStorage.getItem('token_dispositivo');
      this.objetoEntrada.Fecha = new Date();
      this.objetoEntrada.Id = sessionStorage.getItem("RSS_ID");
      this.objetoEntrada.TipoOperacion = '1';
      let loader = await this.loading.create({
        message: 'Creando...<br>registro de sessión',
        duration: 2000
      });

      await loader.present().then(async () => {
        if (!this.utiles.isAppOnDevice()) {
          //web
          this.servicioGeo.postIngreso(this.objetoEntrada).subscribe((data: any) => {
            //console.log(data);
            loader.dismiss();
          });
        }
        else {
          //dispositivo
          this.servicioGeo.postIngresoNative(this.objetoEntrada).then(response => {
            let respuesta = JSON.parse(response.data);
            //console.log(respuesta);
            loader.dismiss();
          });
        }
      });


    }
  }
  //para obtener los movimientos en la app
  async buscarLogMovimientos() {
    var idDispositivo = localStorage.getItem('token_dispositivo');
    var cantidadDias = this.parametrosApp.DIAS_LOG_MODULOS();
    this.estaCargando = true;
    let loader = await this.loading.create({
      cssClass: 'loading-vacio',
      showBackdrop: false,
      spinner: null,
    });
    await loader.present().then(async () => {
      //si ya se encuentra no es necesario volverlo a cargar
      if (sessionStorage.getItem('LOG_MOVIMIENTOS')) {
        this.itemsMenu = JSON.parse(sessionStorage.getItem('LOG_MOVIMIENTOS'));
        //console.log(this.itemsMenu);
        loader.dismiss();
        this.estaCargando = false;
      }
      else {
        if (!this.utiles.isAppOnDevice()) {
          //llamada web
          this.servicioGeo.getMovimientos(cantidadDias, idDispositivo).subscribe((response: any) => {
            //procesar
            this.itemsMenu = this.utiles.entregaArregloHome(response);
            //lo guardaremos en una variable de sesión para que no 
            //se carge constantemente, según ultima observación de 
            //juan moran
            sessionStorage.setItem('LOG_MOVIMIENTOS', JSON.stringify(this.itemsMenu));
            //console.log(this.itemsMenu);
            loader.dismiss();
            this.estaCargando = false;
          })
        }
        else {
          //llamada nativa
          this.servicioGeo.getMovimientosNative(cantidadDias, idDispositivo).then((response: any) => {
            //procesar
            var data = JSON.parse(response.data);
            this.itemsMenu = this.utiles.entregaArregloHome(data);
            //console.log(this.itemsMenu);
            loader.dismiss();
            this.estaCargando = false;
          })
        }
      }
    });

  }
  openNotificacion(modulo) {
    if (modulo && modulo != '') {
      this.navCtrl.navigateRoot(modulo);
    }
  }
  openGenerico(modulo) {
    var pageName = modulo.toLowerCase();
    if (modulo == 'EXAMENES') {
      pageName = 'ordenes';
    }
    //registramos movimiento
    if (sessionStorage.getItem("RSS_ID")) {
      if (this.parametrosApp.USA_LOG_MODULOS()) {
        this.utiles.registrarMovimiento(sessionStorage.getItem("RSS_ID"), modulo.toUpperCase());
      }
    }
    this.navCtrl.navigateRoot(pageName);
  }
  //notificaciones
  async obtenerNotificaciones() {
    this.estaCargando = true;
    this.estaCargandoNotificaciones = true;
    let loader = await this.loading.create({
      cssClass: 'loading-vacio',
      showBackdrop: false,
      spinner: null,
    });
    await loader.present().then(async () => {
      this.notificaciones = await this.servicioNotLocales.getAll();
      //console.log(this.notificaciones);
      this.estaCargando = false;
      this.estaCargandoNotificaciones = false;
    })

  }

  async obtenerNotificacionesApi() {
    this.notificaciones = [];
    this.estaCargando = true;
    this.estaCargandoNotificaciones = true;
    let loader = await this.loading.create({
      cssClass: 'loading-vacio',
      showBackdrop: false,
      spinner: null,
    });
    var usuario = null;
    if (localStorage.getItem('UsuarioAps')) {
      usuario = JSON.parse(localStorage.getItem('UsuarioAps'));
    }
    var annoConsultar = 0;
    var mesConsultar = 0;
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
    if (mesActual.mes == mesEvaluar.mes && mesActual.anno == mesEvaluar.anno) {
      //es le mismo mes
      mesConsultar = mesActual.mes;
      annoConsultar = mesActual.anno;
    }
    else {
      //hay diferencia, por tanto se toma el ultimo mes
      mesConsultar = mesEvaluar.mes;
      annoConsultar = mesEvaluar.anno;
    }
    await loader.present().then(async () => {
      if (!this.utiles.isAppOnDevice()) {
        //llamada web
        this.cita.entregaPorMesNuevoLivianoApi(usuario.Id, usuario.IdRyf, usuario.NodId, mesConsultar, annoConsultar).subscribe((response: any) => {
          var data = response;
          //console.log(data);
          this.notificaciones = this.servNotificaciones.construyeNotificaciones(data);
          this.estaCargando = false;
          this.loading.dismiss();
          this.estaCargandoNotificaciones = false;
          //console.log(this.notificaciones);
        }, error => {
          console.log(error.message);
          //revisamos igual las notificaciones ya que pueden haber
          //aquellas que pasan por fuera de la api
          this.notificaciones = this.servNotificaciones.construyeNotificaciones([]);
          this.estaCargando = false;
          this.loading.dismiss();
          this.estaCargandoNotificaciones = false;
        })
      }
      else {
        //llamada native
        this.cita.entregaPorMesNuevoLivianoApiNative(usuario.Id, usuario.IdRyf, usuario.NodId, mesConsultar, annoConsultar).then((response: any) => {
          var data = JSON.parse(response.data);
          //console.log(data);
          this.notificaciones = this.servNotificaciones.construyeNotificaciones(data);
          this.estaCargando = false;
          this.loading.dismiss();
          this.estaCargandoNotificaciones = false;
        }).catch(error => {
          console.log(error.message);
          //revisamos igual las notificaciones ya que pueden haber
          //aquellas que pasan por fuera de la api
          this.notificaciones = this.servNotificaciones.construyeNotificaciones([]);
          this.estaCargando = false;
          this.loading.dismiss();
          this.estaCargandoNotificaciones = false;
        })
      }
    });

  }

  openItemPage(modulo) {
    this.openGenerico(modulo);
  }


  //para procesar citas
  /*
  async buscarDisponibilidad(){
    //ACA ME FALTA CONTROLAR LOS MENSAJES
    var fecha = new Date();
    this.utiles.construyeSemana(this.runPaciente, this.codigoDeis, fecha);
    this.semana = this.utiles.semana;
    this.semanas = this.utiles.semanas;
    var ini = this.semana.semanas[0].start;
    var ter = this.semana.semanas[0].end;
    let loader = await this.loading.create({
      message: 'Cargando...<br>disponibilidad',
      duration: 20000
    });

    await loader.present().then(async () => {
      if (!this.utiles.isAppOnDevice()) {
        //llamada web
        this.cita.getDisponibilidad(ini, ter, this.codigoDeis, this.runPaciente, this.serviceType, '', '', 'disponibilidad').subscribe((response: any)=>{
          this.procesarRespuesta(response, loader);
        });
      }
      else {
        //llamada nativa
        this.cita.getDisponibilidadNative(ini, ter, this.codigoDeis, this.runPaciente, this.serviceType, '', '', 'disponibilidad').then((response: any)=>{
          var respuesta = JSON.parse(response.data);
          this.procesarRespuesta(respuesta, loader);
        });
      }
    });
  }
  procesarRespuesta(data, loader){
    if (data && data.Mensaje){
      //correcto
      if (data.Mensaje.Detalle.Codigo == 'MSG_CITA_VIGENTE'){
        //ya tiene citas tomadas, hay que enviarlo a otra pagina
        //la de buscarcitas
        this.tieneCitaVigente = true;
        sessionStorage.setItem('OPERACION', 'cita');
        loader.dismiss();
      }
      else{
        //lanzamos mensaje
        this.tieneCitaVigente = false;
        sessionStorage.setItem('OPERACION', 'disponibilidad')
        loader.dismiss();
      }
      //error
    }
  }
  */

  mostrarNotificacionesModal(mostrar) {
    //this.slides.slideTo(0);
/*     if (this.muestraNotificaciones == true && mostrar == true) {
      this.muestraNotificaciones = false;
      return;
    }
    if (this.muestraNotificaciones == false && mostrar == true) {
      this.muestraNotificaciones = true;
    } */
    this.goToNoficiaciones();
  }
  async goToNoficiaciones() {
    const modal = await this.modalCtrl.create(
      {
        component: ModalAlertasPage,
        componentProps: {
          'notificaciones': JSON.stringify(this.notificaciones)
        }
      }
    );
    modal.onDidDismiss().then((data) => {
      if (data) {
        console.log(data);
      }
    });
    return await modal.present();
  }
  mostrarNotificaciones(mostrar) {
    this.slides.slideTo(0);
    if (this.muestraNotificaciones == true && mostrar == true) {
      this.muestraNotificaciones = false;
      return;
    }
    if (this.muestraNotificaciones == false && mostrar == true) {
      this.muestraNotificaciones = true;
    }
  }
  moverSlide(indice) {
    if (indice <= this.notificaciones.length - 1) {
      this.slides.slideNext();
    }
    else {
      //this.slides.slidePrev();
      //lo volvemos al inicio
      this.slides.slideTo(0);
    }
  }
}
