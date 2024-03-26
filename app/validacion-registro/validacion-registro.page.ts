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

    myControlCombo1 = new FormControl('');
    listaCombo1: [];
    filteredOptionsCombo1: Observable<string[]>;  

    myControlCombo2 = new FormControl('');
    listaCombo2: [];
    filteredOptionsCombo2: Observable<string[]>;

    myControlCombo3 = new FormControl('');
    listaCombo3: [];
    filteredOptionsCombo3: Observable<string[]>;


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
            // console.log('Confirm aceptar');
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
              //console.log('Respuesta ********', response);
              let data = response;
              this.procesarRespuestaNew(data);
              loader.dismiss();
            })
          }
          else {
            this.servicioGeo.getPreguntasNative(this.run).then((response: any) => {
              //procesar
              //console.log('Respuesta ********', JSON.parse(response.data));
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

  private _filterCombo1(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.listaCombo1.filter((option:any) => option.toLowerCase().includes(filterValue));
  }

  private _filterCombo2(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.listaCombo2.filter((option:any) => option.toLowerCase().includes(filterValue));
  }

  private _filterCombo3(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.listaCombo3.filter((option:any) => option.toLowerCase().includes(filterValue));
  }

  separateWords(texto: string): string {
    return texto.replace(/([A-Z])/g, ' $1').trim();
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
    
    // reeprocesamos ya que vienen las respuestas ofuzcadas
    data.ListaPreguntas[0].forEach(pregunta => {
      if (pregunta.Respuesta && pregunta.Respuesta.Texto){
        const nuevoTexto = this.decodeBase64(pregunta.Respuesta.Texto);
        const nuevoTexto2 = decodeURIComponent(escape(nuevoTexto));
        //const nuevoTexto = this.utiles.desencriptar(pregunta.Respuesta.Texto);
        // console.log('NUEVO TEXTO ****', nuevoTexto2);
        pregunta.Respuesta.Texto = nuevoTexto2;
      }
    });

    this.newListaPreguntas = data.ListaPreguntas[0];
    //console.log('***** nuevo preguntas *****', this.newListaPreguntas);

    if (data.ListaPreguntas[0][0] && data.ListaPreguntas[0][0].Respuesta.Lista){
      this.listaCombo1 = data.ListaPreguntas[0][0].Respuesta.Lista;
    }
    if (data.ListaPreguntas[0][1] && data.ListaPreguntas[0][1].Respuesta.Lista){
      this.listaCombo2 = data.ListaPreguntas[0][1].Respuesta.Lista;
    }
    if (data.ListaPreguntas[0][2] && data.ListaPreguntas[0][2].Respuesta.Lista){
      this.listaCombo3 = data.ListaPreguntas[0][2].Respuesta.Lista;
    }

    //datos
    this.filteredOptionsCombo1 = this.myControlCombo1.valueChanges.pipe(
      startWith(''),
      map(value => this._filterCombo1(value || '')),
    );

    this.filteredOptionsCombo2 = this.myControlCombo2.valueChanges.pipe(
      startWith(''),
      map(value => this._filterCombo2(value || '')),
    );

    this.filteredOptionsCombo3 = this.myControlCombo3.valueChanges.pipe(
      startWith(''),
      map(value => this._filterCombo3(value || '')),
    );


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
  }
  volver() {
    if (this.paginaAnterior) {
      this.navCtrl.navigateRoot(this.paginaAnterior);
    }
    else {
      this.navCtrl.navigateRoot('nuevo-login');
    }
  }


  private extraerRespuestaNew(pregunta, index){
    let correcto = false;
    let valorEvaluar = null;
    let respuestaTxt = pregunta.Respuesta.Texto != '' ? pregunta.Respuesta.Texto.toUpperCase() : '';
    if (pregunta.Tipo === 1 || pregunta.Tipo === 3 || pregunta.Tipo === 4){
      if (index === 0){
        valorEvaluar = this.firstFormGroup.controls.firstCtrl.value;
      }
      else if (index === 1){
        valorEvaluar = this.secondFormGroup.controls.secondCtrl.value;
      }
      else{
        valorEvaluar = this.threeFormGroup.controls.threeCtrl.value;
      }

      correcto = valorEvaluar.toUpperCase() == respuestaTxt ? true : false;
      
    }
    else if (pregunta.Tipo === 2){
      if (index === 0){
        valorEvaluar = this.myControlCombo1.value;
      }
      else if (index === 1) {
        valorEvaluar = this.myControlCombo2.value;
      }
      else{
        valorEvaluar = this.myControlCombo3.value;
      }

      correcto = valorEvaluar.toUpperCase() == respuestaTxt ? true : false;      

    }

    return correcto;
  }

  procesarRespuestasNew(){
    const parametroIntentos = this.parametros.INTENTOS_INSCRIPCION();
    let contador = 0;
    let indice = 0;
    if (this.newListaPreguntas && this.newListaPreguntas.length > 0){
      this.newListaPreguntas.forEach(pregunta => {
        //console.log('respueesta a la prgunta *****', pregunta.Respuesta.Texto);
        let res = this.extraerRespuestaNew(pregunta, indice);
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