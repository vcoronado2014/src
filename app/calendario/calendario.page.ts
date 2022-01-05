import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavController, ToastController, Platform, ModalController, LoadingController, MenuController, IonItem, AlertController, IonContent } from '@ionic/angular';
//parametros
import { ActivatedRoute, Router } from '@angular/router';
import { NavigationExtras } from '@angular/router';
//SERVICIOS
import { ServicioUtiles } from '../../app/services/ServicioUtiles';
import { ServicioInfoUsuario } from '../../app/services/ServicioInfoUsuario';
import { ServicioAcceso } from '../../app/services/ServicioAcceso';
import { ServicioCitas } from '../../app/services/ServicioCitas';
import { ServicioParametrosApp } from '../../app/services/ServicioParametrosApp';
import { environment } from 'src/environments/environment';
//moment
import * as moment from 'moment';
//modal
import { ModalDetalleCitaPage } from '../modal-detalle-cita/modal-detalle-cita.page';
import { MomentPipe } from '../../app/pipes/fecha.pipe';
import { MatCard } from '@angular/material/card';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.page.html',
  styleUrls: ['./calendario.page.scss'],
})
export class CalendarioPage implements OnInit {
  miColor = '#FF4081';
  tiene = true;
  textColor = '#FFFFFF';
  //variables propias
  eventSource;
  public userData;
  public usuarioAps;
  public citas;
  public citasVertical;
  public citasVerticalMostrar;
  public calendarioData = [];
  public current;
  public calendarioTodo = [];
  public hoy;
  public diaSem;
  public meses;
  public anio;
  public icon;
  public imgEvento;
  public latAndLong;
  public titulo;
  public mesesVertical: any;
  public mesActualSeleccionado: any;
  public citasIntegracion = [];
  public citasVerticalTodas = [];
  //datos para consultar citas
  runPaciente = '';
  codigoDeis = '';
  serviceType = '349';
  nodId;
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
  @ViewChild('myList', { read: IonItem }) list: IonItem;
  @ViewChild('myListCard', { read: MatCard }) listCarda: MatCard;
  @ViewChild('content', { static: true }) content: IonContent;
  //para controlar el cargando
  estaCargando = false;
  tituloLoading = '';
  //para infinity scroll
  topLimit: number = 50;
  citasVerticalTodasTop: any = [];
  //para poner la linea en la fecha actual
  fechaActual = '';
  anioActual = '';
  scrollTo = null;
  //tiene eventos hoy
  tieneEventosHoy = false;
  tieneEventosFuturos = false;
  fechaParaHoy;
  //data local
  EVENTOS_LOCAL = [
    {
      "FechaCompleta": "2021-06-01T00:00:00",
      "NumeroDia": 1,
      "NombreDia": "martes",
      "NombreDiaReducido": "mar",
      "Id": 1,
      "Eventos": [

      ],
      "Mostrar": false,
      "indice": 0
    },
    {
      "FechaCompleta": "2021-06-02T00:00:00",
      "NumeroDia": 2,
      "NombreDia": "miércoles",
      "NombreDiaReducido": "mié",
      "Id": 2,
      "Eventos": [

      ],
      "Mostrar": false,
      "indice": 0
    },
    {
      "FechaCompleta": "2021-06-03T00:00:00",
      "NumeroDia": 3,
      "NombreDia": "jueves",
      "NombreDiaReducido": "jue",
      "Id": 3,
      "Eventos": [

      ],
      "Mostrar": false,
      "indice": 0
    },
    {
      "FechaCompleta": "2021-06-04T00:00:00",
      "NumeroDia": 4,
      "NombreDia": "viernes",
      "NombreDiaReducido": "vie",
      "Id": 4,
      "Eventos": [

      ],
      "Mostrar": false,
      "indice": 0
    },
    {
      "FechaCompleta": "2021-06-05T00:00:00",
      "NumeroDia": 5,
      "NombreDia": "sábado",
      "NombreDiaReducido": "sáb",
      "Id": 5,
      "Eventos": [

      ],
      "Mostrar": false,
      "indice": 0
    },
    {
      "FechaCompleta": "2021-06-06T00:00:00",
      "NumeroDia": 6,
      "NombreDia": "domingo",
      "NombreDiaReducido": "dom",
      "Id": 6,
      "Eventos": [

      ],
      "Mostrar": false,
      "indice": 0
    },
    {
      "FechaCompleta": "2021-06-07T00:00:00",
      "NumeroDia": 7,
      "NombreDia": "lunes",
      "NombreDiaReducido": "lun",
      "Id": 7,
      "Eventos": [

      ],
      "Mostrar": false,
      "indice": 0
    },
    {
      "FechaCompleta": "2021-06-08T00:00:00",
      "NumeroDia": 8,
      "NombreDia": "martes",
      "NombreDiaReducido": "mar",
      "Id": 8,
      "Eventos": [

      ],
      "Mostrar": false,
      "indice": 0
    },
    {
      "FechaCompleta": "2021-06-09T00:00:00",
      "NumeroDia": 9,
      "NombreDia": "miércoles",
      "NombreDiaReducido": "mié",
      "Id": 9,
      "Eventos": [

      ],
      "Mostrar": false,
      "indice": 0
    },
    {
      "FechaCompleta": "2021-06-10T00:00:00",
      "NumeroDia": 10,
      "NombreDia": "jueves",
      "NombreDiaReducido": "jue",
      "Id": 10,
      "Eventos": [

      ],
      "Mostrar": false,
      "indice": 0
    },
    {
      "FechaCompleta": "2021-06-11T00:00:00",
      "NumeroDia": 11,
      "NombreDia": "viernes",
      "NombreDiaReducido": "vie",
      "Id": 11,
      "Eventos": [

      ],
      "Mostrar": false,
      "indice": 0
    },
    {
      "FechaCompleta": "2021-06-12T00:00:00",
      "NumeroDia": 12,
      "NombreDia": "sábado",
      "NombreDiaReducido": "sáb",
      "Id": 12,
      "Eventos": [

      ],
      "Mostrar": false,
      "indice": 0
    },
    {
      "FechaCompleta": "2021-06-13T00:00:00",
      "NumeroDia": 13,
      "NombreDia": "domingo",
      "NombreDiaReducido": "dom",
      "Id": 13,
      "Eventos": [
        {
          "NombrePrincipal": "Leche Purita Fortificada",
          "NombreSecundario": "2",
          "HoraInicioFin": "13:00",
          "Imagen": "alimento.png",
          "DetalleEventoMes": {
            "FechaHora": "2021-06-13T13:00:00",
            "NombrePaciente": "Victor Edgardo Coronado Troncoso",
            "DescripcionPrincipal": "Leche Purita Fortificada",
            "DescripcionSecundaria": "2",
            "Lugar": "RAYENSALUD [CESFAM]",
            "Titulo": "Alimento",
            "Subtitulo": "Alimento Entregado",
            "IdElemento": 14105,
            "Estado": ""
          },
          "ListaFarmacos": null,
          "Color": "#757575"
        },
        {
          "NombrePrincipal": "Bebida Lactea Años Dorados",
          "NombreSecundario": "1",
          "HoraInicioFin": "13:00",
          "Imagen": "alimento.png",
          "DetalleEventoMes": {
            "FechaHora": "2021-06-13T13:00:00",
            "NombrePaciente": "Victor Edgardo Coronado Troncoso",
            "DescripcionPrincipal": "Bebida Lactea Años Dorados",
            "DescripcionSecundaria": "1",
            "Lugar": "RAYENSALUD [CESFAM]",
            "Titulo": "Alimento",
            "Subtitulo": "Alimento Entregado",
            "IdElemento": 14126,
            "Estado": ""
          },
          "ListaFarmacos": null,
          "Color": "#757575"
        }
      ],
      "Mostrar": true,
      "indice": 0
    },
    {
      "FechaCompleta": "2021-06-14T00:00:00",
      "NumeroDia": 14,
      "NombreDia": "lunes",
      "NombreDiaReducido": "lun",
      "Id": 14,
      "Eventos": [

      ],
      "Mostrar": false,
      "indice": 0
    },
    {
      "FechaCompleta": "2021-06-15T00:00:00",
      "NumeroDia": 15,
      "NombreDia": "martes",
      "NombreDiaReducido": "mar",
      "Id": 15,
      "Eventos": [
        {
          "NombrePrincipal": "Rinofaringitis aguda (resfriado común)",
          "NombreSecundario": "J00",
          "HoraInicioFin": "13:09",
          "Imagen": "diagnostico.png",
          "DetalleEventoMes": {
            "FechaHora": "2021-06-15T13:09:54.547",
            "NombrePaciente": "Victor Edgardo Coronado Troncoso",
            "DescripcionPrincipal": "Rinofaringitis aguda (resfriado común)",
            "DescripcionSecundaria": "J00",
            "Lugar": "RAYENSALUD [CESFAM]",
            "Titulo": "Atención",
            "Subtitulo": "Atención Realizada",
            "IdElemento": 390333192,
            "Estado": ""
          },
          "ListaFarmacos": null,
          "Color": "#757575"
        }
      ],
      "Mostrar": true,
      "indice": 0
    },
    {
      "FechaCompleta": "2021-06-16T00:00:00",
      "NumeroDia": 16,
      "NombreDia": "miércoles",
      "NombreDiaReducido": "mié",
      "Id": 16,
      "Eventos": [

      ],
      "Mostrar": false,
      "indice": 0
    },
    {
      "FechaCompleta": "2021-06-17T00:00:00",
      "NumeroDia": 17,
      "NombreDia": "jueves",
      "NombreDiaReducido": "jue",
      "Id": 17,
      "Eventos": [

      ],
      "Mostrar": false,
      "indice": 0
    },
    {
      "FechaCompleta": "2021-06-18T00:00:00",
      "NumeroDia": 18,
      "NombreDia": "viernes",
      "NombreDiaReducido": "vie",
      "Id": 18,
      "Eventos": [

      ],
      "Mostrar": false,
      "indice": 0
    },
    {
      "FechaCompleta": "2021-06-19T00:00:00",
      "NumeroDia": 19,
      "NombreDia": "sábado",
      "NombreDiaReducido": "sáb",
      "Id": 19,
      "Eventos": [

      ],
      "Mostrar": false,
      "indice": 0
    },
    {
      "FechaCompleta": "2021-06-20T00:00:00",
      "NumeroDia": 20,
      "NombreDia": "domingo",
      "NombreDiaReducido": "dom",
      "Id": 20,
      "Eventos": [

      ],
      "Mostrar": false,
      "indice": 0
    },
    {
      "FechaCompleta": "2021-06-21T00:00:00",
      "NumeroDia": 21,
      "NombreDia": "lunes",
      "NombreDiaReducido": "lun",
      "Id": 21,
      "Eventos": [

      ],
      "Mostrar": false,
      "indice": 0
    },
    {
      "FechaCompleta": "2021-06-22T00:00:00",
      "NumeroDia": 22,
      "NombreDia": "martes",
      "NombreDiaReducido": "mar",
      "Id": 22,
      "Eventos": [

      ],
      "Mostrar": false,
      "indice": 0
    },
    {
      "FechaCompleta": "2021-06-23T00:00:00",
      "NumeroDia": 23,
      "NombreDia": "miércoles",
      "NombreDiaReducido": "mié",
      "Id": 23,
      "Eventos": [

      ],
      "Mostrar": false,
      "indice": 0
    },
    {
      "FechaCompleta": "2021-06-24T00:00:00",
      "NumeroDia": 24,
      "NombreDia": "jueves",
      "NombreDiaReducido": "jue",
      "Id": 24,
      "Eventos": [

      ],
      "Mostrar": false,
      "indice": 0
    },
    {
      "FechaCompleta": "2021-06-25T00:00:00",
      "NumeroDia": 25,
      "NombreDia": "viernes",
      "NombreDiaReducido": "vie",
      "Id": 25,
      "Eventos": [

      ],
      "Mostrar": false,
      "indice": 0
    },
    {
      "FechaCompleta": "2021-06-26T00:00:00",
      "NumeroDia": 26,
      "NombreDia": "sábado",
      "NombreDiaReducido": "sáb",
      "Id": 26,
      "Eventos": [

      ],
      "Mostrar": false,
      "indice": 0
    },
    {
      "FechaCompleta": "2021-06-27T00:00:00",
      "NumeroDia": 27,
      "NombreDia": "domingo",
      "NombreDiaReducido": "dom",
      "Id": 27,
      "Eventos": [

      ],
      "Mostrar": false,
      "indice": 0
    },
    {
      "FechaCompleta": "2021-06-28T00:00:00",
      "NumeroDia": 28,
      "NombreDia": "lunes",
      "NombreDiaReducido": "lun",
      "Id": 28,
      "Eventos": [

      ],
      "Mostrar": false,
      "indice": 0
    },
    {
      "FechaCompleta": "2021-06-29T00:00:00",
      "NumeroDia": 29,
      "NombreDia": "martes",
      "NombreDiaReducido": "mar",
      "Id": 29,
      "Eventos": [

      ],
      "Mostrar": false,
      "indice": 0
    },
    {
      "FechaCompleta": "2021-06-30T00:00:00",
      "NumeroDia": 30,
      "NombreDia": "miércoles",
      "NombreDiaReducido": "mié",
      "Id": 30,
      "Eventos": [

      ],
      "Mostrar": false,
      "indice": 0
    }
  ];
  constructor(
    public navCtrl: NavController,
    public toast: ToastController,
    public modalCtrl: ModalController,
    public platform: Platform,
    public menu: MenuController,
    public activatedRoute: ActivatedRoute,
    private router: Router,
    public utiles: ServicioUtiles,
    public loading: LoadingController,
    public info: ServicioInfoUsuario,
    public acceso: ServicioAcceso,
    public cita: ServicioCitas,
    private alertController: AlertController,
    public parametrosApp: ServicioParametrosApp
  ) { }

