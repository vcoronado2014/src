import { AfterViewInit, Component, OnInit, ViewChild, ɵConsole } from '@angular/core';
import { NavController, ToastController, Platform, ModalController, LoadingController, IonSlides } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Device } from '@ionic-native/device/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
//servicios
import { ServicioUtiles } from '../../app/services/ServicioUtiles';
import { ServicioGeo } from '../../app/services/ServicioGeo';
import { ServicioAcceso } from '../../app/services/ServicioAcceso';
import { ServicioParametrosApp } from '../../app/services/ServicioParametrosApp';
import { NavigationExtras } from '@angular/router';

import * as moment from 'moment';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {

  @ViewChild('mySlider', { static: true }) slides: IonSlides;

  cargando = false;
  //datos politicos
  comuna;
  region;
  provincia;
  pais;
  //nuevo slide
  slideOpts = {
    initialSlide: 0,
    speed: 500
  };
  preRegistro: any;
  constructor(
    public navCtrl: NavController,
    public toast: ToastController,
    public modalCtrl: ModalController,
    public platform: Platform,
    private route: ActivatedRoute,
    private router: Router,
    public geolocation: Geolocation,
    public device: Device,
    public appVersion: AppVersion,
    public loading: LoadingController,
    public utiles: ServicioUtiles,
    public servicioGeo: ServicioGeo,
    public acceso: ServicioAcceso,
    public parametrosApp: ServicioParametrosApp,
  ) {

    platform.ready().then(() => {
      //geolocation
      this.geolocation.getCurrentPosition().then((resp) => {
        sessionStorage.setItem("latitud", JSON.stringify(resp.coords.latitude));
        sessionStorage.setItem("longitud", JSON.stringify(resp.coords.longitude));
        var lat = sessionStorage.getItem('latitud');
        var lon = sessionStorage.getItem('longitud');
        this.doGeocode(lat, lon);

      }).catch((error) => {
        console.log('Error getting location', error);
      });
    });
  }

  ngOnInit() {
    let tieneValidacionCU = false;
    //primero validamos si usa clave unica
    //por ahora esta deshabilitado hasta que alguien quiera
    //implementar, pero será por su cuenta
    if (this.parametrosApp.USA_CLAVE_UNICA()) {
      if (localStorage.getItem('STATE_CLAVE_UNICA')) {
        let stateClaveUnica = localStorage.getItem('STATE_CLAVE_UNICA');
        let objeto = { Run: '', Fecha: '', Tipo: '' };
        if (stateClaveUnica != '') {
          //descompnemos el state
          let stateCompleto = this.utiles.desencriptar(stateClaveUnica);
          let arr = stateCompleto.split('|');
          if (arr && arr.length == 3) {
            objeto.Run = arr[0],
              objeto.Fecha = arr[1];
            objeto.Tipo = arr[2];
          }

        }
        tieneValidacionCU = true;
        this.verificaRegistroClaveUnica(stateClaveUnica, objeto);
      }
    }

    this.VerificarRegistro(tieneValidacionCU);

  }
  abrirLogin() {
    //this.navCtrl.navigateRoot('nuevo-login');
    //this.navCtrl.navigateForward('nuevo-login');
    this.router.navigateByUrl('/nuevo-login', { replaceUrl: true });
  }
  abrirPrimerosPasos() {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        modulo: 'inicio'
      }
    }
    //this.navCtrl.navigateRoot(['pre-registro-uno'], navigationExtras);
    //this.navCtrl.navigateForward(['pre-registro-uno'], navigationExtras);
    this.navCtrl.navigateRoot(['step-uno-registro'], navigationExtras);
  }
  irARegistro(registroIncompleto) {
    //enviar registroIncompleto
    if (registroIncompleto) {
      const navigationExtras: NavigationExtras = {
        queryParams: {
          usuario: JSON.stringify(registroIncompleto)
        }
      };
      //this.navCtrl.navigateRoot(['registro-usuario'], navigationExtras);
      this.navCtrl.navigateForward(['registro-usuario'], navigationExtras);
    }

  }
  abrirValidacionFactor() {
    //this.navCtrl.navigateRoot('validacion-factor');
    this.navCtrl.navigateForward('validacion-factor');
  }

  async procesarRespuestaCU(registros, loader, run, state) {
    let estaCorrecto = false;
    if (registros && registros.length > 0) {
      let regCorrecto = registros.filter(p => p.Mensaje == 'correcto');
      let regInCorrecto = registros.filter(p => p.Mensaje != 'correcto');
      if (regCorrecto && regCorrecto.length > 0) {
        //si esta correcto lo derivamos a la pantalla de registro
        loader.dismiss();
        //pero guardamos un state que indique que esta correcto, así 
        //podemos capturarlo en la pagina de registro y cuando el registro se complete 
        //lo eliminamos
        sessionStorage.setItem('VALIDADO_CLAVE_UNICA', '1');
        //debemos setear un objeto de registro con los datos del usuario recuperado
        var regIncompleto = {
          Activo: 1,
          Apellidos: regCorrecto[0].Apellidos == null ? '' : regCorrecto[0].Apellidos,
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
          //registro mediante clave unica
          ModoRegistro: 3,
          NombreUsuario: "",
          Nombres: regCorrecto[0].Nombres,
          Pais: localStorage.getItem("pais"),
          Password: "",
          Plataforma: localStorage.getItem("plataforma"),
          Provincia: localStorage.getItem("provincia"),
          Run: regCorrecto[0].Run,
          TelefonoContacto: ''
        }
        this.irARegistro(regIncompleto);
      }
      else {
        if (regInCorrecto && regInCorrecto.length > 0) {
          //si esta incorrecto le informamos al usuario y borramos el registro
          //de clave unica
          let regErroneo = regInCorrecto[0];
          localStorage.removeItem('STATE_CLAVE_UNICA');
          this.utiles.presentToast(regErroneo.Mensaje, 'middle', 3000);
          loader.dismiss();
          //aperación async para eliminar el registro en este caso
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
                loader2.dismiss();
              })
            }
            else {
              //nativa
              this.servicioGeo.postValidacionClaveUnicaNative(run, state).then((response: any) => {
                var responseData = JSON.parse(response.data);
                //console.log(responseData);
                loader2.dismiss();
              })
            }
          })

        }
      }

    }
    else {
      this.utiles.presentToast("No se encontró registro CU", "middle", 2000);
      loader.dismiss();
    }
  }
  //este método se debe validar antes ya que puede tener una validación por clave unica
  async verificaRegistroClaveUnica(stateClaveUnica, stateObjeto) {
    //console.log(stateClaveUnica);
    //console.log(stateObjeto);
    //hay que traer el registro de clave unica
    //1. si el registro de clave unica esta correcto, hay que enviarlo al formulario de
    //   registro para que rellene los datos
    //1.1. hay que eliminar la variable de localstorage
    //1.2. hay que eliminar el registro de clave unica
    //2. si la validación de clave unica salió incorrecto
    //2.1. hay que informar al usuario.

    this.cargando = true;
    let loader = await this.loading.create({
      message: 'Verificando...<br>Registro Clave única',
      duration: 3000
    });

    await loader.present().then(async () => {
      if (!this.utiles.isAppOnDevice()) {
        //llamada web
        this.servicioGeo.getValidacionCU(stateObjeto.Run, stateClaveUnica).subscribe((response: any) => {
          //procesar
          //this.procesarInfoRun(response, loader);
          this.procesarRespuestaCU(response, loader, stateObjeto.Run, stateClaveUnica);
        })
      }
      else {
        //llamada nativa
        this.servicioGeo.getValidacionCUNative(stateObjeto.Run, stateClaveUnica).then((response: any) => {
          //procesar JSON.parse(response.data)
          var responseData = JSON.parse(response.data);
          this.procesarRespuestaCU(responseData, loader, stateObjeto.Run, stateClaveUnica);
        },
          (error) => {
            this.utiles.presentToast('Ocurrió un al procesar clave única', 'bottom', 4000);
          }
        );
      }
    });

  }
  //mecanismo para determinar si el usuario tiene registro
  async VerificarRegistroRun(run) {
    //let f = { UserName: this.usuario, Password: this.password };
    //this.utiles
    var idDispositivo = this.utiles.entregaIdDispositivo();
    this.cargando = true;
    let loader = await this.loading.create({
      message: 'Verificando...<br>Registro Run',
      duration: 3000
    });

    await loader.present().then(async () => {
      if (!this.utiles.isAppOnDevice()) {
        //llamada web
        this.servicioGeo.getRegistroAppRun(run, idDispositivo).subscribe((response: any) => {
          //procesar
          this.procesarInfoRun(response, loader);
        })
      }
      else {
        //llamada nativa
        this.servicioGeo.getRegistroAppNativeRun(run, idDispositivo).then((response: any) => {
          //procesar JSON.parse(response.data)
          this.procesarInfoRun(JSON.parse(response.data), loader);
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
  async VerificarRegistro(tieneRegistroCU) {
    if (tieneRegistroCU == false) {
      var idDispositivo = this.utiles.entregaIdDispositivo();
      this.cargando = true;
      let loader = await this.loading.create({
        message: 'Verificando...<br>Registro',
        duration: 3000
      });

      await loader.present().then(async () => {
        if (!this.utiles.isAppOnDevice()) {
          //llamada web
          this.servicioGeo.getRegistroApp(idDispositivo).subscribe((response: any) => {
            //procesar
            this.procesarInfo(response, loader);
          })
        }
        else {
          //llamada nativa
          this.servicioGeo.getRegistroAppNative(idDispositivo).then((response: any) => {
            //procesar JSON.parse(response.data)
            this.procesarInfo(JSON.parse(response.data), loader);
          },
            (error) => {
              console.log('No hay registro del dispositivo');
              //this.utiles.presentToast('Ocurrió un error de obtención identificador', 'bottom', 4000);
              loader.dismiss();
            }
          );
        }
      });

    }

  }
  procesarInfoRun(registro, loader) {
    //console.log(registro);
    if (registro == null) {
      //no tiene registro, hay que dejarlo acá
      console.log('no tiene registro');
      //limpiamos local storage
      this.limpiarRegistro();
      loader.dismiss();
    }
    else {
      //pasa a la pantalla login solo si tiene sus datos completos
      var tieneCorreo = !(registro.CorreoElectronico == null || registro.CorreoElectronico == "" || registro.CorreoElectronico == undefined);
      var tienePassword = !(registro.Password == null || registro.Password == "" || registro.Password == undefined);
      var tieneRun = !(registro.Run == null || registro.Run == "" || registro.Run == undefined);
      var tieneUsuario = !(registro.NombreUsuario == null || registro.NombreUsuario == "" || registro.NombreUsuario == undefined);
      if (tieneCorreo && tienePassword && tieneRun && tieneUsuario) {
        //correcto se va al login
        loader.dismiss();
        this.abrirLogin();
      }
      else {
        loader.dismiss();
        this.limpiarRegistro();

      }

    }
  }
  procesarInfo(registro, loader) {
    //console.log(registro);
    if (registro == null) {
      loader.dismiss();
      //nueva funcionalidad... el usuario puede haberse logueado y esta validación va a 
      //buscar el registro mediante el idDispositivo, por lo tanto si ya accedió entonces 
      //ocupamos otras variables de local storage para determinar si enviarlo al login o no
      var tieneUsuPass = this.utiles.tieneUsuarioYPassword() && this.validaPreRegistro() == false;
      if (tieneUsuPass) {
        this.abrirLogin();
      }
      else {
        //no tiene registro, hay que dejarlo acá
        //console.log('no tiene registro');
        //limpiamos local storage
        this.limpiarRegistro();
        let tieneRegistroPendiente = this.validaPreRegistro();
        if (tieneRegistroPendiente) {
          //si tiene registro pendiente se envía a la página de autentificación
          this.abrirValidacionFactor();
        }
      }
    }
    else {
      //pasa a la pantalla login solo si tiene sus datos completos
      var tieneCorreo = !(registro.CorreoElectronico == null || registro.CorreoElectronico == "" || registro.CorreoElectronico == undefined);
      var tienePassword = !(registro.Password == null || registro.Password == "" || registro.Password == undefined);
      var tieneRun = !(registro.Run == null || registro.Run == "" || registro.Run == undefined);
      var tieneUsuario = !(registro.NombreUsuario == null || registro.NombreUsuario == "" || registro.NombreUsuario == undefined);
      if (tieneCorreo && tienePassword && tieneRun && tieneUsuario) {
        //correcto se va al login
        loader.dismiss();
        this.abrirLogin();
      }
      else {
        loader.dismiss();
        //lo volvemos a buscar, pero esta vez con el run
        let run = registro.Run;
        this.VerificarRegistroRun(run);
        //this.limpiarRegistro();
      }

    }
  }
  limpiarRegistro() {
    localStorage.removeItem("REGISTRO");
    localStorage.removeItem("MI_NOMBRE");
    localStorage.removeItem("MI_RUT");
    localStorage.removeItem("UsuarioAps");
    localStorage.setItem("TIENE_REGISTRO", "false");
  }
  doGeocodeNative(lat, lon) {
    //antes para omitir tantas llamadas vamos a buscar la info
    //a local storage comuna region provincia pais
    this.comuna = localStorage.getItem('comuna');
    this.region = localStorage.getItem('region');
    this.provincia = localStorage.getItem('provincia');
    this.pais = localStorage.getItem('pais');
    if (this.comuna && this.pais && this.region && this.provincia) {
      console.log('Datos politicos existentes');
    }
    else {
      /* if (this.status == ConnectionStatus.Online) { */
      this.servicioGeo.getMapaNative(lat, lon).then(response => {
        //console.log(data);
        this.utiles.procesarRespuestaMapa(JSON.parse(response.data));

      });

    }

  }
  doGeocode(lat, lon) {
    //antes para omitir tantas llamadas vamos a buscar la info
    //a local storage comuna region provincia pais
    this.comuna = localStorage.getItem('comuna');
    this.region = localStorage.getItem('region');
    this.provincia = localStorage.getItem('provincia');
    this.pais = localStorage.getItem('pais');
    if (this.comuna && this.pais && this.region && this.provincia) {
      console.log('Datos politicos existentes');

    }
    else {
      this.servicioGeo.getMapaWeb(lat, lon).subscribe(data => {
        //console.log(data);
        this.utiles.procesarRespuestaMapa(data);

      });
    }
  }
  procesarRespuestaMapa(objeto) {
    //lo cambiamos a local storage para hacerlo más global
    //y no consultar tantas veces para ocupar la api
    var retorno = false;
    try {
      if (objeto.results && objeto.results[0]) {
        if (objeto.results[0].address_components && objeto.results[0].address_components.length > 0) {
          //ahora recorremos los elementos
          objeto.results[0].address_components.forEach(element => {
            let busquedaCom = element.types.find(ele => ele == 'administrative_area_level_3');
            if (busquedaCom) {
              this.comuna = element.long_name;
              localStorage.setItem('comuna', this.comuna);
            }
            let busquedaReg = element.types.find(ele => ele == 'administrative_area_level_1');
            if (busquedaReg) {
              this.region = element.long_name;
              localStorage.setItem('region', this.region);
            }
            let busquedaProv = element.types.find(ele => ele == 'administrative_area_level_2');
            if (busquedaProv) {
              this.provincia = element.long_name;
              localStorage.setItem('provincia', this.provincia);
            }
            let busquedaPais = element.types.find(ele => ele == 'country');
            if (busquedaPais) {
              this.pais = element.long_name;
              localStorage.setItem('pais', this.pais);
            }
          });
        }
      }
      retorno = true;
    }
    catch (error) {
      console.log(error);

    }
    return retorno;

    //console.log(this.pais + ' ' + this.region);
  }
  //verificacion de pre-registro
  validaPreRegistro() {
    var retorno = false;
    if (localStorage.getItem('PRE-REGISTRO')) {
      this.preRegistro = JSON.parse(localStorage.getItem('PRE-REGISTRO'));
      if (this.preRegistro.Id > 0) {
        retorno = true;
      }
    }
    return retorno;
  }

}
