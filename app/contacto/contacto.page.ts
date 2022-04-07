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
  selector: 'app-contacto',
  templateUrl: './contacto.page.html',
  styleUrls: ['./contacto.page.scss'],
})
export class ContactoPage implements OnInit {
  forma: FormGroup;
  estaCargando = false;
  tituloProgress = '';
  usuarioAps;

  motivos=[];
  
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
    
    this.motivos = this.parametrosApp.entregaMotivosContacto();
    console.log(this.motivos);
    this.usuarioAps = localStorage.getItem('UsuarioAps') ? JSON.parse(localStorage.getItem('UsuarioAps')) : null;
    if (this.usuarioAps != null) {
      this.usuarioAps.UrlImagen = this.utiles.entregaImagen(this.usuarioAps);
    }
    this.cargarForma();
  }
  cargarForma() {
    this.forma = new FormGroup({
      'contenido': new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(1000)]),
      'motivo': new FormControl(),
    });
  }

  async onSumbit() {
    if (this.parametrosApp.ENVIA_CORREO_CONTACTO()) {

      this.estaCargando = true;
      this.tituloProgress = 'Enviando contacto...';

      //variables a enviar
      let nodId = this.usuarioAps.NodId;
      let correoOrigen = this.usuarioAps.Email ?  this.usuarioAps.Email : '';
      let correoDestino = this.parametrosApp.URL_CORREO_CONTACTO();
      let nombreEstablecimiento = this.usuarioAps.Establecimiento ? this.usuarioAps.Establecimiento?.RazonSocial : '';
      let run = this.usuarioAps.Rut ? this.usuarioAps.Rut : '';
      let tokenFcm = this.utiles.entregaTokenFCM();
      let contenido = this.forma.controls.contenido ? this.forma.controls.contenido.value : '';
      let nombreEmisor = this.usuarioAps.Nombres + ' ' + this.usuarioAps.ApellidoPaterno;
      let mcoId = this.forma.controls.motivo ? this.forma.controls.motivo.value : 0;
      let registro = this.utiles.obtenerRegistro();
      let telefono = registro ? registro?.TelefonoContacto : 'No registra';

      if (correoDestino != ''){
        if (!this.utiles.isAppOnDevice()) {
          //llamada web
          this.servicioGeo.postContacto(nodId, correoOrigen, correoDestino, nombreEstablecimiento, 
            telefono, tokenFcm, contenido, nombreEmisor, mcoId, 0, run).subscribe((response: any) => {
            //procesar respuesta
            var datos = response;
            //this.procesarRespuesta(datos, loader, nombreSocial, telefono, email, run);
            this.estaCargando = false;
            this.tituloProgress = '';
            if (datos){
              this.utiles.presentToast('Mensaje enviado con éxito', 'bottom', 4000);
            }
            this.irAHome();

          }, error => {
            console.log(error.message);
            this.estaCargando = false;
            this.tituloProgress = '';
            this.utiles.presentToast('Se presentó un error al guardar los datos, contacte al administrador', 'bottom', 2000);
          })
        }
        else {
          //llamada nativa
          this.servicioGeo.postContactoNative(nodId, correoOrigen, correoDestino, nombreEstablecimiento, 
            telefono, tokenFcm, contenido, nombreEmisor, mcoId, 0, run).then((response: any) => {
            //procesar respuesta
            var datos = JSON.parse(response.data);
            this.estaCargando = false;
            this.tituloProgress = '';
            if (datos){
              this.utiles.presentToast('Mensaje enviado con éxito', 'bottom', 4000);
            }
            this.irAHome();

          }).catch(error => {
            console.log(error.message);
            this.estaCargando = false;
            this.tituloProgress = '';
            this.utiles.presentToast('Se presentó un error al guardar los datos, contacte al administrador', 'bottom', 2000);
          })
        }
      }
      else{
        this.estaCargando = false;
        this.tituloProgress = '';
        this.utiles.presentToast('No hay correo de contacto, comuníquese con el administrador.', 'bottom', 4000);
      }
    }
    else {
      //si no tiene api management
      this.estaCargando = false;
      this.tituloProgress = '';
      this.utiles.presentToast('Esta funcionalidad no está disponible, contacte al administrador.', 'bottom', 4000);
    }

  }

  irAHome(){
    this.navCtrl.navigateBack('home');
  }


  get f() { return this.forma.controls; }
}