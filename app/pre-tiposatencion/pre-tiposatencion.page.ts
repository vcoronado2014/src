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
import {combineAll, map, startWith} from 'rxjs/operators';

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
  //arreglo de nombres de medicos
  profesionales = [];
  profesionalesFiltrados = [];
  comboSeleccionadoProf = '';
  idComboSeleccionadoProf = 0;
  disabledComboProf = false;
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


  async presentToastWithOptions(titulo, mensaje, posicion) {
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
              text: 'Reintentar',
              role: 'alert',
              handler: () => {
                  this.load();
                  toast.dismiss();
              },
          },

      ],
    });
    await toast.present();
  }

  changeProfesional(){
    console.log(this.comboSeleccionadoProf);
    //aca debemos filtrar los tdas de este medico
    this.filtrarTDAProfesional(this.comboSeleccionadoProf);
    //ACA ESTOY
    //BUSCAR LAS CITAS DEL MEDICO
    //LUEGO ATACHHAR LA BUSQUEDA CUANDO SELECCIONE EL TDA.
    //this.buscarCitasFiltro();
  }
  indexarCitasFiltro() {
    //el tipo de atencion seleccionado
    var usaProfesional = this.comboSeleccionadoProf != '' ? true : false;
    var usaTda = this.comboSeleccionado != 'Selecciona...' ? true : false;
    this.citasFiltradas = [];
    var indice = 1;
    if (this.citas && this.citas.length > 0) {
      this.citas.forEach(cita => {
        if (usaProfesional && usaTda){
          if (cita.TipoAtencion == this.comboSeleccionado && cita.NombreCompletoMedico.toLowerCase() == this.comboSeleccionadoProf.toLocaleLowerCase()){
            cita.indice = indice;
            this.citasFiltradas.push(cita);
            indice++;
          }
        }
        else if (usaProfesional && usaTda == false){
          if (cita.NombreCompletoMedico.toLowerCase() == this.comboSeleccionadoProf.toLocaleLowerCase()){
            cita.indice = indice;
            this.citasFiltradas.push(cita);
            indice++;
          }
        }
        else if (usaProfesional == false && usaTda){
          if (cita.TipoAtencion == this.comboSeleccionado){
            cita.indice = indice;
            this.citasFiltradas.push(cita);
            indice++;
          }
        }
        else{
          this.utiles.presentToast('Debe buscar por algún filtro', 'bottom', 3000);
        }
      });

      //las citas filtradas hay que reporcesarlas, ya que un profesional puede tener varios tdas,
      //en este caso es necesario mostrarle al usuario al menos una opcion por tda
      if (usaProfesional && usaTda == false){
        //obtenemos cuantos tdas tiene ese profesional
        var nuevoArreglo = this.utiles.obtenerTdasProfesional(this.citasFiltradas, this.comboSeleccionadoProf);
        this.citasFiltradas = nuevoArreglo;
        //console.log(countTdas);
      }
      else if (usaProfesional == false && usaTda){
        var nuevoArreglo = this.utiles.obtenerProfesionalTdas(this.citasFiltradas, this.comboSeleccionado);
        this.citasFiltradas = nuevoArreglo;
      }

    }
    if (this.citasFiltradas.length > 1) {
      this.encontroCitas = true;
    }
    console.log(this.citasFiltradas);
  }
  buscarCitasFiltro() {
    this.mostrarProgress = true;
    this.encontroCitas = false;
    this.disabledCombo = false;
    setTimeout(() => {
      this.mostrarProgress = false;
      //this.disabledCombo = true;
      this.indexarCitasFiltro();
    }, 2000);
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
  async filterList(item){
    console.log(item.srcElement.value);
    if (item.srcElement.value != '') {
      this.profesionalesFiltrados = this.profesionales;

      const searchTerm = item.srcElement.value;
      if (!searchTerm) {
        return;
      }
      this.profesionalesFiltrados = this.profesionalesFiltrados.filter(prof => {
        if (prof.Texto && searchTerm) {
          return (prof.Texto.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1)
        }
      })
    }
    else{
      this.profesionalesFiltrados = this.profesionales;
      //dejamos los tdas como estaban
      this.tiposAtencion = sessionStorage.getItem('TIPOS_ATENCION') ? JSON.parse(sessionStorage.getItem('TIPOS_ATENCION')) : [];
      this.idComboSeleccionado = 0;
    }

  }
  filtrarTDAProfesional(nombreProfesional){
     this.crearTiposAtencion();
     //agregamos los tdas sólo del medico
     var citas = sessionStorage.getItem('CITAS_DISPONIBLES') ? JSON.parse(sessionStorage.getItem('CITAS_DISPONIBLES')) : [];
     var contador = 1;
     if (citas){
       citas.forEach(cita => {
         if (cita.NombreCompletoMedico.toLowerCase() == nombreProfesional.toLowerCase()){
           var tda = this.tiposAtencion.filter(t=>t.Texto == cita.TipoAtencion);
           if (tda.length == 0){
            var entidad = {
              Texto: cita.TipoAtencion,
              Valor: contador,
              Selected: false
            }
            this.tiposAtencion.push(entidad);
           }
           contador++;
         }
         
       });
     }
  }
  limpiarProfesional(){
    this.comboSeleccionadoProf = '';
    this.profesionalesFiltrados = this.profesionales;
    var item = {
      srcElement : {
        value: ''
      }
    };
    this.filterList(item);
    this.buscarCitasFiltro();
  }
  btnLimpiarFiltros(){
    this.disabledCombo = false;
    this.comboSeleccionado = 'Selecciona...';
    this.idComboSeleccionado = 0;
    this.entregaTiposAtencion();
    this.limpiarProfesional();
    this.citasFiltradas = [];
    this.encontroCitas = false;

  }
  entregaTiposAtencion(){
    this.crearTiposAtencion();
    var contador = 1;
    if (this.citas){
      this.citas.forEach(cita => {
        var tda = this.tiposAtencion.filter(t=>t.Texto == cita.TipoAtencion);
        if (tda.length == 0){
          var entidadTipo = {
            Texto: cita.TipoAtencion,
            Valor: contador,
            Selected: false
          };
          //tipos.push(entidadTipo);
          this.tiposAtencion.push(entidadTipo);
          contador++;
        }
      });
    }
  }
  mostrarChips(){
    var ocultar = true;
    if (this.comboSeleccionadoProf != '' || this.comboSeleccionado != 'Selecciona...'){
      ocultar = false;
    }
    return ocultar;
  }
  async load(){
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
          //this.crearTiposAtencion();
          //nuevo metodo
          this.crearFiltros();
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
  }

  async ngOnInit() {
    moment.locale('es');
    //debemos recibir por parametro al usuario que le conseguiremos la hora
    this.load();

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
          //this.utiles.presentToast('Se ha producido un error al obtener disponibilidad', 'bottom', 2000);
          this.presentToastWithOptions('Citas','Se ha producido un error al obtener disponibilidad', 'bottom');
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
          //this.utiles.presentToast('Se ha producido un error al obtener disponibilidad', 'bottom', 2000);
          this.presentToastWithOptions('Citas','Se ha producido un error al obtener disponibilidad', 'bottom');
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
        //agregamos los profesionales
        this.agregarProfesionales(data.CitasDisponibles);
        console.log(this.profesionales);
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

  //este metodo se modifica para entregar información adicional
  //tipo de atencion web, sector, nombre completo medico
  procesarRespuestaTotal(data, loader) {
    //vienen las citas sin fecha
    this.citas = [];
    this.citasFiltradas = [];
    //this.tiposAtencion = [];
    if (data && data.Mensaje) {
      //correcto
      if (data.Mensaje.Codigo == 'correcto') {
        //todo bien procesar las citas
        if (data.TiposAtencion) {
          this.agregarTiposAtencion(data.TiposAtencion);
          //console.log(this.tiposAtencion);
        }
        //acá reprocesaremos la data VC 21-03-2022
        if (data?.CitasDisponibles){
          data.CitasDisponibles.forEach(cita => {
            var nombre = cita.NombresMedico != '' ? cita.NombresMedico : '';
            var apellidos = cita.ApellidosMedico != '' ? cita.ApellidosMedico : '';
            //nombre completo
            cita.NombreCompletoMedico = nombre + ' ' + apellidos;
            cita.Sector = cita.Servicio?.NombreServicio ? cita.Servicio.NombreServicio : 'No definido';
            cita.TipoAtencionWeb = cita.TipoServicio?.Nombre ? cita.TipoServicio.Nombre : '';
          });
        }

        //aca asignamos las citas
        this.citas = data.CitasDisponibles;
        this.agregarProfesionales(data.CitasDisponibles);
        console.log(this.citas);
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
        //this.utiles.presentToast('Ocurrió un error al obtener la disponibilidad de citas, inténtelo nuevamente', 'bottom', 4000);
        this.presentToastWithOptions('Citas','Se ha producido un error al obtener disponibilidad', 'bottom');
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
  crearFiltros(){
    this.tiposAtencion = [];
    this.profesionalesFiltrados = [];
    this.profesionales = [];

    var entidadInicial = {
      Texto: 'Selecciona...',
      Valor: 0,
      Selected: true
    }
    this.tiposAtencion.push(entidadInicial);
    this.idComboSeleccionado = 0;
    //this.profesionalesFiltrados.push(entidadInicial);
    //this.profesionales.push(entidadInicial);
    this.idComboSeleccionadoProf = 0;
  }

  agregarProfesionales(data){
    var contador = 1;
    if (data){
      data.forEach(cita => {
        var entidad = this.profesionales.filter(p=>p.Texto == cita.NombreCompletoMedico);
        if (entidad.length == 0){
          var entidadProfesional = {
            Texto: cita.NombreCompletoMedico,
            Valor: contador,
            Selected: false
          };
          this.profesionales.push(entidadProfesional);
          contador++;
        }
      });
    }

    sessionStorage.setItem('PROFESIONALES_ATENCION', JSON.stringify(this.profesionales));
    this.profesionalesFiltrados = this.profesionales;
    console.log(this.profesionales);
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
    sessionStorage.setItem('TIPOS_ATENCION_LOCAL', JSON.stringify(this.tiposAtencion));
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
        //this.navCtrl.navigateRoot('calendario');
        //console.log(accion);        
        const navigationExtras: NavigationExtras = {
          queryParams: {
            idUsp: this.idConsultar
          }
        };
        this.navCtrl.navigateBack(['calendario'], navigationExtras);
      }
    });
    return await modal.present();
  }
  openBusquedaAvanzada() {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        Id: this.idConsultar,
        Profesional: this.comboSeleccionadoProf,
        TipoAtencion: this.comboSeleccionado
      }
    };
    this.navCtrl.navigateRoot(['busqueda-avanzada'], navigationExtras);
  }
  irAHome(){
    const navigationExtras: NavigationExtras = {
      queryParams: {
        idUsp: this.idConsultar
      }
    };
    this.navCtrl.navigateBack(['calendario'], navigationExtras);
  }

}
