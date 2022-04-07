import { Component, ViewChild, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { NavController, ToastController, Platform, ModalController, LoadingController, MenuController, IonItem } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

import { ServicioUtiles } from '../../app/services/ServicioUtiles';
import { ServicioAcceso } from '../../app/services/ServicioAcceso';
import { ServicioCitas } from '../../app/services/ServicioCitas';
import { ServicioPaginacion } from '../../app/services/ServicioPaginacion';
import * as moment from 'moment';
import { MomentPipe } from '../../app/pipes/fecha.pipe';
//pipe
import { FilterPipe } from '../../app/pipes/filter.pipe';
import { environment } from 'src/environments/environment';
//modal
import { ModalOperacionCitaPage } from '../modal-operacion-cita/modal-operacion-cita.page';

@Component({
  selector: 'app-busqueda-avanzada',
  templateUrl: './busqueda-avanzada.page.html',
  styleUrls: ['./busqueda-avanzada.page.scss'],
})

export class BusquedaAvanzadaPage implements OnInit {
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
  //busqueda
  fechaInicioBusqueda;
  horarioBusqueda;
  diasBusqueda;
  //para volver a la pagina anterior
  idUsuario = 0;
  //esto es para infiniti scroll
  topLimit: number = 5;
  citasFiltradasTop: any = [];
  //parametros desde la pagina anterior
  profesional = '';
  tipoAtencion = '';
  profesionales = [];
  profesionalesFiltrados = [];
  comboSeleccionadoProf = '';

  comboSeleccionadoFecha = '';
  comboSeleccionadoHorario = '';
  comboSeleccionadoDias = '';

  ocultarFiltros = false;

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
    public paginacion: ServicioPaginacion,
    public activatedRoute: ActivatedRoute,
    private router: Router,
  ) { }

  changeFiltros(){
    if (this.ocultarFiltros){
      this.ocultarFiltros = false;
    }
    else{
      this.ocultarFiltros = true;
    }
  }

  agregarProfesionales(data) {
    var contador = 1;
    if (data) {
      data.forEach(cita => {
        var entidad = this.profesionales.filter(p => p.Texto == cita.NombreCompletoMedico);
        if (entidad.length == 0) {
          var entidadProfesional = {
            Texto: cita.NombreCompletoMedico,
            Valor: contador,
            Selected: false
          };
          if (cita.NombreCompletoMedico.toLowerCase() == this.profesional.toLowerCase() && this.profesional != '') {
            entidadProfesional.Selected = true;
            //seleccionamos el input de profesional
            this.comboSeleccionadoProf = this.profesional;
          }
          else {
            entidadProfesional.Selected = false;
          }
          this.profesionales.push(entidadProfesional);
          contador++;
        }
      });
    }

    //sessionStorage.setItem('PROFESIONALES_ATENCION', JSON.stringify(this.profesionales));
    this.profesionalesFiltrados = this.profesionales;
    console.log(this.profesionales);
  }

  async filterList(item) {
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
    else {
      this.profesionalesFiltrados = this.profesionales;
      //dejamos los tdas como estaban
      this.tiposAtencion = sessionStorage.getItem('TIPOS_ATENCION') ? JSON.parse(sessionStorage.getItem('TIPOS_ATENCION')) : [];
      this.idComboSeleccionado = 0;
      this.comboSeleccionado = 'Selecciona...';
    }

  }

  crearFiltros() {
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
  }
  selectedTipoAtencion() {
    if (this.tipoAtencion && this.tiposAtencion.length > 0) {
      this.tiposAtencion.forEach(tipo => {
        if (tipo.Texto == this.tipoAtencion) {
          tipo.Selected = true;
          //seleccionamos el tipo atención
          this.comboSeleccionado = this.tipoAtencion;
        }
        else {
          tipo.Selected = false;
        }
      });
    }
  }
  limpiarProfesional() {
    this.comboSeleccionadoProf = '';
    this.profesionalesFiltrados = this.profesionales;
    var item = {
      srcElement: {
        value: ''
      }
    };
    this.filterList(item);
    //aca realizar búsqueda
    //this.buscarCitasFiltro();
  }
  changeProfesional() {
    console.log(this.comboSeleccionadoProf);
    //aca debemos filtrar los tdas de este medico
    this.filtrarTDAProfesional(this.comboSeleccionadoProf);
    //aca realizar búsqueda
    //this.buscarCitasFiltro();
  }
  filtrarTDAProfesional(nombreProfesional) {
    this.crearTiposAtencionInicial();
    //agregamos los tdas sólo del medico
    var citas = sessionStorage.getItem('CITAS_DISPONIBLES') ? JSON.parse(sessionStorage.getItem('CITAS_DISPONIBLES')) : [];
    var contador = 1;
    if (citas) {
      citas.forEach(cita => {
        if (cita.NombreCompletoMedico.toLowerCase() == nombreProfesional.toLowerCase()) {
          var tda = this.tiposAtencion.filter(t => t.Texto == cita.TipoAtencion);
          if (tda.length == 0) {
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
  crearTiposAtencionInicial() {
    //var arr = [];
    this.tiposAtencion = [];
    var entidadInicial = {
      Texto: 'Selecciona...',
      Valor: 0,
      Selected: true
    }
    this.tiposAtencion.push(entidadInicial);
    this.idComboSeleccionado = 0;
  }
  mostrarChips() {
    var ocultar = true;
    if (this.comboSeleccionadoProf != '' || this.comboSeleccionado != 'Selecciona...'
        || this.comboSeleccionadoDias != '' || this.comboSeleccionadoFecha != ''
        || this.comboSeleccionadoHorario != '') {
      ocultar = false;
    }
    return ocultar;
  }

  buscarCitasFiltro(event) {
    this.mostrarProgress = true;
    this.encontroCitas = false;
    this.disabledCombo = true;
    setTimeout(() => {
      //console.log('Async operation has ended');

      //event.target.complete();
      this.mostrarProgress = false;
      //this.encontroCitas = true;
      //si existen citas hay que deshabilitar el control
      this.disabledCombo = false;
      this.indexarCitasFiltro();
    }, 2000);

  }
  indexarCitasFiltro() {
    //el tipo de atencion seleccionado
    //HAY QUE AGREGAR LOS DEMAS FILTROS
    //el filtro profesional
    var usaTipoAtencion = this.comboSeleccionado == 'Selecciona...' ? false : true;
    var usaProfesional = this.comboSeleccionadoProf == '' ? false : true;

    var citasProcesar = [];
    if (usaProfesional && usaTipoAtencion){
      if (this.citas){
        this.citas.forEach(cita => {
            if (cita.NombreCompletoMedico.toLowerCase() == this.comboSeleccionadoProf.toLowerCase()
            && cita.TipoAtencion.toLowerCase() == this.comboSeleccionado.toLowerCase()){
              citasProcesar.push(cita);
            }
        }); 
      }
    }
    else if (usaProfesional == false && usaTipoAtencion){
      if (this.citas){
        this.citas.forEach(cita => {
            if (cita.TipoAtencion.toLowerCase() == this.comboSeleccionado.toLowerCase()){
              citasProcesar.push(cita);
            }
        }); 
      }
    }
    else if (usaProfesional && usaTipoAtencion == false){
      if (this.citas){
        this.citas.forEach(cita => {
            if (cita.NombreCompletoMedico.toLowerCase() == this.comboSeleccionadoProf.toLowerCase()){
              citasProcesar.push(cita);
            }
        }); 
      }
    }
    else{
      citasProcesar = this.citas;
    }

    this.citasFiltradas = [];
    var indice = 1;
    if (citasProcesar && citasProcesar.length > 0) {
      citasProcesar.forEach(cita => {

          //aca debemos aplicar los demas filtros, el primero es fecha inicio
          var fechaCita = moment(cita.FechaHoraInicio);
          var isAfter = moment(fechaCita.format()).isAfter(this.fechaInicioBusqueda);
          //aca ya tenemos el segundo filtro importante
          if (isAfter) {
            //ahora debemos trabajar con los filtros de horario
            //partimos con dia de la semana
            if (this.diasBusqueda && this.diasBusqueda.length > 0) {
              var diaSemana = fechaCita.day();
              //console.log('dia semana ' + diaSemana + ' ' + fechaCita.format('DD-MM-YYYY'));
              var existe = this.diasBusqueda.includes(diaSemana.toString());
              //si el día de la semana existe se agrega
              if (existe) {
                //ahora aplicamos filtros de mañana y tarde
                if (this.horarioBusqueda == 0) {
                  cita.indice = indice;
                  this.citasFiltradas.push(cita);
                  indice++;
                }
                else {
                  //busca mañana o tarde
                  var hora = fechaCita.hour();
                  var minute = fechaCita.minute();
                  var horaEntera = this.utiles.convertirHoraInt(hora, minute);
                  //deberia entregar 600 para las 6 am y 1800 para las 6 pm
                  //por lo tanto todo aquello menor o igual 1200 es mañana
                  if (this.horarioBusqueda == 1 && horaEntera <= 1200) {
                    //mañana
                    //console.log('mañana');
                    cita.indice = indice;
                    this.citasFiltradas.push(cita);
                    indice++;
                  }
                  if (this.horarioBusqueda == 2 && horaEntera > 1200) {
                    //tarde
                    //console.log('tarde');
                    cita.indice = indice;
                    this.citasFiltradas.push(cita);
                    indice++;
                  }

                }

              }

            }
          }

      });
    }
    if (indice > 2) {
      this.encontroCitas = true;
    }
    //aca le ponemos limite a ala lista de citas filtradas
    if (this.citasFiltradas && this.citasFiltradas.length > 0) {
      this.citasFiltradasTop = this.citasFiltradas.slice(0, this.topLimit);
    }
  }
  
  limpiarFiltros(){
    //metodos de limpieza
    this.setFechasInicioFin();
    this.tiposAtencion = sessionStorage.getItem('TIPOS_ATENCION_LOCAL') ? JSON.parse(sessionStorage.getItem('TIPOS_ATENCION_LOCAL')) : [];
    this.comboSeleccionado = 'Selecciona...';
    this.idComboSeleccionado = 0;
    this.limpiarProfesional();
    this.citasFiltradas = [];
    this.encontroCitas = false;
  }


  volver() {
    if (this.idUsuario == 0) {
      this.navCtrl.navigateRoot('home');
    }
    else {
      const navigationExtras: NavigationExtras = {
        queryParams: {
          Id: this.idUsuario,
          CodigoDeis: this.codigoDeis,
          NodId: this.nodId
        }
      };
      this.navCtrl.navigateRoot(['pre-tiposatencion'], navigationExtras);
    }
  }
  ngOnInit() {
    moment.locale('es');
    this.activatedRoute.queryParams.subscribe(async params => {
      if (params && params.Id && params.CodigoDeis && params.NodId) {
        this.idUsuario = params.Id
        this.codigoDeis = params.CodigoDeis;
        this.nodId = params.NodId;
        this.usuarioAps = this.utiles.entregaUsuario(params.Id);
        if (this.usuarioAps) {
          //this.usuarioAps.UrlImagen = this.utiles.entregaMiImagen();
          this.usuarioAps.UrlImagen = this.utiles.entregaImagen(this.usuarioAps);
          this.miColor = this.utiles.entregaColor(this.usuarioAps);
          this.runPaciente = this.utiles.insertarGuion(this.usuarioAps.Rut);
/*           this.codigoDeis = this.usuarioAps.ConfiguracionNodo.CodigoDeis2014;
          this.nodId = this.usuarioAps.ConfiguracionNodo.NodId; */
        }
        //parametros adicionales
        this.profesional = params?.Profesional ? params.Profesional : '';
        this.tipoAtencion = params?.TipoAtencion ? params.TipoAtencion : '';
      }
    });
    console.log('profesional ' + this.profesional);
    console.log('tipo atencion ' + this.tipoAtencion);
    this.tiposAtencion = sessionStorage.getItem('TIPOS_ATENCION_LOCAL') ? JSON.parse(sessionStorage.getItem('TIPOS_ATENCION_LOCAL')) : [];
    //creamos tipo atencion inicial
    //this.crearTiposAtencion();
    //nuevo, ojo con esto
    //this.crearFiltros();
    //***************** */
    this.setFechasInicioFin();
    this.citas = JSON.parse(sessionStorage.getItem('CITAS_DISPONIBLES'));
    //nuevo
    this.selectedTipoAtencion();
    this.agregarProfesionales(this.citas);

  }
  setFechasInicioFin() {
    this.fechaInicio = sessionStorage.getItem('FECHA_INICIO_CONSULTA');
    this.fechaTermino = sessionStorage.getItem('FECHA_TERMINO_CONSULTA');
    //dejamos el horario busqueda por defecto en mañana
    this.horarioBusqueda = 0;
    this.comboSeleccionadoHorario = this.entregaJornada(this.horarioBusqueda);
    this.diasBusqueda = ['1', '2', '3', '4', '5', '6', '7'];
    this.comboSeleccionadoDias = this.entregaDiasSemana(this.diasBusqueda);
    this.fechaInicioBusqueda = this.fechaInicio;
  }
  indexarCitas() {
    //el tipo de atencion seleccionado
    //HAY QUE AGREGAR LOS DEMAS FILTROS
    this.citasFiltradas = [];
    var indice = 1;
    if (this.citas && this.citas.length > 0) {
      this.citas.forEach(cita => {
        if (cita.TipoAtencion == this.comboSeleccionado) {
          //aca debemos aplicar los demas filtros, el primero es fecha inicio
          var fechaCita = moment(cita.FechaHoraInicio);
          var isAfter = moment(fechaCita.format()).isAfter(this.fechaInicioBusqueda);
          //aca ya tenemos el segundo filtro importante
          if (isAfter) {
            //ahora debemos trabajar con los filtros de horario
            //partimos con dia de la semana
            if (this.diasBusqueda && this.diasBusqueda.length > 0) {
              var diaSemana = fechaCita.day();
              //console.log('dia semana ' + diaSemana + ' ' + fechaCita.format('DD-MM-YYYY'));
              var existe = this.diasBusqueda.includes(diaSemana.toString());
              //si el día de la semana existe se agrega
              if (existe) {
                //ahora aplicamos filtros de mañana y tarde
                if (this.horarioBusqueda == 0) {
                  cita.indice = indice;
                  this.citasFiltradas.push(cita);
                  indice++;
                }
                else {
                  //busca mañana o tarde
                  var hora = fechaCita.hour();
                  var minute = fechaCita.minute();
                  var horaEntera = this.utiles.convertirHoraInt(hora, minute);
                  //deberia entregar 600 para las 6 am y 1800 para las 6 pm
                  //por lo tanto todo aquello menor o igual 1200 es mañana
                  if (this.horarioBusqueda == 1 && horaEntera <= 1200) {
                    //mañana
                    //console.log('mañana');
                    cita.indice = indice;
                    this.citasFiltradas.push(cita);
                    indice++;
                  }
                  if (this.horarioBusqueda == 2 && horaEntera > 1200) {
                    //tarde
                    //console.log('tarde');
                    cita.indice = indice;
                    this.citasFiltradas.push(cita);
                    indice++;
                  }

                }

              }

            }
          }
        }
      });
    }
    if (indice > 2) {
      this.encontroCitas = true;
    }
    //aca le ponemos limite a ala lista de citas filtradas
    if (this.citasFiltradas && this.citasFiltradas.length > 0) {
      this.citasFiltradasTop = this.citasFiltradas.slice(0, this.topLimit);
    }
  }
  loadData(event) {
    setTimeout(() => {
      //console.log('Done');
      this.topLimit += 5;
      this.citasFiltradasTop = this.citasFiltradas.slice(0, this.topLimit);
      event.target.complete();
      //aplicamos disabled si la cantidad de registros es la misma que el total
      if (this.citasFiltradasTop.length == this.citasFiltradas.length) {
        event.target.disabled = true;
      }

    }, 500);
  }
  //creamos los tipos de atención disponibles
  crearTiposAtencion() {
    this.tiposAtencion = [];
    if (sessionStorage.getItem('TIPOS_ATENCION')) {
      this.tiposAtencion = JSON.parse(sessionStorage.getItem('TIPOS_ATENCION'));
      if (this.tiposAtencion) {
        this.tiposAtencion.forEach(tipo => {
          if (tipo.Selected) {
            this.comboSeleccionado = tipo.Texto;
            this.disabledCombo = true;
          }
        });
      }
    }
  }
  buscarCitas(event) {

    //console.log(this.comboSeleccionado);
    //console.log(this.horarioBusqueda);
    //console.log(this.diasBusqueda);
    //console.log(this.fechaInicioBusqueda);
    this.mostrarProgress = true;
    this.encontroCitas = false;
    this.disabledCombo = false;
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
            idUsp: this.idUsuario
          }
        };
        this.navCtrl.navigateBack(['calendario'], navigationExtras);
      }
    });
    return await modal.present();
  }
  changeFechaInicio(event) {
    console.log(event);
    if (event.detail.value) {
      this.fechaInicioBusqueda = event.detail.value;
      //console.log(this.fechaInicioBusqueda);
      var fechaActual = moment().format('YYYY-MM-DD');
      var fechaComparar = moment(this.fechaInicioBusqueda).format('YYYY-MM-DD');
      if (fechaActual != fechaComparar)
      {
        this.comboSeleccionadoFecha = 'Fecha inicio';
      }
      else{
        this.comboSeleccionadoFecha = '';
      }

    }
  }
  changeHorario(event) {
    if (event.detail.value) {
      this.horarioBusqueda = event.detail.value;
      //el horario de busqueda es por defecto 0 (mañana)
      this.comboSeleccionadoHorario = this.entregaJornada(this.horarioBusqueda);
      //console.log(this.horarioBusqueda);
    }
  }
  changeDia(event) {
    if (event.detail.value) {
      this.diasBusqueda = event.detail.value;
      //console.log(this.diasBusqueda);
      this.comboSeleccionadoDias = this.entregaDiasSemana(this.diasBusqueda);
    }
  }

  entregaJornada(value){
    var retorno = '';
    if (value == '0'){
      retorno = 'Todo el día';
    }
    else if (value == '1'){
      retorno = 'Mañana';
    }
    else if (value == '2'){
      retorno = 'Tarde'
    }
    return retorno;
  }
  entregaDiasSemana(array){
    var retorno = '';
    var arrDias = [];
    if (array.length == 7){
      retorno = 'Todos los días';
    }
    else{
      array.forEach(dia => {
        if (dia == '1'){
          arrDias.push('Lu');
        }
        if (dia == '2'){
          arrDias.push('Ma');
        }
        if (dia == '3'){
          arrDias.push('Mi');
        }
        if (dia == '4'){
          arrDias.push('Ju');
        }
        if (dia == '5'){
          arrDias.push('Vi');
        }
        if (dia == '6'){
          arrDias.push('Sa');
        }
        if (dia == '7'){
          arrDias.push('Do');
        }
      });

      retorno = arrDias.toString();

      console.log(retorno);
    }
    return retorno;
  }

}