  ngOnInit() {
    moment().locale('es');
    this.fechaActual = this.transformDate(moment(), 'YYYY-MM-DD');
    this.anioActual = this.transformDate(moment(), 'YYYY');
    //console.log(this.fechaActual);
    //this.miColor = this.utiles.entregaMiColor();
    if (sessionStorage.UsuarioAps) {
      this.usuarioAps = JSON.parse(sessionStorage.UsuarioAps);
      if (this.usuarioAps) {
        this.miColor = this.utiles.entregaColor(this.usuarioAps);
        this.usuarioAps.UrlImagen = environment.URL_FOTOS + this.usuarioAps.UrlImagen;
        this.runPaciente = this.utiles.insertarGuion(this.usuarioAps.Rut);
        this.codigoDeis = this.usuarioAps.ConfiguracionNodo.CodigoDeis2014;
        this.nodId = this.usuarioAps.ConfiguracionNodo.NodId;
      }
    }
    //mes seleccionado
    this.mesActualSeleccionado = moment().month() + 1 + ',' + moment().year();
    let diasSemana = new Array("domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado");
    let meses = new Array("enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre");
    this.diaSem = diasSemana[new Date().getDay()];
    this.hoy = new Date().getDate();
    this.meses = meses[new Date().getMonth()];
    this.anio = new Date().getFullYear();
    //estos parametros estan en el ready
    //lamada para citas vertical
    var annoActual = moment().year();

    var mesActual = moment().month() + 1;
    //var mesActual = this.mesActualSeleccionado;
    //console.log(mesActual);
    //***************************** */
    this.tratamientoMeses();
    //prueba de implementacion api management
    //this.cargarTodosLosEventosApi();
    //implementacion nueva
    if (this.parametrosApp.USA_API_MANAGEMENT()) {
      this.cargarTodosLosEventosApi();
    }
    else {
      this.cargarTodosLosEventos();
    }


  }
  private getTime(date?: Date) {
    return date != null ? new Date(date).getTime() : 0;
  }
  cargarDataLocal(){
    sessionStorage.setItem('EVENTOS_LOCAL', JSON.stringify(this.EVENTOS_LOCAL));
    this.citasVerticalTodas = this.EVENTOS_LOCAL;
    this.procesarArregloCitasTodas();
    this.citasVerticalMostrar = this.citasVerticalTodas.filter(e => e.Mostrar == true);
    this.citasVerticalMostrar.sort((a: any, b: any) => { return this.getTime(a.FechaCompleta) - this.getTime(b.FechaCompleta) });
    //guardamos la variable de ordenamiento
    sessionStorage.setItem('ORDEN_EVENTOS', 'descendente');
    //creamos top limit al nuevo arreglo de citas
    this.citasVerticalTodasTop = this.citasVerticalMostrar.slice(0, this.topLimit);
  }
  async cargarTodosLosEventosApi() {
    //usar citasVerticalTodas
    this.citasVerticalTodas = [];
    this.citasVerticalMostrar = [];
    var fechaActual = moment();

    var mesActual = {
      mes: fechaActual.month() + 1,
      anno: fechaActual.year()
    };

    let loader = await this.loading.create({
      cssClass: 'loading-vacio',
      showBackdrop: false,
      spinner: null,
      //message: 'Cargando...<br>tipos de atención',
      duration: 2000
    });
    this.estaCargando = true;
    this.tituloLoading = 'Obteniendo calendario';

    await loader.present().then(async () => {
      if (!this.utiles.isAppOnDevice()) {
        //llamada web
        this.cita.entregaPorMesNuevoApi(this.usuarioAps.Id, this.usuarioAps.IdRyf, this.usuarioAps.NodId, mesActual.mes, mesActual.anno).subscribe(async (response: any) => {
          this.citasVerticalTodas = response;
          this.procesarArregloCitasTodas();
          this.citasVerticalMostrar = this.citasVerticalTodas.filter(e => e.Mostrar == true);
          this.citasVerticalMostrar.sort((a: any, b: any) => { return this.getTime(a.FechaCompleta) - this.getTime(b.FechaCompleta) });
          //guardamos la variable de ordenamiento
          sessionStorage.setItem('ORDEN_EVENTOS', 'descendente');
          //creamos top limit al nuevo arreglo de citas
          this.citasVerticalTodasTop = this.citasVerticalMostrar.slice(0, this.topLimit);
          //console.log(this.citasVerticalTodasTop);
          console.log(this.tieneEventosFuturos);
          loader.dismiss();
          this.estaCargando = false;
          this.tituloLoading = '';
          this.scrollListVisible();
          
        }, error => {
          //console.log(error.message);
          this.estaCargando = false;
          this.tituloLoading = '';
          loader.dismiss();
          //*** agregado por homologación ***/
          if (this.utiles.isAppIOS()){
            this.cargarDataLocal();
          }
          else{
            this.tiene = false;
            this.utiles.presentToast('Se produjo un error al obtener la información, vuelva a intentarlo más tarde', 'bottom', 3000);
            this.agregarUnElemento(moment().toDate());
          }
          console.log(this.tieneEventosFuturos);
        });
      }
      else {
        //llamada nativa
        this.cita.entregaPorMesNuevoApiNative(this.usuarioAps.Id, this.usuarioAps.IdRyf, this.usuarioAps.NodId, mesActual.mes, mesActual.anno).then(async (response: any) => {
          this.citasVerticalTodas = JSON.parse(response.data);
          //aca procesamos
          this.procesarArregloCitasTodas();
          this.citasVerticalMostrar = this.citasVerticalTodas.filter(e => e.Mostrar == true);
          //ahora que tenemos las citas que queremos mostrar
          //ordenamos
          this.citasVerticalMostrar.sort((a: any, b: any) => { return this.getTime(a.FechaCompleta) - this.getTime(b.FechaCompleta) });
          //guardamos la variable de ordenamiento
          sessionStorage.setItem('ORDEN_EVENTOS', 'descendente');
          //creamos top limit al nuevo arreglo de citas
          this.citasVerticalTodasTop = this.citasVerticalMostrar.slice(0, this.topLimit);
          //console.log(this.citasVerticalTodasTop);
          loader.dismiss();
          this.estaCargando = false;
          this.tituloLoading = '';
          this.scrollListVisible();
        }).catch(error => {
          //console.log(error.message);
          this.estaCargando = false;
          this.tituloLoading = '';
          loader.dismiss();
          //*** agregado por homologación ***/
          if (this.utiles.isAppIOS()){
            this.cargarDataLocal();
          }
          else {
            this.tiene = false;
            this.utiles.presentToast('Se produjo un error al obtener la información, vuelva a intentarlo más tarde', 'bottom', 3000);
            this.agregarUnElemento(moment().toDate());
          }

        });
      }
    });

  }

