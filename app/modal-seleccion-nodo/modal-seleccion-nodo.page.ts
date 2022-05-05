import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, NavController, ToastController, Platform, LoadingController, MenuController, AlertController } from '@ionic/angular';
import { NavigationExtras } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
//SERVICIOS
import { ServicioUtiles } from '../../app/services/ServicioUtiles';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-modal-seleccion-nodo',
  templateUrl: './modal-seleccion-nodo.page.html',
  styleUrls: ['./modal-seleccion-nodo.page.scss'],
  providers: [NavParams]
})
export class ModalSeleccionNodoPage implements OnInit {

  public usuarioAps;
  idConsultar;
  listadoNodos = [];
  estaCargando = false;

  modulo = '';
  texto = '';
  botones = '';

  constructor(
    public modalCtrl: ModalController,
    public navParams: NavParams,
    public utiles: ServicioUtiles,
    public navCtrl: NavController,
    public toast: ToastController,
    public platform: Platform,
    public menu: MenuController,
    public loading: LoadingController,
    private alertController: AlertController,
    public activatedRoute: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(async params => {
      if (params && params.Id) {
        this.modulo = params && params?.Modulo ? params.Modulo : 'AGENDA';
        console.log(this.modulo);
        this.setearTitulosBotones();
        var nodosIntegracion = this.utiles.obtenerEstablecimientosRayen(params.Id);
        this.listadoNodos = nodosIntegracion.length == 0 ? this.utiles.entregaEstablecimientosUsuariosRayenUsp(params.Id) : nodosIntegracion;
        //this.estaAgregandoFamilia = true;
        this.idConsultar = params.Id;
        this.usuarioAps = this.utiles.entregaUsuario(params.Id);
        if (this.usuarioAps != null) {
          this.usuarioAps.UrlImagen = this.utiles.entregaImagen(this.usuarioAps);
          //this.runPaciente = this.utiles.insertarGuion(this.usuarioAps.Rut);
        }
        else {
          this.utiles.presentToast('No hay usuario, vuelva a seleccionar', 'bottom', 2000);
        }
      }
      else {
        this.utiles.presentToast('No hay usuario, vuelva a seleccionar', 'bottom', 2000);
        this.irAHome();
      }
    });
  }
  setearTitulosBotones(){
    if (this.modulo == 'CALENDARIO'){
      this.texto = 'A continuación podrás seleccionar el establecimiento donde quieres ver tus eventos.';
      this.botones = 'VER CALENDARIO';
    }
    else{
      this.texto = 'A continuación podrás seleccionar el establecimiento donde quieres tomar una hora para tu atención.';
      this.botones = 'TOMAR HORA';
    }
  }
  dismiss() {
    this.modalCtrl.dismiss();
  }

/*   irAHome() {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        idUsp: this.idConsultar
      }
    };
    this.navCtrl.navigateBack(['calendario'], navigationExtras);
  } */
  irAHome() {
    this.navCtrl.navigateBack('home');
  }
  irAReservar(nodo) {
    //console.log(nodo);
    if (this.modulo == 'AGENDA'){
      const navigationExtras: NavigationExtras = {
        queryParams: {
          Id: this.usuarioAps.Id,
          CodigoDeis: nodo.codigoDeis2014 ? nodo.codigoDeis2014 : this.usuarioAps.ConfiguracionNodo.CodigoDeis2014,
          NodId: nodo.nodId ? nodo.nodId : this.usuarioAps.NodId
        }
      };
      this.navCtrl.navigateRoot(['pre-tiposatencion'], navigationExtras);
    }
    else if (this.modulo == 'CALENDARIO'){
      const navigationExtras: NavigationExtras = {
        queryParams: {
          idUsp: this.usuarioAps.Id,
          codigoDeis: nodo.codigoDeis2014 ? nodo.codigoDeis2014 : this.usuarioAps.ConfiguracionNodo.CodigoDeis2014,
          nodId: nodo.nodId ? nodo.nodId : this.usuarioAps.NodId
        }
      };
      this.navCtrl.navigateForward(['calendario'], navigationExtras);
    }

  }

}