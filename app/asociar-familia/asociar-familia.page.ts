import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, ToastController, Platform, ModalController, LoadingController, MenuController, IonList, AlertController } from '@ionic/angular';
//parametros
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
//SERVICIOS
import { ServicioUtiles } from '../../app/services/ServicioUtiles';
import { ServicioGeo } from '../../app/services/ServicioGeo';
import { ServicioAcceso } from '../../app/services/ServicioAcceso';
import { ServicioParametrosApp } from '../../app/services/ServicioParametrosApp';

@Component({
  selector: 'app-asociar-familia',
  templateUrl: './asociar-familia.page.html',
  styleUrls: ['./asociar-familia.page.scss'],
})
export class AsociarFamiliaPage implements OnInit {
  familiaAsociar = [];
  estaCargando = false;
  tituloProgress = '';
  //autentificacion
  nombreUsuario = '';
  password = '';
  isLogged: boolean;
  loggedIn: boolean;
  CodigoMensaje: any;
  Mensaje: string;
  //para validarse solo con enrolamiento
  usaEnrolamiento = false;
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
    public servicioGeo: ServicioGeo,
    public acceso: ServicioAcceso,
    public parametrosApp: ServicioParametrosApp,
    private alertController: AlertController,
  ) { }

  ngOnInit() {
    this.usaEnrolamiento = this.parametrosApp.USA_LOGIN_ENROLAMIENTO();
    if (localStorage.getItem('REGISTRO')) {
      let registro = JSON.parse(localStorage.getItem('REGISTRO'));
      if (this.usaEnrolamiento) {
        localStorage.setItem('TIENE_REGISTRO', 'false');
      }
      this.nombreUsuario = registro.Run;
      this.password = registro.Password;
    }
    this.buscar();
  }
  buscar() {
    if (localStorage.getItem('FAMILIA-POR-ACEPTAR')) {
      let arrFam = JSON.parse(localStorage.getItem('FAMILIA-POR-ACEPTAR'));
      if (arrFam.length > 0) {
        for (var i = 0; i < arrFam.length; i++) {
          arrFam[i].Run = this.utiles.insertarGuion(arrFam[i].Run);
          if (arrFam[i].Aceptado == 1) {
            arrFam[i].EsAceptado = true;
          }
          else {
            arrFam[i].EsAceptado = false;
          }
        }
        this.familiaAsociar = arrFam;
        //console.log(this.familiaAsociar);
      }
    }
  }
  async procesarFamilia() {
    //tomar los miembros aceptados y crear un arr de string
    if (this.familiaAsociar && this.familiaAsociar.length > 0) {
      let uspIdTitular = this.familiaAsociar[0].UspIdTitular.toString();
      let arrString = [];
      for (let i = 0; i < this.familiaAsociar.length; i++) {
        const element = this.familiaAsociar[i];
        if (element.EsAceptado) {
          arrString.push(element.UspId.toString());
        }
      }
      //si no hay elementos aceptados asignaremos un 0 para que no se caiga el server
      if (arrString && arrString.length == 0) {
        arrString.push("0");
      }
      //tomamos los elementos a guardar
      //console.log(uspIdTitular);
      //console.log(arrString.toString());
      //ahora que tenemos los elementos procedemos a ejecutar el proceso
      this.estaCargando = true;
      this.tituloProgress = 'Guardando información de la familia'
      let loader = await this.loading.create({
        cssClass: 'loading-vacio',
        showBackdrop: false,
        spinner: null,
      });

      await loader.present().then(async () => {
        if (!this.utiles.isAppOnDevice()) {
          //llamada web
          this.servicioGeo.actualizaFamilia(arrString.toString(), uspIdTitular).subscribe((data) => {
            let respuesta = data;
            if (respuesta) {
              loader.dismiss();
              this.estaCargando = false;
              this.tituloProgress = '';
              //correcto, hay que volver a autentificarse
              //console.log('autentificarse');
              this.autentificarse();
            }
            else {
              loader.dismiss();
              this.estaCargando = false;
              this.tituloProgress = '';
              this.utiles.presentToast('Ocurrió un error al asociar familia', 'bottom', 3000);
            }

          }, error => {
            console.log(error.message);
            loader.dismiss();
            this.estaCargando = false;
            this.tituloProgress = '';
            this.utiles.presentToast('Ocurrió un error al asociar familia', 'bottom', 3000);
          });
        }
        else {
          //llamada nativa
          this.servicioGeo.actualizaFamiliaNative(arrString.toString(), uspIdTitular).then((data) => {
            let respuesta = JSON.parse(data.data);
            if (respuesta) {
              loader.dismiss();
              this.estaCargando = false;
              this.tituloProgress = '';
              //correcto, hay que volver a autentificarse
              //console.log('autentificarse');
              this.autentificarse();
            }
            else {
              loader.dismiss();
              this.estaCargando = false;
              this.tituloProgress = '';
              this.utiles.presentToast('Ocurrió un error al asociar familia', 'bottom', 3000);
            }

          }).catch(error => {
            console.log(error.message);
            loader.dismiss();
            this.estaCargando = false;
            this.tituloProgress = '';
            this.utiles.presentToast('Ocurrió un error al asociar familia', 'bottom', 3000);
          });
        }
      });

    }
  }
  onSubmit() {
    if (this.familiaAsociar && this.familiaAsociar.length > 0) {
      let cantidadMiembros = this.familiaAsociar.length;
      let miembrosAceptados = this.familiaAsociar.filter(p => p.EsAceptado == true);
      if (miembrosAceptados.length < cantidadMiembros) {
        //console.log('infromar que no esta aceptando a todos los miembros, si esta seguro de continuar');
        let header = "Aviso";
        let message = "Hay al menos un miembro de la familia al cual no está aceptando. Posteriormente lo puede volver a aceptar en Activar/Desactivar integrantes. \n¿Está seguro de continuar?.";
        this.presentAlertConfirm(header, message);
      }
      else {
        //console.log('esta aceptando a todos los miembros');
        this.procesarFamilia();
      }
    }
    else {
      this.utiles.presentToast('No hay miembros de la familia a asociar', 'bottom', 3000);
    }
    //console.log(this.familiaAsociar);

  }
  async presentAlertConfirm(header, message) {

    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'danger',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Si',
          cssClass: 'success',
          handler: () => {
            //aca debemos realizar la operación
            this.procesarFamilia();
          }
        }
      ]
    });

    await alert.present();
  }

  //metodos de autentificacion
  async autentificarse() {
    //en este caso ya el user name es el email

    let f = { UserName: this.nombreUsuario, Password: this.password, UsaEnrolamiento: this.usaEnrolamiento, TokenFCM: this.utiles.entregaTokenFCM() };

    this.estaCargando = true;
    this.tituloProgress = 'Volviendo a autentificar, espere un momento'
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
            console.log(error.message);
            loader.dismiss();
            this.estaCargando = false;
            this.tituloProgress = '';
            return;
          });
      }
      else {
        //llamada nativa
        this.acceso.loginWebNative(f).then((response: any) => {
          this.procesarLogin(JSON.parse(response.data), loader);
        },
          (error) => {
            console.log(error.message);
            this.utiles.presentToast('Ocurrió un error de autentificación', 'bottom', 4000);
            this.estaCargando = false;
            loader.dismiss();
            this.tituloProgress = '';
            return;
          }
        );
      }
    })
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
              this.tituloProgress = '';
            }
            else {
              //no tiene entidad contratante
              this.utiles.presentToast("No tiene entidad contratante asociada", "middle", 3000);
              loader.dismiss();
              this.estaCargando = false;
              this.tituloProgress = '';
              return;
            }
          }
          else {
            //no usa entidad contratante
            tieneUsuario = true;
            this.setDatosUsuario(retorno, user, userFamilia);
            loader.dismiss();
            this.estaCargando = false;
            this.tituloProgress = '';
          }

        }

        //si tiene usuario está valido
        if (!tieneUsuario) {
          this.utiles.presentToast("Tiene registro correcto, pero no cuenta con información en la red de salud.", "middle", 3000);
        }
        this.irAHome();
      }
      else {
        this.CodigoMensaje = retorno.RespuestaBase.CodigoMensaje;
        this.Mensaje = retorno.RespuestaBase.Mensaje;
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
  }

  irAHome() {
    this.navCtrl.navigateRoot('home');
  }

}
