import { Component, ViewChild, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { NavController, ToastController, Platform, ModalController, LoadingController, MenuController } from '@ionic/angular';

import { ServicioUtiles } from '../../app/services/ServicioUtiles';
import { ServicioAcceso } from '../../app/services/ServicioAcceso';
import { ServicioParametrosApp } from '../../app/services/ServicioParametrosApp';
@Component({
  selector: 'app-pre-ordenes',
  templateUrl: './pre-ordenes.page.html',
  styleUrls: ['./pre-ordenes.page.scss'],
})
export class PreOrdenesPage implements OnInit {
  miColor = '#FF4081';

  public usuarioAps;
  public usuarioApsFamilia = [];
  public listadoUsuario = [];
  linesAvatar='inset';

  estaCargando = false;
  //para el modulo
  moduloActual = '';
  titulo = '';
  constructor(
    public navCtrl: NavController,
    public toast: ToastController,
    public modalCtrl: ModalController,
    public platform: Platform,
    public loading: LoadingController,
    public menu: MenuController,
    public utiles: ServicioUtiles,
    public acceso: ServicioAcceso,
    public parametrosApp: ServicioParametrosApp
  ) { }

  ngOnInit() {
    this.cargarDatosInciales();
  }
  async cargarDatosInciales() {
    //agregado para determinar que ventana levantar
    this.moduloActual = sessionStorage.getItem('MODULO_ACTUAL');
    if (this.moduloActual == 'CALENDARIO'){
      this.titulo = 'Calendario';
    }
    else{
      this.titulo = 'Exámenes';
    }

    this.estaCargando = true;
    let loader = await this.loading.create({
      cssClass: 'loading-vacio',
      showBackdrop: false,
      spinner: null,
    });

    await loader.present().then(async () => {

      if (sessionStorage.UsuarioAps) {
        this.usuarioAps = JSON.parse(sessionStorage.UsuarioAps);
        if (this.usuarioAps) {
          //this.usuarioAps.UrlImagen = this.utiles.entregaMiImagen();
          this.usuarioAps.UrlImagen = this.utiles.entregaImagen(this.usuarioAps);
          this.usuarioAps.Color = this.utiles.entregaColor(this.usuarioAps);
          this.miColor = this.utiles.entregaColor(this.usuarioAps);
        }
      }
      else {
        this.usuarioAps = { Nombres: '', PrimerApellido: '', SegundoApellido: '', UrlImagen: '' };
      }

      //manejo de los usuarios de la familia
      if (localStorage.UsuariosFamilia) {
        this.usuarioApsFamilia = JSON.parse(localStorage.UsuariosFamilia);
        if (this.usuarioApsFamilia.length > 0) {
          for (var s in this.usuarioApsFamilia) {
            this.usuarioApsFamilia[s].UrlImagen = this.utiles.entregaImagen(this.usuarioApsFamilia[s]);
            this.usuarioApsFamilia[s].Color = this.utiles.entregaColor(this.usuarioApsFamilia[s]);
          }
        }

      }
      //ahora vamos a generar un solo listado de usuarios con los datos que necesitamos
      if (this.usuarioAps) {
        if (this.usuarioAps.Parentezco && this.usuarioAps.Parentezco.Id > 0) {
          if (this.usuarioAps.Parentezco.Nombre.toUpperCase() == 'LA MISMA PERSONA') {
            this.usuarioAps.Parentezco.Nombre = 'Yo';
          }
        }
        else {
          this.usuarioAps.Parentezco.Nombre = 'Yo';
        }
        //this.usuarioAps.Parentezco = "Yo";
        this.listadoUsuario.push(this.usuarioAps);
      }
      if (this.usuarioApsFamilia) {
        if (this.usuarioApsFamilia.length > 0) {
          for (var s in this.usuarioApsFamilia) {
            //por mientras el parentezco lo dejamos como no informado.
            if (!(this.usuarioApsFamilia[s].Parentezco && this.usuarioApsFamilia[s].Parentezco.Id > 0)) {
              this.usuarioApsFamilia[s].Parentezco.Nombre = 'No informado';
            }
            //this.usuarioApsFamilia[s].Parentezco = "No informado";
            this.listadoUsuario.push(this.usuarioApsFamilia[s]);
          }
        }
      }
      loader.dismiss();
      this.estaCargando = false;
    });

  }

  goToDetails(usuario) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        usuario: JSON.stringify(usuario)
      }
    };
    this.navCtrl.navigateRoot(['ordenes'], navigationExtras);
  }
  goToDetailsModulo(usuario) {

    //this.navCtrl.navigateRoot(['ordenes'], navigationExtras);
    if (this.moduloActual == 'CALENDARIO'){
      const navigationExtras: NavigationExtras = {
        queryParams: {
          idUsp: usuario.Id
        }
      };
      this.navCtrl.navigateForward(['calendario'], navigationExtras);
    }
    else{
      const navigationExtras: NavigationExtras = {
        queryParams: {
          usuario: JSON.stringify(usuario)
        }
      };
      this.navCtrl.navigateForward(['ordenes'], navigationExtras);
    }
  }
}
