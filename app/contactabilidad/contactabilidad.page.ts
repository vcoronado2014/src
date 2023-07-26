import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { FormGroup, Validators, FormBuilder, FormControl, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
//servicios
import { ServicioUtiles } from '../../app/services/ServicioUtiles';
import { ServicioGeo } from '../../app/services/ServicioGeo';
import { ServicioAcceso } from '../../app/services/ServicioAcceso';
import { ServicioParametrosApp } from '../../app/services/ServicioParametrosApp';

import * as moment from 'moment';

@Component({
  selector: 'app-contactabilidad',
  templateUrl: './contactabilidad.page.html',
  styleUrls: ['./contactabilidad.page.scss'],
})
export class ContactabilidadPage implements OnInit {
  forma: FormGroup;
  //para validar
  patternOnlyLetter = '[a-zA-ZÀ-ÿ\u00f1\u00d1]+(\s*[a-zA-ZÀ-ÿ\u00f1\u00d1]*)*[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$';
  //expCelular = /^(\+?56)?(\s?)(0?9)(\s?)[9876543]\d{7}$/gm;
  ///^[7-9]\d{7}$/;
  expCelular = /^[7-9]\d{8}$/;
  expPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,8}$/gm;
  //expEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/gm;
  expEmail = /^((\w[^\W]+)[\.\-]?){1,}\@(([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/gm
  //variable para obtener el registro del usuario
  registro = null;
  estaCargando = false;
  tituloProgress = '';
  usuarioAps = null;
  usuarioApsRegistro = null;
  modificaRegistro = false;
  nombrePersona = '';

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
    public alertController: AlertController
  ) { }

  ngOnInit() {
    moment.locale('es');
    //obtenemos el registro

    this.activatedRoute.queryParams.subscribe(params => {

      if (params && params.usuario) {
        if (localStorage.getItem('REGISTRO')) {
          this.registro = JSON.parse(localStorage.getItem('REGISTRO'));
        }

        this.usuarioAps = JSON.parse(params.usuario);
        this.nombrePersona = this.usuarioAps.Nombres + ' ' + this.usuarioAps.ApellidoPaterno;
        if (localStorage.getItem('UsuarioAps')) {
          this.usuarioApsRegistro = JSON.parse(localStorage.getItem('UsuarioAps'));
        }
        //verificamos si es el mismo usuario o no
        if (this.usuarioAps && this.usuarioApsRegistro && this.registro) {
          if (this.usuarioAps.Id == this.usuarioApsRegistro.Id) {
            this.modificaRegistro = true;
          }
        }
        //console.log(this.usuarioAps);
      }

    });
    //cargamos la forma
    this.cargarForma();
  }
  cargarForma() {
    this.forma = new FormGroup({
      'nombreSocial': new FormControl(''),
      //'email': new FormControl('', [Validators.pattern(this.expEmail)]),
      'email': new FormControl('', [Validators.email]),
      'telefono': new FormControl('', [Validators.pattern(this.expCelular)]),
    });
    //precargar los datos del usuario. solo si modifica registro
    if (this.modificaRegistro) {
      if (this.registro && this.registro != null) {
        this.forma.setValue({
          nombreSocial: this.registro.Apodo,
          email: this.registro.CorreoElectronico,
          telefono: this.registro.TelefonoContacto ? this.registro.TelefonoContacto : '',
        })
      }
    }
    else {
      //no tiene registro, pero puede tener datos de contactabilidad en el local storage
      if (this.usuarioAps.Contactabilidad != null) {
        this.forma.setValue({
          nombreSocial: this.usuarioAps.Contactabilidad.NombreSocial,
          email: this.usuarioAps.Contactabilidad.Email,
          telefono: this.usuarioAps.Contactabilidad.Telefono ? this.usuarioAps.Contactabilidad.Telefono : '',
        })
      }
    }
  }
  async onSumbit() {
    if (this.parametrosApp.USA_API_MANAGEMENT()) {
      let loader = await this.loading.create({
        cssClass: 'loading-vacio',
        showBackdrop: false,
        spinner: null,
        //message: 'Cargando...<br>tipos de atención',
        duration: 2000
      });
      this.estaCargando = true;
      this.tituloProgress = 'Actualizando datos de contacto';

      //variables a enviar
      let email = this.forma.controls.email ? this.forma.controls.email.value : '';
      let nombreSocial = this.forma.controls.nombreSocial ? this.forma.controls.nombreSocial.value : '';
      let telefono = this.forma.controls.telefono ? this.forma.controls.telefono.value : '';
      //el run debe ser del usuario que se está modificando
      //let run = this.registro.Run.replace('-', '');
      let run = this.usuarioAps.Rut;
      await loader.present().then(async () => {
        if (!this.utiles.isAppOnDevice()) {
          //llamada web
          this.servicioGeo.postInformarPersona(run, nombreSocial, email, telefono, 'MOVIL_FICHA_FAMILIAR').subscribe((response: any) => {
            //procesar respuesta
            var datos = response;
            this.procesarRespuesta(datos, loader, nombreSocial, telefono, email, run);

          }, error => {
            console.log(error.message);
            this.estaCargando = false;
            loader.dismiss();
            this.tituloProgress = '';
            this.utiles.presentToast('Se presentó un error al guardar los datos, contacte al administrador', 'bottom', 2000);
          })
        }
        else {
          //llamada nativa
          this.servicioGeo.postInformarPersonaNative(run, nombreSocial, email, telefono, 'MOVIL_FICHA_FAMILIAR').then((response: any) => {
            //procesar respuesta
            var datos = JSON.parse(response.data);
            this.procesarRespuesta(datos, loader, nombreSocial, telefono, email, run);

          }).catch(error => {
            console.log(error.message);
            this.estaCargando = false;
            loader.dismiss();
            this.tituloProgress = '';
            this.utiles.presentToast('Se presentó un error al guardar los datos, contacte al administrador', 'bottom', 2000);
          })
        }
      });
    }
    else {
      //si no tiene api management
      this.utiles.presentToast('Esta funcionalidad no está disponible', 'bottom', 3000);
    }

  }
  async procesarRespuesta(data, loading, nombreSocial, telefono, email, run) {
    //primero evaluamos la respuesta
    if (data) {
      if (data.InformarPersonaResponse) {
        if (data.InformarPersonaResponse.RespuestaBase) {
          //acá trae info de rayen y de ryf
          //ojo que debemos actualizar igual el registro, al menos con el telefono y el apodo
          //ya que el email es de autentificacion y no se puede cambiar
          let correctoRayen = false;
          let correctoRyf = false;
          if (data.InformarPersonaResponse.RespuestaBase.Rayen) {
            if (data.InformarPersonaResponse.RespuestaBase.Rayen.Descripcion.toUpperCase() == 'TRANSACCIÓN EXITOSA') {
              correctoRayen = true;
              //console.log('actualizado rayen');
            }
          }
          if (data.InformarPersonaResponse.RespuestaBase.Ryf) {
            if (data.InformarPersonaResponse.RespuestaBase.Ryf.Descripcion.toUpperCase() == 'TRANSACCIÓN EXITOSA') {
              correctoRyf = true;
              //console.log('actualizado ryf');
            }
          }
          if (correctoRyf || correctoRayen) {
            this.estaCargando = false;
            this.tituloProgress = '';
            loading.dismiss();
            this.utiles.presentToast('Datos actualizados correctamente', 'bottom', 2000);
            //se debe actualizar registro solo si esta registrado
            if (this.modificaRegistro) {
              this.actualizarRegistro(nombreSocial, telefono);
            }
            //aca debemos hacer la llamada para obtener la contactabilidad y guardarla en el localstorage
            //this.utiles.actualizarContactabilidad(this.usuarioAps, nombreSocial, telefono, email);
            this.obtenerContactabilidad(run);
          }
          else {
            this.estaCargando = false;
            loading.dismiss();
            this.tituloProgress = '';
            this.utiles.presentToast('Error al actualizar los datos', 'bottom', 2000);
          }
        }
        else {
          this.estaCargando = false;
          loading.dismiss();
          this.tituloProgress = '';
          this.utiles.presentToast('Error al actualizar los datos', 'bottom', 3000);
        }
      }
      else {
        this.estaCargando = false;
        loading.dismiss();
        this.tituloProgress = '';
        this.utiles.presentToast('Error al actualizar los datos', 'bottom', 3000);
      }
    }
    else {
      this.estaCargando = false;
      loading.dismiss();
      this.utiles.presentToast('Error al actualizar los datos', 'bottom', 3000);
      this.tituloProgress = '';
    }
  }

  async actualizarRegistro(nombreSocial, telefono) {
    var fechaNac = moment();
    if (this.registro.FechaNacimiento) {
      fechaNac = moment(this.registro.FechaNacimiento);
    }
    //ahora actualizar el registro
    this.registro.Apodo = nombreSocial;
    this.registro.TelefonoContacto = telefono;
    //valores por defecto
    this.registro.Id = this.registro.Id.toString();
    this.registro.Activo = this.registro.Activo.toString();
    this.registro.DiaNacimiento = fechaNac.date().toString();
    this.registro.MesNacimiento = (fechaNac.month() + 1).toString();
    this.registro.AnioNacimiento = fechaNac.year().toString();
    this.registro.Eliminado = this.registro.Eliminado.toString();
    this.registro.ModoRegistro = this.registro.ModoRegistro.toString();
    this.registro.FechaBaja = null;

    let loader = await this.loading.create({
      cssClass: 'loading-vacio',
      showBackdrop: false,
      spinner: null
    });
    this.estaCargando = true;
    this.tituloProgress = 'Actualizando datos de registro';
    await loader.present().then(async () => {
      if (!this.utiles.isAppOnDevice()) {
        //llamada web
        this.servicioGeo.postRegistroFamilia(this.registro).subscribe((data) => {
          let respuesta = data;
          localStorage.setItem('REGISTRO', JSON.stringify(respuesta));
          loader.dismiss();
          this.estaCargando = false;
          this.utiles.presentToast('Datos actualizados correctamente', 'bottom', 2000);
        },
          error => {
            loader.dismiss();
            this.estaCargando = false;
            this.utiles.presentToast(error, 'bottom', 2000);
          });
      }
      else {
        //llamada nativa
        this.servicioGeo.postRegistroFamiliaNative(this.registro).then((data) => {
          let respuesta = JSON.parse(data.data);
          localStorage.setItem('REGISTRO', JSON.stringify(respuesta));
          loader.dismiss();
          this.estaCargando = false;
          this.utiles.presentToast('Datos actualizados correctamente', 'bottom', 2000);

        }).catch(error => {
          loader.dismiss();
          this.estaCargando = false;
          this.utiles.presentToast(error, 'bottom', 2000);
        });
      }
    });
  }
  actualizarContactabilidad(usuario, nombreSocial, telefono, email) {
    //buscamos al usuario en local sttorage
    var contactabilidad = {
      Rut: usuario.Rut,
      Id: usuario.Id,
      NombreSocial: nombreSocial,
      Telefono: telefono,
      Email: email,
      EtiquetaTelefono: 'MOVIL_FICHA_FAMILIAR'
    }

    if (localStorage.getItem('UsuarioAps')) {
      var usu = JSON.parse(localStorage.getItem('UsuarioAps'));
      if (usu) {
        if (usu.Id == usuario.Id) {
          usu.Contactabilidad = contactabilidad;
          localStorage.setItem('UsuarioAps', JSON.stringify(usu));
        }
      }
    }
    if (localStorage.getItem('UsuariosFamilia')) {
      var existe = false;
      var usuarios = JSON.parse(localStorage.getItem('UsuariosFamilia'));
      if (usuarios && usuarios.length > 0) {
        for (var i = 0; i < usuarios.length; i++) {
          if (usuarios[i].Id == usuario.Id) {
            usuarios[i].Contactabilidad = contactabilidad;
            existe = true;
          }
        }
      }
      if (existe) {
        localStorage.setItem('UsuariosFamilia', JSON.stringify(usuarios));
      }
    }

  }
  async obtenerContactabilidad(run) {
    let loader = await this.loading.create({
      cssClass: 'loading-vacio',
      showBackdrop: false,
      spinner: null
    });
    this.estaCargando = true;
    this.tituloProgress = 'Buscando contactabilidad';

    await loader.present().then(async () => {
      if (!this.utiles.isAppOnDevice()) {
        //llamada web
        this.servicioGeo.getContactabilidad(run).subscribe((data) => {
          let respuesta = data;
          loader.dismiss();
          this.estaCargando = false;
          this.utiles.actualizarContactabilidad(respuesta);
        },
          error => {
            loader.dismiss();
            this.estaCargando = false;
            this.utiles.presentToast(error, 'bottom', 2000);
          });
      }
      else {
        //llamada nativa
        this.servicioGeo.getContactabilidadNative(run).then((data) => {
          let respuesta = JSON.parse(data.data);
          loader.dismiss();
          this.estaCargando = false;
          this.utiles.actualizarContactabilidad(respuesta);

        }).catch(error => {
          loader.dismiss();
          this.estaCargando = false;
          this.utiles.presentToast(error, 'bottom', 2000);
        });
      }

    });

  }
  irAHome() {
    this.navCtrl.navigateRoot('home');
  }

  get f() { return this.forma.controls; }

}