  async cargarTodosLosEventos() {
    //usar citasVerticalTodas
    this.citasVerticalTodas = [];
    this.citasVerticalMostrar = [];
    var fechaActual = moment();
    var fechaAnterior = moment().subtract(1, 'month');
    var fechaPosterior = moment().add(1, 'month');
    var mesAnterior = {
      mes: fechaAnterior.month() + 1,
      anno: fechaAnterior.year()
    };
    var mesActual = {
      mes: fechaActual.month() + 1,
      anno: fechaActual.year()
    };
    var mesPosterior = {
      mes: fechaPosterior.month() + 1,
      anno: fechaPosterior.year()
    };
    let loader = await this.loading.create({
      cssClass: 'loading-vacio',
      showBackdrop: false,
      spinner: null,
      //message: 'Cargando...<br>tipos de atención',
      duration: 2000
    });
    this.estaCargando = true;
    this.tituloLoading = 'Cargando calendario';

    await loader.present().then(async () => {
      if (!this.utiles.isAppOnDevice()) {
        //llamada web
        this.cita.entregaPorMesNuevo(this.usuarioAps.Id, this.usuarioAps.IdRyf, this.usuarioAps.NodId, mesAnterior.mes, mesAnterior.anno).subscribe(async (response: any) => {
          this.citasVerticalTodas = response;
          //segunda llamada
          this.cita.entregaPorMesNuevo(this.usuarioAps.Id, this.usuarioAps.IdRyf, this.usuarioAps.NodId, mesActual.mes, mesActual.anno).subscribe(async (responseDos: any) => {
            this.citasVerticalTodas = this.citasVerticalTodas.concat(responseDos);
            //tercera llamada
            this.cita.entregaPorMesNuevo(this.usuarioAps.Id, this.usuarioAps.IdRyf, this.usuarioAps.NodId, mesPosterior.mes, mesPosterior.anno).subscribe(async (responseTres: any) => {
              this.citasVerticalTodas = this.citasVerticalTodas.concat(responseTres);
              //aca procedemos a procesarlos
              this.procesarArregloCitasTodas();
              this.citasVerticalMostrar = this.citasVerticalTodas.filter(e => e.Mostrar == true);
              ////console.log(this.citasVerticalMostrar);
              //ahora que tenemos las citas que queremos mostrar
              //ordenamos
              this.citasVerticalMostrar.sort((a: any, b: any) => { return this.getTime(a.FechaCompleta) - this.getTime(b.FechaCompleta) });
              //guardamos la variable de ordenamiento
              sessionStorage.setItem('ORDEN_EVENTOS', 'descendente');
              //creamos top limit al nuevo arreglo de citas
              this.citasVerticalTodasTop = this.citasVerticalMostrar.slice(0, this.topLimit);
              //console.log(this.citasVerticalTodasTop);
              loader.dismiss();
              this.estaCargando = false;
              this.tituloLoading = '';
            });
          });
        });
      }
      else {
        //llamada nativa
        this.cita.entregaPorMesNuevoNative(this.usuarioAps.Id, this.usuarioAps.IdRyf, this.usuarioAps.NodId, mesAnterior.mes, mesAnterior.anno).then(async (response: any) => {
          this.citasVerticalTodas = JSON.parse(response.data);
          //segunda llamada
          this.cita.entregaPorMesNuevoNative(this.usuarioAps.Id, this.usuarioAps.IdRyf, this.usuarioAps.NodId, mesActual.mes, mesActual.anno).then(async (responseDos: any) => {
            var dataDos = JSON.parse(responseDos.data);
            this.citasVerticalTodas = this.citasVerticalTodas.concat(dataDos);
            //tercera llamada
            this.cita.entregaPorMesNuevoNative(this.usuarioAps.Id, this.usuarioAps.IdRyf, this.usuarioAps.NodId, mesPosterior.mes, mesPosterior.anno).then(async (responseTres: any) => {
              var dataTres = JSON.parse(responseTres.data);
              this.citasVerticalTodas = this.citasVerticalTodas.concat(dataTres);
              //aca procesamos
              this.procesarArregloCitasTodas();
              this.citasVerticalMostrar = this.citasVerticalTodas.filter(e => e.Mostrar == true);
              //ahora que tenemos las citas que queremos mostrar
              //ordenamos
              this.citasVerticalMostrar.sort((a: any, b: any) => { return this.getTime(b.FechaCompleta) - this.getTime(a.FechaCompleta) });
              //guardamos la variable de ordenamiento
              sessionStorage.setItem('ORDEN_EVENTOS', 'descendente');
              //creamos top limit al nuevo arreglo de citas
              this.citasVerticalTodasTop = this.citasVerticalMostrar.slice(0, this.topLimit);
              //console.log(this.citasVerticalTodasTop);
              loader.dismiss();
              this.estaCargando = false;
              this.tituloLoading = '';
            });
          });
        });
      }
    });

  }


