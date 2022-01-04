import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, Platform } from '@ionic/angular';
import { FormGroup, Validators, FormBuilder, FormControl, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
//servicios
import { ServicioUtiles } from '../../app/services/ServicioUtiles';
import { ServicioGeo } from '../../app/services/ServicioGeo';
import { ServicioAcceso } from '../../app/services/ServicioAcceso';
import { ServicioParametrosApp } from '../../app/services/ServicioParametrosApp';
import { ServicioFCM } from '../../app/services/ServicioFCM';
import { ServicioNotificaciones } from '../../app/services/ServicioNotificaciones';
import { NavigationExtras } from '@angular/router';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Device } from '@ionic-native/device/ngx';

import * as moment from 'moment';


//estoy implementando progress bar
//aca hay que controlar cuando no hay internet

@Component({
  selector: 'app-nuevo-login',
  templateUrl: './nuevo-login.page.html',
  styleUrls: ['./nuevo-login.page.scss'],
})
export class NuevoLoginPage implements OnInit {
  hide = true;

  registro;
  forma: FormGroup;
  nombreMostrar;
  //para validar
  patternOnlyLetter = '[a-zA-ZÀ-ÿ\u00f1\u00d1]+(\s*[a-zA-ZÀ-ÿ\u00f1\u00d1]*)*[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$';
  expCelular = /^(\+?56)?(\s?)(0?9)(\s?)[9876543]\d{7}$/gm;
  expPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,8}$/gm;
  expEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/gm;
  isLogged: boolean;
  loggedIn: boolean;
  CodigoMensaje: any;
  Mensaje: string;
  tokenDispositivo;
  //para validarse solo con enrolamiento
  usaEnrolamiento = false;
  //PARA REGISTRAR EL MOVIMIENTO DE INGRESO
  objetoEntrada = {
    VersionAppName: '',
    Plataforma: '',
    Token: '',
    VersionAppNumber: '',
    Fecha: new Date(),
    TipoOperacion: '0',
    Id: '0'
  };
  //para progress bar
  estaCargando = false;


  constructor(
    private navCtrl: NavController,
    public utiles: ServicioUtiles,
    public servicioGeo: ServicioGeo,
    public loading: LoadingController,
    private formBuilder: FormBuilder,
    public activatedRoute: ActivatedRoute,
    private router: Router,
    public acceso: ServicioAcceso,
    public parametrosApp: ServicioParametrosApp,
    public fcmService: ServicioFCM,
    public appVersion: AppVersion,
    public platform: Platform,
    public device: Device,
    public servNotificaciones: ServicioNotificaciones,
  ) { }

  ngOnInit() {
    moment.locale('es');
    //vamos a obtener las notificaciones push en esta pantalla
    this.servNotificaciones.buscarCitasTodas();
    this.usaEnrolamiento = this.parametrosApp.USA_LOGIN_ENROLAMIENTO();
    this.cargarForma();
  }
  abrirAsistente() {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        modulo: 'nuevo-login'
      }
    }
    this.navCtrl.navigateRoot(['pre-registro-uno'], navigationExtras);
  }
  cargarForma() {
    this.forma = new FormGroup({
      'run': new FormControl('', [Validators.required]),
      'email': new FormControl('', [Validators.required, Validators.pattern(this.expEmail)]),
      'clave': new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(10)])
    });
    //si usa enrolamiento hay que quitar validación de email
    if (this.usaEnrolamiento) {
      this.forma.get('email').clearValidators();
    }
    else {
      this.forma.get('run').clearValidators();
    }
    //acá ver si dejamos preseteado el usuario y clave
    //por lo pronto lo comentamos

    /*     if (this.registro && this.registro.Id > 0){
          this.forma.setValue({
            run: this.registro.Run,
            email: this.registro.CorreoElectronico,
            nombre: this.registro.Nombres,
            apellido: this.registro.Apellidos,
            telefono: this.registro.TelefonoContacto,
            genero: this.registro.Sexo.toString(),
            clave: '',
            repetirClave: ''
          })
        } */
  }
  async crearToken() {
    var versionAppName;
    var versionNumber;
    var plataforma;
    //original
    /*     let loader = await this.loading.create({
          message: 'Creando...<br>Token inicial',
          duration: 2000
        }); */
    this.estaCargando = true;
    let loader = await this.loading.create({
      cssClass: 'loading-vacio',
      showBackdrop: false,
      spinner: null,
    });

    await loader.present().then(async () => {
      if (!this.utiles.isAppOnDevice()) {
        //web
        //guardar local storage
        if (!localStorage.getItem('token_dispositivo')) {
          //crear token para web
          this.tokenDispositivo = (Math.random() * (1000000 - 1) + 1).toString() + ' web';
          localStorage.setItem('token_dispositivo', this.tokenDispositivo);
        }
        else {
          this.tokenDispositivo = localStorage.getItem('token_dispositivo');
        }
        versionAppName = "Mi salud familiar"
        versionNumber = "0.0";
        plataforma = "Web";
        //loader.dismiss();
        //otras variables
        localStorage.setItem('version_app_name', versionAppName);
        localStorage.setItem('version_number', versionNumber);
        localStorage.setItem('plataforma', plataforma);
        loader.dismiss();
        this.estaCargando = false;
      }
      else {
        if (this.platform.is('ios')) {
          versionAppName = await this.appVersion.getAppName();
          versionNumber = await this.appVersion.getVersionNumber();
          plataforma = "iOS";
        }
        else if (this.platform.is('android')) {
          versionAppName = await this.appVersion.getAppName();
          versionNumber = await this.appVersion.getVersionNumber();
          plataforma = "Android";
        }
        else if (this.platform.is('mobileweb')) {
          versionAppName = "Mi salud familiar"
          versionNumber = "0.0";
          plataforma = "Web";
        }
        else {
          versionAppName = "Mi salud familiar"
          versionNumber = "0.0";
          plataforma = "No informado";
        }
        //crear token para web
        this.tokenDispositivo = this.device.uuid;
        localStorage.setItem('token_dispositivo', this.tokenDispositivo);
        //otras variables
        localStorage.setItem('version_app_name', versionAppName);
        localStorage.setItem('version_number', versionNumber);
        localStorage.setItem('plataforma', plataforma);
        loader.dismiss();
        this.estaCargando = false;
      }

    })
  }
  async registrarEntrada() {
    //variable de session que identifica el ingreso
    if (!sessionStorage.getItem('RSS_ID')) {
      this.objetoEntrada.VersionAppName = localStorage.getItem('version_app_name');
      this.objetoEntrada.Plataforma = localStorage.getItem('plataforma');
      this.objetoEntrada.VersionAppNumber = localStorage.getItem('version_number');
      this.objetoEntrada.Token = localStorage.getItem('token_dispositivo');
      this.objetoEntrada.Fecha = new Date();
      //GUARDAMOS EN LA SESSION PARA OCUPARLO DESPUES
      sessionStorage.setItem('ENTRADA', JSON.stringify(this.objetoEntrada));
      //original
      /*       let loader = await this.loading.create({
              message: 'Creando...<br>registro de sessión',
              duration: 2000
            }); */
      this.estaCargando = true;
      let loader = await this.loading.create({
        cssClass: 'loading-vacio',
        showBackdrop: false,
        spinner: null,
      });

      await loader.present().then(async () => {
        if (!this.utiles.isAppOnDevice()) {
          //web
          this.servicioGeo.postIngreso(this.objetoEntrada).subscribe((data: any) => {
            if (data) {
              if (data.Id > 0) {
                //guardamos el identificador del registro para procesarlo despues
                sessionStorage.setItem("RSS_ID", data.Id);

              }
            }
            loader.dismiss();
            this.estaCargando = false;
          });
        }
        else {
          //dispositivo
          this.servicioGeo.postIngresoNative(this.objetoEntrada).then(response => {
            let respuesta = JSON.parse(response.data);
            sessionStorage.setItem("RSS_ID", respuesta.Id);
            loader.dismiss();
            this.estaCargando = false;
          });
        }
      });


    }
  }
  async loguearseRegistro() {
    let correo = this.forma.controls.email.value;
    let password = this.forma.controls.clave ? this.utiles.encriptar(this.forma.controls.clave.value) : '';

    //ahora guardamos
    this.estaCargando = true;
    let loader = await this.loading.create({
      cssClass: 'loading-vacio',
      showBackdrop: false,
      spinner: null,
    });
    await loader.present().then(async () => {
      if (!this.utiles.isAppOnDevice()) {
        //llamada web
        this.servicioGeo.getRegistroAppCorreoPassword(correo, password).subscribe((data) => {
          if (data) {
            let respuesta = data;
            localStorage.setItem('REGISTRO', JSON.stringify(respuesta));
            localStorage.setItem('TIENE_REGISTRO', 'true');
            loader.dismiss();
            let registro = JSON.parse(localStorage.getItem('REGISTRO'));

            this.autentificarse(registro.Run, password);
          }
          else {
            this.utiles.presentToast("No se encontró registro de usuario.", "middle", 3000);
            this.estaCargando = false;
            loader.dismiss();
            return;
          }

        }, error => {
          console.log(error.message);
          this.utiles.presentToast("Error de conexión.", "middle", 3000);
          this.estaCargando = false;
          loader.dismiss();
        })
      }
      else {
        //llamada nativa
        this.servicioGeo.getRegistroAppNativeCorreoPassword(correo, password).then((data) => {
          let respuesta = JSON.parse(data.data);
          if (respuesta) {
            localStorage.setItem('REGISTRO', JSON.stringify(respuesta));
            localStorage.setItem('TIENE_REGISTRO', 'true');
            loader.dismiss();
            let registro = JSON.parse(localStorage.getItem('REGISTRO'));
            this.autentificarse(registro.Run, password);
          }
          else {
            this.utiles.presentToast("No se encontró registro de usuario.", "middle", 3000);
            this.estaCargando = false;
            loader.dismiss();
            return;
          }

        }).catch(error => {
          console.log(error.message);
          this.utiles.presentToast("Error de conexión.", "middle", 3000);
          this.estaCargando = false;
          loader.dismiss();
        })
      }
    })
  }

  async loguearseEnrolamiento() {
    this.estaCargando = true;
    let run = this.forma.controls.run.value;
    let password = this.forma.controls.clave ? this.utiles.encriptar(this.forma.controls.clave.value) : '';
    localStorage.setItem('TIENE_REGISTRO', 'false');
    this.autentificarse(run, password);
  }

  async onSubmit() {
    if (this.forma.invalid) {
      return;
    }
    if (this.usaEnrolamiento) {
      //loguearse con enrolamiento
      this.loguearseEnrolamiento();
    }
    else {
      //loguearse con registro app
      this.loguearseRegistro();
    }
  }
  async autentificarse(userName, password) {
    //en este caso ya el user name es el email

    let f = { UserName: userName, Password: password, UsaEnrolamiento: this.usaEnrolamiento, TokenFCM: this.utiles.entregaTokenFCM() };

    this.estaCargando = true;
    let loader = await this.loading.create({
      cssClass: 'loading-vacio',
      showBackdrop: false,
      spinner: null,
    });


    await loader.present().then(async () => {
      if (!this.utiles.isAppOnDevice()) {
        //llamada web
        this.acceso.loginWebDirecto(f).subscribe((response: any) => {
          this.procesarLogin(response, loader);
        },
          (error) => {
            loader.dismiss();
            this.estaCargando = false;
            return;
          });
      }
      else {
        //llamada nativa
        this.acceso.loginWebNative(f).then((response: any) => {
          this.procesarLogin(JSON.parse(response.data), loader);
        },
          (error) => {
            this.utiles.presentToast('Ocurrió un error de autentificación', 'bottom', 4000);
            this.estaCargando = false;
            loader.dismiss();
            return;
          }
        );
      }
    })
  }
  setDatosUsuario(retorno, user, userFamilia) {
    //variable de sessión muy importante para el resto de la app.
    sessionStorage.setItem("UsuarioAps", user);
    localStorage.setItem('MI_RUT', retorno.UsuarioAps.Rut);
    localStorage.setItem('MI_NOMBRE', retorno.UsuarioAps.Nombres + ' ' + retorno.UsuarioAps.ApellidoPaterno);
    localStorage.setItem('MI_COLOR', retorno.UsuarioAps.Color);
    localStorage.setItem('MI_IMAGEN', retorno.UsuarioAps.UrlImagen);
    //lo vamos a guardar en el local storage para realizar la llamada
    //en el background
    localStorage.setItem('UsuarioAps', user);
    if (retorno.UsuariosFamilia) {
      //debemos quitar los repetidos según última revisión
      let hash = {};
      var familia = retorno.UsuariosFamilia.filter(o => hash[o.Id] ? false : hash[o.Id] = true);
      retorno.UsuariosFamilia = familia;
      userFamilia = JSON.stringify(retorno.UsuariosFamilia);
      //variable de sessión muy importante para el resto de la app.
      localStorage.setItem("UsuariosFamilia", userFamilia);
    }
    if (retorno.FamiliaPorAceptar && retorno.FamiliaPorAceptar.length >= 0) {
      localStorage.setItem('FAMILIA-POR-ACEPTAR', JSON.stringify(retorno.FamiliaPorAceptar));
    }
    if (retorno.FamiliaAceptada && retorno.FamiliaAceptada.length >= 0) {
      localStorage.setItem('FAMILIA-ACEPTADA', JSON.stringify(retorno.FamiliaAceptada));
    }
    if (retorno.FamiliaRechazada && retorno.FamiliaRechazada.length >= 0) {
      localStorage.setItem('FAMILIA-RECHAZADA', JSON.stringify(retorno.FamiliaRechazada));
    }


    this.CodigoMensaje = retorno.RespuestaBase.CodigoMensaje;
    this.Mensaje = retorno.RespuestaBase.Mensaje;

    this.loggedIn = true;
    /*     this.fcmService.initFCM();
        this.fcmService.receiveMessage(true); */
  }
  procesarLogin(response, loader) {
    var retorno = response;
    let tieneUsuario = false;
    if (retorno.RespuestaBase) {
      if (retorno.RespuestaBase.CodigoMensaje == 0) {
        //esta todo ok
        var user;
        var userFamilia;
        if (retorno.UsuarioAps) {
          user = JSON.stringify(retorno.UsuarioAps);
          //antes debemos validar si tiene entidad contratante
          if (user.NodId && this.parametrosApp.USA_ENTIDAD_CONTRATANTE()) {
            //usa entidad contratante y tiene nodo
            if (retorno.UsuarioAps.EntidadContratante && retorno.UsuarioAps.EntidadContratante.length > 0) {
              //tiene entidad contratante
              tieneUsuario = true;
              this.setDatosUsuario(retorno, user, userFamilia);
              loader.dismiss();
              this.estaCargando = false;
            }
            else {
              //no tiene entidad contratante
              this.utiles.presentToast("No tiene entidad contratante asociada", "middle", 3000);
              loader.dismiss();
              this.estaCargando = false;
              return;
            }
          }
          else {
            //no usa entidad contratante
            tieneUsuario = true;
            this.setDatosUsuario(retorno, user, userFamilia);
            loader.dismiss();
            this.estaCargando = false;
          }

        }

        //si tiene usuario está valido
        if (!tieneUsuario) {
          this.utiles.presentToast("Tiene registro correcto, pero no cuenta con información en la red de salud.", "middle", 3000);
        }
        this.crearToken();
        //guardamos el registro de session
        this.registrarEntrada();
        this.irAHome();
      }
      else {
        this.loggedIn = false;
        this.CodigoMensaje = retorno.RespuestaBase.CodigoMensaje;
        this.Mensaje = retorno.RespuestaBase.Mensaje;
        this.loggedIn = true;
        loader.dismiss();
        this.estaCargando = false;
        this.utiles.presentToast(this.Mensaje, 'middle', 4000);
        return;
      }

    }
    else {
      //error también
      this.loggedIn = false;
      this.CodigoMensaje = 1000;
      this.Mensaje = 'Error de llamada Http;';
      this.loggedIn = true;
      this.estaCargando = false;
      loader.dismiss();
      this.utiles.presentToast(this.Mensaje, 'middle', 4000);
      return;
    }
  }
  irAHome() {
    this.navCtrl.navigateRoot('home');
  }
  irRecuperarClave() {
    this.navCtrl.navigateRoot('recuperar-clave');
  }
  get f() { return this.forma.controls; }
}
