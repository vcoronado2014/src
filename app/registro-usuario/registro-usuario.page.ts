import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { FormGroup, Validators, FormBuilder, FormControl, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
//servicios
import { ServicioUtiles } from '../../app/services/ServicioUtiles';
import { ServicioGeo } from '../../app/services/ServicioGeo';
import { ServicioAcceso } from '../../app/services/ServicioAcceso';
import { ServicioParametrosApp } from '../../app/services/ServicioParametrosApp';
import { NavigationExtras } from '@angular/router';
import { MatInput } from '@angular/material/input';

import * as moment from 'moment';

@Component({
  selector: 'app-registro-usuario',
  templateUrl: './registro-usuario.page.html',
  styleUrls: ['./registro-usuario.page.scss'],
})
export class RegistroUsuarioPage implements OnInit {
  options: InAppBrowserOptions = {
    location: 'yes',
  };
  registro;
  forma: FormGroup;
  nombreMostrar;
  //para validar
  patternOnlyLetter = '[a-zA-ZÀ-ÿ\u00f1\u00d1]+(\s*[a-zA-ZÀ-ÿ\u00f1\u00d1]*)*[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$';
  expCelular = /^(\+?56)?(\s?)(0?9)(\s?)[9876543]\d{7}$/gm;
  expPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,8}$/gm;
  expEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/gm;
  expAceptaCondiciones = true;
  isLogged: boolean;
  loggedIn: boolean;
  CodigoMensaje: any;
  Mensaje: string;
  estaEditando = false;
  estaAgregandoFamilia = false;
  //para validarse solo con enrolamiento
  usaEnrolamiento = false;
  //para el progressbar
  estaCargando = false;
  tituloLoading = '';
  //acepta CONDICIONES
  rutaAceptoCondiciones;
  //aceptaCondiciones = true;

  //focus
  @ViewChild('nombreId', { static: true }) nombreInput: MatInput;
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
    public alertController: AlertController,
    public inap: InAppBrowser,
  ) { }

  ngOnInit() {
    moment.locale('es');
    this.usaEnrolamiento = this.parametrosApp.USA_LOGIN_ENROLAMIENTO();
    this.rutaAceptoCondiciones = this.parametrosApp.URL_ACEPTA_CONDICIONES();
    this.activatedRoute.queryParams.subscribe(params => {
      if (params && params.usuario) {
        //store the temp in data        
        this.registro = JSON.parse(params.usuario);
        this.nombreMostrar = this.registro.Nombres + " " + this.registro.Apellidos;
        //console.log(this.registro);
        if (params.EstaEditando && params.EstaEditando != null) {
          //esta editando al usuario
          this.estaEditando = true;
        }
        if (params.estaAgregandoFamilia && params.estaAgregandoFamilia != null) {

          this.estaAgregandoFamilia = true;
        }
        if (!this.estaEditando) {
          this.nombreMostrar = 'Nuevo registro';
        }
        //cargamos la forma
        this.cargarForma();
      }
    });
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.nombreInput.focus();
    }, 1000);
  }
  cargarForma() {
    this.forma = new FormGroup({
      'run': new FormControl({ value: '', disabled: this.estaEditando }, [Validators.required]),
      'email': new FormControl({ value: '', disabled: this.estaEditando }, [Validators.required, Validators.pattern(this.expEmail)]),
      'nombre': new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(this.patternOnlyLetter)]),
      'apellido': new FormControl('', [Validators.required, Validators.pattern(this.patternOnlyLetter)]),
      'nombreSocial': new FormControl('', [Validators.maxLength(100)]),
      'telefono': new FormControl('', [Validators.pattern(this.expCelular)]),
      'genero': new FormControl(),
      'aceptaCondiciones': new FormControl(true, [Validators.requiredTrue]),
      'clave': new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]),
      'repetirClave': new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(10)])
    }, { validators: this.EmailIgualesValidator });
    if (this.registro && this.registro.Id >= 0) {
      let sexo = this.registro.Sexo != null ? this.registro.Sexo.toString() : "-1";
      this.forma.setValue({
        run: this.registro.Run,
        email: this.registro.CorreoElectronico,
        nombre: this.registro.Nombres.trimStart(),
        apellido: this.registro.Apellidos.trimStart(),
        nombreSocial: this.registro.Apodo.trimStart(),
        telefono: this.registro.TelefonoContacto ? this.registro.TelefonoContacto : '',
        genero: sexo,
        aceptaCondiciones: true,
        clave: '',
        repetirClave: ''
      })
      //si esta editando hay que cambiar algunas cosas
      if (this.estaEditando) {
        this.forma.get('clave').clearValidators();
        this.forma.get('repetirClave').clearValidators();
      }
      else {
        //esto no esta claro, yo creo que siempre debería estar deshabilitado
        //ya que viene del pre-registro y la edición no debería cambiar tampoco 
        //estos datos.
        this.forma.controls['run'].disable();
        this.forma.controls['email'].disable();
      }
      /*       if (this.estaEditando){
              //desactivar algunas cosas
              this.forma.controls['run'].disable();
              this.forma.controls['email'].disable();
            } */
    }
  }
  EmailIgualesValidator: ValidatorFn = (fg: FormGroup) => {
    const clave = fg.get('clave').value;
    const claveR = fg.get('repetirClave').value;
    if (clave !== null && claveR !== null && clave != claveR) {
      this.forma.controls.repetirClave.setErrors({ clavesIguales: false });
    }
    return clave !== null && claveR !== null && clave != claveR ? null : null;
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
          //variable de sessión muy importante para el resto de la app.
          sessionStorage.setItem("UsuarioAps", user);
          localStorage.setItem('MI_RUT', retorno.UsuarioAps.Rut);
          localStorage.setItem('MI_NOMBRE', retorno.UsuarioAps.Nombres + ' ' + retorno.UsuarioAps.ApellidoPaterno);
          localStorage.setItem('MI_COLOR', retorno.UsuarioAps.Color);
          localStorage.setItem('MI_IMAGEN', retorno.UsuarioAps.UrlImagen);
          //lo vamos a guardar en el local storage para realizar la llamada
          //en el background
          localStorage.setItem('UsuarioAps', user);
          tieneUsuario = true;
        }
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
        loader.dismiss();
        this.estaCargando = false;
        this.tituloLoading = '';
        //si tiene usuario está valido
        if (!tieneUsuario) {
          this.utiles.presentToast("Tiene registro correcto, pero no cuenta con información en la red de salud.", "middle", 3000);
        }
        //this.crearToken();
        this.irAHome();
      }
      else {
        this.loggedIn = false;
        this.CodigoMensaje = retorno.RespuestaBase.CodigoMensaje;
        this.Mensaje = retorno.RespuestaBase.Mensaje;
        this.loggedIn = true;
        loader.dismiss();
        this.estaCargando = false;
        this.tituloLoading = '';
        this.utiles.presentToast(this.Mensaje, 'middle', 4000);
      }

    }
    else {
      //error también
      this.loggedIn = false;
      this.CodigoMensaje = 1000;
      this.Mensaje = 'Error de llamada Http;';
      this.loggedIn = true;
      loader.dismiss();
      this.estaCargando = false;
      this.tituloLoading = '';
      this.utiles.presentToast(this.Mensaje, 'middle', 4000);
    }
  }
  irAHome() {
    this.navCtrl.navigateRoot('home');
  }

  async autentificarse(userName, password) {
    //en este caso ya el user name es el email
    let f = { UserName: userName, Password: password, UsaEnrolamiento: this.usaEnrolamiento, TokenFCM: this.utiles.entregaTokenFCM() };
    //original
    /*     let loader = await this.loading.create({
          message: 'Obteniendo...<br>Login',
          duration: 10000
        }); */
    this.estaCargando = true;
    this.tituloLoading = 'Autentificándose';

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
        }, error => {
          console.log(error.message);
          loader.dismiss();
          this.estaCargando = false;
          this.tituloLoading = '';
        });
      }
      else {
        //llamada nativa
        this.acceso.loginWebNative(f).then((response: any) => {
          this.procesarLogin(JSON.parse(response.data), loader);
        },
          (error) => {
            console.log(error.message);
            loader.dismiss();
            this.estaCargando = false;
            this.tituloLoading = '';
            this.utiles.presentToast('Ocurrió un error de autentificación', 'bottom', 4000);
          }
        );
      }
    })

  }
  async salirRegistro() {
    var titulo = '';
    this.navCtrl.navigateRoot('inicio');
  }

  async onSubmit() {
    if (this.forma.invalid) {
      return;
    }
    //aca seguir con el formulario
    //seteamos los valores para enviar el formulario
    var fechaNac = moment();
    if (this.registro.FechaNacimiento) {
      fechaNac = moment(this.registro.FechaNacimiento);
    }
    var pass = "";
    pass = this.forma.controls.clave ? this.utiles.encriptar(this.forma.controls.clave.value) : '';
    var entidadRegistro = {
      Id: this.registro.Id.toString(),
      Nombres: this.forma.controls.nombre ? this.forma.controls.nombre.value : '',
      Apellidos: this.forma.controls.apellido ? this.forma.controls.apellido.value : '',
      CorreoElectronico: this.forma.controls.email ? this.forma.controls.email.value : '',
      NombreUsuario: this.forma.controls.email ? this.forma.controls.email.value : '',
      //dejare por defecto genero no definido
      Sexo: this.forma.controls.genero ? this.forma.controls.genero.value : 2,
      DiaNacimiento: fechaNac.date(),
      MesNacimiento: fechaNac.month() + 1,
      AnioNacimiento: fechaNac.year(),
      Pais: localStorage.getItem('pais'),
      Provincia: localStorage.getItem('provincia'),
      Region: localStorage.getItem('region'),
      Comuna: localStorage.getItem('comuna'),
      Password: pass,
      ModoRegistro: 1,
      Apodo: this.forma.controls.nombreSocial ? this.forma.controls.nombreSocial.value : '',
      Avatar: '',
      VersionAppName: localStorage.getItem('version_app_name'),
      IdDispositivo: localStorage.getItem('token_dispositivo'),
      Plataforma: localStorage.getItem('plataforma'),
      VersionAppNumber: localStorage.getItem('version_number'),
      TelefonoContacto: this.forma.controls.telefono ? this.forma.controls.telefono.value : '',
      Latitud: sessionStorage.getItem('latitud'),
      Longitud: sessionStorage.getItem('longitud'),
      Eliminado: '0',
      Activo: '1',
      Run: this.forma.controls.run ? this.forma.controls.run.value : ''
    };
    //console.log(entidadRegistro);
    //antes de guardar
    if (this.estaEditando) {
      //hay que validar las password en caso que las ingrese porque se quito que fueran
      //requeridas cuando se edita
      var passEdt = "";
      var repitaPassEdt = ""
      passEdt = this.forma.controls.clave ? this.utiles.encriptar(this.forma.controls.clave.value) : '';
      repitaPassEdt = this.forma.controls.repetirClave ? this.utiles.encriptar(this.forma.controls.repetirClave.value) : '';
      if (passEdt != '' || repitaPassEdt != '') {
        if (passEdt != repitaPassEdt) {
          this.utiles.presentToast("Está cambiando su password, estas deben coincidir", "bottom", 3000);
          return;
        }
      }
    }
    //ahora guardamos
    //original
    /*     let loader = await this.loading.create({
          message: this.estaEditando ? 'Modificando...<br>Registro' : 'Creando...<br>Registro',
          duration: 20000
        }); */
    this.estaCargando = true;
    this.tituloLoading = 'Guardando el registro en la app';

    let loader = await this.loading.create({
      cssClass: 'loading-vacio',
      showBackdrop: false,
      spinner: null,
    });


    await loader.present().then(async () => {
      if (!this.utiles.isAppOnDevice()) {
        //llamada web
        this.servicioGeo.postRegistroFamilia(entidadRegistro).subscribe((data) => {
          let respuesta = data;
          localStorage.setItem('REGISTRO', JSON.stringify(respuesta));
          localStorage.setItem('TIENE_REGISTRO', 'true');
          loader.dismiss();
          //progress bar
          this.estaCargando = false;
          this.tituloLoading = '';
          if (localStorage.getItem('STATE_CLAVE_UNICA')) {
            var state = localStorage.getItem('STATE_CLAVE_UNICA');
            //ACA HAY QUE HACER EL PROCESO DE ELIMINACION DEL REGISTRO Y LUEGO CONTINUAR
            this.descartarCU(entidadRegistro.Run, state, entidadRegistro.Run, entidadRegistro.Password);
          }
          else {
            //hay que mandarlo autentificado y con los datos del usuario aps
            //ver que hacemos aca
            if (this.estaEditando) {
              this.utiles.presentToast("Registro modificado con éxito", "bottom", 2000);
            }
            if (this.estaAgregandoFamilia) {
              //hacer la operacion para agregar al usuario a la familia
              console.log('ESTA AGREGANDO FAMILIA');
            }
            else {
              //si tiene pre-registro, hay que eliminarlo
              if (localStorage.getItem('PRE-REGISTRO')) {
                localStorage.removeItem('PRE-REGISTRO');
              }
              console.log('autentificarse');
              //lo comentamos por mientras
              this.autentificarse(entidadRegistro.Run, entidadRegistro.Password);
            }

          }

        })
      }
      else {
        //llamada nativa
        this.servicioGeo.postRegistroFamiliaNative(entidadRegistro).then((data) => {
          let respuesta = JSON.parse(data.data);
          localStorage.setItem('REGISTRO', JSON.stringify(respuesta));
          localStorage.setItem('TIENE_REGISTRO', 'true');
          loader.dismiss();
          //progress bar
          this.estaCargando = false;
          this.tituloLoading = '';
          if (localStorage.getItem('STATE_CLAVE_UNICA')) {
            var state = localStorage.getItem('STATE_CLAVE_UNICA');
            //ACA HAY QUE HACER EL PROCESO DE ELIMINACION DEL REGISTRO Y LUEGO CONTINUAR
            this.descartarCU(entidadRegistro.Run, state, entidadRegistro.Run, entidadRegistro.Password);
          }
          else {
            //hay que mandarlo autentificado y con los datos del usuario aps
            //ver que hacemos aca
            if (this.estaEditando) {
              this.utiles.presentToast("Registro modificado con éxito", "bottom", 2000);
            }
            if (this.estaAgregandoFamilia) {
              //hacer la operacion para agregar al usuario a la familia
              console.log('ESTA AGREGANDO FAMILIA');
            }
            else {
              //si tiene pre-registro, hay que eliminarlo
              if (localStorage.getItem('PRE-REGISTRO')) {
                localStorage.removeItem('PRE-REGISTRO');
              }
              console.log('autentificarse');
              //lo comentamos por mientras
              this.autentificarse(entidadRegistro.Run, entidadRegistro.Password);
            }
          }
        })
      }
    })


  }
  async descartarCU(run, state, usuario, passord) {
    let loader2 = await this.loading.create({
      message: 'Descartando...<br>Registro Clave única',
      duration: 3000
    });

    await loader2.present().then(async () => {
      if (!this.utiles.isAppOnDevice()) {
        //web
        this.servicioGeo.postValidacionClaveUnica(run, state).subscribe((response: any) => {
          //aca quedamos, no habría que hacer nada
          //console.log(response);
          localStorage.removeItem('STATE_CLAVE_UNICA');
          loader2.dismiss();
          //aca finalmente mandarlo a autentificar
          if (this.estaAgregandoFamilia) {
            //guardar los datos en la familia
            console.log('ESTA AGREGANDO FAMILIA');
          }
          else {
            this.autentificarse(usuario, passord);
          }

        })
      }
      else {
        //nativa
        this.servicioGeo.postValidacionClaveUnicaNative(run, state).then((response: any) => {
          var responseData = JSON.parse(response.data);
          //console.log(responseData);
          localStorage.removeItem('STATE_CLAVE_UNICA');
          loader2.dismiss();
          //aca mandarlo a autentificar
          if (this.estaAgregandoFamilia) {
            //guardar los datos en la familia
            console.log('ESTA AGREGANDO FAMILIA');
          }
          else {
            this.autentificarse(usuario, passord);
          }
        })
      }
    })
  }

  async validarCorreo(event) {
    //let correo = event.target.value;
    //console.log(event);
    let correo = this.forma.controls.email.value;
    let loader = await this.loading.create({
      message: 'Verificando...<br>Correo electrónico',
      duration: 3000
    });

    await loader.present().then(async () => {
      if (!this.utiles.isAppOnDevice()) {
        //llamada web
        this.servicioGeo.postValidarCorreo(correo).subscribe((response: any) => {
          //procesar
          if (response && response.CodigoMensaje != 0) {
            this.utiles.presentToast(response.Mensaje, "middle", 3000);
            this.forma.controls.email.setValue('');
          }
        })
      }
      else {
        //llamada nativa
        this.servicioGeo.postValidarCorreoNative(correo).then((response: any) => {
          //procesar JSON.parse(response.data)
          var responseData = JSON.parse(response.data);
          if (response && response.CodigoMensaje != 0) {
            this.utiles.presentToast(response.Mensaje, "middle", 3000);
            this.forma.controls.email.setValue('');
          }
        },
          (error) => {
            this.utiles.presentToast('Ocurrió un al procesar clave única', 'bottom', 4000);
          }
        );
      }
    });

  }
  onChangeAcepta(event) {
    if (event.detail) {
      //this.aceptaCondiciones = event.detail.checked;
      if (event.detail.checked == false) {
        this.utiles.presentToast("Para continuar debe aceptar las condiciones del servicio, puede revisar las condiciones haciendo click en el ícono al costado derecho del check.", "middle", 3000);
      }
    }
  }
  abrirPDF(){
    if (this.rutaAceptoCondiciones != '#'){
      //abrir en una ventana nueva
      if (this.utiles.isAppOnDevice()){
        let target = "_system";
        this.inap.create(encodeURI(this.rutaAceptoCondiciones), target, this.options);
      }
      else {
        //web
        window.open(encodeURI(this.rutaAceptoCondiciones), "_system", "location=yes");
      }
    }
  }

  get f() { return this.forma.controls; }

}
