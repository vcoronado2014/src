import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController } from '@ionic/angular';
import { FormGroup, Validators, FormBuilder, FormControl, ValidatorFn, FormGroupDirective, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
//servicios
import { ServicioUtiles } from '../../app/services/ServicioUtiles';
import { ServicioGeo } from '../../app/services/ServicioGeo';
import { ServicioParametrosApp } from '../../app/services/ServicioParametrosApp';
import { NavigationExtras } from '@angular/router';

import * as moment from 'moment';

@Component({
  selector: 'app-registro-uno',
  templateUrl: './registro-uno.page.html',
  styleUrls: ['./registro-uno.page.scss'],
})
export class RegistroUnoPage implements OnInit {
  rut;
  nombre = '';
  cargando = false;
  registroIncompleto: any;
  //formulario
  forma: FormGroup;
  //expresiones regulares
  //expEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/gm;
  expEmail = /^((\w[^\W]+)[\.\-]?){1,}\@(([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/gm
  tipoMovimiento = '1';
  estaAgregandoFamilia = false;
  paginaAnterior = 'inicio';
  //para mostrar la pagina de mensajes
  muestraMensaje = false;
  objetoMensaje = {
    irA: 'inicio',
    titulo: '',
    contenido: ''
  }
  constructor(
    private navCtrl: NavController,
    public utiles: ServicioUtiles,
    public servicioGeo: ServicioGeo,
    public parametros: ServicioParametrosApp,
    public loading: LoadingController,
    private formBuilder: FormBuilder,
    public activatedRoute: ActivatedRoute,
    private router: Router,
  ) {

  }

  ngOnInit() {
    moment.locale('es');
    this.activatedRoute.queryParams.subscribe(params => {
      if (params && params.estaAgregandoFamilia) {
        this.estaAgregandoFamilia = true;
      }
      if (params && params.nombre) {
        this.nombre = params.nombre;
      }
      if (params && params.modulo) {
        this.paginaAnterior = params.modulo;
      }
    });
    this.cargarForma();
  }
  cargarForma() {
    this.forma = new FormGroup({
      'run': new FormControl('', [Validators.required]),
      /* 'email': new FormControl('', [Validators.required, Validators.pattern(this.expEmail)]), */
      'email': new FormControl('', [Validators.required, Validators.email]),
      'fechaNacimiento': new FormControl('', [Validators.required]),
    }, { validators: this.RunValidator });

  }

  volver() {
    //this.navCtrl.navigateRoot('nuevo-login');
    const navigationExtras: NavigationExtras = {
      queryParams: {
        modulo: 'inicio',
        nombre: this.nombre
      }
    }
    this.navCtrl.navigateRoot(['pre-registro-uno'], navigationExtras);
  }
  //para validar
  get f() { return this.forma.controls; }

  async verificaRegistroCompleto() {
    if (this.forma.invalid) {
      return;
    }
    let run = this.forma.controls.run.value;
    let idDispositivo = this.utiles.entregaIdDispositivo();
    let fechaNac = moment(this.forma.controls.fechaNacimiento.value);
    let fechaNacStr = fechaNac.format('DD-MM-YYYY');
    //console.log('run registro uno ' + run);
    //console.log('idispositivo registro uno ' + idDispositivo);
    //console.log('fecha nac registro uno ' + fechaNac);
    //console.log('fecha nac registro uno str ' + fechaNacStr);

    this.cargando = true;
    let loader = await this.loading.create({
      message: 'Verificando...<br>Registro',
      duration: 3000
    });

    //primero validamos nuevamente si cuenta con registro dentro de la app por run
    await loader.present().then(async () => {
      if (!this.utiles.isAppOnDevice()) {
        //llamada web
        this.servicioGeo.getRegistroAppRun(run, idDispositivo).subscribe((response: any) => {
          //procesar
          this.procesarRespuestaRegistroCompleto(response, loader);
        })
      }
      else {
        //llamada nativa
        this.servicioGeo.getRegistroAppNativeRun(run, idDispositivo).then((response: any) => {
          var data = JSON.parse(response.data);
          this.procesarRespuestaRegistroCompleto(data, loader);
        },
          (error) => {
            console.log('No hay registro por run');
            //this.utiles.presentToast('Ocurrió un error de obtención identificador', 'bottom', 4000);
            loader.dismiss();
          }
        );
      }
    });

  }

  async verificaRegistro() {

    let run = this.forma.controls.run;
    let idDispositivo = this.utiles.entregaIdDispositivo();

    this.cargando = true;
    let loader = await this.loading.create({
      message: 'Verificando...<br>Registro',
      duration: 3000
    });

    //primero validamos nuevamente si cuenta con registro dentro de la app por run
    await loader.present().then(async () => {
      if (!this.utiles.isAppOnDevice()) {
        //llamada web
        this.servicioGeo.getRegistroAppRun(run.value, idDispositivo).subscribe((response: any) => {
          //procesar
          this.procesarRespuestaRegistro(response, loader);
        })
      }
      else {
        //llamada nativa
        this.servicioGeo.getRegistroAppNativeRun(run.value, idDispositivo).then((response: any) => {
          var data = JSON.parse(response.data);
          this.procesarRespuestaRegistro(data, loader);
        },
          (error) => {
            console.log('No hay registro por Run');
            //this.utiles.presentToast('Ocurrió un error de obtención identificador', 'bottom', 4000);
            loader.dismiss();
          }
        );
      }
    });

  }

  abrirLogin() {
    this.navCtrl.navigateRoot('nuevo-login');
  }
  procesarRespuestaRegistroCompleto(registro, loader) {
    if (registro && registro != null) {
      //verificamos si tiene su registro completo
      var tieneCorreo = !(registro.CorreoElectronico == null || registro.CorreoElectronico == "" || registro.CorreoElectronico == undefined);
      var tienePassword = !(registro.Password == null || registro.Password == "" || registro.Password == undefined);
      var tieneRun = !(registro.Run == null || registro.Run == "" || registro.Run == undefined);
      var tieneUsuario = !(registro.NombreUsuario == null || registro.NombreUsuario == "" || registro.NombreUsuario == undefined);
      if (tieneCorreo && tienePassword && tieneRun && tieneUsuario) {
        //tiene registro completo, enviarlo a la pagina de login
        this.utiles.presentToast('Usted ya tiene registro', 'middle', 5000);
        loader.dismiss();
        if (this.estaAgregandoFamilia == false) {
          this.abrirLogin();
        }
        else {
          //si esta agregando familia hay que crear lo que corresponde y avisar al
          //usuario que fue creado o no exito
          //console.log('ESTA AGREGANDO FAMILIA');
        }

      }
      else {
        //su registro esta incompleto, derivarlo a la pagina de registro de la app
        this.registroIncompleto = registro;
        //pasar como parametro el registro incompleto a la otra pantalla para que pueda completarlo
        //******* LLAMAR A LA PAGINA DE REGISTRO  *************/
        this.utiles.presentToast('Su registro está incompleto', 'middle', 5000);
        loader.dismiss();
        this.irARegistro(this.estaAgregandoFamilia);
      }
    }
    else {
      //no tiene registro, llamar a la api para buscarlo en rayen
      loader.dismiss();
      //llamamos a enrolamiento
      this.verficarEnrolamientoRayenCompleto();
      //console.log('Buscarlo en rayen');

    }
  }
  procesarRespuestaRegistro(registro, loader) {
    if (registro && registro != null) {
      //verificamos si tiene su registro completo
      var tieneCorreo = !(registro.CorreoElectronico == null || registro.CorreoElectronico == "" || registro.CorreoElectronico == undefined);
      var tienePassword = !(registro.Password == null || registro.Password == "" || registro.Password == undefined);
      var tieneRun = !(registro.Run == null || registro.Run == "" || registro.Run == undefined);
      var tieneUsuario = !(registro.NombreUsuario == null || registro.NombreUsuario == "" || registro.NombreUsuario == undefined);
      if (tieneCorreo && tienePassword && tieneRun && tieneUsuario) {
        //tiene registro completo, enviarlo a la pagina de login
        this.utiles.presentToast('Usted ya tiene registro', 'middle', 5000);
        loader.dismiss();
        if (this.estaAgregandoFamilia == false) {
          this.abrirLogin();
        }
        else {
          //si esta agregando familia hay que crear lo que corresponde y avisar al
          //usuario que fue creado o no exito
          //console.log('ESTA AGREGANDO FAMILIA');
        }

      }
      else {
        //su registro esta incompleto, derivarlo a la pagina de registro de la app
        this.registroIncompleto = registro;
        //pasar como parametro el registro incompleto a la otra pantalla para que pueda completarlo
        //******* LLAMAR A LA PAGINA DE REGISTRO  *************/
        this.utiles.presentToast('Su registro está incompleto', 'middle', 5000);
        loader.dismiss();
        this.irARegistro(this.estaAgregandoFamilia);
      }
    }
    else {
      //no tiene registro, llamar a la api para buscarlo en rayen
      loader.dismiss();
      //llamamos a enrolamiento
      this.verficarEnrolamientoRayen();
      //console.log('Buscarlo en rayen');

    }
  }
  irARegistro(agregaFamilia) {
    //enviar registroIncompleto
    if (this.registroIncompleto) {
      let query = {
        usuario: null,
        estaAgregandoFamilia: null
      };
      query = { usuario: JSON.stringify(this.registroIncompleto), estaAgregandoFamilia: agregaFamilia }
      const navigationExtras: NavigationExtras = {
        queryParams: query
      };
      this.navCtrl.navigateRoot(['registro-usuario'], navigationExtras);
    }

  }
  irAClaveUnica() {
    //debemos generar un hash de al menos 30 caracteres para enviar a clave unica (state)
    let runUsuario = this.forma.controls.run.value;
    let fecha = moment().format('DD-MM-YYYY HH:mm');
    let enviar = runUsuario + '|' + fecha + '|' + this.tipoMovimiento;
    let state = this.utiles.encriptar(enviar);
    //guardamos en el local storage el state
    localStorage.setItem("STATE_CLAVE_UNICA", state);
    const navigationExtras: NavigationExtras = {
      queryParams: {
        state: state
      }
    };
    //this.navCtrl.navigateRoot('login-clave-unica');
    this.navCtrl.navigateRoot(['login-clave-unica'], navigationExtras);
  }

  async verficarEnrolamientoRayen() {
    let run = this.forma.controls.run;

    this.cargando = true;
    let loader = await this.loading.create({
      message: 'Verificando...<br>Registro',
      duration: 3000
    });

    await loader.present().then(async () => {
      if (!this.utiles.isAppOnDevice()) {
        //llamada web
        this.servicioGeo.verificaEnrolamiento(run.value).subscribe((response: any) => {
          //procesar
          //console.log(response);
          this.procesaRespuestaEnrolamiento(response, loader);
        })
      }
      else {
        //llamada nativa
        this.servicioGeo.verificaEnrolamientoNative(run.value).then((response: any) => {
          var data = JSON.parse(response.data);
          //console.log(data);
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

  async verficarEnrolamientoRayenCompleto() {
    let run = this.forma.controls.run.value;
    let fechaNac = moment(this.forma.controls.fechaNacimiento.value);
    let fechaNacStr = fechaNac.format('DD-MM-YYYY');
    let email = this.forma.controls.email.value;

    this.cargando = true;
    let loader = await this.loading.create({
      message: 'Verificando...<br>Registro',
      duration: 3000
    });

    await loader.present().then(async () => {
      if (!this.utiles.isAppOnDevice()) {
        //llamada web
        this.servicioGeo.verificaEnrolamientoCompleto(run, fechaNacStr, email).subscribe((response: any) => {
          //procesar
          //console.log(response);
          this.procesaRespuestaEnrolamiento(response, loader);
        })
      }
      else {
        //llamada nativa
        this.servicioGeo.verificaEnrolamientoCompletoNative(run, fechaNacStr, email).then((response: any) => {
          var data = JSON.parse(response.data);
          //console.log(data);
          this.procesaRespuestaEnrolamiento(data, loader);
        },
          (error) => {
            console.log('No hay enrolamiento clave única');
            //this.utiles.presentToast('Ocurrió un error de obtención identificador', 'bottom', 4000);
            loader.dismiss();
          }
        );
      }
    })

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
      localStorage.setItem('PRE-REGISTRO', JSON.stringify(preRegistro));
    }
    else {
      //aca definitivamente debemos enviarlo a clave única
      loader.dismiss();
      //no debemos enviarlo a clave unica, debemos validar el mensaje
      //en base a la respuesta del mensaje realizar acciones
      if (this.parametros.USA_CLAVE_UNICA()) {
        //console.log('clave unica');
        this.irAClaveUnica();
      }
      else {
        this.muestraMensaje = true;

        //debemos revisar la respuesta, pondremos una pagina intermedia
        //para procesar la respuesta
        //levantar pagina mensajes
        //registro de menor de edad
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
  }


  RunValidator: ValidatorFn = (fg: FormGroup) => {
    const run = fg.get('run').value;
    if (run !== null && run !== "") {
      if (this.utiles.Rut(run) == false) {
        this.forma.controls.run.setErrors({ runInvalido: false });
      }
    }

    return run !== null ? null : null;
  };

}