import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { FormGroup, Validators, FormBuilder, FormControl, ValidatorFn, FormGroupDirective, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
//servicios
import { ServicioUtiles } from '../../app/services/ServicioUtiles';
import { ServicioGeo } from '../../app/services/ServicioGeo';
import { ServicioParametrosApp } from '../../app/services/ServicioParametrosApp';
import { NavigationExtras } from '@angular/router';

import * as moment from 'moment';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-validacion-registro',
  templateUrl: './validacion-registro.page.html',
  styleUrls: ['./validacion-registro.page.scss'],
})
export class ValidacionRegistroPage implements OnInit {
    //stepper *********************
    firstFormGroup: FormGroup;
    secondFormGroup: FormGroup;
    threeFormGroup: FormGroup;
    //*************************** */
    cargando = false;
    registroIncompleto: any;
    tipoMovimiento = '1';
    estaAgregandoFamilia = false;
    paginaAnterior = 'step-uno-registro';
    //para mostrar la pagina de mensajes
    muestraMensaje = false;
    nombre = '';
    run = '';
    email = '';

    tieneHisSalud = false;
    listaPreguntas = [];
    atenciones = [];
    data;
    newData;
    newListaPreguntas = [];

    myControlComNac = new FormControl('');
    listaComunasNacimiento: [];
    filteredOptionsComunasNacimiento: Observable<string[]>;

    listaComunasResidencia: [];
    myControlComRes = new FormControl('');
    filteredOptionsComunasResidencia: Observable<string[]>;

    listaEstadoCivil: [];
    myControlECivil = new FormControl('');
    filteredOptionsEstadoCivil: Observable<string[]>;

    listaNacionalidad: [];
    myControlNac = new FormControl('');
    filteredOptionsNacionalidad: Observable<string[]>;

    listaPrevision: [];
    myControlPrevision = new FormControl('');
    filteredOptionsPrevision: Observable<string[]>;

    listaSector: [];
    myControlSector = new FormControl('');
    filteredOptionsSector: Observable<string[]>;

    listaTipoProfesional: [];
    myControlTProfesional = new FormControl('');
    filteredOptionsTProfesional: Observable<string[]>;

    objetoMensaje = {
      irA: 'inicio',
      titulo: '',
      contenido: ''
    }

    cantidadIntentos = 3;
    tiempoBloqueo = '';

