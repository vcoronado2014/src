import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, ToastController, Platform, ModalController, LoadingController, MenuController, IonSlides } from '@ionic/angular';
//parametros
import { ActivatedRoute, Router } from '@angular/router';
//SERVICIOS
import { ServicioUtiles } from '../../app/services/ServicioUtiles';
import { ServicioInfoUsuario } from '../../app/services/ServicioInfoUsuario';
import { ServicioAcceso } from '../../app/services/ServicioAcceso';
import { ServicioParametrosApp } from '../../app/services/ServicioParametrosApp';
import { ServicioGeo } from '../../app/services/ServicioGeo';
import * as moment from 'moment';

//usamos el servicio de storage
import { StorageService } from '../../app/services/StorageService';


@Component({
  selector: 'app-detail-usuario',
  templateUrl: './detail-usuario.page.html',
  styleUrls: ['./detail-usuario.page.scss'],
})
export class DetailUsuarioPage implements OnInit {
  @ViewChild('mySlider', { static: true }) slides: IonSlides;
  //nuevo slide
  slideOpts = {
    initialSlide: 0,
    speed: 500,
    pager: true
  };
  miColor = '#FF4081';
  //OTROS DATOS
  public usuario;
  public indicadorValor = [];
  public presiones = [];
  public alergias = [];
  //variables del Formulario
  public valorAltura;
  public fechaAltura;
  public valorPeso;
  public fechaPeso;
  public valorImc;
  public fechaImc;
  public valorPresion;
  public fechaPresion;
  public valorGlicemia;
  public fechaGlicemia;
  public valorGrupoSangre;
  public fechaGrupoSangre;
  public usuarioAps;
  public cargando = false;
  public userImagen;
  public title;
  //para controlar componente progess
  estaCargando = false;
  //antecedentes
  antecedentes;
  familiares = [];
  personales = [];
  //card mediciones
  arrMediciones = [];
  tituloProgress = '';
  //2 partes para los datos del usuario
  arrMedicionesParteUno = [];
  arrMedicionesParteDos = [];
  //pruebas de loading independientes
  estaCargandoDatosUsuario = false;
  tituloProgressDatosUsuario = '';
  estaCargandoAlergias = false;
  tituloProgressAlergias = '';
  estaCargandoMorbidos = false;
  tituloProgressMorbidos = '';
  //para mostrar que no tiene
  tieneDatosUsuario = false;
  tieneAlergias = false;
  tieneMorbidosPersonales = false;
  tieneMorbidosFamiliares = false;
  //variables para insertar en local storage
  arrMedicionesL = [];
  arrAlergias = [];
  arrMorbidos = [];
  //para eventos privados
  usuarioLogueado;
  registroApp;

