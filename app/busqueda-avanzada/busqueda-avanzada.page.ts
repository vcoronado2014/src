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

  volver() {
    if (this.idUsuario == 0) {
      this.navCtrl.navigateRoot('pre-tiposatencion');
    }
    else {
      const navigationExtras: NavigationExtras = {
        queryParams: {
          Id: this.idUsuario
        }
      };
      this.navCtrl.navigateRoot(['pre-tiposatencion'], navigationExtras);
    }
  }
  ngOnInit() {
    moment.locale('es');
    if (sessionStorage.UsuarioAps) {
      this.usuarioAps = JSON.parse(sessionStorage.UsuarioAps);
      if (this.usuarioAps) {
        //this.usuarioAps.UrlImagen = this.utiles.entregaMiImagen();
        this.usuarioAps.UrlImagen = this.utiles.entregaImagen(this.usuarioAps);
        this.miColor = this.utiles.entregaColor(this.usuarioAps);
        this.runPaciente = this.utiles.insertarGuion(this.usuarioAps.Rut);
        this.codigoDeis = this.usuarioAps.ConfiguracionNodo.CodigoDeis2014;
        this.nodId = this.usuarioAps.ConfiguracionNodo.NodId;
      }
    }
    this.activatedRoute.queryParams.subscribe(async params => {
      if (params && params.Id) {
        this.idUsuario = params.Id
      }
    });
    //creamos tipo atencion inicial
    this.crearTiposAtencion();
    this.setFechasInicioFin();
    this.citas = JSON.parse(sessionStorage.getItem('CITAS_DISPONIBLES'));

  }
  setFechasInicioFin() {
    this.fechaInicio = sessionStorage.getItem('FECHA_INICIO_CONSULTA');
    this.fechaTermino = sessionStorage.getItem('FECHA_TERMINO_CONSULTA');
    //dejamos el horario busqueda por defecto en mañana
    this.horarioBusqueda = 0;
    this.diasBusqueda = ['1', '2', '3', '4', '5', '6', '7'];
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
        this.navCtrl.navigateRoot('calendario');
        //console.log(accion);        
      }
    });
    return await modal.present();
  }
  changeFechaInicio(event) {
    console.log(event);
    if (event.detail.value) {
      this.fechaInicioBusqueda = event.detail.value;
      //console.log(this.fechaInicioBusqueda);
    }
  }
  changeHorario(event) {
    if (event.detail.value) {
      this.horarioBusqueda = event.detail.value;
      //console.log(this.horarioBusqueda);
    }
  }
  changeDia(event) {
    if (event.detail.value) {
      this.diasBusqueda = event.detail.value;
      //console.log(this.diasBusqueda);
    }
  }


}