  constructor(
    private navCtrl: NavController,
    public utiles: ServicioUtiles,
    public servicioGeo: ServicioGeo,
    public parametros: ServicioParametrosApp,
    public loading: LoadingController,
    private formBuilder: FormBuilder,
    public activatedRoute: ActivatedRoute,
    private router: Router,
    public alertController: AlertController
  ) {

  }
  /*
  esta es la lista de preguntas

  FechaAtencion
  TipoProfesional
  ComunaNacimiento
  ApellidoPaterno
  ApellidoMaterno
  Edad
  EstadoCivil
  Nacionalidad
  Prevision
  ComunaResidencia
  Sector

  
  */
  async presentAlertConfirm(header, message, esIntentosFallidos) {
    const alert = await this.alertController.create({
      //cssClass: 'my-custom-class',
      header: header,
      message: message,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Aceptar',
          handler: () => {
            console.log('Confirm aceptar');
            if (esIntentosFallidos){
              this.navCtrl.navigateRoot('nuevo-login');
            }
            else{
              this.refreshPage();
            }
          },
        },
      ],
    });

    await alert.present();
  }

  private convertirTiempo(valor: string){
    const minutos = parseInt(valor);

    if (minutos >= 60) {
      const horas = Math.floor(minutos / 60);
      return `${horas} hora${horas !== 1 ? 's' : ''}`;
    } else {
      return `${minutos} minuto${minutos !== 1 ? 's' : ''}`;
    }
  }

  ngOnInit() {
    moment.locale('es');
    this.cantidadIntentos = this.parametros.INTENTOS_INSCRIPCION();
    this.tiempoBloqueo = this.convertirTiempo(this.parametros.MINUTOS_ULTIMO_INTENTO().toString());
    //stepeer
/*       this.firstFormGroup = this.formBuilder.group({
          firstCtrl: ['', Validators.required]
      });
      this.secondFormGroup = this.formBuilder.group({
          secondCtrl: ['', Validators.required]
      });
      this.threeFormGroup = this.formBuilder.group({
          threeCtrl: ['', Validators.required]
      }); */


    //antes de continuar debemos verificar si puede hacerlo
    //para ello se debe verificar si hay intentos fallidos guardados en el storage
    if (localStorage.getItem('intentosFallidos')){
      let intentosFallidos = parseInt(localStorage.getItem('intentosFallidos'));
      const parametroIntentos = this.parametros.INTENTOS_INSCRIPCION();
      if (intentosFallidos >= parametroIntentos) {
        this.comprobarTiempoUltimoIntentoFallido().then((puedeEjecutar) => {
          if (!puedeEjecutar) {
            console.log('NO PUEDE EJECUTAR YA QUE COMPLETÓ LOS INTENTOS FALLIDOS Y DEBE ESPERAR 24 HORAS.');
            let sms = "Debe esperar 24 horas para volver a ejecutar el proceso, será direccionado a la página de login.";
            let prox = this.entregaProximoIntento();
            if (prox != null){
              sms = "Debe esperar hasta el " + moment(prox).format("DD-MM-YYYY HH:mm") + " para volver a realizar la operación.";
            }
            let header = "Límite de intentos fallidos"
            this.presentAlertConfirm(header, sms, true);
            //aca hay que bloquearlo
            return;
          }
          else{
            //resetear los intentos fallidos
            localStorage.removeItem('intentosFallidos');
            localStorage.removeItem('ultimoIntentoFallido');
          }
        });
      } 
    }

    this.activatedRoute.queryParams.subscribe(async params => {
      if (params && params.estaAgregandoFamilia) {
        this.estaAgregandoFamilia = true;
      }
      if (params && params.modulo) {
        this.paginaAnterior = params.modulo;
      }
      if (params && params.nombre) {
        this.nombre = params.nombre;
      }
      if (params && params.run) {
        this.run = params.run;
      }
      if (params && params.email) {
        this.email = params.email;
      }

      //haremos la llamada
      if (this.run) {
        this.cargando = true;
        let loader = await this.loading.create({
          message: 'Verificando...<br>Registro',
          duration: 3000
        });

        await loader.present().then(async () => {
          if (!this.utiles.isAppOnDevice()) {
            this.servicioGeo.getPreguntas(this.run).subscribe((response: any) => {
              //procesar
              console.log('Respuesta ********', response);
              let data = response;
              this.procesarRespuestaNew(data);
              loader.dismiss();
            })
          }
          else {
            this.servicioGeo.getPreguntasNative(this.run).then((response: any) => {
              //procesar
              console.log('Respuesta ********', JSON.parse(response.data));
              let data = JSON.parse(response.data);
              this.procesarRespuestaNew(data);
              loader.dismiss();
            },
              (error) => {
                console.log('error al obtener preguntas');
                loader.dismiss();
              })
          }

        });
      }




    });
    
  }
  private _filterComNac(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.listaComunasNacimiento.filter((option:any) => option.toLowerCase().includes(filterValue));
  }

  private _filterComRes(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.listaComunasResidencia.filter((option:any) => option.toLowerCase().includes(filterValue));
  }

  private _filterECivil(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.listaEstadoCivil.filter((option:any) => option.toLowerCase().includes(filterValue));
  }

  private _filterNac(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.listaNacionalidad.filter((option:any) => option.toLowerCase().includes(filterValue));
  }

  private _filterPrevision(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.listaPrevision.filter((option:any) => option.toLowerCase().includes(filterValue));
  }

  private _filterSector(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.listaSector.filter((option:any) => option.toLowerCase().includes(filterValue));
  }

  private _filterTProfesional(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.listaTipoProfesional.filter((option:any) => option.toLowerCase().includes(filterValue));
  }

  separateWords(texto: string): string {
    return texto.replace(/([A-Z])/g, ' $1').trim();
  }

  procesarRespuesta(data) {
    if (data && data.UspId > 0) {
      this.tieneHisSalud = true;
    }
    this.data = data;
    //datos
    if (data && data.ComunaNacimiento.Lista){
      this.listaComunasNacimiento = data.ComunaNacimiento.Lista;
    }
    if (data && data.ComunaResidencia.Lista){
      this.listaComunasResidencia = data.ComunaResidencia.Lista;
    }
    if (data && data.EstadoCivil.Lista){
      this.listaEstadoCivil = data.EstadoCivil.Lista;
    }
    if (data && data.Nacionalidad.Lista){
      this.listaNacionalidad = data.Nacionalidad.Lista;
    }
    if (data && data.Prevision.Lista){
      this.listaPrevision = data.Prevision?.Lista;
    }
    if (data && data.Sector.Lista){
      this.listaSector = data.Sector?.Lista;
    }
    if (data && data.TipoProfesional?.Lista){
      this.listaTipoProfesional = data.TipoProfesional.Lista;
    }
    //*************** */


    this.listaPreguntas = data.ListaPreguntas;
    this.atenciones = data.Atenciones;

    this.firstFormGroup = this.formBuilder.group({
      firstCtrl: ['']
    });
    this.secondFormGroup = this.formBuilder.group({
      secondCtrl: ['']
    });
    this.threeFormGroup = this.formBuilder.group({
      threeCtrl: ['']
    });

    this.filteredOptionsComunasNacimiento = this.myControlComNac.valueChanges.pipe(
      startWith(''),
      map(value => this._filterComNac(value || '')),
    );

    this.filteredOptionsComunasResidencia = this.myControlComRes.valueChanges.pipe(
      startWith(''),
      map(value => this._filterComRes(value || '')),
    );

    this.filteredOptionsEstadoCivil = this.myControlECivil.valueChanges.pipe(
      startWith(''),
      map(value => this._filterECivil(value || '')),
    );

    this.filteredOptionsNacionalidad = this.myControlNac.valueChanges.pipe(
      startWith(''),
      map(value => this._filterNac(value || '')),
    );

    this.filteredOptionsPrevision = this.myControlPrevision.valueChanges.pipe(
      startWith(''),
      map(value => this._filterPrevision(value || '')),
    );

    this.filteredOptionsSector = this.myControlSector.valueChanges.pipe(
      startWith(''),
      map(value => this._filterSector(value || '')),
    );

    this.filteredOptionsTProfesional = this.myControlTProfesional.valueChanges.pipe(
      startWith(''),
      map(value => this._filterTProfesional(value || '')),
    );

  }
  decodeBase64(encodedString: string): string {
    const decodedString = atob(encodedString); 
    return decodedString;
  }

  procesarRespuestaNew(data) {
    if (data && parseInt(data.UspId) > 0) {
      this.tieneHisSalud = true;
    }
    this.newData = data;
    //datos
/*     if (data && data.ComunaNacimiento.Lista){
      this.listaComunasNacimiento = data.ComunaNacimiento.Lista;
    }
    if (data && data.ComunaResidencia.Lista){
      this.listaComunasResidencia = data.ComunaResidencia.Lista;
    }
    if (data && data.EstadoCivil.Lista){
      this.listaEstadoCivil = data.EstadoCivil.Lista;
    }
    if (data && data.Nacionalidad.Lista){
      this.listaNacionalidad = data.Nacionalidad.Lista;
    }
    if (data && data.Prevision.Lista){
      this.listaPrevision = data.Prevision?.Lista;
    }
    if (data && data.Sector.Lista){
      this.listaSector = data.Sector?.Lista;
    }
    if (data && data.TipoProfesional?.Lista){
      this.listaTipoProfesional = data.TipoProfesional.Lista;
    } */
    //*************** */
    
    // reeprocesamos ya que vienen las respuestas ofuzcadas
    data.ListaPreguntas[0].forEach(pregunta => {
      if (pregunta.Respuesta && pregunta.Respuesta.Texto){
        const nuevoTexto = this.decodeBase64(pregunta.Respuesta.Texto);
        //const nuevoTexto = this.utiles.desencriptar(pregunta.Respuesta.Texto);
        console.log('NUEVO TEXTO ****', nuevoTexto);
        pregunta.Respuesta.Texto = nuevoTexto;
      }
    });

    this.newListaPreguntas = data.ListaPreguntas[0];
    console.log('***** nuevo preguntas *****', this,this.newListaPreguntas);
    // this.atenciones = data.Atenciones;

    this.firstFormGroup = this.formBuilder.group({
      firstCtrl: ['']
    });
    this.secondFormGroup = this.formBuilder.group({
      secondCtrl: ['']
    });
    this.threeFormGroup = this.formBuilder.group({
      threeCtrl: ['']
    });

/*     this.filteredOptionsComunasNacimiento = this.myControlComNac.valueChanges.pipe(
      startWith(''),
      map(value => this._filterComNac(value || '')),
    );

    this.filteredOptionsComunasResidencia = this.myControlComRes.valueChanges.pipe(
      startWith(''),
      map(value => this._filterComRes(value || '')),
    );

    this.filteredOptionsEstadoCivil = this.myControlECivil.valueChanges.pipe(
      startWith(''),
      map(value => this._filterECivil(value || '')),
    );

    this.filteredOptionsNacionalidad = this.myControlNac.valueChanges.pipe(
      startWith(''),
      map(value => this._filterNac(value || '')),
    );

    this.filteredOptionsPrevision = this.myControlPrevision.valueChanges.pipe(
      startWith(''),
      map(value => this._filterPrevision(value || '')),
    );

    this.filteredOptionsSector = this.myControlSector.valueChanges.pipe(
      startWith(''),
      map(value => this._filterSector(value || '')),
    );

    this.filteredOptionsTProfesional = this.myControlTProfesional.valueChanges.pipe(
      startWith(''),
      map(value => this._filterTProfesional(value || '')),
    ); */

  }


  volver() {
    if (this.paginaAnterior) {
      this.navCtrl.navigateRoot(this.paginaAnterior);
    }
    else {
      this.navCtrl.navigateRoot('nuevo-login');
    }
  }

  private obtenerObjetoMasReciente(datos: any[]): any {
    let objetoMasReciente = null;
    let fechaMasReciente = new Date(0);
  
    for (const objeto of datos) {
      const fechaAtencion = new Date(objeto.FechaAtencion);
  
      if (fechaAtencion > fechaMasReciente) {
        fechaMasReciente = fechaAtencion;
        objetoMasReciente = objeto;
      }
    }
  
    return objetoMasReciente;
  }
  

  private extraerRespuesta(pregunta, index){
    let correcto = false;
    let valorEvaluar = null;
    if (pregunta.Campo == 'FechaAtencion'){
      let objMasReciente = this.obtenerObjetoMasReciente(this.atenciones);
      let fecha = objMasReciente.FechaAtencion ?  moment(objMasReciente.FechaAtencion).format("MM-YYYY") : '';
      console.log(fecha);
      let valor = this.firstFormGroup.controls.firstCtrl.value;
      correcto = fecha != '' && fecha === valor ? true : false; 
    }
    if (pregunta.Campo == 'TipoProfesional'){
      //myControlTProfesional
      let objMasReciente = this.obtenerObjetoMasReciente(this.atenciones);
      let tipoProf = objMasReciente.TipoProfesional ?  objMasReciente.TipoProfesional : '';
      console.log(tipoProf);
      let valor = this.myControlTProfesional.value;
      correcto = tipoProf != '' && tipoProf.toUpperCase() === valor.toUpperCase() ? true : false; 
    }
    if (pregunta.Campo == 'ApellidoPaterno'){
      let apellidoPat = this.data.ApellidoPaterno;
      if (index == 0){
        valorEvaluar = this.firstFormGroup.controls.firstCtrl.value;
      }
      else if (index == 1){
        valorEvaluar = this.secondFormGroup.controls.secondCtrl.value;
      }
      else{
        valorEvaluar = this.threeFormGroup.controls.threeCtrl.value;
      }
      correcto = apellidoPat != '' && apellidoPat.toUpperCase() === valorEvaluar.toUpperCase() ? true : false;
    }
    if (pregunta.Campo == 'ApellidoMaterno'){
      let apellidoMat = this.data.ApellidoMaterno;
      if (index == 0){
        valorEvaluar = this.firstFormGroup.controls.firstCtrl.value;
      }
      else if (index == 1){
        valorEvaluar = this.secondFormGroup.controls.secondCtrl.value;
      }
      else{
        valorEvaluar = this.threeFormGroup.controls.threeCtrl.value;
      }
      correcto = apellidoMat.toUpperCase() === valorEvaluar.toUpperCase() ? true : false;

    }
    if (pregunta.Campo == 'Edad'){
      let edad = this.data.Edad.toString();
      if (index == 0){
        valorEvaluar = this.firstFormGroup.controls.firstCtrl.value;
      }
      else if (index == 1){
        valorEvaluar = this.secondFormGroup.controls.secondCtrl.value;
      }
      else{
        valorEvaluar = this.threeFormGroup.controls.threeCtrl.value;
      }
      correcto = edad != '' && edad.toUpperCase() === valorEvaluar.toUpperCase() ? true : false;
    }

    if (pregunta.Campo == 'ComunaNacimiento'){
      //myControlComNac
      let comunaNac = this.data.ComunaNacimiento.Nombre  ?  this.data.ComunaNacimiento.Nombre : '';
      console.log(comunaNac);
      let valor = this.myControlComNac.value;
      correcto = comunaNac != '' && comunaNac.toUpperCase() === valor.toUpperCase() ? true : false; 
    }

    if (pregunta.Campo == 'ComunaResidencia'){
      //myControlComNac
      let comunaRes = this.data.ComunaResidencia.Nombre  ?  this.data.ComunaResidencia.Nombre : '';
      console.log(comunaRes);
      let valor = this.myControlComRes.value;
      correcto = comunaRes != '' && comunaRes.toUpperCase() === valor.toUpperCase() ? true : false; 
    }

    if (pregunta.Campo == 'EstadoCivil'){
      //myControlComNac
      let eCivil = this.data.EstadoCivil.Nombre  ?  this.data.EstadoCivil.Nombre : '';
      console.log(eCivil);
      let valor = this.myControlECivil.value;
      correcto = eCivil != '' && eCivil.toUpperCase() === valor.toUpperCase() ? true : false; 
    }

    if (pregunta.Campo == 'Nacionalidad'){
      //myControlComNac
      let nac = this.data.Nacionalidad.Nombre  ?  this.data.Nacionalidad.Nombre : '';
      console.log(nac);
      let valor = this.myControlNac.value;
      correcto = nac != '' && nac.toUpperCase() === valor.toUpperCase() ? true : false; 
    }

    if (pregunta.Campo == 'Prevision'){
      //myControlComNac
      let previ = this.data.Prevision.Nombre  ?  this.data.Prevision.Nombre : '';
      console.log(previ);
      let valor = this.myControlPrevision.value;
      correcto = previ != '' && previ.toUpperCase() === valor.toUpperCase() ? true : false; 
    }

    if (pregunta.Campo == 'Sector'){
      //myControlComNac
      let sector = this.data.Sector.Nombre  ?  this.data.Sector.Nombre : '';
      console.log(sector);
      let valor = this.myControlSector.value;
      correcto = sector != '' && sector.toUpperCase() === valor.toUpperCase() ? true : false; 
    }

    return correcto;
  }

  procesarRespuestas(){
    const parametroIntentos = this.parametros.INTENTOS_INSCRIPCION();
    let contador = 0;
    let indice = 0;
    if (this.listaPreguntas && this.listaPreguntas.length > 0){
      this.listaPreguntas.forEach(pregunta => {
        let res = this.extraerRespuesta(pregunta, indice);
        console.log(res);
        if (res === true){
          contador++
        }
        indice++;
      });
    }
    if (contador < 3) {
      this.incrementarIntentosFallidos().then((intentosFallidos) => {
        if (intentosFallidos >= parametroIntentos) {
          this.comprobarTiempoUltimoIntentoFallido().then((puedeEjecutar) => {
            if (!puedeEjecutar) {
              console.log('NO PUEDE EJECUTAR YA QUE COMPLETÓ LOS INTENTOS FALLIDOS Y DEBE ESPERAR 24 HORAS.');
              let sms = "Debe esperar 24 horas para volver a ejecutar el proceso, será direccionado a la página de login.";
              let prox = this.entregaProximoIntento();
              if (prox != null){
                sms = "Debe esperar hasta el " + moment(prox).format("DD-MM-YYYY hh:mm") + " para volver a realizar la operación.";
              }
              let header = "Límite de intentos fallidos"
              this.presentAlertConfirm(header, sms, true);
              //aca hay que bloquearlo
              return;
            }
            else{
              //resetear los intentos fallidos
              localStorage.removeItem('intentosFallidos');
              localStorage.removeItem('ultimoIntentoFallido');
            }
          });
        } else {
          console.log('SEGUIR INTENTANDO INTENTO NRO. ', contador)
          let sms = (3 - contador).toString() + " de sus respuestas son incorrectas le queda(n) " + (parametroIntentos - intentosFallidos).toString() + " intento(s).";
          let header = "Intento fallido";
          this.presentAlertConfirm(header, sms, false);
        }
        //this.refreshPage();
      });
    }
    else if (contador == 3){
      //primero eliminamos los intentos fallidos
      localStorage.removeItem('intentosFallidos');
      localStorage.removeItem('ultimoIntentoFallido');
      console.log('SEGUIR A LA PANTALLA SIGUIENTE');
      //hacemos una llamada para traernos los datos el usuario
      //aca se debe hacer una llamada nueva, ver controlador registroappfamilia
      this.verficarEnrolamientoRayen(this.run);

    }
    

    //por mientras
    //stepper.reset();
  }

  procesaRespuestaEnrolamiento(usuarioAps, loader) {
    if (usuarioAps.RespuestaBase.CodigoMensaje == 0) {
      let usuario = usuarioAps.UsuarioAps;
      let preRegistro = usuarioAps.PreRegistro;
      /*       this.registroIncompleto = {
              Activo: 1,
              Apellidos: usuario.ApellidoPaterno == null ? '' : usuario.ApellidoPaterno + ' ' + usuario.ApellidoMaterno == null ? '': usuario.ApellidoMaterno,
              Apodo: "",
              Avatar: "",
              Comuna: localStorage.getItem("comuna"),
              CorreoElectronico: "",
              Eliminado: 0,
              FechaBaja: "0001-01-01T00:00:00",
              FechaNacimiento: "0001-01-01T00:00:00",
              FechaRegistro: "0001-01-01T00:00:00",
              Id: 0,
              IdDispositivo: localStorage.getItem("token_dispositivo"),
              Latitud: sessionStorage.getItem("latitud"),
              Longitud: sessionStorage.getItem("longitud"),
              //registro mediante el enrolamiento
              ModoRegistro: 2,
              NombreUsuario: "",
              Nombres: usuario.Nombres,
              Pais: localStorage.getItem("pais"),
              Password: "",
              Plataforma: localStorage.getItem("plataforma"),
              Provincia: localStorage.getItem("provincia"),
              Run: this.utiles.insertarGuion(usuario.Rut),
              TelefonoContacto: ''
            } */
      loader.dismiss();
      //acá estamos ok deberíamos mandarlo a que complete su fomrulario
      //this.irARegistro(this.estaAgregandoFamilia);
      //ya no vamos directamente al registro, guardamos los datos de validación en el backend
      //en la table de pre-registro
      //lo redirigimos a la pagina de login y le informamos que revise su correo electrónico
      this.muestraMensaje = true;
      //this.objetoMensaje.irA = this.paginaAnterior;
      this.objetoMensaje.irA = 'inicio';
      this.objetoMensaje.titulo = 'Registro en la app mi familia';
      this.objetoMensaje.contenido = usuarioAps.RespuestaBase.Mensaje;
      //aca debemos guardar el preregistro
      //hay que cambiar el correo para dejarlo en el pre-registro

      localStorage.setItem('PRE-REGISTRO', JSON.stringify(preRegistro));
    }
    else {
      loader.dismiss();

      this.muestraMensaje = true;

      if (usuarioAps.RespuestaBase.CodigoMensaje == 8) {
        this.objetoMensaje.irA = this.paginaAnterior;
        this.objetoMensaje.titulo = 'Menor de edad';
        this.objetoMensaje.contenido = 'No puedes registrarte ya que eres menor de edad y el registro para esta aplicación es sólo para mayores.';
      }
      else if (usuarioAps.RespuestaBase.CodigoMensaje == 9) {
        this.objetoMensaje.irA = this.paginaAnterior;
        this.objetoMensaje.titulo = 'Fecha nacimiento no coincide';
        this.objetoMensaje.contenido = 'La fecha de nacimiento ingresada no coincide con nuestros registros, revísela e inténtelo nuevamente.';
      }
      else if (usuarioAps.RespuestaBase.CodigoMensaje == 10) {
        this.objetoMensaje.irA = this.paginaAnterior;
        this.objetoMensaje.titulo = 'Email no coincide';
        this.objetoMensaje.contenido = 'El email ingresado no coincide con nuestros registros, revíselo e inténtelo nuevamente.';
      }
      else if (usuarioAps.RespuestaBase.CodigoMensaje == 11) {
        this.objetoMensaje.irA = this.paginaAnterior;
        this.objetoMensaje.titulo = 'Sin datos de contacto';
        this.objetoMensaje.contenido = 'No cuentas con datos de contacto, te sugerimos actualizarlos en tu centro de salud.';
      }
      else if (usuarioAps.RespuestaBase.CodigoMensaje == 12) {
        this.objetoMensaje.irA = this.paginaAnterior;
        this.objetoMensaje.titulo = 'Establecimiento sin permisos';
        this.objetoMensaje.contenido = 'El establecimiento en el cual te encuentras inscrito no tiene permisos para usar la aplicacion.';
      }
      else if (usuarioAps.RespuestaBase.CodigoMensaje == 1) {
        this.objetoMensaje.irA = this.paginaAnterior;
        this.objetoMensaje.titulo = 'Run no encontrado';
        this.objetoMensaje.contenido = 'Por el momento no cuentas con registros de salud en la Red pública, el run digitado no ha sido encontrado.';
      }
      else {
        this.objetoMensaje.irA = this.paginaAnterior;
        this.objetoMensaje.titulo = 'Mensaje';
        this.objetoMensaje.contenido = usuarioAps.RespuestaBase.Mensaje;
      }


    }
  }

  async verficarEnrolamientoRayen(runUsuario) {
    let run = runUsuario;

    this.cargando = true;
    let loader = await this.loading.create({
      message: 'Verificando...<br>Usuario',
      duration: 3000
    });

    await loader.present().then(async () => {
      if (!this.utiles.isAppOnDevice()) {
        //llamada web
        this.servicioGeo.verificaEnrolamientoRegistro(runUsuario, this.email).subscribe((response: any) => {
          //procesar
          console.log(response);
          this.procesaRespuestaEnrolamiento(response, loader);
        })
      }
      else {
        //llamada nativa
        this.servicioGeo.verificaEnrolamientoRegistroNative(runUsuario, this.email).then((response: any) => {
          var data = JSON.parse(response.data);
          console.log(data);
          this.procesaRespuestaEnrolamiento(data, loader);
        },
          (error) => {
            console.log('No hay enrolamiento por clave única');
            //this.utiles.presentToast('Ocurrió un error de obtención identificador', 'bottom', 4000);
            loader.dismiss();
          }
        );
      }
    })

  }

  //metodos para controlar los intentos
  incrementarIntentosFallidos(): Promise<number> {
    return new Promise((resolve) => {
      let intentosFallidos = localStorage.getItem('intentosFallidos');
      if (intentosFallidos) {
        intentosFallidos = String(Number(intentosFallidos) + 1);
      } else {
        intentosFallidos = '1';
      }
      localStorage.setItem('intentosFallidos', intentosFallidos);
  
      // Guardar la marca de tiempo del último intento fallido
      //const marcaTiempo = new Date().toISOString();
      const marcaTiempo = moment().format();
      localStorage.setItem('ultimoIntentoFallido', marcaTiempo);
  
      resolve(Number(intentosFallidos));
    });
  }

  entregaProximoIntento(){
    let proxima = null;
    const ultimoIntentoFallido = localStorage.getItem('ultimoIntentoFallido');
    if (ultimoIntentoFallido) {
      proxima = moment(ultimoIntentoFallido).add(24,'hour');
    }
    return proxima;
  }
  
  comprobarTiempoUltimoIntentoFallido(): Promise<boolean> {
    return new Promise((resolve) => {
      const ultimoIntentoFallido = localStorage.getItem('ultimoIntentoFallido');
      if (!ultimoIntentoFallido) {
        resolve(true);
      } else {
        const fechaUltimoIntento = new Date(ultimoIntentoFallido);
        //const horasTranscurridas = this.calcularHorasTranscurridas(fechaUltimoIntento);
        const minutosTranscurridos = this.calcularMinutosTranscurridos(fechaUltimoIntento);
        //obtenemos el parametro 
        const horasParametro = this.parametros.MINUTOS_ULTIMO_INTENTO();
        if (minutosTranscurridos < horasParametro) {
          resolve(false);
        } else {
          resolve(true);
        }
      }
    });
  }
  
  calcularHorasTranscurridas(fecha: Date): number {
    const fechaActual = new Date();
    const diferenciaHoras = fechaActual.getTime() - fecha.getTime();
    return diferenciaHoras / (1000 * 60 * 60);
  }

  calcularMinutosTranscurridos(fecha) {
    const fechaActual = new Date();
    const diferenciaMinutos = fechaActual.getTime() - fecha.getTime();
    return diferenciaMinutos / (1000 * 60);
  }

  refreshPage() {
/*     const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigateByUrl(currentUrl);
    }); */
    window.location.reload();
  }


}