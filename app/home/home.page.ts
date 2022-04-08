import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController, ToastController, Platform, ModalController, LoadingController, MenuController, IonSlides } from '@ionic/angular';
import { NavigationExtras } from '@angular/router';
//inap
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { Router, RoutesRecognized } from '@angular/router';

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
import { ModalCapsulasPage } from '../modal-capsulas/modal-capsulas.page';
//moment
import * as moment from 'moment';
import { filter, pairwise } from 'rxjs/operators';

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
  arrMediciones = [];
  arrAlergias = [];
  arrMorbidos = [];
  //info app
  infoApp = {
    Version: '',
    EsProduccion: false,
    Nombre: '',
  }
  //acepta CONDICIONES
  rutaAceptoCondiciones;
  options: InAppBrowserOptions = {
    location: 'yes',
  };


  //para las capsulas educativas
  usaCapsulasEducativas = false;
  progressRayen = false;
  pacientesRayen = [];
  establecimientosRayen = [];
  private previousPage: string;

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
    public info: ServicioInfoUsuario,
    public inap: InAppBrowser,
    private router: Router,
  ) { }

  ngOnInit() {
    moment.locale('es');
    this.previousPage = null;

    this.router.events
      .pipe(filter((event: any) => event instanceof RoutesRecognized), pairwise())
      .subscribe((events: RoutesRecognized[]) => {
        this.previousPage = events[0].urlAfterRedirects;
        //console.log(this.previousPage);
      });

    this.usaCapsulasEducativas = this.parametrosApp.USA_CAPSULAS_EDUCATIVAS();
    //obtención ruta acepto condiciones
    this.rutaAceptoCondiciones = this.parametrosApp.URL_ACEPTA_CONDICIONES();
    this.infoApp = this.utiles.entregaInfoApp();
    //this.miColor = this.utiles.entregaMiColor();
    this.usuarioAps = JSON.parse(sessionStorage.UsuarioAps);
    this.miColor = this.utiles.entregaColor(this.usuarioAps);
    //this.miImagen = this.utiles.entregaMiImagen();
    this.miImagen = this.utiles.entregaImagen(this.usuarioAps)
    this.miNombre = this.utiles.entregaMiNombre();
    if (this.usuarioAps.Establecimiento) {
      this.miInstitucion = this.usuarioAps.Establecimiento.RazonSocial;
    }

    this.pages = this.utiles.entregaMenuPages();
    //console.log(this.pages);
    this.runPaciente = this.utiles.insertarGuion(this.usuarioAps.Rut);
    this.codigoDeis = this.usuarioAps.ConfiguracionNodo.CodigoDeis2014;
    this.usaAgenda = this.utiles.entregaParametroUsaAgenda();
    this.buscarLogMovimientos();
    //notificaciones locales
    //this.obtenerNotificaciones();
    //COMENTADO POR REVISION DE NOTIFICACIONES
    //this.obtenerNotificacionesApi();
    this.obtenerNotificacionesApiLocales();
    //nueva implementación
    this.miembrosPorAceptar();
    if (this.utiles.necesitaActualizarDatosRayen(false))
      this.llamadaObtenerPacienteRayen();
  }
  public getPreviousUrl() {
    return this.previousPage;
  }
  async obtenerEstablecimientosUsuarioRayen() {
    this.establecimientosRayen = [];

    this.progressRayen = true;
    var establecimientos = [];
    var tienePacienteRayen = this.pacientesRayen && this.pacientesRayen.length > 0 ? true : false;
    if (tienePacienteRayen) {
      if (this.pacientesRayen && this.pacientesRayen.length > 0) {
        this.pacientesRayen.forEach(paciente => {
          if (paciente && paciente.UsuariosNodo?.UsuarioNodo?.length > 0) {
            paciente.UsuariosNodo?.UsuarioNodo.forEach(nodo => {
              var entidad = {
                Id: nodo.IdNodo,
                EsInscrito: nodo.EsInscrito,
                IdFuncionarioPrestadorCabecera: nodo.IdFuncionarioPrestadorCabecera,
                UspId: paciente.Id
              };
              //antes vamos a verificar si se inserta o no
              if (this.utiles.verificaNodoRayenAgregar(paciente.Id, nodo.IdNodo)) {
                establecimientos.push(entidad);
              }
            });
          }
        });
      }
      //ahora tendriamos que traernos los nodos ccompletamente
      //console.log(establecimientos);
      if (establecimientos && establecimientos.length > 0) {
        if (!this.utiles.isAppOnDevice()) {
          //web
          this.servicioGeo.postEstablecimientosFork(establecimientos).subscribe((data: any) => {
            this.progressRayen = true;
            if (data && data.length > 0) {
              var indice = 0;
              data.forEach(nodo => {
                if (nodo && nodo?.nodo) {
                  //console.log(nodo.nodo);
                  nodo.nodo.esInscrito = establecimientos[indice].EsInscrito;
                  nodo.nodo.id = establecimientos[indice].Id;
                  nodo.nodo.idFuncionarioPrestadorCabecera = establecimientos[indice].IdFuncionarioPrestadorCabecera;
                  nodo.nodo.nombreFuncionarioPrestadorCabecera = nodo.nodo.nombreFuncionarioPrestadorCabecera;
                  this.establecimientosRayen.push(nodo.nodo);
                  indice++;
                }

              });
            }

            this.progressRayen = false;
            //seteamos los nodos del usuario
            sessionStorage.setItem('ESTABLECIMIENTOS_USUARIO_RAYEN', JSON.stringify(this.establecimientosRayen));

          }, error => {
            console.log(error);
            this.progressRayen = false;
          });
        }
        else {
          //nativa
          this.servicioGeo.postEstablecimientosForkNative(establecimientos).subscribe((data: any) => {
            //data es lo que hay que recorrer
            this.progressRayen = true;
            if (data && data.length > 0) {
              var indice = 0;
              data.forEach(datos => {
                var nodo = JSON.parse(datos.data);
                if (nodo && nodo?.nodo) {
                  //console.log(nodo.nodo);
                  nodo.nodo.esInscrito = establecimientos[indice].EsInscrito;
                  nodo.nodo.id = establecimientos[indice].Id;
                  nodo.nodo.idFuncionarioPrestadorCabecera = establecimientos[indice].IdFuncionarioPrestadorCabecera;
                  nodo.nodo.nombreFuncionarioPrestadorCabecera = nodo.nodo.nombreFuncionarioPrestadorCabecera;
                  this.establecimientosRayen.push(nodo.nodo);
                  indice++;
                }

              });

            }
            this.progressRayen = false;
            //seteamos los nodos del usuario
            sessionStorage.setItem('ESTABLECIMIENTOS_USUARIO_RAYEN', JSON.stringify(this.establecimientosRayen));

          }, error => {
            console.log(error);
            this.progressRayen = false;
          })
        }

      }
    }
    else {
      //obtenemos los nodos del paciente de accuerdo a lo registrado en
      //la autentificación
      var establecimientosR = this.utiles.entregaEstablecimientosUsuariosRayen();

      sessionStorage.setItem('ESTABLECIMIENTOS_USUARIO_RAYEN', JSON.stringify(establecimientosR));

    }

    this.progressRayen = false;

  }
  async llamadaObtenerPacienteRayen() {
    this.pacientesRayen = [];
    //this.establecimientosRayen = [];
    //obtenemos los usuarios
    var usuarios = this.utiles.entregaArregloUsuarios();
    this.progressRayen = true;


    if (!this.utiles.isAppOnDevice()) {
      //llamada web
      this.servicioGeo.postPersonaRayenFork(usuarios).subscribe((responseList: any) => {
        //console.log(responseList);
        if (responseList && responseList.length > 0) {
          responseList.forEach(usu => {
            if (usu) {
              let usuRayen = usu?.ObtenerUsuarioApsPorFiltroResponse?.usuarios?.UsuarioAps;
              //console.log(usuRayen);
              this.pacientesRayen.push(usuRayen);
            }

          });
        }
        //console.log(this.pacientesRayen);
        sessionStorage.setItem('USUARIOS_RAYEN', JSON.stringify(this.pacientesRayen));
        localStorage.setItem('FECHA_ACTUALIZACION_DATOS_RAYEN', moment().format('YYYY-MM-DD HH:mm'));
        this.progressRayen = false;
        //haremos la llamada para obtener los establecimientos
        this.obtenerEstablecimientosUsuarioRayen();
        //************************************************* */
      }, error => {
        console.log(error);
        this.progressRayen = false;
      })
    }
    else {
      this.servicioGeo.postPersonaRayenForkNative(usuarios).subscribe((responseList: any) => {
        if (responseList && responseList.length > 0) {
          responseList.forEach(usu => {
            if (usu && usu.data) {
              var data = JSON.parse(usu.data);
              let usuRayen = data?.ObtenerUsuarioApsPorFiltroResponse?.usuarios?.UsuarioAps;
              this.pacientesRayen.push(usuRayen);
            }

          });
        }
        sessionStorage.setItem('USUARIOS_RAYEN', JSON.stringify(this.pacientesRayen));
        localStorage.setItem('FECHA_ACTUALIZACION_DATOS_RAYEN', moment().format('YYYY-MM-DD HH:mm'));
        this.progressRayen = false;
        //haremos la llamada para obtener los establecimientos
        this.obtenerEstablecimientosUsuarioRayen();
        //************************************************* */
      }, error => {
        console.log(error);
        this.progressRayen = false;
      });
    }
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
              //console.log(response);
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
              //console.log(JSON.parse(response.data));
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
  obtenerAlergiasPacientes() {
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
              //console.log(response);
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
              //console.log(JSON.parse(response.data));
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
  obtenerMorbidosPacientes() {
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
              //console.log(response);
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
              //console.log(JSON.parse(response.data));
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
    this.miColor = this.utiles.entregaColor(this.usuarioAps);
    this.miImagen = this.utiles.entregaImagen(this.usuarioAps)
    this.miNombre = this.utiles.entregaMiNombre();
    //llamamos a actualizar las notificaciones si es que vienen desde la pag /quitar-familia
    if (this.getPreviousUrl() == '/quitar-familia') {
      //cuando volvemos de quitar familia se deben volver a obtener los pacientes rayen
      //sin verificar la ultima fecha de actualizacion

      if (this.progressRayen == false) {
        if (this.utiles.necesitaActualizarDatosRayen(true))
          this.llamadaObtenerPacienteRayen();
      }
      this.obtenerNotificacionesApiLocales();
    }
    //console.log('will enter home');

  }
  openPage(pages) {
    if (pages.src != '#') {
      //this.navCtrl.navigateRoot(pages.src);
      this.menu.close();
      this.navCtrl.navigateForward(pages.src);
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

  //se deben restrcuturar las notificaciones locales
  //hay que definir cuales son locales y las push
  //por lo pronto se implementa este método
  async obtenerNotificacionesApiLocales() {
    this.notificaciones = [];
    this.estaCargando = true;
    this.estaCargandoNotificaciones = true;
    var ruts = this.servNotificaciones.entregaArregloRuts();
    if (!this.utiles.isAppOnDevice()) {
      //web
      this.cita.postCitasWebFuturas(ruts).subscribe((response: any) => {
        var data = response;
        //console.log(data);
        this.notificaciones = this.servNotificaciones.construyeNotificacionesLocales(data);
        this.estaCargando = false;
        this.estaCargandoNotificaciones = false;
      }, error => {
        console.log(error);
        this.notificaciones = this.servNotificaciones.construyeNotificacionesLocales([]);
        this.estaCargando = false;
        this.estaCargandoNotificaciones = false;
      })
    }
    else {
      //nativa
      this.cita.postCitasWebFuturasNative(ruts).then((response: any) => {
        var data = JSON.parse(response.data);
        //console.log(data);
        this.notificaciones = this.servNotificaciones.construyeNotificacionesLocales(data);
        this.estaCargando = false;
        this.estaCargandoNotificaciones = false;
      }, error => {
        console.log(error);
        this.notificaciones = this.servNotificaciones.construyeNotificacionesLocales([]);
        this.estaCargando = false;
        this.estaCargandoNotificaciones = false;
      })
    }


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
    modal.onDidDismiss().then((data: any) => {
      if (data) {
        //console.log(data);
        if (data?.data) {
          this.obtenerNotificacionesApiLocales();
        }
      }
    });
    return await modal.present();
  }
  async goToCapsulas() {
    const modal = await this.modalCtrl.create(
      {
        component: ModalCapsulasPage,
      }
    );
    modal.onDidDismiss().then((data: any) => {
      if (data) {
        console.log(data);
      }
    });
    return await modal.present();
  }

  openCapsulasPage() {
    this.navCtrl.navigateRoot('modal-capsulas');
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
  abrirTerminos() {
    if (this.rutaAceptoCondiciones != '#') {
      //abrir en una ventana nueva
      if (this.utiles.isAppOnDevice()) {
        let target = "_system";
        this.inap.create(encodeURI(this.rutaAceptoCondiciones), target, this.options);
      }
      else {
        //web
        window.open(encodeURI(this.rutaAceptoCondiciones), "_system", "location=yes");
      }
    }
  }

}