  logout() {
    this.acceso.logout();
    this.navCtrl.navigateRoot('nuevo-login');
  }
  procesarArregloCitas() {
    var contador = 0;
    for (var s in this.citasVertical) {
      for (var t in this.citasVertical[s].Eventos) {
        var fechaHora = (this.citasVertical[s].Eventos[t].DetalleEventoMes.FechaHora);
        var fechaEvento = moment(fechaHora, 'YYYY-MM-DD').toDate();
        var fechaHoy = moment().toDate();

        //console.log('Evento: ' + fechaEvento);
        //console.log('Hoy:' + fechaHoy);
        contador++;
        if (this.citasVertical[s].Eventos[t]) {

          if (this.citasVertical[s].Eventos[t].DetalleEventoMes.Subtitulo == 'Próxima Cita') {
            this.citasVertical[s].Eventos[t].Imagen = 'agendar_citas.svg';
            this.citasVertical[s].Eventos[t].DetalleEventoMes.Titulo = 'Cita programada';
          }
          if (this.citasVertical[s].Eventos[t].DetalleEventoMes.Subtitulo == 'Próxima Cita Web') {
            this.citasVertical[s].Eventos[t].Imagen = 'agendar_citas.svg';
            this.citasVertical[s].Eventos[t].DetalleEventoMes.Titulo = 'Cita programada web';
          }
          if (this.citasVertical[s].Eventos[t].DetalleEventoMes.Subtitulo == 'Atención Realizada') {
            this.citasVertical[s].Eventos[t].Imagen = 'atenciones.svg';
            this.citasVertical[s].Eventos[t].DetalleEventoMes.Titulo = 'Atención Realizada';
          }
          if (this.citasVertical[s].Eventos[t].DetalleEventoMes.Subtitulo == 'Fármaco en uso') {
            this.citasVertical[s].Eventos[t].Imagen = 'retiro-de-medicamentos.svg';
            this.citasVertical[s].Eventos[t].DetalleEventoMes.Titulo = 'Fármaco en uso';
          }
          if (this.citasVertical[s].Eventos[t].DetalleEventoMes.Subtitulo == 'Fármaco Pendiente') {
            this.citasVertical[s].Eventos[t].Imagen = 'retiro-de-medicamentos.svg';
            this.citasVertical[s].Eventos[t].DetalleEventoMes.Titulo = 'Fármaco en uso';

          }
          if (this.citasVertical[s].Eventos[t].DetalleEventoMes.Subtitulo == 'Alimento Entregado') {
            this.citasVertical[s].Eventos[t].Imagen = 'retiro-de-alimentos.svg';
            this.citasVertical[s].Eventos[t].DetalleEventoMes.Titulo = 'Entrega de alimento';
          }
          if (this.citasVertical[s].Eventos[t].DetalleEventoMes.Subtitulo == 'Vacuna Administrada') {
            this.citasVertical[s].Eventos[t].Imagen = 'vacunas.svg';
            this.citasVertical[s].Eventos[t].DetalleEventoMes.Titulo = 'Inmunización';
          }
          if (this.citasVertical[s].Eventos[t].DetalleEventoMes.Subtitulo == 'Vacuna por administrar') {
            this.citasVertical[s].Eventos[t].Imagen = 'vacunas.svg';
            this.citasVertical[s].Eventos[t].DetalleEventoMes.Titulo = 'Vacuna';
          }
        }
        if (fechaEvento < fechaHoy && this.citasVertical[s].Eventos[t].DetalleEventoMes.Titulo == 'Entrega de alimento') {
          this.citasVertical[s].Eventos[t].DetalleEventoMes.Titulo = 'Alimento entregado';
          //console.log(this.citasVertical[s].Eventos[t].DetalleEventoMes);
        }
        if (fechaEvento < fechaHoy && this.citasVertical[s].Eventos[t].DetalleEventoMes.Titulo == 'Entrega de fármaco') {
          this.citasVertical[s].Eventos[t].DetalleEventoMes.Titulo = 'Fármaco entregado'
        }
        if (fechaEvento < fechaHoy && this.citasVertical[s].Eventos[t].DetalleEventoMes.Titulo == 'Inmunización') {
          this.citasVertical[s].Eventos[t].DetalleEventoMes.Titulo = 'Vacuna administrada'
        }
        if (fechaEvento < fechaHoy && this.citasVertical[s].Eventos[t].DetalleEventoMes.Titulo == 'Vacuna') {
          this.citasVertical[s].Eventos[t].DetalleEventoMes.Titulo = 'Vacuna por administrar'
        }

      }
    }
    //para determinar si tiene o no eventos
    if (contador == 0) {
      this.tiene = false;
    }
    else {
      this.tiene = true;
    }
  }
  procesarArregloCitasTodas() {
    var contador = 0;
    for (var s in this.citasVerticalTodas) {
      var fechaActual = moment();
      var fechaEvento1 = moment(this.citasVerticalTodas[s].FechaCompleta);
      var dif = fechaActual.diff(fechaEvento1);
      if (dif < 0) {
        dif = dif * -1;
      }
      this.citasVerticalTodas[s].DiferenciaFechas = dif;
      for (var t in this.citasVerticalTodas[s].Eventos) {
        var fechaHora = (this.citasVerticalTodas[s].Eventos[t].DetalleEventoMes.FechaHora);
        var fechaEvento = moment(fechaHora, 'YYYY-MM-DD').toDate();
        var fechaHoy = moment().toDate();

        console.log('Evento: ' + fechaEvento);
        console.log('Hoy:' + fechaHoy);
        if (moment(fechaHoy).format('DD-MM-YYYY') == moment(fechaEvento).format('DD-MM-YYYY')){
          this.tieneEventosHoy = true;
        }
        if (moment(fechaEvento).isAfter(moment(fechaHoy))){
          this.tieneEventosFuturos = true;
        }
        this.fechaParaHoy = moment(fechaHoy).format('DD') + ' de ' + moment(fechaHoy).format('MMMM');
        console.log(this.fechaParaHoy);
        
        contador++;

        if (this.citasVerticalTodas[s].Eventos[t]) {

          if (this.citasVerticalTodas[s].Eventos[t].DetalleEventoMes.Subtitulo == 'Próxima Cita') {
            this.citasVerticalTodas[s].Eventos[t].Imagen = 'agendar_citas.svg';
            this.citasVerticalTodas[s].Eventos[t].DetalleEventoMes.Titulo = 'Cita programada';
          }
          if (this.citasVerticalTodas[s].Eventos[t].DetalleEventoMes.Subtitulo == 'Próxima Cita Web') {
            this.citasVerticalTodas[s].Eventos[t].Imagen = 'agendar_citas.svg';
            this.citasVerticalTodas[s].Eventos[t].DetalleEventoMes.Titulo = 'Cita programada web';
          }
          if (this.citasVerticalTodas[s].Eventos[t].DetalleEventoMes.Subtitulo == 'Atención Realizada') {
            this.citasVerticalTodas[s].Eventos[t].Imagen = 'atenciones.svg';
            this.citasVerticalTodas[s].Eventos[t].DetalleEventoMes.Titulo = 'Atención Realizada';
          }
          if (this.citasVerticalTodas[s].Eventos[t].DetalleEventoMes.Subtitulo == 'Fármaco en uso') {
            this.citasVerticalTodas[s].Eventos[t].Imagen = 'retiro-de-medicamentos.svg';
            this.citasVerticalTodas[s].Eventos[t].DetalleEventoMes.Titulo = 'Fármaco en uso';
          }
          if (this.citasVerticalTodas[s].Eventos[t].DetalleEventoMes.Subtitulo == 'Fármaco Pendiente') {
            this.citasVerticalTodas[s].Eventos[t].Imagen = 'retiro-de-medicamentos.svg';
            this.citasVerticalTodas[s].Eventos[t].DetalleEventoMes.Titulo = 'Fármaco en uso';

          }
          if (this.citasVerticalTodas[s].Eventos[t].DetalleEventoMes.Subtitulo == 'Alimento Entregado') {
            this.citasVerticalTodas[s].Eventos[t].Imagen = 'retiro-de-alimentos.svg';
            this.citasVerticalTodas[s].Eventos[t].DetalleEventoMes.Titulo = 'Entrega de alimento';
          }
          if (this.citasVerticalTodas[s].Eventos[t].DetalleEventoMes.Subtitulo == 'Vacuna Administrada') {
            this.citasVerticalTodas[s].Eventos[t].Imagen = 'vacunas.svg';
            this.citasVerticalTodas[s].Eventos[t].DetalleEventoMes.Titulo = 'Inmunización';
          }
          if (this.citasVerticalTodas[s].Eventos[t].DetalleEventoMes.Subtitulo == 'Vacuna por administrar') {
            this.citasVerticalTodas[s].Eventos[t].Imagen = 'vacunas.svg';
            this.citasVerticalTodas[s].Eventos[t].DetalleEventoMes.Titulo = 'Vacuna';
          }
        }
        if (fechaEvento < fechaHoy && this.citasVerticalTodas[s].Eventos[t].DetalleEventoMes.Titulo == 'Entrega de alimento') {
          this.citasVerticalTodas[s].Eventos[t].DetalleEventoMes.Titulo = 'Alimento entregado';
          //console.log(this.citasVerticalTodas[s].Eventos[t].DetalleEventoMes);
        }
        if (fechaEvento < fechaHoy && this.citasVerticalTodas[s].Eventos[t].DetalleEventoMes.Titulo == 'Entrega de fármaco') {
          this.citasVerticalTodas[s].Eventos[t].DetalleEventoMes.Titulo = 'Fármaco entregado'
        }
        if (fechaEvento < fechaHoy && this.citasVerticalTodas[s].Eventos[t].DetalleEventoMes.Titulo == 'Inmunización') {
          this.citasVerticalTodas[s].Eventos[t].DetalleEventoMes.Titulo = 'Vacuna administrada'
        }
        if (fechaEvento < fechaHoy && this.citasVerticalTodas[s].Eventos[t].DetalleEventoMes.Titulo == 'Vacuna') {
          this.citasVerticalTodas[s].Eventos[t].DetalleEventoMes.Titulo = 'Vacuna por administrar'
        }
      }
    }

    //para determinar si tiene o no eventos
    if (contador == 0) {
      this.tiene = false;
    }
    else {
      this.tiene = true;
    }
    //aca hay que determinar si agregar o no el evento de hoy
    if (this.tieneEventosHoy == false) {
      var ultimo = this.citasVerticalTodas.length + 1;
      var entidadHoy = {
        FechaCompleta: fechaHoy,
        Id: parseInt(moment(fechaHoy).format('DD')),
        Mostrar: true,
        NombreDia: moment(fechaHoy).format('dddd'),
        NombreDiaReducido: moment(fechaHoy).format('ddd'),
        NumeroDia: parseInt(moment(fechaHoy).format('DD')),
        Indice: ultimo,
        DiferenciaFechas: 10,
        NoHayEvento: true,
        Eventos: [{
          Color: null,
          HoraInicioFin: '00:00',
          Imagen: 'agendar_citas.svg',
          ListaFarmacos: null,
          NombrePrincipal: 'Nada planificado para hoy',
          NombreSecundario: 'Nada planificado para hoy',
          DetalleEventoMes: {
            DescripcionPrincipal: 'Nada planificado para hoy',
            DescripcionSecundaria: 'Nada planificado para hoy',
            Estado: '',
            FechaHora: fechaHoy,
            IdElemento: 0,
            Lugar: '',
            NombrePaciente: '',
            Subtitulo: 'Nada planificado para hoy',
            Titulo: 'Nada planificado para hoy'
          }
        }]
      }
      //si no tiene eventos hoy lo agregamos
      this.citasVerticalTodas.push(entidadHoy);
    }

  
}
agregarUnElemento(fechaHoy){
  if (this.tieneEventosHoy == false){
    //contador = 1;
    var ultimo = this.citasVerticalTodas.length + 1;
    var entidadHoy = {
      FechaCompleta: fechaHoy,
      Id: parseInt(moment(fechaHoy).format('DD')),
      Mostrar: true,
      NombreDia: moment(fechaHoy).format('dddd'),
      NombreDiaReducido: moment(fechaHoy).format('ddd'),
      NumeroDia: parseInt(moment(fechaHoy).format('DD')),
      Indice: ultimo,
      DiferenciaFechas: 10,
      NoHayEvento: true,
      Eventos: [{
        Color: null,
        HoraInicioFin: '00:00',
        Imagen: 'agendar_citas.svg',
        ListaFarmacos: null,
        NombrePrincipal: 'Nada planificado para hoy',
        NombreSecundario: 'Nada planificado para hoy',
        DetalleEventoMes: {
          DescripcionPrincipal: 'Nada planificado para hoy',
          DescripcionSecundaria: 'Nada planificado para hoy',
          Estado: '',
          FechaHora: fechaHoy,
          IdElemento: 0,
          Lugar: '',
          NombrePaciente: '',
          Subtitulo: 'Nada planificado para hoy',
          Titulo: 'Nada planificado para hoy'
        }
      }]
    }
    //si no tiene eventos hoy lo agregamos
    this.citasVerticalTodas.push(entidadHoy);
    this.citasVerticalTodasTop = this.citasVerticalTodas;
    this.tiene = false;
  }
}
  //ordena los elementos de forma descende o ascendente
  ordenar() {
    if (sessionStorage.getItem('ORDEN_EVENTOS')) {
      var orden = sessionStorage.getItem('ORDEN_EVENTOS');
      if (orden == 'descendente') {
        this.citasVerticalTodasTop.sort((a: any, b: any) => { return this.getTime(a.FechaCompleta) - this.getTime(b.FechaCompleta) });
        sessionStorage.setItem('ORDEN_EVENTOS', 'ascendente');
      }
      else {
        this.citasVerticalTodasTop.sort((a: any, b: any) => { return this.getTime(b.FechaCompleta) - this.getTime(a.FechaCompleta) });
        sessionStorage.setItem('ORDEN_EVENTOS', 'descendente');
      }
    }
    else {
      this.citasVerticalTodasTop.sort((a: any, b: any) => { return this.getTime(b.FechaCompleta) - this.getTime(a.FechaCompleta) });
      sessionStorage.setItem('ORDEN_EVENTOS', 'descendente');
    }
    this.scrollListVisible();
  }
  loadData(event) {
    setTimeout(() => {
      ////console.log('Done');
      this.topLimit += 5;
      this.citasVerticalTodasTop = this.citasVerticalMostrar.slice(0, this.topLimit);
      event.target.complete();
      //aplicamos disabled si la cantidad de registros es la misma que el total
      if (this.citasVerticalTodasTop.length == this.citasVerticalMostrar.length) {
        event.target.disabled = true;
      }

    }, 500);
  }
  cargarDatosNativeN(mesConsultar, annoConsultar, loader) {
    //lo cambiamos para probar el nuevo metodo
    //this.cita.entregaPorMesNative(this.usuarioAps.Id, this.usuarioAps.IdRyf, this.usuarioAps.NodId, mesConsultar, annoConsultar).then(async (response: any)=>{
    this.cita.entregaPorMesNuevoNative(this.usuarioAps.Id, this.usuarioAps.IdRyf, this.usuarioAps.NodId, mesConsultar, annoConsultar).then(async (response: any) => {
      let consultaMes = this.cita.entregaPorMesNuevoNative(this.usuarioAps.Id, this.usuarioAps.IdRyf, this.usuarioAps.NodId, mesConsultar, annoConsultar).then(async (response: any) => {
        this.citasVertical = JSON.parse(response.data);
        this.citasVerticalMostrar = this.citasVertical.filter(e => e.Mostrar == true);
        //aqui procesa citasVertical
        this.procesarArregloCitas();
        loader.dismiss();
      });
    });
  }
  async cargarDatosWebN(mesConsultar, annoConsultar, loader) {
    //ACA NO SE REALIZA LA CONSULTA A INETGRACIÓN PARA MOSTRAR O MEZCLAR LAS CITAS, YA QUE EL SP TRAE LA INFO DE LAS CITAS WEB
    let consultaMes = this.cita.entregaPorMesNuevo(this.usuarioAps.Id, this.usuarioAps.IdRyf, this.usuarioAps.NodId, mesConsultar, annoConsultar).subscribe(async (response: any) => {
      this.citasVertical = response;
      this.citasVerticalMostrar = this.citasVertical.filter(e => e.Mostrar == true);
      //aqui procesa citasVertical
      this.procesarArregloCitas();
      loader.dismiss();
    });

  }
  tratamientoMeses() {
    this.mesesVertical = [];
    moment.locale('es-es');
    var fechaActual = moment();
    var fechaMenosUnMes = moment().subtract(1, 'month');
    var fechaMasUnMes = moment().add(1, 'month');

    var mesActualNumero = moment(fechaActual).month() + 1;
    var mesMenosUnMesNumero = moment(fechaMenosUnMes).month() + 1;
    var mesMasUnMesNumero = moment(fechaMasUnMes).month() + 1;

    var mesActualStr = moment(fechaActual).format("MMMM").toUpperCase();
    var mesMenosUnMesStr = moment(fechaMenosUnMes).format("MMMM").toUpperCase();
    var mesMasUnMesStr = moment(fechaMasUnMes).format("MMMM").toUpperCase();

    var annoActual = moment(fechaActual).format("YYYY");
    var annoMenosUnMes = moment(fechaMenosUnMes).format("YYYY");
    var annoMasUnMes = moment(fechaMasUnMes).format("YYYY");

    //ahora tenemos los años, meses podemos construir el arreglo.
    var entidadActual = { mesNumero: mesActualNumero + ',' + annoActual, mesTexto: mesActualStr, anno: annoActual };
    var entidadMenos = { mesNumero: mesMenosUnMesNumero + ',' + annoMenosUnMes, mesTexto: mesMenosUnMesStr, anno: annoMenosUnMes };
    var entidadMas = { mesNumero: mesMasUnMesNumero + ',' + annoMasUnMes, mesTexto: mesMasUnMesStr, anno: annoMasUnMes };

    //agregamos los elementos al arreglo
    this.mesesVertical.push(entidadMenos);
    this.mesesVertical.push(entidadActual);
    this.mesesVertical.push(entidadMas);

    //console.log(this.mesesVertical);
  }
  createEventsCalendario() {
    this.calendarioData = this.citas;
    //console.log(this.calendarioData);
    return this.calendarioData;
  }
  async goToDetalleCita(evento) {
    //this.list.closeSlidingItems();
    //this.navCtrl.push(DetailCitasPage, {evento:evento, usuario: this.usuarioAps});
    const modal = await this.modalCtrl.create(
      {
        component: ModalDetalleCitaPage,
        componentProps: {
          'evento': JSON.stringify(evento),
          'usuario': JSON.stringify(this.usuarioAps)
        }
      }
    );
    modal.onDidDismiss().then((data) => {
      if (data.data && data.data.accion) {
        var accion = data.data.accion;
        ////console.log(accion);
        //obtenemos la pagina actual
        //actualizar
        var annoActual = moment().year();

        var mesActual = moment().month() + 1;
        //var mesActual = this.mesActualSeleccionado;
        ////console.log(mesActual);
        //***************************** */
        this.tratamientoMeses();
        if (accion === 'booked') {
          this.utiles.presentToast('Cita reservada con éxito!!', 'bottom', 3000);
        }
        else if (accion === 'confirmed') {
          this.utiles.presentToast('Cita confirmada con éxito!!', 'bottom', 3000);
        }
        else if (accion === 'cancelled') {
          this.utiles.presentToast('Cita anulada con éxito!!', 'bottom', 3000);
        }
        if (this.parametrosApp.USA_API_MANAGEMENT()) {
          this.cargarTodosLosEventosApi();
        }
        else {
          this.cargarTodosLosEventos();
        }

      }
    });
    return await modal.present();
  }


