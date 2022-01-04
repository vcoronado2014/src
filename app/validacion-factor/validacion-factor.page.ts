import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NavController, ToastController, Platform, ModalController, LoadingController, MenuController, IonList } from '@ionic/angular';
import { FormGroup, Validators, FormBuilder, FormControl, ValidatorFn } from '@angular/forms';
//parametros
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
//SERVICIOS
import { ServicioUtiles } from '../../app/services/ServicioUtiles';
import { ServicioGeo } from '../../app/services/ServicioGeo';
import { environment } from 'src/environments/environment';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-validacion-factor',
  templateUrl: './validacion-factor.page.html',
  styleUrls: ['./validacion-factor.page.scss'],
})
export class ValidacionFactorPage implements OnInit {
  preRegistro: any;
  forma: FormGroup;

  estaCargando = false;
  tituloLoading = '';

  muestraMensaje = false;
  tituloMensaje = '';
  contenidoMensaje = '';
  irA = 'inicio';

  //elementos
  ///@ViewChild('codigo1', {static: true}) codigoUnoInput: any;
  @ViewChild('codigo1', { static: true }) codigoUnoInput: MatInput;
  @ViewChild('codigo2', { static: true }) codigoDosInput: MatInput;
  @ViewChild('codigo3', { static: true }) codigoTresInput: MatInput;
  @ViewChild('codigo4', { static: true }) codigoCuatroInput: MatInput;
  @ViewChild('codigo5', { static: true }) codigoCincoInput: MatInput;
  @ViewChild('codigo6', { static: true }) codigoSeisInput: MatInput;
  //@ViewChild('codigo1', {static: true}) codigoUnoInput: ElementRef;
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
  ) { }

  ngOnInit() {
    //lo volvemos a la pagina de inicio
    if (this.validaPreRegistro() == false) {
      this.utiles.presentToast('No cuentas con registro pendiente', 'bottom', 3000);
      this.navCtrl.navigateRoot('inicio');
    }
    this.cargarForma();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.codigoUnoInput.focus();
    }, 1000);
  }
  onKeypressEvent(event: any) {
    //console.log(event.target.value);
    if (event.currentTarget) {
      if (event.currentTarget.name == "codigoUno") {
        setTimeout(() => {
          this.codigoDosInput.focus();
        }, 100);
      }
      if (event.currentTarget.name == "codigoDos") {
        setTimeout(() => {
          this.codigoTresInput.focus();
        }, 100);
      }
      if (event.currentTarget.name == "codigoTres") {
        setTimeout(() => {
          this.codigoCuatroInput.focus();
        }, 100);
      }
      if (event.currentTarget.name == "codigoCuatro") {
        setTimeout(() => {
          this.codigoCincoInput.focus();
        }, 100);
      }
      if (event.currentTarget.name == "codigoCinco") {
        setTimeout(() => {
          this.codigoSeisInput.focus();
        }, 100);
      }
    }
  }

  /*   enviarFoco(){
      setTimeout(() => this.codigoUnoInput.focus(), 1000);
    } */

  cargarForma() {
    this.forma = new FormGroup({
      'codigoUno': new FormControl('', [Validators.required]),
      'codigoDos': new FormControl('', [Validators.required]),
      'codigoTres': new FormControl('', [Validators.required]),
      'codigoCuatro': new FormControl('', [Validators.required]),
      'codigoCinco': new FormControl('', [Validators.required]),
      'codigoSeis': new FormControl('', [Validators.required]),
    });
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

  async onSubmit() {
    if (this.forma.invalid) {
      return;
    }
    //obtenemos los valores a enviar
    let codUno = this.forma.controls.codigoUno.value;
    let codDos = this.forma.controls.codigoDos.value;
    let codTres = this.forma.controls.codigoTres.value;
    let codCuatro = this.forma.controls.codigoCuatro.value;
    let codCinco = this.forma.controls.codigoCinco.value;
    let codSeis = this.forma.controls.codigoSeis.value;
    let codigoCompleto = codUno + codDos + codTres + codCuatro + codCinco + codSeis;
    let idPreRegistro = "";
    if (this.preRegistro && this.preRegistro.Id > 0) {
      idPreRegistro = this.preRegistro.Id;
    }

    this.estaCargando = true;
    this.tituloLoading = 'Verificando solicitud de registro';
    let accion = 'confirmar';

    let loader = await this.loading.create({
      cssClass: 'loading-vacio',
      showBackdrop: false,
      spinner: null,
    });

    await loader.present().then(async () => {
      if (!this.utiles.isAppOnDevice()) {
        //llamada web
        this.servicioGeo.validaCodigo(idPreRegistro, codigoCompleto, accion).subscribe((response: any) => {
          //procesar
          var data = response;
          //la respuesta trae
          //CodigoMensaje, TextoMensaje, PreRegistroApp { Codigo, Correo, Eliminado, Estado, FechaHora, Id, Run (con guion) }
          if (data) {
            if (data.CodigoMensaje == 0) {
              //correcto
              loader.dismiss();
              this.estaCargando = false;
              this.tituloLoading = '';
              //limpiamos la localstorage
              //no deberíamos limpiar pre-registro, deberíamos limpiarlo en el registro cuando termine
              //localStorage.removeItem('PRE-REGISTRO');
              //ir a la pagina de registro
              this.irARegistro();
            }
            else {
              loader.dismiss();
              this.estaCargando = false;
              this.tituloLoading = '';
              //mensaje
              this.muestraMensaje = true;
              this.tituloMensaje = 'Mensaje';
              this.contenidoMensaje = data.TextoMensaje;
            }
          }
          else {
            loader.dismiss();
            this.estaCargando = false;
            this.tituloLoading = '';
            //mensaje
            this.muestraMensaje = true;
            this.tituloMensaje = 'Error de comunicación';
            this.contenidoMensaje = 'Hubo un error de comunicación, contacte al administrador.';
          }
        }, error => {
          console.log(error);
          loader.dismiss();
          this.estaCargando = false;
          this.tituloLoading = '';
        })
      }
      else {
        //llamada nativa
        this.servicioGeo.validaCodigoNative(idPreRegistro, codigoCompleto, accion).then((response: any) => {
          var data = JSON.parse(response.data);
          //la respuesta trae
          //CodigoMensaje, TextoMensaje, PreRegistroApp { Codigo, Correo, Eliminado, Estado, FechaHora, Id, Run (con guion) }
          if (data) {
            if (data.CodigoMensaje == 0) {
              //correcto
              loader.dismiss();
              this.estaCargando = false;
              this.tituloLoading = '';
              //limpiamos la localstorage
              //no deberíamos limpiar pre-registro, deberíamos limpiarlo en el registro cuando termine
              //localStorage.removeItem('PRE-REGISTRO');
              //ir a la pagina de registro
              this.irARegistro();
            }
            else {
              loader.dismiss();
              this.estaCargando = false;
              this.tituloLoading = '';
              //mensaje
              this.muestraMensaje = true;
              this.tituloMensaje = 'Mensaje';
              this.contenidoMensaje = data.TextoMensaje;
            }
          }
          else {
            loader.dismiss();
            this.estaCargando = false;
            this.tituloLoading = '';
            //mensaje
            this.muestraMensaje = true;
            this.tituloMensaje = 'Error de comunicación';
            this.contenidoMensaje = 'Hubo un error de comunicación, contacte al administrador.';
          }

        }).catch(error => {
          console.log(error);
          loader.dismiss();
          this.estaCargando = false;
          this.tituloLoading = '';
        });
      }
    });
  }

  async cancelarRegistro() {
    //aca da lo mismo el codigo ya que esta cancelando
    let codigoCompleto = "123456";
    let idPreRegistro = "";
    if (this.preRegistro && this.preRegistro.Id > 0) {
      idPreRegistro = this.preRegistro.Id;
    }

    this.estaCargando = true;
    this.tituloLoading = 'Verificando solicitud de registro';
    let accion = 'cancelar';

    let loader = await this.loading.create({
      cssClass: 'loading-vacio',
      showBackdrop: false,
      spinner: null,
    });

    await loader.present().then(async () => {
      if (!this.utiles.isAppOnDevice()) {
        //llamada web
        this.servicioGeo.validaCodigo(idPreRegistro, codigoCompleto, accion).subscribe((response: any) => {
          //procesar
          var data = response;
          //la respuesta trae
          //CodigoMensaje, TextoMensaje, PreRegistroApp { Codigo, Correo, Eliminado, Estado, FechaHora, Id, Run (con guion) }
          if (data) {
            if (data.CodigoMensaje == 0) {
              //correcto
              loader.dismiss();
              this.estaCargando = false;
              this.tituloLoading = '';
              //limpiamos la localstorage
              localStorage.removeItem('PRE-REGISTRO');
              this.utiles.presentToast('Tu solicitud registro ha sido cancelado con éxito', 'bottom', 3000);
              //lo manadmos a la pagina de inicio nuevamente
              this.navCtrl.navigateRoot('inicio');
            }
            else {
              loader.dismiss();
              this.estaCargando = false;
              this.tituloLoading = '';
              //mensaje
              this.muestraMensaje = true;
              this.tituloMensaje = 'Mensaje';
              this.contenidoMensaje = data.TextoMensaje;
            }
          }
          else {
            loader.dismiss();
            this.estaCargando = false;
            this.tituloLoading = '';
            //mensaje
            this.muestraMensaje = true;
            this.tituloMensaje = 'Error de comunicación';
            this.contenidoMensaje = 'Hubo un error de comunicación, contacte al administrador.';
          }
        }, error => {
          console.log(error);
          loader.dismiss();
          this.estaCargando = false;
          this.tituloLoading = '';
        })
      }
      else {
        //llamada nativa
        this.servicioGeo.validaCodigoNative(idPreRegistro, codigoCompleto, accion).then((response: any) => {
          var data = JSON.parse(response.data);
          //la respuesta trae
          //CodigoMensaje, TextoMensaje, PreRegistroApp { Codigo, Correo, Eliminado, Estado, FechaHora, Id, Run (con guion) }
          if (data) {
            if (data.CodigoMensaje == 0) {
              //correcto
              loader.dismiss();
              this.estaCargando = false;
              this.tituloLoading = '';
              //limpiamos la localstorage
              localStorage.removeItem('PRE-REGISTRO');
              this.utiles.presentToast('Tu solicitud registro ha sido cancelado con éxito', 'bottom', 3000);
              //lo manadmos a la pagina de inicio nuevamente
              this.navCtrl.navigateRoot('inicio');

            }
            else {
              loader.dismiss();
              this.estaCargando = false;
              this.tituloLoading = '';
              //mensaje
              this.muestraMensaje = true;
              this.tituloMensaje = 'Mensaje';
              this.contenidoMensaje = data.TextoMensaje;
            }
          }
          else {
            loader.dismiss();
            this.estaCargando = false;
            this.tituloLoading = '';
            //mensaje
            this.muestraMensaje = true;
            this.tituloMensaje = 'Error de comunicación';
            this.contenidoMensaje = 'Hubo un error de comunicación, contacte al administrador.';
          }

        }).catch(error => {
          console.log(error);
          loader.dismiss();
          this.estaCargando = false;
          this.tituloLoading = '';
        });
      }
    });
  }

  irARegistro() {
    //enviar registroIncompleto
    let registroIncompleto = {
      Activo: 1,
      Apellidos: '',
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
      Nombres: '',
      Pais: localStorage.getItem("pais"),
      Password: "",
      Plataforma: localStorage.getItem("plataforma"),
      Provincia: localStorage.getItem("provincia"),
      Run: '',
      TelefonoContacto: ''
    }
    if (this.preRegistro && this.preRegistro.Id > 0) {
      registroIncompleto.CorreoElectronico = this.preRegistro.Correo;
      registroIncompleto.Run = this.preRegistro.Run;
    }

    let query = {
      usuario: JSON.stringify(registroIncompleto),
      estaAgregandoFamilia: null
    };
    const navigationExtras: NavigationExtras = {
      queryParams: query
    };
    this.navCtrl.navigateRoot(['registro-usuario'], navigationExtras);
  }

  get f() { return this.forma.controls; }

}
