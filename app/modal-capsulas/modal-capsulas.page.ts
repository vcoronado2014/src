import { Component, OnInit } from '@angular/core';
import { NavController, ToastController, Platform, LoadingController, MenuController, AlertController } from '@ionic/angular';
//SERVICIOS
import { ServicioUtiles } from '../../app/services/ServicioUtiles';
import { ServicioGeo } from '../../app/services/ServicioGeo';
import { environment } from 'src/environments/environment';
import { ServicioParametrosApp } from '../../app/services/ServicioParametrosApp';
import {DomSanitizer} from '@angular/platform-browser';
//moment
import * as moment from 'moment';

@Component({
  selector: 'app-modal-capsulas',
  templateUrl: './modal-capsulas.page.html',
  styleUrls: ['./modal-capsulas.page.scss'],
})
export class ModalCapsulasPage implements OnInit {
  estaCargando = false;
  tituloLoading = '';
  nodId = 0;

  usuarioAps = null;
  //videourl = 'https://www.youtube.com/watch?v=8iN11Pt6LdU';
  videourl = 'https://www.youtube.com/embed/8iN11Pt6LdU';

  capsulas = [];

  constructor(
    public utiles: ServicioUtiles,
    public navCtrl: NavController,
    public toast: ToastController,
    public platform: Platform,
    public menu: MenuController,
    public loading: LoadingController,
    private alertController: AlertController,
    public  sanitizer:DomSanitizer,
    public global: ServicioGeo,
    public parametrosApp: ServicioParametrosApp,
  ) { }

  /* ME FALTA ORDENAR LOS ELEMENTOS DE LAS ALERTAS */

  ngOnInit() {
    moment.locale('es');
    this.usuarioAps = this.utiles.entregaUsuarioLogueado();
    if (this.usuarioAps) {
      this.usuarioAps.UrlImagen = environment.URL_FOTOS + this.usuarioAps.UrlImagen;
      if (this.usuarioAps.Parentezco.Nombre.toUpperCase() == 'LA MISMA PERSONA') {
        this.usuarioAps.Parentezco.Nombre = 'Yo';
      }
      this.nodId = this.usuarioAps.NodId ? this.usuarioAps?.NodId : 0;
    }

    this.obtener();
  }

  async obtener(){
    if (this.parametrosApp.USA_CAPSULAS_EDUCATIVAS()) {
      this.estaCargando = true;
      this.tituloLoading = 'Enviando contacto...';

      if (!this.utiles.isAppOnDevice()) {
        //llamada web
        this.global.postCapsulas(this.nodId).subscribe((response: any) => {
          //procesar respuesta
          var datos = response;
          this.capsulas = datos;
          this.estaCargando = false;
          this.tituloLoading = '';

        }, error => {
          console.log(error.message);
          this.estaCargando = false;
          this.tituloLoading = '';
          this.utiles.presentToast('Se presentó un error al obtener las cápsulas, contacte al administrador', 'bottom', 2000);
        })
      }
      else{
        //llamada nativa
        this.global.postCapsulasNative(this.nodId).then((response: any) => {
          //procesar respuesta
          var datos = JSON.parse(response.data);
          this.estaCargando = false;
          this.tituloLoading = '';
          this.capsulas = datos;

        }).catch(error => {
          console.log(error.message);
          this.estaCargando = false;
          this.tituloLoading = '';
          this.utiles.presentToast('Se presentó un error al obtener las cápsulas, contacte al administrador', 'bottom', 2000);
        })
      }

    }
    else {
      //si no tiene api management
      this.estaCargando = false;
      this.tituloLoading = '';
      this.utiles.presentToast('Esta funcionalidad no está disponible, contacte al administrador.', 'bottom', 4000);
    }
  }

  abrirYoutube(item){
    console.log(item);
  }

}