  procesarRespuesta(data, loader) {
    this.citasIntegracion = [];
    if (data && data.Mensaje) {
      //correcto
      if (data.Mensaje.Detalle.Codigo == 'MSG_CORRECTO') {
        //ya tiene citas tomadas, hay que enviarlo a otra pagina
        //la de buscarcitas
        this.citasIntegracion = data.CitasDisponibles;

      }
      loader.dismiss();
    }
  }
  revisarCita(evento, tituloBoton) {
    //aca hay solo booked y confirmed
    //si está booked puede confirmar y anular
    //si está confirmed solo puede anular
    //boton confirmar, anular
    var visible = [false, false];
    if (evento.DetalleEventoMes.Estado == 'booked' && tituloBoton == 'Confirmar') {
      //si esta booked se puede confirmar
      visible = [true, true];
    }
    else if (evento.DetalleEventoMes.Estado == 'confirmed' && tituloBoton == 'Anular') {
      //si esta booked se puede confirmar
      visible = [false, true];
    }
    else if (evento.DetalleEventoMes.Estado == 'booked' && tituloBoton == 'Anular') {
      //si esta booked se puede confirmar
      visible = [true, true];
    }
    else {
      visible = [false, false]
    }
    return visible;
  }
  //manejo de citas
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
  async accionCita(boton, evento) {
    if (evento.DetalleEventoMes.Estado && evento.DetalleEventoMes.Estado != '') {
      //aca buscamos al paciente por el nombre
      let usuarioCita = this.utiles.entregaUsuarioNombre(evento.DetalleEventoMes.NombrePaciente);
      //var idPaciente = this.usuarioAps.Rut;
      var idPaciente = usuarioCita.Rut;
      var idCita = evento.DetalleEventoMes.IdElemento;
      var accion = boton.Operacion;
      //original
      /*       let loader = await this.loading.create({
              message: 'Procesado...<br>Información',
              duration: 20000
            }); */
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
          this.cita.getOperacionCita(idCita, idPaciente, accion).subscribe((response: any) => {
            this.procesarRespuestaAgendar(response, loader, accion);
          })
        }
        else {
          //llamada nativa
          this.cita.getOperacionCitaNative(idCita, idPaciente, accion).then((responseData: any) => {
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
        //this.utiles.presentToast('Operación realizada con éxito', 'middle', 2000);
        retorno = data;
        //actualizar la pagina
        var annoActual = moment().year();

        var mesActual = moment().month() + 1;
        //var mesActual = this.mesActualSeleccionado;
        //console.log(mesActual);
        //***************************** */
        this.tratamientoMeses();
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
        if (this.parametrosApp.USA_API_MANAGEMENT()) {
          this.cargarTodosLosEventosApi();
        }
        else {
          this.cargarTodosLosEventos();
        }

      }
      else {
        this.estaCargando = false;
        this.tituloLoading = '';
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
  }
  //abrir pagina de reservar hora
  openReservarHoraPage() {
    var tieneFamilia = this.utiles.tieneFamilia();
    //si tiene familia hay que enviarlo a la pagina de los miembros de la familia
    if (tieneFamilia) {
      this.navCtrl.navigateRoot('seleccion-usuario');
    }
    else {
      //si no tiene hay que enviarlo a buscar disponibilidad directo
      //pasando id
      const navigationExtras: NavigationExtras = {
        queryParams: {
          Id: this.usuarioAps.Id
        }
      };
      this.navCtrl.navigateRoot(['pre-tiposatencion'], navigationExtras);
    }

  }
  revisaEstado(item) {
    var retorno = false;
    if (item.DetalleEventoMes) {
      if (item.DetalleEventoMes.Estado) {
        if (item.DetalleEventoMes.Estado != undefined && item.DetalleEventoMes.Estado != '') {
          retorno = true;
        }
      }
    }
    return retorno;
  }
  transformDate(value, format) {
    var pi = new MomentPipe();
    return pi.transform(value, format);
  }

  hasMin = function (attrib) {
    return (this.length && this.reduce(function (prev, curr) {
      return prev[attrib] < curr[attrib] ? prev : curr;
    })) || null;
  }
  determinaFechaMasCercana() {
    var fechaActual = moment();
    if (this.citasVerticalTodasTop && this.citasVerticalTodasTop.length > 0) {
      for (var i = 0; i < this.citasVerticalTodasTop.length; i++) {
        var fechaEvento = moment(this.citasVerticalTodasTop[i].FechaCompleta);
        var dif = fechaActual.diff(fechaEvento);
        if (dif < 0) {
          dif = dif * -1;
        }
        this.citasVerticalTodasTop[i].DiferenciaFechas = dif;
        /*         //console.log(dif);
                //console.log(this.citasVerticalTodasTop[i]); */
      }

    }
  }


  finder(cmp, arr, attr) {
    var val = arr[0][attr];
    for (var i = 1; i < arr.length; i++) {
      val = cmp(val, arr[i][attr])
    }
    return val;
  }

  scrollListVisible() {
    //this.determinaFechaMasCercana();
    setTimeout(() => {
      var min = this.finder(Math.min, this.citasVerticalTodasTop, 'DiferenciaFechas');
      if (min) {
        var entidad = this.citasVerticalTodasTop.filter(p => p.DiferenciaFechas == min)[0];
        if (entidad) {
          //var elemento = this.min();
          //console.log(min);
          //console.log(entidad);
          let yOffset = document.getElementById(entidad.DiferenciaFechas.toString()).offsetTop;
          if (yOffset != null) {
            this.content.scrollToPoint(0, yOffset, 600);
          }
        }

      }
    }, 1000);


  }
}
