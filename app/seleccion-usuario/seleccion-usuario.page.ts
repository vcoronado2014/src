import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, ToastController, Platform, ModalController, LoadingController, MenuController, IonList } from '@ionic/angular';
//parametros
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
//SERVICIOS
import { ServicioUtiles } from '../../app/services/ServicioUtiles';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-seleccion-usuario',
  templateUrl: './seleccion-usuario.page.html',
  styleUrls: ['./seleccion-usuario.page.scss'],
})
export class SeleccionUsuarioPage implements OnInit {
  //textColor Directive
  textColor = '#FFFFFF';
  //color
  miColor = '#FF4081';
  //otras variables
  hayInfo = true;
  public usuarioAps;
  public usuarioApsFamilia = [];
  public listadoUsuario = [];
  estaCargando = false;
  linesAvatar = 'inset';
  @ViewChild('myList', { read: IonList }) list: IonList;
  //para volver al calendario
  usuarioSeleccionado;

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
  ) { }

  ngOnInit() {
    this.cargarDatosIniciales();
  }
  async cargarDatosIniciales() {
    this.listadoUsuario = [];

    this.estaCargando = true;
    let loader = await this.loading.create({
      cssClass: 'loading-vacio',
      showBackdrop: false,
      spinner: null,
    });

    await loader.present().then(async () => {
      //cargamos mi color
      this.miColor = this.utiles.entregaMiColor();
      //demas cargas
      if (sessionStorage.UsuarioAps) {
        this.usuarioAps = JSON.parse(sessionStorage.UsuarioAps);
        if (this.usuarioAps) {
          this.usuarioAps.UrlImagen = environment.URL_FOTOS + this.usuarioAps.UrlImagen;
          //this.usuarioAps.Parentezco = 'Yo';
          if (this.usuarioAps.Parentezco && this.usuarioAps.Parentezco.Id > 0) {
            if (this.usuarioAps.Parentezco.Nombre.toUpperCase() == 'LA MISMA PERSONA') {
              this.usuarioAps.Parentezco.Nombre = 'Yo';
            }
          }
          //this.usuarioAps.Parentezco = 'Yo';
        }
      }
      else
        this.usuarioAps = { Nombres: '', PrimerApellido: '', SegundoApellido: '', UrlImagen: '' };

      //manejo de los usuarios de la familia
      if (localStorage.UsuariosFamilia) {
        this.usuarioApsFamilia = JSON.parse(localStorage.UsuariosFamilia);
        if (this.usuarioApsFamilia.length > 0) {
          for (var s in this.usuarioApsFamilia) {
            this.usuarioApsFamilia[s].UrlImagen = environment.URL_FOTOS + this.usuarioApsFamilia[s].UrlImagen;
            if (!(this.usuarioApsFamilia[s].Parentezco && this.usuarioApsFamilia[s].Parentezco.Id > 0)) {
              this.usuarioApsFamilia[s].Parentezco.Nombre = 'No informado';
            }
            //this.usuarioApsFamilia[s].Parentezco = "No informado";
          }
        }
      }
      //ahora vamos a generar un solo listado de usuarios con los datos que necesitamos
      if (this.usuarioAps) {
        this.listadoUsuario.push(this.usuarioAps);
      }
      if (this.usuarioApsFamilia) {
        if (this.usuarioApsFamilia.length > 0) {
          for (var s in this.usuarioApsFamilia) {
            this.listadoUsuario.push(this.usuarioApsFamilia[s]);
          }
        }
      }
      if (this.listadoUsuario.length == 0) {
        this.hayInfo = false;
      }
      loader.dismiss();
      this.estaCargando = false;
    });
  }
  irHoras(item) {
    //console.log(item);
    //pasando id
    const navigationExtras: NavigationExtras = {
      queryParams: {
        Id: item.Id
      }
    };
    this.navCtrl.navigateRoot(['pre-tiposatencion'], navigationExtras);
  }
  irAHome(){

  }
}