  compartoMiInfo: boolean = false;
  traeIndicadores: boolean = false;
  traeAlergias: boolean = false;
  traeRelevantes: boolean = false;

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
    public parametrosApp: ServicioParametrosApp,
    public storage: StorageService,
    private global: ServicioGeo,
  ) {

  }
  ngOnInit() {
    //this.miColor = this.utiles.entregaMiColor();
    this.usuarioLogueado = this.utiles.entregaUsuarioLogueado();

    this.registroApp = this.utiles.obtenerRegistro();
    console.log('registro app ', this.registroApp);

    if (this.registroApp) {
      this.compartoMiInfo = this.registroApp.ComparteInformacion;
    }
    //capturamos los parametros
    this.slideOpts = {
      initialSlide: 0,
      speed: 500,
      pager: true
    };
    this.activatedRoute.queryParams.subscribe(async params => {
      if (params && params.usuario) {
        //store the temp in data

        console.log('usuario logueado ', this.usuarioLogueado);

        this.usuario = JSON.parse(params.usuario);
        if (this.usuario.Parentezco && this.usuario.Parentezco.Id > 0) {
          if (this.usuario.Parentezco.Nombre.toUpperCase() == 'LA MISMA PERSONA') {
            this.usuario.Parentezco.Nombre = 'Yo';
          }
        }
        else {
          this.usuario.Parentezco.Nombre = 'No informado';
        }
        this.userImagen = this.usuario.UrlImagen;
        this.miColor = this.utiles.entregaColor(this.usuario);

        console.log('usuario ', this.usuario);
        //nueva implementacion, solo una llamada
        this.entregaAntecedentesCompleto(this.usuario.Id);

      }
    });
  }
  //nuevo metodo que envuelve las 3 llamadas
  //no se verificcará fecha de actualización
  //se realizarn siempre
  async entregaAntecedentesCompleto(uspId) {
    //obtiene datos del usuario para definir si corresponde o no hacer la llamada
    var usuarioConsultando = this.utiles.entregaUsuario(uspId);
    //var traeIndicadores = this.usuarioLogueado.Id == usuarioConsultando.Id ? true : usuarioConsultando.ComparteInformacion && !usuarioConsultando.EsPrivadoAntecedentes;
    this.traeIndicadores = this.usuarioLogueado.Id == usuarioConsultando.Id ? true : usuarioConsultando.ComparteInformacion && !usuarioConsultando.EsPrivadoAntecedentes;
    console.log('trae los indicadores de ' + usuarioConsultando.Email + ' ', this.traeIndicadores);

    this.traeAlergias = this.usuarioLogueado.Id == usuarioConsultando.Id ? true : usuarioConsultando.ComparteInformacion && !usuarioConsultando.EsPrivadoAlergias;
    console.log('trae las alergias de ' + usuarioConsultando.Email + ' ', this.traeAlergias);

    this.traeRelevantes = this.usuarioLogueado.Id == usuarioConsultando.Id ? true : usuarioConsultando.ComparteInformacion && !usuarioConsultando.EsPrivadoRelevantes;
    console.log('trae los privados de ' + usuarioConsultando.Email + ' ', this.traeRelevantes);

    //nombres de storages *************
    var nameIndicadores = 'dataIndicadores';
    var nameAlergias = 'dataAlergias';
    var nameAntecedentes = 'dataAntecedentes';
    //****************** */
    //data storages
    var necesitaActualizar = true;
    var newDataIndicadores = await this.storage.get(nameIndicadores, uspId);
    var newDataAlergias = await this.storage.get(nameAlergias, uspId);
    var newDataAntecedentes = await this.storage.get(nameAntecedentes, uspId);
    if (newDataIndicadores != null && newDataAlergias != null && newDataAntecedentes != null) {
      //hay datos en el storage
      necesitaActualizar = this.utiles.actualizaAntecedentes(newDataIndicadores?.RespuestaBase?.FechaActualizacion);
    }
    console.log(necesitaActualizar, ' necesita actualizar antecedentes');

    //******************* */
    this.arrMediciones = [];
    this.alergias = [];

    this.estaCargando = true;
    this.tituloProgress = 'Buscando datos del paciente';

    if (necesitaActualizar == false) {
      if (this.traeIndicadores)
        this.procesarNuevoArregloValoresIndependienteSinLoader(newDataIndicadores);
      if (this.traeAlergias)
        this.procesarAlergiasIndividualSinLoader(newDataAlergias);
      if (this.traeRelevantes)
        this.procesarAntecedentesIndividualSinLoader(newDataAntecedentes);

      this.estaCargando = false;
      this.tituloProgress = '';
    }
    else {
      let loader = await this.loading.create({
        cssClass: 'loading-vacio',
        showBackdrop: false,
        spinner: null,
      });

      await loader.present().then(async () => {

        if (!this.utiles.isAppOnDevice()) {
          //llamada web
          this.info.entregaAntecedentesForkFlag(uspId, this.traeIndicadores, this.traeAlergias, this.traeRelevantes).subscribe((responseList: any) => {
            //0 = indicadores, 1 = alergias, 2 = antecedentes (morbidos)
            var dataIndicadores = responseList[0];
            //probamos storage ********************************************
            this.storage.set('dataIndicadores', dataIndicadores, uspId.toString(), moment().format('YYYY-MM-DD HH:mm'));
            //********************************************************** */
            this.procesarNuevoArregloValoresIndependienteSinLoader(dataIndicadores);
            var dataAlergias = responseList[1];
            //probamos storage ********************************************
            this.storage.set('dataAlergias', dataAlergias, uspId.toString(), moment().format('YYYY-MM-DD HH:mm'));
            //********************************************************** */
            this.procesarAlergiasIndividualSinLoader(dataAlergias);
            var dataAntecedentes = responseList[2];
            //probamos storage ********************************************
            this.storage.set('dataAntecedentes', dataAntecedentes, uspId.toString(), moment().format('YYYY-MM-DD HH:mm'));
            //********************************************************** */
            this.procesarAntecedentesIndividualSinLoader(dataAntecedentes);
  
            this.estaCargando = false;
            loader.dismiss();
            this.tituloProgress = '';
          }, error => {
            console.log(error);
            this.estaCargando = false;
            loader.dismiss();
            this.tituloProgress = '';
          })
        }
        else {
          //llamada nativa
          this.info.entregaAntecedentesNativeForkFlagNuevo(uspId, this.traeIndicadores, this.traeAlergias, this.traeRelevantes).subscribe((responseList: any) => {
            //0 = indicadores, 1 = alergias, 2 = antecedentes (morbidos) this.citasVerticalTodas = JSON.parse(responseList[0].data);
            //var dataIndicadores = JSON.parse(responseList[0].data);
            var dataIndicadores = [];
            if (responseList[0].type != undefined){
              dataIndicadores = responseList[0].body;
            }
            else{
              dataIndicadores = JSON.parse(responseList[0].data);
            }
            //probamos storage ********************************************
            this.storage.set('dataIndicadores', dataIndicadores, uspId.toString(), moment().format('YYYY-MM-DD HH:mm'));
            //********************************************************** */
            this.procesarNuevoArregloValoresIndependienteSinLoader(dataIndicadores);

            //var dataAlergias = JSON.parse(responseList[1].data);
            var dataAlergias = [];
            if (responseList[1].type != undefined){
              dataAlergias = responseList[1].body;
            }
            else{
              dataAlergias = JSON.parse(responseList[1].data);
            }
            //probamos storage ********************************************
            this.storage.set('dataAlergias', dataAlergias, uspId.toString(), moment().format('YYYY-MM-DD HH:mm'));
            //********************************************************** */          
            this.procesarAlergiasIndividualSinLoader(dataAlergias);

            //var dataAntecedentes = JSON.parse(responseList[2].data);
            var dataAntecedentes = [];
            if (responseList[2].type != undefined){
              dataAntecedentes = responseList[2].body;
            }
            else{
              dataAntecedentes = JSON.parse(responseList[2].data);
            }
            //probamos storage ********************************************
            this.storage.set('dataAntecedentes', dataAntecedentes, uspId.toString(), moment().format('YYYY-MM-DD HH:mm'));
            //********************************************************** */          
            this.procesarAntecedentesIndividualSinLoader(dataAntecedentes);
  
            this.estaCargando = false;
            loader.dismiss();
            this.tituloProgress = '';
  
          }, error => {
            console.log(error);
            this.estaCargando = false;
            loader.dismiss();
            this.tituloProgress = '';
          })
        }



      });
    }

  }

  procesarAlergiasSinLoader(data) {
    this.alergias = data.AlergiasUsp;
    if (this.alergias.length == 1) {
      this.title = "Alergia";
    } else {
      this.title = "Alergias";
    }
  }

  procesarPresionSinLoader(data) {
    this.presiones = data.PresionesUsp;
    if (this.presiones && this.presiones.length > 0) {
      //todo ok
      for (var s in this.presiones) {
        //altura
        this.valorPresion = this.presiones[s].ValorPresion;
        if (this.presiones[s].FechaPresion == null) {
          this.fechaPresion = 'n/a';
        }
        else {
          this.fechaPresion = this.presiones[s].FechaPresion;
        }
      }

    }
    else {
      //llenar con valores predeterminados
      this.valorPresion = 'N/A';
      this.fechaPresion = 'N/A';
    }
  }
  private getTime(date?: Date) {
    return date != null ? new Date(date).getTime() : 0;
  }

  logout() {
    this.acceso.logout();
    this.navCtrl.navigateRoot('login', { animated: true, animationDirection: 'back' });
  }
  volver() {
    this.navCtrl.navigateRoot('antecedentes', { animated: true, animationDirection: 'back' });
  }

  async procesarNuevoArregloValoresIndependienteSinLoader(response) {
    //fin proceso ********************************
    this.arrMediciones = [];
    this.arrMedicionesParteUno = [];
    this.arrMedicionesParteDos = [];
    var arreglo = [];
    if (response) {
      arreglo = response.IndicadorValorUsp;
    }
    ///altura
    var arrAltura = arreglo?.filter(p => p.Descripcion.includes('Altura') || p.Descripcion.includes('Talla'));
    if (arrAltura && arrAltura.length > 0) {
      //console.log('tiene altura');
      //fecha mas actualizada
      arrAltura.sort((a: any, b: any) => { return this.getTime(moment(b.fecha).toDate()) - this.getTime(moment(a.fecha).toDate()) });
      //console.log(arrAltura);
      let entidad = {
        Nombre: 'Altura',
        Valor: arrAltura[0].Valor.toFixed(0),
        Fecha: moment(arrAltura[0].fecha).format('DD MMM YYYY'),
        Medida: 'cm'
      }
      this.arrMediciones.push(entidad);
    }
    //peso
    var arrPeso = arreglo?.filter(p => p.Descripcion.includes('Peso'));
    if (arrPeso && arrPeso.length > 0) {
      //console.log('tiene peso');
      //fecha mas actualizada
      arrPeso.sort((a: any, b: any) => { return this.getTime(moment(b.fecha).toDate()) - this.getTime(moment(a.fecha).toDate()) });
      //console.log(arrPeso);
      let entidad = {
        Nombre: 'Peso',
        Valor: arrPeso[0].Valor.toFixed(0),
        Fecha: moment(arrPeso[0].fecha).format('DD MMM YYYY'),
        Medida: 'kg'
      }
      this.arrMediciones.push(entidad);
    }
    //imc
    var arrImc = arreglo?.filter(p => p.Descripcion.includes('I.M.C.'));
    if (arrImc && arrImc.length > 0) {
      //console.log('tiene imc');
      //fecha mas actualizada
      arrImc.sort((a: any, b: any) => { return this.getTime(moment(b.fecha).toDate()) - this.getTime(moment(a.fecha).toDate()) });
      //console.log(arrImc);
      let entidad = {
        Nombre: 'IMC',
        Valor: arrImc[0].Valor.toFixed(0),
        Fecha: moment(arrImc[0].fecha).format('DD MMM YYYY'),
        Medida: ''
      }
      this.arrMediciones.push(entidad);
    }
    //glicemia
    var arrGlicemia = arreglo?.filter(p => p.Descripcion.includes('Glicemia'));
    if (arrGlicemia && arrGlicemia.length > 0) {
      //console.log('tiene glicemia');
      //fecha mas actualizada
      arrGlicemia.sort((a: any, b: any) => { return this.getTime(moment(b.fecha).toDate()) - this.getTime(moment(a.fecha).toDate()) });
      //console.log(arrGlicemia);
      //el primer elemento es el más nuevo
      let entidad = {
        Nombre: 'Glicemia',
        Valor: arrGlicemia[0].Valor.toFixed(0),
        Fecha: moment(arrGlicemia[0].fecha).format('DD MMM YYYY'),
        Medida: 'mg/dl'
      }
      this.arrMediciones.push(entidad);
    }
    //sangre
    var arrSangre = arreglo?.filter(p => p.Descripcion.includes('Sanguineo'));
    if (arrSangre && arrSangre.length > 0) {
      let valor = '';
      //console.log('tiene sangre');
      //fecha mas actualizada
      arrSangre.sort((a: any, b: any) => { return this.getTime(moment(b.fecha).toDate()) - this.getTime(moment(a.fecha).toDate()) });
      //console.log(arrSangre);
      //el primer elemento es el más nuevo
      if (arrSangre[0].Valor == 279) {
        valor = "A";
      }
      else if (arrSangre[0].Valor == 280) {
        valor = "B";
      }
      else if (arrSangre[0].Valor == 281) {
        valor = "AB";
      }
      else if (arrSangre[0].Valor == 252) {
        valor = "O";
      }
      else {
        valor = "";
      }
      let entidad = {
        Nombre: 'Grupo Sangre',
        Valor: valor,
        Fecha: moment(arrSangre[0].fecha).format('DD MMM YYYY'),
        Medida: ''
      }
      this.arrMediciones.push(entidad);
    }
    //presion diastolica
    var valorDiast = '';
    var tienePresion = false;
    var fechaPresion = '';
    var arrDiast = arreglo?.filter(p => p.Descripcion.includes('Diastólica'));
    if (arrDiast && arrDiast.length > 0) {
      //console.log('tiene diastolica');
      //fecha mas actualizada
      arrDiast.sort((a: any, b: any) => { return this.getTime(moment(b.fecha).toDate()) - this.getTime(moment(a.fecha).toDate()) });
      //console.log(arrDiast);
      valorDiast = arrDiast[0].Valor;
      tienePresion = true;
    }
    var valorSist = '';
    var tienePresionSis = false;
    var arrSist = arreglo?.filter(p => p.Descripcion.includes('Sistólica'));
    if (arrSist && arrSist.length > 0) {
      //console.log('tiene sistolica');
      //fecha mas actualizada
      arrSist.sort((a: any, b: any) => { return this.getTime(moment(b.fecha).toDate()) - this.getTime(moment(a.fecha).toDate()) });
      //console.log(arrSist);
      valorSist = arrSist[0].Valor;
      fechaPresion = moment(arrSist[0].fecha).format('DD MMM YYYY');
      tienePresionSis = true;
    }
    if (tienePresion && tienePresionSis) {
      let entidad = {
        Nombre: 'Presión',
        Valor: valorSist.toString() + '/' + valorDiast.toString(),
        Fecha: fechaPresion,
        Medida: ''
      }
      this.arrMediciones.push(entidad);
    }
    //console.log(this.arrMediciones);
    //aca partimos el arreglo
    this.arrMedicionesParteUno = this.arrMediciones.slice(0, 3);
    this.arrMedicionesParteDos = this.arrMediciones.slice(3, 6);
    if (this.arrMediciones && this.arrMediciones.length > 0) {
      this.tieneDatosUsuario = true;
    }
  }

  async procesarAlergiasIndividualSinLoader(data) {
    this.alergias = data.AlergiasUsp;
    if (this.alergias) {
      if (this.alergias.length == 1) {
        this.title = "Alergia";
      } else {
        this.title = "Alergias";
      }
    }
    this.tituloProgressAlergias = '';
    if (this.alergias && this.alergias.length > 0) {
      this.tieneAlergias = true;
    }
  }

  procesarAntecedentesIndividualSinLoader(data) {
    this.antecedentes = data;
    //console.log(this.antecedentes);
    this.familiares = [];
    this.personales = [];
    if (this.antecedentes.Antecedentes) {
      if (this.antecedentes.Antecedentes.Familiares) {
        if (this.antecedentes.Antecedentes.Familiares.Antecedente && this.antecedentes.Antecedentes.Familiares.Antecedente.length > 0) {
          let arr = this.antecedentes.Antecedentes.Familiares.Antecedente;
          arr.forEach(ante => {
            let entidad = {
              Nombre: ante
            }
            this.familiares.push(entidad);
          });
        }
      }
      if (this.antecedentes.Antecedentes.Personales) {
        if (this.antecedentes.Antecedentes.Personales.Antecedente && this.antecedentes.Antecedentes.Personales.Antecedente.length > 0) {
          let arr = this.antecedentes.Antecedentes.Personales.Antecedente;
          arr.forEach(perso => {
            let entidad = {
              Nombre: perso
            }
            this.personales.push(entidad);
          });
        }
      }
    }
    //if (this.personales.length > 0 || this.familiares.len)
    if (this.personales && this.personales.length > 0) {
      this.tieneMorbidosPersonales = true;
    }
    if (this.familiares && this.familiares.length > 0) {
      this.tieneMorbidosFamiliares = true;
    }

  }

  /*
  enumerado eventos
    CALENDARIO = 1,
    VACUNAS = 2,
    ANTECEDENTES = 3,
    ALERGIAS = 4,
    DIAGNOSTICOS_PERSONALES = 5,
    DIAGNOSTICOS_FAMILIARES = 6,
    EXAMENES = 7,
    SOLICITUDES_INTERCONSULTA = 8
  
  
  */
  modificaAntecedente(evento, uspId) {
    var usuario = this.utiles.entregaUsuario(uspId);
    if (usuario) {
      if (evento) {
        if (evento.TipoEvento == 3) {
          usuario.EsPrivadoAntecedentes = evento.EsPrivado;
          this.usuario.EsPrivadoAntecedentes = evento.EsPrivado;
        }
        if (evento.TipoEvento == 4) {
          usuario.EsPrivadoAlergias = evento.EsPrivado;
          this.usuario.EsPrivadoAlergias = evento.EsPrivado;
        }
        if (evento.TipoEvento == 5) {
          usuario.EsPrivadoRelevantees = evento.EsPrivado;
          this.usuario.EsPrivadoRelevantes = evento.EsPrivado;
        }

        //actualizamos
        this.utiles.actualizaUsuarioAps(usuario);
      }
    }
  }

  onChangeEsPrivadoAntecedentes(value) {
    if (value.detail) {
      if (value.detail.checked == this.usuario.EsPrivadoAntecedentes) {
        //console.log('esprivado antecdentes ', this.esPrivadoAntecedentes);
        //console.log('valor es privado ', value);

        this.estaCargando = true;
        this.tituloProgressDatosUsuario = 'Procesando evento.';
        var nombre = 'dataAntecedentes-' + this.usuario.Id.toString();

        //entidad
        var evento = {
          Id: 0,
          UspId: this.usuario.Id,
          IdElemento: 0,
          Titulo: nombre,
          Subtitulo: nombre,
          EsPrivado: this.usuario.EsPrivadoAntecedentes,
          Run: this.utiles.insertarGuion(this.usuario.Rut),
          //FechaHoraEvento: this.data.DetalleEventoMes.FechaHoraEvento,
          ColaId: 0,
          ColaVisto: 0,
          DescripcionPrincipal: nombre,
          DescripcionSecundaria: nombre,
          Lugar: this.usuario.Establecimiento.RazonSocial,
          Estado: '',
          TipoEvento: 3 //antecedentes
        };

        if (!this.utiles.isAppOnDevice()) {
          //llamada web
          this.global.postEventosPrivados(evento).subscribe((response: any) => {
            console.log(response);
            //this.eventoPrivadoGuardado = response;
            //loader.dismiss();
            this.modificaAntecedente(response, evento.UspId);

            this.estaCargando = false;
            this.tituloProgressDatosUsuario = '';

          }, (error) => {
            console.log(error);
            //loader.dismiss();
            this.estaCargando = false;
            this.tituloProgressDatosUsuario = '';
          });
        }
        else {
          //llamada nativa
          this.global.postEventosPrivadosNative(evento).then((response: any) => {
            var datos = JSON.parse(response.data);
            console.log(datos);
            this.modificaAntecedente(datos, evento.UspId);
            //this.eventoPrivadoGuardado = datos;
            //loader.dismiss();
            this.estaCargando = false;
            this.tituloProgressDatosUsuario = '';

          }, (error) => {
            console.log(error);
            //loader.dismiss();
            this.estaCargando = false;
            this.tituloProgressDatosUsuario = '';
          })
        }
      }

    }
  }

  onChangeEsPrivadoAlergias(value) {
    if (value.detail) {
      if (value.detail.checked == this.usuario.EsPrivadoAlergias) {
        //console.log('esprivado antecdentes ', this.esPrivadoAntecedentes);
        //console.log('valor es privado ', value);

        this.estaCargando = true;
        this.tituloProgressDatosUsuario = 'Procesando evento.';
        var nombre = 'dataAlergias-' + this.usuario.Id.toString();

        //entidad
        var evento = {
          Id: 0,
          UspId: this.usuario.Id,
          IdElemento: 0,
          Titulo: nombre,
          Subtitulo: nombre,
          EsPrivado: this.usuario.EsPrivadoAlergias,
          Run: this.utiles.insertarGuion(this.usuario.Rut),
          //FechaHoraEvento: this.data.DetalleEventoMes.FechaHoraEvento,
          ColaId: 0,
          ColaVisto: 0,
          DescripcionPrincipal: nombre,
          DescripcionSecundaria: nombre,
          Lugar: this.usuario.Establecimiento.RazonSocial,
          Estado: '',
          TipoEvento: 4 //alergias
        };

        if (!this.utiles.isAppOnDevice()) {
          //llamada web
          this.global.postEventosPrivados(evento).subscribe((response: any) => {
            console.log(response);
            //this.eventoPrivadoGuardado = response;
            //loader.dismiss();
            this.modificaAntecedente(response, evento.UspId);

            this.estaCargando = false;
            this.tituloProgressDatosUsuario = '';

          }, (error) => {
            console.log(error);
            //loader.dismiss();
            this.estaCargando = false;
            this.tituloProgressDatosUsuario = '';
          });
        }
        else {
          //llamada nativa
          this.global.postEventosPrivadosNative(evento).then((response: any) => {
            var datos = JSON.parse(response.data);
            console.log(datos);
            this.modificaAntecedente(datos, evento.UspId);
            //this.eventoPrivadoGuardado = datos;
            //loader.dismiss();
            this.estaCargando = false;
            this.tituloProgressDatosUsuario = '';

          }, (error) => {
            console.log(error);
            //loader.dismiss();
            this.estaCargando = false;
            this.tituloProgressDatosUsuario = '';
          })
        }
      }

    }
  }

  onChangeEsPrivadoRelevantes(value) {
    if (value.detail) {
      if (value.detail.checked == this.usuario.EsPrivadoRelevantes) {
        //console.log('esprivado antecdentes ', this.esPrivadoAntecedentes);
        //console.log('valor es privado ', value);

        this.estaCargando = true;
        this.tituloProgressDatosUsuario = 'Procesando evento.';
        var nombre = 'dataPersonales-' + this.usuario.Id.toString();

        //entidad
        var evento = {
          Id: 0,
          UspId: this.usuario.Id,
          IdElemento: 0,
          Titulo: nombre,
          Subtitulo: nombre,
          EsPrivado: this.usuario.EsPrivadoRelevantes,
          Run: this.utiles.insertarGuion(this.usuario.Rut),
          //FechaHoraEvento: this.data.DetalleEventoMes.FechaHoraEvento,
          ColaId: 0,
          ColaVisto: 0,
          DescripcionPrincipal: nombre,
          DescripcionSecundaria: nombre,
          Lugar: this.usuario.Establecimiento.RazonSocial,
          Estado: '',
          TipoEvento: 5 //personales
        };

        if (!this.utiles.isAppOnDevice()) {
          //llamada web
          this.global.postEventosPrivados(evento).subscribe((response: any) => {
            console.log(response);
            //this.eventoPrivadoGuardado = response;
            //loader.dismiss();
            this.modificaAntecedente(response, evento.UspId);

            this.estaCargando = false;
            this.tituloProgressDatosUsuario = '';

          }, (error) => {
            console.log(error);
            //loader.dismiss();
            this.estaCargando = false;
            this.tituloProgressDatosUsuario = '';
          });
        }
        else {
          //llamada nativa
          this.global.postEventosPrivadosNative(evento).then((response: any) => {
            var datos = JSON.parse(response.data);
            console.log(datos);
            this.modificaAntecedente(datos, evento.UspId);
            //this.eventoPrivadoGuardado = datos;
            //loader.dismiss();
            this.estaCargando = false;
            this.tituloProgressDatosUsuario = '';

          }, (error) => {
            console.log(error);
            //loader.dismiss();
            this.estaCargando = false;
            this.tituloProgressDatosUsuario = '';
          })
        }
      }

    }
  }


}
